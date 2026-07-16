-- ============================================================
-- Persist quotations (previously client-side PDF only, never saved)
--
-- product_id becomes optional and item_name/item_sku are stored on the
-- line itself (same pattern as sale_items), so a quotation for a
-- custom/ad-hoc item (no catalog product_id) can be saved too, and so
-- historical quotations display correctly even if a product is later
-- renamed or deleted.
-- ============================================================

ALTER TABLE public.quotation_items
  ALTER COLUMN product_id DROP NOT NULL;

ALTER TABLE public.quotation_items
  ADD COLUMN IF NOT EXISTS item_name TEXT,
  ADD COLUMN IF NOT EXISTS item_sku  TEXT;

ALTER TABLE public.quotation_items
  ADD CONSTRAINT quotation_items_requires_name
  CHECK (product_id IS NOT NULL OR item_name IS NOT NULL);
