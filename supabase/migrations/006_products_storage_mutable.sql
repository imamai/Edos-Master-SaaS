-- ============================================================
-- Allow tenants to replace/remove their own product photos
-- Uploads are stored under `${tenant_id}/...` in the `products`
-- bucket; INSERT-only policies meant `upsert: true` re-uploads to
-- an existing path failed RLS, so photos could never be replaced.
-- ============================================================

CREATE POLICY "products_tenant_update" ON storage.objects
  FOR UPDATE TO authenticated
  USING (bucket_id = 'products' AND (storage.foldername(name))[1] = public.current_tenant_id()::text)
  WITH CHECK (bucket_id = 'products' AND (storage.foldername(name))[1] = public.current_tenant_id()::text);

CREATE POLICY "products_tenant_delete" ON storage.objects
  FOR DELETE TO authenticated
  USING (bucket_id = 'products' AND (storage.foldername(name))[1] = public.current_tenant_id()::text);
