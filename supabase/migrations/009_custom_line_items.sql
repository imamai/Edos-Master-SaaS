-- ============================================================
-- Custom (non-catalog) POS line items
-- Lets a cashier ring up a one-off commodity that isn't in the product
-- catalog, with a manually entered name/price. product_id becomes optional;
-- product_name/product_sku are stored on the line itself since there's no
-- catalog row to join for display (receipts, invoices, reports).
-- deduct_stock_on_sale() (001_initial_schema.sql) already no-ops when
-- NEW.product_id IS NULL, so custom items correctly never touch stock.
-- ============================================================

ALTER TABLE public.sale_items
  ALTER COLUMN product_id DROP NOT NULL;

ALTER TABLE public.sale_items
  ADD COLUMN IF NOT EXISTS product_name TEXT,
  ADD COLUMN IF NOT EXISTS product_sku  TEXT;

ALTER TABLE public.sale_items
  ADD CONSTRAINT sale_items_custom_requires_name
  CHECK (product_id IS NOT NULL OR product_name IS NOT NULL);
