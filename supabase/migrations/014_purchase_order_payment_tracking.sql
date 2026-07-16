-- ============================================================
-- Purchase order payment tracking (accounts payable)
-- Lets a PO be marked unpaid / partially paid / paid, and traced back to
-- its supplier, so outstanding supplier balances can be singled out.
-- ============================================================

ALTER TABLE public.purchase_orders
  ADD COLUMN IF NOT EXISTS payment_status TEXT NOT NULL DEFAULT 'unpaid',
  ADD COLUMN IF NOT EXISTS amount_paid NUMERIC(12,2) NOT NULL DEFAULT 0;

ALTER TABLE public.purchase_orders
  DROP CONSTRAINT IF EXISTS purchase_orders_payment_status_check;
ALTER TABLE public.purchase_orders
  ADD CONSTRAINT purchase_orders_payment_status_check
  CHECK (payment_status IN ('unpaid', 'partial', 'paid'));

ALTER TABLE public.purchase_orders
  DROP CONSTRAINT IF EXISTS purchase_orders_amount_paid_check;
ALTER TABLE public.purchase_orders
  ADD CONSTRAINT purchase_orders_amount_paid_check
  CHECK (amount_paid >= 0 AND amount_paid <= total_amount);
