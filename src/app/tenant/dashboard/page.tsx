import { createClient } from '@/lib/supabase/server'
import DashboardClient from '@/components/dashboard/DashboardClient'

export default async function DashboardPage() {
  const supabase = await createClient()
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = supabase as any
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data: profile } = await db
    .from('profiles')
    .select('tenant_id')
    .eq('id', user.id)
    .single()

  if (!profile?.tenant_id) return null
  const tenantId = profile.tenant_id as string

  const today = new Date().toISOString().split('T')[0]
  const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  const monthStart = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0]

  const [
    { data: todaySales },
    { data: weekSales },
    { data: monthSales },
    { data: lowStock },
    { data: recentSales },
    { data: topProducts },
  ] = await Promise.all([
    db.from('sales').select('total_amount, payment_method')
      .eq('tenant_id', tenantId).eq('status', 'completed')
      .gte('created_at', `${today}T00:00:00`),
    db.from('sales').select('total_amount, created_at')
      .eq('tenant_id', tenantId).eq('status', 'completed')
      .gte('created_at', `${weekAgo}T00:00:00`),
    db.from('sales').select('total_amount')
      .eq('tenant_id', tenantId).eq('status', 'completed')
      .gte('created_at', `${monthStart}T00:00:00`),
    supabase.from('product_stock').select('id, name, stock_quantity, reorder_level, category_name')
      .eq('tenant_id', tenantId).eq('is_active', true)
      .eq('is_low_stock', true).limit(10),
    db.from('sales')
      .select('id, receipt_number, total_amount, payment_method, created_at, customers(name), profiles!cashier_id(full_name)')
      .eq('tenant_id', tenantId).eq('status', 'completed')
      .order('created_at', { ascending: false }).limit(8),
    db.from('sales')
      .select('sale_items(product_id, quantity, products(name, categories(name)))')
      .eq('tenant_id', tenantId).eq('status', 'completed')
      .gte('created_at', `${monthStart}T00:00:00`).limit(100),
  ])

  type SaleRow = { total_amount: number; payment_method: string; created_at: string }
  type SaleItemRow = { product_id: string; quantity: number; products: { name: string; categories: { name: string } | null } | null }
  type SaleWithItems = { sale_items: SaleItemRow[] | null }
  const ts = (todaySales ?? []) as SaleRow[]
  const ws = (weekSales ?? []) as SaleRow[]
  const ms = (monthSales ?? []) as SaleRow[]
  const tpRaw = ((topProducts ?? []) as SaleWithItems[]).flatMap((s) => s.sale_items ?? [])

  const stats = {
    today_sales: ts.length,
    today_revenue: ts.reduce((s, r) => s + r.total_amount, 0),
    week_revenue: ws.reduce((s, r) => s + r.total_amount, 0),
    month_revenue: ms.reduce((s, r) => s + r.total_amount, 0),
    low_stock_count: lowStock?.length ?? 0,
    cash_today: ts.filter((s) => s.payment_method === 'cash').reduce((s, r) => s + r.total_amount, 0),
    mpesa_today: ts.filter((s) => s.payment_method === 'mpesa').reduce((s, r) => s + r.total_amount, 0),
    credit_today: ts.filter((s) => s.payment_method === 'credit').reduce((s, r) => s + r.total_amount, 0),
  }

  const chartData = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(Date.now() - (6 - i) * 86400000)
    const dStr = d.toISOString().split('T')[0]
    const dayRevenue = ws.filter((s) => s.created_at.startsWith(dStr)).reduce((s, r) => s + r.total_amount, 0)
    return { date: d.toLocaleDateString('en-KE', { weekday: 'short' }), revenue: dayRevenue }
  })

  const productMap = new Map<string, { name: string; qty: number; category: string }>()
  tpRaw.forEach((item) => {
    const key = item.product_id
    if (!productMap.has(key)) {
      productMap.set(key, { name: item.products?.name ?? 'Unknown', qty: 0, category: item.products?.categories?.name ?? '' })
    }
    const entry = productMap.get(key)!
    entry.qty += Number(item.quantity)
  })
  const topProductList = [...productMap.entries()]
    .map(([id, v]) => ({ id, ...v }))
    .sort((a, b) => b.qty - a.qty)
    .slice(0, 5)

  return (
    <div className="p-6">
      <DashboardClient
        stats={stats}
        chartData={chartData}
        lowStock={(lowStock ?? []) as { id: string; name: string; stock_quantity: number; reorder_level: number; category_name: string }[]}
        recentSales={(recentSales ?? []) as unknown as Parameters<typeof DashboardClient>[0]['recentSales']}
        topProducts={topProductList}
      />
    </div>
  )
}
