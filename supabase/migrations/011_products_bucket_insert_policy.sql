-- ============================================================
-- Fix "new row violates row-level security policy" on product photo upload
--
-- 006_products_storage_mutable.sql assumed an INSERT policy already existed
-- on the products bucket (only UPDATE/DELETE were missing, for re-upload
-- support). On the live database no INSERT policy existed at all — so every
-- upload, not just replacements, was rejected by RLS.
-- ============================================================

CREATE POLICY products_tenant_insert ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'products' AND (storage.foldername(name))[1] = current_tenant_id()::text);

CREATE POLICY products_tenant_select ON storage.objects
  FOR SELECT TO authenticated
  USING (bucket_id = 'products' AND (storage.foldername(name))[1] = current_tenant_id()::text);
