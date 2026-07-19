-- ============================================================
-- Fix: goods received via a GRN never actually reached the stock
-- levels the Inventory page, POS, and product_stock view read.
--
-- confirm_grn() only ever updated products.quantity, a column that
-- (per migration 010's findings) nothing in the live app reads for
-- stock_quantity anymore -- the real, branch-scoped stock lives in
-- the `inventory` table, which sales deduct from and which the
-- product_stock view exposes. Receiving goods therefore silently
-- "vanished": the PO/GRN paperwork updated, but the product never
-- became sellable and never showed increased stock anywhere staff
-- could see. This wires GRN confirmation into the real table and
-- logs a stock_movements row so receipts show up in a trail.
-- ============================================================

CREATE OR REPLACE FUNCTION public.confirm_grn(p_grn_id UUID)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  v_grn       public.goods_received_notes%ROWTYPE;
  v_item      RECORD;
  v_branch_id UUID;
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

  -- Goods receiving always posts to a branch's stock. Fall back to the
  -- tenant's main branch when the GRN itself wasn't given one.
  v_branch_id := COALESCE(
    v_grn.branch_id,
    (SELECT id FROM public.branches WHERE tenant_id = v_grn.tenant_id AND is_main = true LIMIT 1)
  );

  FOR v_item IN
    SELECT * FROM public.grn_items WHERE grn_id = p_grn_id AND received_qty > 0
  LOOP
    IF v_item.product_id IS NOT NULL THEN
      -- Legacy column kept in sync for the inventory-intelligence views
      -- (inventory_aging, product_batches costing) that still read it.
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

      -- The actual stock the Inventory page / POS / product_stock view
      -- read from is this branch-scoped table.
      IF v_branch_id IS NOT NULL THEN
        INSERT INTO public.inventory (tenant_id, product_id, branch_id, quantity)
        VALUES (v_grn.tenant_id, v_item.product_id, v_branch_id, v_item.received_qty)
        ON CONFLICT (product_id, branch_id)
        DO UPDATE SET quantity     = public.inventory.quantity + EXCLUDED.quantity,
                       last_updated = NOW();

        INSERT INTO public.stock_movements (
          tenant_id, product_id, branch_id, type, quantity,
          reference_id, reference_type, notes, created_by
        ) VALUES (
          v_grn.tenant_id, v_item.product_id, v_branch_id, 'purchase', v_item.received_qty,
          p_grn_id, 'grn', 'GRN ' || v_grn.grn_number, auth.uid()
        );
      END IF;
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
