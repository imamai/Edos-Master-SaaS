-- ============================================================
-- Fix "new row for relation payments violates check constraint
-- payments_method_check" when paying via M-Pesa Till/Paybill
--
-- The Till/Paybill payment option (added alongside STK Push) sends
-- payments.method = 'mpesa_manual', but the check constraint was never
-- updated to allow it when the feature was built — every Till/Paybill
-- sale was rejected.
-- ============================================================

ALTER TABLE public.payments
  DROP CONSTRAINT payments_method_check;
ALTER TABLE public.payments
  ADD CONSTRAINT payments_method_check
  CHECK (method = ANY (ARRAY['cash'::text, 'card'::text, 'mpesa'::text, 'mpesa_manual'::text, 'credit'::text]));
