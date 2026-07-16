-- ============================================================
-- Fix product_stock view + wire up real stock deduction on sale
--
-- Context: the live database's `product_stock` view (dashboard-managed,
-- never tracked in these migration files) aliased products.cost_price as
-- `buying_price`. Every screen reading the view expects `cost_price`, so
-- Buying Price displayed as NaN and silently zeroed out on product edits.
--
-- While fixing that, we also found no trigger ever decremented stock on a
-- sale (the `sale_items` trigger only updated total_sold/last_sale_at), and
-- that products.reorder_level / products.low_stock_threshold had drifted
-- out of sync (the view's low-stock calc reads reorder_level; the product
-- form was only writing low_stock_threshold).
-- ============================================================

-- Sync the two reorder-threshold columns.
UPDATE public.products
SET reorder_level = low_stock_threshold
WHERE low_stock_threshold IS NOT NULL AND reorder_level IS DISTINCT FROM low_stock_threshold;

-- product_stock: rename buying_price -> cost_price, expose wholesale_price,
-- and run as SECURITY INVOKER so the underlying tenant RLS policies on
-- products/categories/inventory are actually enforced per-row (it was
-- previously SECURITY DEFINER, relying only on app-level .eq('tenant_id')
-- filtering for tenant isolation).
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'product_stock' AND column_name = 'buying_price'
  ) THEN
    ALTER VIEW public.product_stock RENAME COLUMN buying_price TO cost_price;
  END IF;
END;
$$;

CREATE OR REPLACE VIEW public.product_stock AS
 SELECT p.tenant_id,
    p.id,
    p.sku,
    p.name,
    p.barcode,
    p.category_id,
    c.name AS category_name,
    p.unit,
    p.cost_price,
    p.selling_price,
    p.vat_rate,
    p.reorder_level,
    p.is_active,
    p.has_serial,
    p.has_warranty,
    p.warranty_months,
    p.image_url,
    COALESCE(i.quantity, 0::numeric) AS stock_quantity,
    COALESCE(i.reserved_quantity, 0::numeric) AS reserved_quantity,
    COALESCE(i.quantity, 0::numeric) - COALESCE(i.reserved_quantity, 0::numeric) AS available_quantity,
    COALESCE(i.quantity, 0::numeric) > 0::numeric AND COALESCE(i.quantity, 0::numeric) <= p.reorder_level::numeric AS is_low_stock,
    COALESCE(i.quantity, 0::numeric) = 0::numeric AS is_out_of_stock,
    p.wholesale_price
   FROM products p
     LEFT JOIN categories c ON p.category_id = c.id
     LEFT JOIN inventory i ON p.id = i.product_id;

ALTER VIEW public.product_stock SET (security_invoker = true);

-- Stock deduction on sale. sale_items has no branch_id of its own; look it
-- up from the parent sale. Deducts from the `inventory` table (product_id +
-- branch_id), which is what product_stock actually reads for
-- stock_quantity — products.quantity is a separate column only touched by
-- GRN receiving. Blocks the insert (and so the whole sale, inside the same
-- transaction as /api/sales/complete) if it would oversell a tracked
-- product; no-ops for products with no inventory row for that branch and
-- for custom line items (product_id IS NULL).
CREATE OR REPLACE FUNCTION public.deduct_stock_on_sale()
RETURNS TRIGGER AS $$
DECLARE
  v_branch_id UUID;
  v_updated INT;
BEGIN
  IF NEW.product_id IS NOT NULL THEN
    SELECT branch_id INTO v_branch_id FROM public.sales WHERE id = NEW.sale_id;

    IF v_branch_id IS NOT NULL THEN
      UPDATE public.inventory
      SET quantity = quantity - NEW.quantity,
          last_updated = NOW()
      WHERE product_id = NEW.product_id
        AND branch_id = v_branch_id
        AND quantity >= NEW.quantity;

      GET DIAGNOSTICS v_updated = ROW_COUNT;

      IF v_updated = 0 AND EXISTS (
        SELECT 1 FROM public.inventory
        WHERE product_id = NEW.product_id AND branch_id = v_branch_id
      ) THEN
        RAISE EXCEPTION 'Insufficient stock for product %', NEW.product_id
          USING ERRCODE = 'P0001';
      END IF;

      IF v_updated > 0 THEN
        INSERT INTO public.stock_movements (product_id, branch_id, type, quantity, reference_id, reference_type, tenant_id)
        SELECT NEW.product_id, v_branch_id, 'sale', -NEW.quantity, NEW.sale_id, 'sale', s.tenant_id
        FROM public.sales s WHERE s.id = NEW.sale_id;
      END IF;
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

DROP TRIGGER IF EXISTS on_sale_item_deduct_stock ON public.sale_items;
CREATE TRIGGER on_sale_item_deduct_stock
  AFTER INSERT ON public.sale_items
  FOR EACH ROW EXECUTE FUNCTION public.deduct_stock_on_sale();
