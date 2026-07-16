-- ============================================================
-- Stripe webhook idempotency
-- Stripe delivers events at-least-once and can retry on timeout/non-2xx.
-- Without this, a retried invoice.payment_succeeded event created a
-- duplicate row in `invoices` for the same payment on every redelivery.
-- ============================================================

CREATE TABLE IF NOT EXISTS public.stripe_webhook_events (
  event_id   TEXT PRIMARY KEY,
  event_type TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.stripe_webhook_events ENABLE ROW LEVEL SECURITY;
-- Only the service-role client (used exclusively by the webhook handler)
-- ever touches this table — no policies needed for authenticated/anon.
