-- ============================================================
-- Optional customer KRA PIN — lets a VAT-registered client's PIN be
-- captured and included on tax invoices / eTIMS submissions, so they can
-- claim input VAT on their own return. Nullable: most POS customers are
-- individuals/walk-ins with no PIN.
-- ============================================================

ALTER TABLE public.customers
  ADD COLUMN IF NOT EXISTS kra_pin text;
