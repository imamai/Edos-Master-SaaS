-- ============================================================
-- Wholesale vs retail pricing
-- Adds an optional wholesale price per product and records which price
-- tier a sale was rung up under, for reporting.
-- ============================================================

ALTER TABLE public.products
  ADD COLUMN IF NOT EXISTS wholesale_price NUMERIC(12,2);

ALTER TABLE public.sales
  ADD COLUMN IF NOT EXISTS price_mode TEXT NOT NULL DEFAULT 'retail'
    CHECK (price_mode IN ('retail', 'wholesale'));
