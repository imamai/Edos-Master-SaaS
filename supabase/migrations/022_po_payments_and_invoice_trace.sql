-- ============================================================
-- Purchase order payments (accounts payable) + supplier invoice
-- number traceability.
--
-- Lets staff select one or more POs and pay them in a single action,
-- keeps a full payment history per PO (the old flow just overwrote
-- amount_paid/payment_status with no record of individual payments),
-- and links POs to the supplier's own invoice number so a payment can
-- be traced back to the paperwork the supplier sent.
-- ============================================================

-- A PO can carry the supplier's invoice number directly (set manually,
-- copied automatically from a linked GRN on confirm, or captured at
-- payment time) — independent of any one GRN, since a PO can receive
-- multiple partial deliveries under different supplier invoices.
ALTER TABLE public.purchase_orders
  ADD COLUMN IF NOT EXISTS supplier_invoice_ref TEXT;

CREATE TABLE IF NOT EXISTS public.purchase_order_payments (
  id                 UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id          UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  purchase_order_id  UUID NOT NULL REFERENCES public.purchase_orders(id) ON DELETE CASCADE,
  supplier_id        UUID REFERENCES public.suppliers(id),
  amount             NUMERIC(12,2) NOT NULL CHECK (amount > 0),
  payment_method     TEXT NOT NULL DEFAULT 'bank_transfer'
    CHECK (payment_method IN ('cash', 'bank_transfer', 'mpesa', 'cheque', 'other')),
  reference          TEXT,
  payment_date       DATE NOT NULL DEFAULT CURRENT_DATE,
  notes              TEXT,
  paid_by            UUID REFERENCES public.profiles(id),
  created_at         TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_po_payments_tenant ON public.purchase_order_payments(tenant_id);
CREATE INDEX IF NOT EXISTS idx_po_payments_po     ON public.purchase_order_payments(purchase_order_id);
CREATE INDEX IF NOT EXISTS idx_po_payments_supplier ON public.purchase_order_payments(supplier_id);

ALTER TABLE public.purchase_order_payments ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_po_payments ON public.purchase_order_payments;
CREATE POLICY tenant_po_payments ON public.purchase_order_payments
  FOR ALL USING (tenant_id = public.current_tenant_id() OR public.is_super_admin());

-- ── Pay one or more purchase orders atomically ─────────────────
-- p_payments is a JSON array of objects:
--   { purchase_order_id, amount, payment_method, reference, payment_date, notes }
-- Each element is applied to its own PO — the client fills the shared
-- fields (method/reference/date) into every element so a single call
-- can settle several POs against one supplier invoice/transaction.
CREATE OR REPLACE FUNCTION public.pay_purchase_orders(p_payments JSONB)
RETURNS SETOF public.purchase_order_payments
LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  v_item       JSONB;
  v_po         public.purchase_orders%ROWTYPE;
  v_amount     NUMERIC(12,2);
  v_new_paid   NUMERIC(12,2);
  v_new_status TEXT;
  v_reference  TEXT;
  v_payment    public.purchase_order_payments%ROWTYPE;
BEGIN
  FOR v_item IN SELECT * FROM jsonb_array_elements(p_payments)
  LOOP
    -- Lock the PO row so two simultaneous payments against the same PO
    -- serialize instead of both reading a stale balance due.
    SELECT * INTO v_po FROM public.purchase_orders
      WHERE id = (v_item->>'purchase_order_id')::UUID
      FOR UPDATE;

    IF NOT FOUND THEN
      RAISE EXCEPTION 'Purchase order % not found', v_item->>'purchase_order_id';
    END IF;

    IF v_po.tenant_id <> public.current_tenant_id() AND NOT public.is_super_admin() THEN
      RAISE EXCEPTION 'Not authorized to pay purchase order %', v_po.po_number;
    END IF;

    IF v_po.status = 'cancelled' THEN
      RAISE EXCEPTION 'Cannot pay a cancelled purchase order (%)', v_po.po_number;
    END IF;

    v_amount := (v_item->>'amount')::NUMERIC;
    IF v_amount IS NULL OR v_amount <= 0 THEN
      RAISE EXCEPTION 'Invalid payment amount for purchase order %', v_po.po_number;
    END IF;
    IF v_amount > (v_po.total_amount - v_po.amount_paid) THEN
      RAISE EXCEPTION 'Payment of % exceeds balance due (%) for purchase order %',
        v_amount, v_po.total_amount - v_po.amount_paid, v_po.po_number;
    END IF;

    v_reference  := NULLIF(v_item->>'reference', '');
    v_new_paid   := v_po.amount_paid + v_amount;
    v_new_status := CASE WHEN v_new_paid >= v_po.total_amount THEN 'paid' ELSE 'partial' END;

    UPDATE public.purchase_orders
      SET amount_paid          = v_new_paid,
          payment_status       = v_new_status,
          supplier_invoice_ref = COALESCE(purchase_orders.supplier_invoice_ref, v_reference)
      WHERE id = v_po.id;

    INSERT INTO public.purchase_order_payments (
      tenant_id, purchase_order_id, supplier_id, amount,
      payment_method, reference, payment_date, notes, paid_by
    ) VALUES (
      v_po.tenant_id, v_po.id, v_po.supplier_id, v_amount,
      COALESCE(NULLIF(v_item->>'payment_method', ''), 'bank_transfer'),
      v_reference,
      COALESCE(NULLIF(v_item->>'payment_date', '')::DATE, CURRENT_DATE),
      NULLIF(v_item->>'notes', ''),
      auth.uid()
    )
    RETURNING * INTO v_payment;

    RETURN NEXT v_payment;
  END LOOP;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.pay_purchase_orders(JSONB) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.pay_purchase_orders(JSONB) TO authenticated;

-- ── Carry the supplier invoice number from a confirmed GRN onto its PO ─
-- Keeps the PO traceable to the paperwork even when the invoice ref was
-- only captured at goods-receiving time, not when the PO itself was raised.
CREATE OR REPLACE FUNCTION public.confirm_grn(p_grn_id UUID)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  v_grn   public.goods_received_notes%ROWTYPE;
  v_item  RECORD;
BEGIN
  -- Lock the GRN row so concurrent confirm calls serialize on it instead
  -- of both observing status = 'draft' and double-applying stock.
  SELECT * INTO v_grn FROM public.goods_received_notes WHERE id = p_grn_id FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'GRN % not found', p_grn_id;
  END IF;

  IF v_grn.tenant_id <> public.current_tenant_id() AND NOT public.is_super_admin() THEN
    RAISE EXCEPTION 'Not authorized to confirm this GRN';
  END IF;

  IF v_grn.status = 'confirmed' THEN
    RAISE EXCEPTION 'GRN already confirmed';
  END IF;

  -- Flip status while still holding the row lock, before touching stock,
  -- so a second waiting transaction sees 'confirmed' and aborts above.
  UPDATE public.goods_received_notes
    SET status = 'confirmed', confirmed_at = NOW()
    WHERE id = p_grn_id;

  FOR v_item IN
    SELECT * FROM public.grn_items WHERE grn_id = p_grn_id AND received_qty > 0
  LOOP
    IF v_item.product_id IS NOT NULL THEN
      UPDATE public.products
        SET quantity    = quantity + v_item.received_qty,
            cost_price  = v_item.unit_cost,
            stocked_at  = COALESCE(stocked_at, NOW())
        WHERE id = v_item.product_id;

      INSERT INTO public.inventory_movements (
        tenant_id, product_id, movement_type, quantity,
        unit_cost, stock_before, stock_after,
        reference_id, reference_type
      )
      SELECT
        v_grn.tenant_id,
        v_item.product_id,
        'purchase',
        v_item.received_qty,
        v_item.unit_cost,
        p.quantity - v_item.received_qty,
        p.quantity,
        p_grn_id,
        'grn'
      FROM public.products p WHERE p.id = v_item.product_id;
    END IF;
  END LOOP;

  -- Reflect received quantities back on PO items
  UPDATE public.purchase_order_items poi
  SET received_quantity = received_quantity + gi.received_qty
  FROM public.grn_items gi
  WHERE gi.po_item_id = poi.id AND gi.grn_id = p_grn_id;

  IF v_grn.purchase_order_id IS NOT NULL AND v_grn.supplier_invoice_ref IS NOT NULL THEN
    UPDATE public.purchase_orders
    SET supplier_invoice_ref = COALESCE(supplier_invoice_ref, v_grn.supplier_invoice_ref)
    WHERE id = v_grn.purchase_order_id;
  END IF;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.confirm_grn(UUID) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.confirm_grn(UUID) TO authenticated;
