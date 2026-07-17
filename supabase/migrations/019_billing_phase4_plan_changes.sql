-- ============================================================
-- Billing Phase 4: support deferred downgrades. Per the agreed
-- proration policy — upgrades take effect immediately (with a
-- prorated invoice for the remaining days), downgrades take effect
-- only at the next renewal (no refund of already-collected prepaid
-- time) — a pending plan change needs to be recorded somewhere and
-- applied automatically when the next renewal payment lands.
-- ============================================================

ALTER TABLE public.subscriptions
  ADD COLUMN IF NOT EXISTS pending_plan_id uuid REFERENCES public.plans(id),
  ADD COLUMN IF NOT EXISTS pending_billing_cycle text;
