import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import QuotationsHistoryClient from '@/components/quotations/QuotationsHistoryClient'

export default async function QuotationsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>
}) {
  const params = await searchParams
  const page = parseInt(params.page || '1')
  const pageSize = 25

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data: profile } = await supabase
    .from('profiles')
    .select('tenant_id')
    .eq('id', user.id)
    .single()

  if (!profile?.tenant_id) return null

  const { data: tenant } = await supabase
    .from('tenants')
    .select('name, phone, metadata')
    .eq('id', profile.tenant_id)
    .single()

  const meta = (tenant?.metadata ?? {}) as Record<string, string>

  const { data: quotations, count } = await supabase
    .from('quotations')
    .select('*, customer:customers(name, phone)', { count: 'exact' })
    .eq('tenant_id', profile.tenant_id)
    .order('created_at', { ascending: false })
    .range((page - 1) * pageSize, page * pageSize - 1)

  const totalPages = Math.ceil((count || 0) / pageSize)

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Quotations</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">{count ?? 0} quotations generated</p>
        </div>
      </div>

      <QuotationsHistoryClient
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        quotations={(quotations ?? []) as any}
        tenantName={tenant?.name ?? 'Store'}
        tenantAddress={meta.address || undefined}
        tenantPhone={tenant?.phone ?? undefined}
        tenantKraPIN={meta.kra_pin || undefined}
        quotationNotes={meta.quotation_notes || undefined}
      />

      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-4">
          <p className="text-sm text-gray-500 dark:text-gray-400">Page {page} of {totalPages}</p>
          <div className="flex gap-2">
            {page > 1 && <Link href={`?page=${page - 1}`} className="px-3 py-1.5 border border-gray-200 dark:border-slate-700 rounded-lg text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-slate-800">Previous</Link>}
            {page < totalPages && <Link href={`?page=${page + 1}`} className="px-3 py-1.5 border border-gray-200 dark:border-slate-700 rounded-lg text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-slate-800">Next</Link>}
          </div>
        </div>
      )}
    </div>
  )
}
