-- ============================================================
-- Migration 004 – Inventory Intelligence, Procurement & VAT
-- ============================================================
-- Safe to re-run: uses IF NOT EXISTS / ADD COLUMN IF NOT EXISTS
-- ============================================================

-- ── Enhance suppliers ─────────────────────────────────────────
ALTER TABLE public.suppliers
  ADD COLUMN IF NOT EXISTS vat_number      TEXT,
  ADD COLUMN IF NOT EXISTS website         TEXT,
  ADD COLUMN IF NOT EXISTS lead_time_days  INT  NOT NULL DEFAULT 3,
  ADD COLUMN IF NOT EXISTS product_categories TEXT[] NOT NULL DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS is_preferred    BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS rating          NUMERIC(3,1) CHECK (rating BETWEEN 0 AND 5);

-- ── Normalise edos_db column names to match fresh-install schema ─────────
-- Rename buying_price → cost_price (safe: only runs when old name exists)
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'products' AND column_name = 'buying_price'
  ) AND NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'products' AND column_name = 'cost_price'
  ) THEN
    ALTER TABLE public.products RENAME COLUMN buying_price TO cost_price;
  END IF;
END;
$$;

-- Ensure products.branch_id exists (missing in edos_db migration path)
ALTER TABLE public.products
  ADD COLUMN IF NOT EXISTS branch_id UUID REFERENCES public.branches(id);

-- ── Enhance products for stock intelligence ───────────────────
ALTER TABLE public.products
  ADD COLUMN IF NOT EXISTS stocked_at          TIMESTAMPTZ DEFAULT NOW(),
  ADD COLUMN IF NOT EXISTS first_sale_at       TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS last_sale_at        TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS total_sold          INT NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS reorder_quantity    INT NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS max_stock_level     INT,
  ADD COLUMN IF NOT EXISTS stock_classification TEXT NOT NULL DEFAULT 'normal'
    CHECK (stock_classification IN ('fast','normal','slow','dead','overstock'));

