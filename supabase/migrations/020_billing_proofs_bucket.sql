-- ============================================================
-- Private storage bucket for bank-transfer / manual payment proof
-- uploads (screenshots, PDFs). Not public — tenants can upload their
-- own proof, only they and super_admin can read it back.
-- ============================================================

INSERT INTO storage.buckets (id, name, public)
VALUES ('billing-proofs', 'billing-proofs', false)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY billing_proofs_tenant_insert ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'billing-proofs' AND (storage.foldername(name))[1] = (current_tenant_id())::text);

CREATE POLICY billing_proofs_tenant_select ON storage.objects
  FOR SELECT TO authenticated
  USING (bucket_id = 'billing-proofs' AND ((storage.foldername(name))[1] = (current_tenant_id())::text OR is_super_admin()));
