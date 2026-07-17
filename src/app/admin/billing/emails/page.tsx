import { createServiceClient } from '@/lib/supabase/server'
import { formatDateTime } from '@/lib/utils'

export default async function BillingEmailsPage() {
  const supabase = await createServiceClient()

  const { data: logs } = await supabase
    .from('email_logs')
    .select('*, tenant:tenants(name)')
    .order('created_at', { ascending: false })
    .limit(150)

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Email Delivery Log</h1>
        <p className="text-sm text-gray-500">{logs?.length ?? 0} recent sends</p>
      </div>

      <div className="bg-white rounded-xl border overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tenant</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Template</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Recipient</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Subject</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Sent</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {logs?.map((log) => {
              const t = log.tenant as unknown as { name: string } | null
              return (
                <tr key={log.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm text-gray-700">{t?.name ?? '—'}</td>
                  <td className="px-4 py-3 text-xs font-mono text-gray-500">{log.template}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">{log.recipient}</td>
                  <td className="px-4 py-3 text-sm text-gray-500 truncate max-w-xs">{log.subject}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${log.status === 'sent' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                      {log.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-xs text-gray-500">{formatDateTime(log.created_at)}</td>
                </tr>
              )
            })}
          </tbody>
        </table>
        {(!logs || logs.length === 0) && <div className="text-center py-12 text-gray-400">No emails sent yet</div>}
      </div>
    </div>
  )
}
