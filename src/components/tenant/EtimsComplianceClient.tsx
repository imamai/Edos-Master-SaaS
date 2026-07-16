'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { formatCurrency } from '@/lib/utils'
import {
  CheckCircle2, XCircle, Clock, RefreshCw, AlertTriangle,
  QrCode, FileText, ChevronDown, ChevronUp, Loader2
} from 'lucide-react'
import toast from 'react-hot-toast'

interface EtimsInvoice {
  id:               string
  sale_id:          string
  etims_invoice_no: number
  status:           'pending' | 'submitted' | 'confirmed' | 'failed' | 'cancelled'
  irn:              string | null
  qr_code:          string | null
  result_code:      string | null
  result_msg:       string | null
  submitted_at:     string | null
  created_at:       string
  sales: {
    receipt_number: string
    total:          number
    payment_method: string
    created_at:     string
  } | null
}

interface QueueItem {
  id:             string
  sale_id:        string
  status:         string
  attempt_count:  number
  last_error:     string | null
  next_attempt_at: string
  created_at:     string
  sales: { receipt_number: string; total: number } | null
}

interface Props {
  tenantId: string
}

const STATUS_CONFIG = {
  submitted:  { label: 'Submitted',  color: 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-400',   icon: CheckCircle2 },
  confirmed:  { label: 'Confirmed',  color: 'bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-400', icon: CheckCircle2 },
  pending:    { label: 'Pending',    color: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-950 dark:text-yellow-400', icon: Clock },
  failed:     { label: 'Failed',     color: 'bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-400',     icon: XCircle },
  cancelled:  { label: 'Cancelled',  color: 'bg-gray-100 text-gray-500 dark:bg-slate-800 dark:text-slate-400',   icon: XCircle },
}

export default function EtimsComplianceClient({ tenantId }: Props) {
  const supabase = createClient()
  const [invoices, setInvoices] = useState<EtimsInvoice[]>([])
  const [queue,    setQueue]    = useState<QueueItem[]>([])
  const [loading,  setLoading]  = useState(true)
  const [tab,      setTab]      = useState<'invoices' | 'queue'>('invoices')
  const [expanded, setExpanded] = useState<string | null>(null)
  const [retrying, setRetrying] = useState<string | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    const [{ data: inv }, { data: q }] = await Promise.all([
      supabase
        .from('etims_invoices')
        .select('*, sales(receipt_number, total, payment_method, created_at)')
        .eq('tenant_id', tenantId)
        .order('created_at', { ascending: false })
        .limit(100),
      supabase
        .from('etims_queue')
        .select('*, sales(receipt_number, total)')
        .eq('tenant_id', tenantId)
        .neq('status', 'done')
        .order('created_at', { ascending: false })
        .limit(50),
    ])
    setInvoices((inv ?? []) as EtimsInvoice[])
    setQueue((q ?? []) as QueueItem[])
    setLoading(false)
  }, [tenantId, supabase])

  useEffect(() => { load() }, [load])

  const handleRetry = async (saleId: string) => {
    setRetrying(saleId)
    const res  = await fetch('/api/etims/retry', {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ saleId, tenantId }),
    })
    const json = await res.json() as { ok?: boolean; error?: string }
    setRetrying(null)
    if (json.ok) { toast.success('Invoice submitted successfully'); await load() }
    else { toast.error(json.error || 'Retry failed – added back to queue') }
  }

  const stats = {
    total:     invoices.length,
    submitted: invoices.filter((i) => i.status === 'submitted' || i.status === 'confirmed').length,
    failed:    invoices.filter((i) => i.status === 'failed').length,
    pending:   invoices.filter((i) => i.status === 'pending').length,
    queued:    queue.length,
  }

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Invoices', value: stats.total,     color: 'text-gray-900 dark:text-white' },
          { label: 'Submitted',      value: stats.submitted, color: 'text-green-600 dark:text-green-400' },
          { label: 'Failed',         value: stats.failed,    color: 'text-red-600 dark:text-red-400' },
          { label: 'In Queue',       value: stats.queued,    color: 'text-amber-600 dark:text-amber-400' },
        ].map((s) => (
          <div key={s.label} className="bg-white border rounded-xl p-4 dark:bg-slate-800 dark:border-slate-700">
            <p className="text-xs text-gray-500 dark:text-slate-400">{s.label}</p>
            <p className={`text-2xl font-bold mt-1 ${s.color}`}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Failed alert */}
      {stats.failed > 0 && (
        <div className="flex items-start gap-3 bg-red-50 border border-red-200 rounded-xl p-4 dark:bg-red-950/30 dark:border-red-900">
          <AlertTriangle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-red-800 dark:text-red-300">
              {stats.failed} invoice{stats.failed > 1 ? 's' : ''} failed to submit
            </p>
            <p className="text-xs text-red-700 mt-1 dark:text-red-400">
              Use the Retry button below to resubmit. Ensure your eTIMS credentials are correct.
            </p>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-1 border-b dark:border-slate-700">
        {(['invoices', 'queue'] as const).map((t) => (
          <button key={t} onClick={() => setTab(t)}
            className={`px-4 py-2.5 text-sm font-medium rounded-t-lg border-b-2 transition-colors capitalize ${
              tab === t ? 'border-blue-600 text-blue-600 dark:border-blue-500 dark:text-blue-400' : 'border-transparent text-gray-500 hover:text-gray-900 dark:text-slate-400 dark:hover:text-white'
            }`}>
            {t === 'invoices' ? `Invoices (${stats.total})` : `Queue (${stats.queued})`}
          </button>
        ))}
        <button onClick={() => load()} disabled={loading}
          className="ml-auto flex items-center gap-1.5 px-3 py-2 text-xs text-gray-500 hover:text-gray-900 disabled:opacity-50 dark:text-slate-400 dark:hover:text-white">
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {/* Invoices table */}
      {tab === 'invoices' && (
        loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="w-6 h-6 animate-spin text-gray-300 dark:text-slate-600" />
          </div>
        ) : invoices.length === 0 ? (
          <div className="text-center py-16 text-gray-400 dark:text-slate-500">
            <FileText className="w-10 h-10 mx-auto mb-2 opacity-30" />
            <p className="text-sm">No eTIMS invoices yet. Complete a sale to generate one.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {invoices.map((inv) => {
              const cfg    = STATUS_CONFIG[inv.status] || STATUS_CONFIG.pending
              const Icon   = cfg.icon
              const sale   = inv.sales
              const isOpen = expanded === inv.id
              return (
                <div key={inv.id} className="bg-white border rounded-xl overflow-hidden dark:bg-slate-800 dark:border-slate-700">
                  <div
                    className="flex items-center gap-3 p-4 cursor-pointer hover:bg-gray-50 dark:hover:bg-slate-700"
                    onClick={() => setExpanded(isOpen ? null : inv.id)}
                  >
                    <Icon className={`w-4 h-4 flex-shrink-0 ${cfg.color.split(' ')[1]}`} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm font-semibold text-gray-900 dark:text-white">
                          eTIMS #{inv.etims_invoice_no}
                        </span>
                        {sale?.receipt_number && (
                          <span className="text-xs text-gray-400 dark:text-slate-500">({sale.receipt_number})</span>
                        )}
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${cfg.color}`}>
                          {cfg.label}
                        </span>
                      </div>
                      <p className="text-xs text-gray-400 mt-0.5 dark:text-slate-500">
                        {sale ? formatCurrency(sale.total) : '—'}
                        {inv.submitted_at && ` · ${new Date(inv.submitted_at).toLocaleString()}`}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      {inv.status === 'failed' && (
                        <button
                          onClick={(e) => { e.stopPropagation(); handleRetry(inv.sale_id) }}
                          disabled={retrying === inv.sale_id}
                          className="flex items-center gap-1 px-2.5 py-1.5 bg-blue-600 text-white rounded-lg text-xs font-medium hover:bg-blue-700 disabled:opacity-50"
                        >
                          {retrying === inv.sale_id
                            ? <Loader2 className="w-3 h-3 animate-spin" />
                            : <RefreshCw className="w-3 h-3" />}
                          Retry
                        </button>
                      )}
                      {isOpen ? <ChevronUp className="w-4 h-4 text-gray-400 dark:text-slate-500" /> : <ChevronDown className="w-4 h-4 text-gray-400 dark:text-slate-500" />}
                    </div>
                  </div>

                  {isOpen && (
                    <div className="border-t bg-gray-50 p-4 space-y-3 dark:border-slate-700 dark:bg-slate-900">
                      {inv.irn && (
                        <div>
                          <p className="text-xs font-semibold text-gray-500 uppercase mb-1 dark:text-slate-400">Invoice Reference Number (IRN)</p>
                          <p className="text-sm font-mono bg-white border rounded-lg px-3 py-2 text-gray-800 break-all dark:bg-slate-800 dark:border-slate-700 dark:text-white">{inv.irn}</p>
                        </div>
                      )}
                      {inv.qr_code && (
                        <div>
                          <p className="text-xs font-semibold text-gray-500 uppercase mb-1 flex items-center gap-1 dark:text-slate-400">
                            <QrCode className="w-3.5 h-3.5" /> QR Code
                          </p>
                          <p className="text-xs font-mono bg-white border rounded-lg px-3 py-2 text-gray-600 break-all dark:bg-slate-800 dark:border-slate-700 dark:text-slate-300">{inv.qr_code}</p>
                        </div>
                      )}
                      {inv.result_msg && (
                        <div>
                          <p className="text-xs font-semibold text-gray-500 uppercase mb-1 dark:text-slate-400">KRA Response</p>
                          <p className="text-xs bg-white border rounded-lg px-3 py-2 text-gray-700 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-200">
                            [{inv.result_code}] {inv.result_msg}
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )
      )}

      {/* Queue table */}
      {tab === 'queue' && (
        loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="w-6 h-6 animate-spin text-gray-300 dark:text-slate-600" />
          </div>
        ) : queue.length === 0 ? (
          <div className="text-center py-16 text-gray-400 dark:text-slate-500">
            <CheckCircle2 className="w-10 h-10 mx-auto mb-2 opacity-30" />
            <p className="text-sm">Queue is empty – all invoices submitted.</p>
          </div>
        ) : (
          <div className="overflow-x-auto rounded-xl border bg-white dark:border-slate-700 dark:bg-slate-800">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b dark:bg-slate-900 dark:border-slate-700">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase dark:text-slate-400">Receipt</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase dark:text-slate-400">Status</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase dark:text-slate-400">Attempts</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase dark:text-slate-400">Next Retry</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase dark:text-slate-400">Error</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y dark:divide-slate-700">
                {queue.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50 dark:hover:bg-slate-700">
                    <td className="px-4 py-3 font-medium dark:text-white">{item.sales?.receipt_number || '—'}</td>
                    <td className="px-4 py-3">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium capitalize ${
                        item.status === 'failed'     ? 'bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-400' :
                        item.status === 'processing' ? 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-400' :
                        'bg-yellow-100 text-yellow-700 dark:bg-yellow-950 dark:text-yellow-400'
                      }`}>{item.status}</span>
                    </td>
                    <td className="px-4 py-3 text-gray-600 dark:text-slate-300">{item.attempt_count}</td>
                    <td className="px-4 py-3 text-xs text-gray-500 dark:text-slate-400">
                      {new Date(item.next_attempt_at).toLocaleString()}
                    </td>
                    <td className="px-4 py-3 text-xs text-red-600 max-w-xs truncate dark:text-red-400">{item.last_error || '—'}</td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => handleRetry(item.sale_id)}
                        disabled={retrying === item.sale_id}
                        className="flex items-center gap-1 px-2.5 py-1.5 border border-gray-200 text-gray-700 rounded-lg text-xs hover:bg-gray-50 disabled:opacity-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-700"
                      >
                        {retrying === item.sale_id
                          ? <Loader2 className="w-3 h-3 animate-spin" />
                          : <RefreshCw className="w-3 h-3" />}
                        Retry Now
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )
      )}
    </div>
  )
}