-- ── Product Batches ───────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.product_batches (
  id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id         UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  product_id        UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  branch_id         UUID REFERENCES public.branches(id),
  supplier_id       UUID REFERENCES public.suppliers(id),
  batch_number      TEXT NOT NULL,
  initial_quantity  INT NOT NULL DEFAULT 0,
  remaining_qty     INT NOT NULL DEFAULT 0,
  cost_price        NUMERIC(12,2) NOT NULL DEFAULT 0,
  selling_price     NUMERIC(12,2),
  expiry_date       DATE,
  received_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  notes             TEXT,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── Inventory Movements (enriched movement log) ───────────────
CREATE TABLE IF NOT EXISTS public.inventory_movements (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id       UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  branch_id       UUID REFERENCES public.branches(id),
  product_id      UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  batch_id        UUID REFERENCES public.product_batches(id),
  movement_type   TEXT NOT NULL
    CHECK (movement_type IN (
      'sale','purchase','adjustment',
      'transfer_in','transfer_out',
      'return_in','return_out',
      'damage','opening'
    )),
  quantity        INT NOT NULL,
  unit_cost       NUMERIC(12,2),
  unit_price      NUMERIC(12,2),
  stock_before    INT NOT NULL DEFAULT 0,
  stock_after     INT NOT NULL DEFAULT 0,
  reference_id    UUID,
  reference_type  TEXT,
  notes           TEXT,
  performed_by    UUID REFERENCES public.profiles(id),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── Supplier Catalogs ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.supplier_catalogs (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id       UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  supplier_id     UUID NOT NULL REFERENCES public.suppliers(id) ON DELETE CASCADE,
  product_id      UUID REFERENCES public.products(id) ON DELETE SET NULL,
  product_name    TEXT NOT NULL,
  supplier_sku    TEXT,
  unit            TEXT NOT NULL DEFAULT 'pcs',
  unit_price      NUMERIC(12,2) NOT NULL DEFAULT 0,
  moq             INT NOT NULL DEFAULT 1,
  vat_applicable  BOOLEAN NOT NULL DEFAULT true,
  is_available    BOOLEAN NOT NULL DEFAULT true,
  notes           TEXT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── Purchase Orders ───────────────────────────────────────────
-- Create if not exists (old edos_db may already have this table).
-- We then ADD COLUMN IF NOT EXISTS for all needed columns.
CREATE TABLE IF NOT EXISTS public.purchase_orders (
  id                     UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id              UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  supplier_id            UUID REFERENCES public.suppliers(id),
  po_number              TEXT NOT NULL,
  status                 TEXT NOT NULL DEFAULT 'draft',
  total_amount           NUMERIC(12,2) NOT NULL DEFAULT 0,
  created_at             TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at             TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Drop NOT NULL on branch_id if edos_db already had it constrained
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'purchase_orders'
      AND column_name = 'branch_id' AND is_nullable = 'NO'
  ) THEN
    ALTER TABLE public.purchase_orders ALTER COLUMN branch_id DROP NOT NULL;
  END IF;
END;
$$;

ALTER TABLE public.purchase_orders
  ADD COLUMN IF NOT EXISTS branch_id              UUID REFERENCES public.branches(id),
  ADD COLUMN IF NOT EXISTS po_type                TEXT NOT NULL DEFAULT 'purchase_order',
  ADD COLUMN IF NOT EXISTS subtotal               NUMERIC(12,2) NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS vat_amount             NUMERIC(12,2) NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS discount_amount        NUMERIC(12,2) NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS expected_delivery_date DATE,
  ADD COLUMN IF NOT EXISTS notes                  TEXT,
  ADD COLUMN IF NOT EXISTS email_sent_at          TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS approved_by            UUID REFERENCES public.profiles(id),
  ADD COLUMN IF NOT EXISTS approved_at            TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS created_by             UUID REFERENCES public.profiles(id);

-- ── Purchase Order Items ──────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.purchase_order_items (
  id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  purchase_order_id UUID NOT NULL REFERENCES public.purchase_orders(id) ON DELETE CASCADE,
  tenant_id         UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  product_id        UUID REFERENCES public.products(id),
  catalog_item_id   UUID REFERENCES public.supplier_catalogs(id),
  product_name      TEXT NOT NULL,
  product_sku       TEXT,
  quantity          INT NOT NULL DEFAULT 1,
  unit              TEXT NOT NULL DEFAULT 'pcs',
  unit_price        NUMERIC(12,2) NOT NULL DEFAULT 0,
  vat_rate          NUMERIC(5,2) NOT NULL DEFAULT 16,
  vat_amount        NUMERIC(12,2) NOT NULL DEFAULT 0,
  total             NUMERIC(12,2) NOT NULL DEFAULT 0,
  received_quantity INT NOT NULL DEFAULT 0,
  notes             TEXT,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Backfill columns missing when table pre-existed in edos_db
ALTER TABLE public.purchase_order_items
  ADD COLUMN IF NOT EXISTS purchase_order_id UUID REFERENCES public.purchase_orders(id) ON DELETE CASCADE,
  ADD COLUMN IF NOT EXISTS tenant_id         UUID REFERENCES public.tenants(id) ON DELETE CASCADE,
  ADD COLUMN IF NOT EXISTS product_id        UUID REFERENCES public.products(id),
  ADD COLUMN IF NOT EXISTS catalog_item_id   UUID REFERENCES public.supplier_catalogs(id),
  ADD COLUMN IF NOT EXISTS product_name      TEXT,
  ADD COLUMN IF NOT EXISTS product_sku       TEXT,
  ADD COLUMN IF NOT EXISTS quantity          INT NOT NULL DEFAULT 1,
  ADD COLUMN IF NOT EXISTS unit              TEXT NOT NULL DEFAULT 'pcs',
  ADD COLUMN IF NOT EXISTS unit_price        NUMERIC(12,2) NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS vat_rate          NUMERIC(5,2) NOT NULL DEFAULT 16,
  ADD COLUMN IF NOT EXISTS vat_amount        NUMERIC(12,2) NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS total             NUMERIC(12,2) NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS received_quantity INT NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS notes             TEXT,
  ADD COLUMN IF NOT EXISTS created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW();

-- ── Goods Received Notes ──────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.goods_received_notes (
  id                   UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id            UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  branch_id            UUID REFERENCES public.branches(id),
  purchase_order_id    UUID REFERENCES public.purchase_orders(id),
  supplier_id          UUID REFERENCES public.suppliers(id),
  grn_number           TEXT NOT NULL,
  supplier_invoice_ref TEXT,
  received_date        DATE NOT NULL DEFAULT CURRENT_DATE,
  status               TEXT NOT NULL DEFAULT 'draft'
    CHECK (status IN ('draft','confirmed','partial')),
  total_cost           NUMERIC(12,2) NOT NULL DEFAULT 0,
  vat_amount           NUMERIC(12,2) NOT NULL DEFAULT 0,
  notes                TEXT,
  received_by          UUID REFERENCES public.profiles(id),
  confirmed_by         UUID REFERENCES public.profiles(id),
  confirmed_at         TIMESTAMPTZ,
  created_at           TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at           TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Backfill columns missing when table pre-existed in edos_db
ALTER TABLE public.goods_received_notes
  ADD COLUMN IF NOT EXISTS purchase_order_id    UUID REFERENCES public.purchase_orders(id),
  ADD COLUMN IF NOT EXISTS branch_id            UUID REFERENCES public.branches(id),
  ADD COLUMN IF NOT EXISTS supplier_id          UUID REFERENCES public.suppliers(id),
  ADD COLUMN IF NOT EXISTS supplier_invoice_ref TEXT,
  ADD COLUMN IF NOT EXISTS received_date        DATE NOT NULL DEFAULT CURRENT_DATE,
  ADD COLUMN IF NOT EXISTS vat_amount           NUMERIC(12,2) NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS received_by          UUID REFERENCES public.profiles(id),
  ADD COLUMN IF NOT EXISTS confirmed_by         UUID REFERENCES public.profiles(id),
  ADD COLUMN IF NOT EXISTS confirmed_at         TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS updated_at           TIMESTAMPTZ NOT NULL DEFAULT NOW();

-- ── GRN Items ─────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.grn_items (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  grn_id        UUID NOT NULL REFERENCES public.goods_received_notes(id) ON DELETE CASCADE,
  tenant_id     UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  product_id    UUID REFERENCES public.products(id),
  po_item_id    UUID REFERENCES public.purchase_order_items(id),
  product_name  TEXT NOT NULL,
  ordered_qty   INT NOT NULL DEFAULT 0,
  received_qty  INT NOT NULL DEFAULT 0,
  damaged_qty   INT NOT NULL DEFAULT 0,
  unit_cost     NUMERIC(12,2) NOT NULL DEFAULT 0,
  vat_rate      NUMERIC(5,2) NOT NULL DEFAULT 16,
  total_cost    NUMERIC(12,2) NOT NULL DEFAULT 0,
  batch_number  TEXT,
  expiry_date   DATE,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Backfill columns missing when table pre-existed in edos_db
ALTER TABLE public.grn_items
  ADD COLUMN IF NOT EXISTS po_item_id   UUID REFERENCES public.purchase_order_items(id),
  ADD COLUMN IF NOT EXISTS ordered_qty  INT NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS damaged_qty  INT NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS vat_rate     NUMERIC(5,2) NOT NULL DEFAULT 16,
  ADD COLUMN IF NOT EXISTS batch_number TEXT,
  ADD COLUMN IF NOT EXISTS expiry_date  DATE;

-- ── VAT Configurations ────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.vat_configurations (
  id                      UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id               UUID NOT NULL UNIQUE REFERENCES public.tenants(id) ON DELETE CASCADE,
  is_vat_registered       BOOLEAN NOT NULL DEFAULT false,
  vat_registration_number TEXT,
  default_vat_rate        NUMERIC(5,2) NOT NULL DEFAULT 16,
  vat_inclusive           BOOLEAN NOT NULL DEFAULT false,
  apply_vat_to_services   BOOLEAN NOT NULL DEFAULT true,
  zero_rate_exports       BOOLEAN NOT NULL DEFAULT true,
  invoice_footer_note     TEXT DEFAULT 'All prices subject to VAT',
  created_at              TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at              TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── Stock Alerts ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.stock_alerts (
  id                 UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id          UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  product_id         UUID REFERENCES public.products(id) ON DELETE CASCADE,
  alert_type         TEXT NOT NULL
    CHECK (alert_type IN ('low_stock','out_of_stock','dead_stock','overstock','reorder')),
  threshold_days     INT DEFAULT 90,
  is_active          BOOLEAN NOT NULL DEFAULT true,
  last_triggered_at  TIMESTAMPTZ,
  notification_email TEXT,
  created_at         TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── Inventory Aging View ──────────────────────────────────────
CREATE OR REPLACE VIEW public.inventory_aging AS
SELECT
  p.id,
  p.tenant_id,
  p.branch_id,
  p.name,
  p.sku,
  p.quantity,
  p.cost_price,
  p.selling_price,
  p.stocked_at,
  p.first_sale_at,
  p.last_sale_at,
  p.total_sold,
  p.low_stock_threshold,
  p.reorder_quantity,
  p.stock_classification,
  p.category_id,
  p.supplier_id,
  EXTRACT(DAY FROM NOW() - COALESCE(p.last_sale_at, p.stocked_at, p.created_at))::INT
    AS days_since_last_sale,
  EXTRACT(DAY FROM NOW() - COALESCE(p.stocked_at, p.created_at))::INT
    AS days_in_inventory,
  p.quantity * p.cost_price AS stock_value,
  CASE
    WHEN p.quantity = 0 THEN 'out_of_stock'
    WHEN EXTRACT(DAY FROM NOW() - COALESCE(p.last_sale_at, p.stocked_at, p.created_at)) > 90 THEN 'dead'
    WHEN EXTRACT(DAY FROM NOW() - COALESCE(p.last_sale_at, p.stocked_at, p.created_at)) > 60 THEN 'slow'
    WHEN p.total_sold > 20 THEN 'fast'
    ELSE 'normal'
  END AS computed_classification,
  CASE
    WHEN EXTRACT(DAY FROM NOW() - COALESCE(p.stocked_at, p.created_at)) <= 30  THEN '0-30'
    WHEN EXTRACT(DAY FROM NOW() - COALESCE(p.stocked_at, p.created_at)) <= 60  THEN '31-60'
    WHEN EXTRACT(DAY FROM NOW() - COALESCE(p.stocked_at, p.created_at)) <= 90  THEN '61-90'
    ELSE '90+'
  END AS age_bucket,
  c.name AS category_name,
  s.name AS supplier_name
FROM public.products p
LEFT JOIN public.categories c ON c.id = p.category_id
LEFT JOIN public.suppliers  s ON s.id = p.supplier_id
WHERE p.is_active = true;

-- ── Indexes ───────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_product_batches_tenant   ON public.product_batches(tenant_id);
CREATE INDEX IF NOT EXISTS idx_product_batches_product  ON public.product_batches(product_id);
CREATE INDEX IF NOT EXISTS idx_inv_movements_tenant     ON public.inventory_movements(tenant_id);
CREATE INDEX IF NOT EXISTS idx_inv_movements_product    ON public.inventory_movements(product_id);
CREATE INDEX IF NOT EXISTS idx_inv_movements_type       ON public.inventory_movements(movement_type);
CREATE INDEX IF NOT EXISTS idx_inv_movements_created    ON public.inventory_movements(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_supplier_catalogs_tenant ON public.supplier_catalogs(tenant_id);
CREATE INDEX IF NOT EXISTS idx_supplier_catalogs_supp   ON public.supplier_catalogs(supplier_id);
CREATE INDEX IF NOT EXISTS idx_po_tenant                ON public.purchase_orders(tenant_id);
CREATE INDEX IF NOT EXISTS idx_po_supplier              ON public.purchase_orders(supplier_id);
CREATE INDEX IF NOT EXISTS idx_po_status                ON public.purchase_orders(status);
CREATE INDEX IF NOT EXISTS idx_po_items_po              ON public.purchase_order_items(purchase_order_id);
CREATE INDEX IF NOT EXISTS idx_grn_tenant               ON public.goods_received_notes(tenant_id);
CREATE INDEX IF NOT EXISTS idx_grn_po                   ON public.goods_received_notes(purchase_order_id);
CREATE INDEX IF NOT EXISTS idx_grn_items_grn            ON public.grn_items(grn_id);

-- ── Updated_at triggers ───────────────────────────────────────
DROP TRIGGER IF EXISTS trg_product_batches_updated_at ON public.product_batches;
CREATE TRIGGER trg_product_batches_updated_at
  BEFORE UPDATE ON public.product_batches
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS trg_supplier_catalogs_updated_at ON public.supplier_catalogs;
CREATE TRIGGER trg_supplier_catalogs_updated_at
  BEFORE UPDATE ON public.supplier_catalogs
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS trg_purchase_orders_updated_at ON public.purchase_orders;
CREATE TRIGGER trg_purchase_orders_updated_at
  BEFORE UPDATE ON public.purchase_orders
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS trg_grn_updated_at ON public.goods_received_notes;
CREATE TRIGGER trg_grn_updated_at
  BEFORE UPDATE ON public.goods_received_notes
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS trg_vat_config_updated_at ON public.vat_configurations;
CREATE TRIGGER trg_vat_config_updated_at
  BEFORE UPDATE ON public.vat_configurations
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ── Sale stats trigger (augments existing deduct_stock_on_sale) ─
-- Fires AFTER INSERT on sale_items to update sale analytics + movement log.
CREATE OR REPLACE FUNCTION public.update_product_sale_stats()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  IF NEW.product_id IS NOT NULL THEN
    UPDATE public.products
    SET
      last_sale_at = NOW(),
      total_sold   = total_sold + NEW.quantity,
      first_sale_at = COALESCE(first_sale_at, NOW())
    WHERE id = NEW.product_id;

    INSERT INTO public.inventory_movements (
      tenant_id, product_id, movement_type, quantity,
      unit_price, stock_before, stock_after,
      reference_id, reference_type
    )
    SELECT
      NEW.tenant_id,
      NEW.product_id,
      'sale',
      NEW.quantity,
      NEW.unit_price,
      p.quantity + NEW.quantity,   -- stock_before (trigger fires after deduct_stock)
      p.quantity,                  -- stock_after
      NEW.sale_id,
      'sale'
    FROM public.products p WHERE p.id = NEW.product_id;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_sale_item_update_stats ON public.sale_items;
CREATE TRIGGER on_sale_item_update_stats
  AFTER INSERT ON public.sale_items
  FOR EACH ROW EXECUTE FUNCTION public.update_product_sale_stats();

-- ── GRN Confirmation Function ─────────────────────────────────
-- Confirms a GRN: updates product stock, logs movements, marks GRN confirmed.
CREATE OR REPLACE FUNCTION public.confirm_grn(p_grn_id UUID)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  v_grn   public.goods_received_notes%ROWTYPE;
  v_item  RECORD;
BEGIN
  SELECT * INTO v_grn FROM public.goods_received_notes WHERE id = p_grn_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'GRN % not found', p_grn_id;
  END IF;

  IF v_grn.status = 'confirmed' THEN
    RAISE EXCEPTION 'GRN already confirmed';
  END IF;

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

  UPDATE public.goods_received_notes
    SET status = 'confirmed', confirmed_at = NOW()
    WHERE id = p_grn_id;

  -- Reflect received quantities back on PO items
  UPDATE public.purchase_order_items poi
  SET received_quantity = received_quantity + gi.received_qty
  FROM public.grn_items gi
  WHERE gi.po_item_id = poi.id AND gi.grn_id = p_grn_id;
END;
$$;

-- ── PO / GRN Number Generators ────────────────────────────────
CREATE OR REPLACE FUNCTION public.generate_po_number(p_tenant_id UUID)
RETURNS TEXT LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE v_count INT;
BEGIN
  SELECT COUNT(*) + 1 INTO v_count FROM public.purchase_orders WHERE tenant_id = p_tenant_id;
  RETURN 'PO-' || TO_CHAR(NOW(), 'YYMMDD') || '-' || LPAD(v_count::TEXT, 4, '0');
END;
$$;

CREATE OR REPLACE FUNCTION public.generate_grn_number(p_tenant_id UUID)
RETURNS TEXT LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE v_count INT;
BEGIN
  SELECT COUNT(*) + 1 INTO v_count FROM public.goods_received_notes WHERE tenant_id = p_tenant_id;
  RETURN 'GRN-' || TO_CHAR(NOW(), 'YYMMDD') || '-' || LPAD(v_count::TEXT, 4, '0');
END;
$$;

-- ── Row Level Security ────────────────────────────────────────
ALTER TABLE public.product_batches        ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inventory_movements    ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.supplier_catalogs      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.goods_received_notes   ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.grn_items              ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vat_configurations     ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stock_alerts           ENABLE ROW LEVEL SECURITY;

-- Drop before re-creating (idempotent)
DROP POLICY IF EXISTS tenant_product_batches     ON public.product_batches;
DROP POLICY IF EXISTS tenant_inventory_movements ON public.inventory_movements;
DROP POLICY IF EXISTS tenant_supplier_catalogs   ON public.supplier_catalogs;
DROP POLICY IF EXISTS tenant_grn                 ON public.goods_received_notes;
DROP POLICY IF EXISTS tenant_grn_items           ON public.grn_items;
DROP POLICY IF EXISTS tenant_vat_config          ON public.vat_configurations;
DROP POLICY IF EXISTS tenant_stock_alerts        ON public.stock_alerts;

CREATE POLICY tenant_product_batches ON public.product_batches
  FOR ALL USING (tenant_id = public.current_tenant_id() OR public.is_super_admin());

CREATE POLICY tenant_inventory_movements ON public.inventory_movements
  FOR ALL USING (tenant_id = public.current_tenant_id() OR public.is_super_admin());

CREATE POLICY tenant_supplier_catalogs ON public.supplier_catalogs
  FOR ALL USING (tenant_id = public.current_tenant_id() OR public.is_super_admin());

CREATE POLICY tenant_grn ON public.goods_received_notes
  FOR ALL USING (tenant_id = public.current_tenant_id() OR public.is_super_admin());

CREATE POLICY tenant_grn_items ON public.grn_items
  FOR ALL USING (tenant_id = public.current_tenant_id() OR public.is_super_admin());

CREATE POLICY tenant_vat_config ON public.vat_configurations
  FOR ALL USING (tenant_id = public.current_tenant_id() OR public.is_super_admin());

CREATE POLICY tenant_stock_alerts ON public.stock_alerts
  FOR ALL USING (tenant_id = public.current_tenant_id() OR public.is_super_admin());

-- purchase_orders RLS (safe re-create)
ALTER TABLE public.purchase_orders ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_purchase_orders ON public.purchase_orders;
CREATE POLICY tenant_purchase_orders ON public.purchase_orders
  FOR ALL USING (tenant_id = public.current_tenant_id() OR public.is_super_admin());

-- purchase_order_items RLS
ALTER TABLE public.purchase_order_items ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_po_items ON public.purchase_order_items;
CREATE POLICY tenant_po_items ON public.purchase_order_items
  FOR ALL USING (tenant_id = public.current_tenant_id() OR public.is_super_admin());
