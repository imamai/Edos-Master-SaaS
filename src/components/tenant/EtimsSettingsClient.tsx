'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import toast from 'react-hot-toast'
import { Loader2, ShieldCheck, AlertTriangle, CheckCircle2, RefreshCw, Info } from 'lucide-react'

const schema = z.object({
  kra_pin:       z.string().min(11, 'KRA PIN must be at least 11 characters').toUpperCase(),
  branch_id:     z.string().default('000'),
  device_serial: z.string().default('VSCU001'),
  environment:   z.enum(['sandbox', 'production']),
  is_enabled:    z.boolean(),
})

type FormData = z.infer<typeof schema>

interface EtimsSettings {
  id?:            string
  is_enabled:     boolean
  environment:    'sandbox' | 'production'
  kra_pin?:       string | null
  branch_id?:     string
  device_serial?: string
  next_invoice_no?: number
  initialized_at?: string | null
}

interface Props {
  tenantId:         string
  initialSettings:  EtimsSettings | null
}

export default function EtimsSettingsClient({ tenantId, initialSettings }: Props) {
  const [settings, setSettings]   = useState<EtimsSettings | null>(initialSettings)
  const [initialising, setInit]   = useState(false)

  const { register, handleSubmit, watch, formState: { isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      kra_pin:       settings?.kra_pin       || '',
      branch_id:     settings?.branch_id     || '000',
      device_serial: settings?.device_serial || 'VSCU001',
      environment:   settings?.environment   || 'sandbox',
      is_enabled:    settings?.is_enabled    || false,
    },
  })

  const isEnabled = watch('is_enabled')

  const onSave = async (data: FormData) => {
    const res = await fetch('/api/etims/settings', {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ ...data, kra_pin: data.kra_pin.trim().toUpperCase() }),
    })
    if (res.ok) {
      toast.success('eTIMS settings saved')
      setSettings((prev) => ({ ...prev, ...data }))
    } else {
      const err = await res.json() as { error?: string }
      toast.error(err.error || 'Failed to save settings')
    }
  }

  const handleInit = async () => {
    setInit(true)
    const res  = await fetch('/api/etims/init', { method: 'POST' })
    const json = await res.json() as { ok?: boolean; error?: string; result_code?: string }
    setInit(false)
    if (json.ok) {
      toast.success('Device initialised with KRA successfully')
      setSettings((prev) => prev ? { ...prev, initialized_at: new Date().toISOString() } : prev)
    } else {
      toast.error(json.error || `KRA error code: ${json.result_code}`)
    }
  }

  return (
    <div className="max-w-xl space-y-6">

      {/* Status banner */}
      {settings?.is_enabled ? (
        <div className="flex items-start gap-3 bg-green-50 border border-green-200 rounded-xl p-4">
          <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-green-800">eTIMS Active</p>
            <p className="text-xs text-green-700 mt-0.5">
              {settings.initialized_at
                ? `Device initialised on ${new Date(settings.initialized_at).toLocaleDateString()}`
                : 'Device not yet initialised – click "Initialise with KRA" below.'}
            </p>
            <p className="text-xs text-green-600 mt-1">
              Next invoice #: <strong>{settings.next_invoice_no ?? 1}</strong>
            </p>
          </div>
        </div>
      ) : (
        <div className="flex items-start gap-3 bg-amber-50 border border-amber-200 rounded-xl p-4">
          <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-amber-800">eTIMS Disabled</p>
            <p className="text-xs text-amber-700 mt-0.5">
              Enable eTIMS to automatically send tax invoices to KRA after every sale.
            </p>
          </div>
        </div>
      )}

      {/* Settings form */}
      <form onSubmit={handleSubmit(onSave)} className="space-y-4">
        <div className="border rounded-xl p-4 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-gray-900">Enable eTIMS</p>
              <p className="text-xs text-gray-500 mt-0.5">Automatically submit invoices to KRA on each sale</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input {...register('is_enabled')} type="checkbox" className="sr-only peer" />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-500 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600" />
            </label>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            KRA PIN (TIN) <span className="text-red-500">*</span>
          </label>
          <input
            {...register('kra_pin')}
            placeholder="e.g. P051234567A"
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm font-mono uppercase focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <p className="text-xs text-gray-400 mt-1">Your Kenya Revenue Authority PIN number.</p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Environment</label>
          <select
            {...register('environment')}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="sandbox">Sandbox (Testing)</option>
            <option value="production">Production (Live KRA)</option>
          </select>
          <p className="text-xs text-gray-400 mt-1">Use sandbox while testing. Switch to production when going live.</p>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Branch ID (bhfId)</label>
            <input
              {...register('branch_id')}
              placeholder="000"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <p className="text-xs text-gray-400 mt-1">Use 000 for main branch.</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Device Serial (VSCU)</label>
            <input
              {...register('device_serial')}
              placeholder="VSCU001"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <p className="text-xs text-gray-400 mt-1">Virtual SCU identifier.</p>
          </div>
        </div>

        <div className="flex items-start gap-2 bg-blue-50 border border-blue-100 rounded-xl p-3">
          <Info className="w-4 h-4 text-blue-500 flex-shrink-0 mt-0.5" />
          <p className="text-xs text-blue-700">
            eTIMS credentials are stored securely and never exposed to the browser.
            All invoice submissions are made server-side only.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="submit"
            disabled={isSubmitting}
            className="flex items-center gap-2 bg-blue-600 text-white px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50"
          >
            {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
            <ShieldCheck className="w-4 h-4" />
            Save Settings
          </button>

          {isEnabled && settings?.kra_pin && (
            <button
              type="button"
              onClick={handleInit}
              disabled={initialising}
              className="flex items-center gap-2 border border-gray-300 text-gray-700 px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-gray-50 disabled:opacity-50"
            >
              {initialising ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
              Initialise with KRA
            </button>
          )}
        </div>
      </form>

      {/* Help section */}
      <div className="border rounded-xl p-4 space-y-3">
        <p className="text-sm font-semibold text-gray-800">Setup Steps</p>
        <ol className="space-y-2 text-xs text-gray-600 list-decimal list-inside">
          <li>Enter your KRA PIN and select Sandbox for testing.</li>
          <li>Click <strong>Save Settings</strong>, then <strong>Initialise with KRA</strong>.</li>
          <li>Complete a test sale in the POS — a tax invoice will be submitted automatically.</li>
          <li>Check the eTIMS Compliance page to verify the submission status.</li>
          <li>When ready for live transactions, change environment to Production and repeat initialisation.</li>
        </ol>
      </div>
    </div>
  )
}
