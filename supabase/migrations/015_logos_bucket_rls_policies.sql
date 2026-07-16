-- ============================================================
-- logos storage bucket had NO RLS policies at all, so every
-- tenant logo upload was rejected with "new row violates
-- row-level security policy". Scope insert/update to the
-- tenant's own folder, same pattern as the products bucket.
-- ============================================================

CREATE POLICY logos_tenant_insert ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'logos' AND (storage.foldername(name))[1] = (current_tenant_id())::text);

CREATE POLICY logos_tenant_update ON storage.objects
  FOR UPDATE TO authenticated
  USING (bucket_id = 'logos' AND (storage.foldername(name))[1] = (current_tenant_id())::text)
  WITH CHECK (bucket_id = 'logos' AND (storage.foldername(name))[1] = (current_tenant_id())::text);

CREATE POLICY logos_tenant_delete ON storage.objects
  FOR DELETE TO authenticated
  USING (bucket_id = 'logos' AND (storage.foldername(name))[1] = (current_tenant_id())::text);
