-- ============================================================
-- expense_categories was a single global list shared by every
-- tenant (no tenant_id, RLS only checked auth.uid() IS NOT NULL),
-- seeded with categories for one specific business (poultry farm).
-- Make it tenant-configurable like product categories: existing
-- rows stay as shared defaults (tenant_id NULL, visible to all,
-- not editable by tenants), and each tenant can add/rename/delete
-- their own on top of those.
-- ============================================================

ALTER TABLE public.expense_categories
  ADD COLUMN IF NOT EXISTS tenant_id uuid REFERENCES public.tenants(id) ON DELETE CASCADE;

DROP POLICY IF EXISTS auth_expense_categories_read ON public.expense_categories;
DROP POLICY IF EXISTS super_admin_expense_categories ON public.expense_categories;

CREATE POLICY expense_categories_select ON public.expense_categories
  FOR SELECT
  USING (tenant_id IS NULL OR tenant_id = current_tenant_id() OR is_super_admin());

CREATE POLICY expense_categories_tenant_write ON public.expense_categories
  FOR ALL
  USING (tenant_id = current_tenant_id() OR is_super_admin())
  WITH CHECK (tenant_id = current_tenant_id() OR is_super_admin());
