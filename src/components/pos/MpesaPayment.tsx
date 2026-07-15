'use client'

import { useState } from 'react'
import { formatCurrency } from '@/lib/utils'
import { Smartphone, CheckCircle2, XCircle, Loader2, RefreshCw } from 'lucide-react'

interface Props {
  amount: number
  tenantId: string
  customerPhone?: string
  onSuccess: () => void
  onCancel: () => void
}

type Step = 'phone' | 'waiting' | 'success' | 'failed'

export default function MpesaPayment({ amount, tenantId, customerPhone, onSuccess, onCancel }: Props) {
  const [phone, setPhone] = useState(customerPhone ?? '')
  const [step, setStep] = useState<Step>('phone')
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [pollCount, setPollCount] = useState(0)

  function formatPhone(value: string): string {
    const digits = value.replace(/\D/g, '')
    if (digits.startsWith('254')) return digits
    if (digits.startsWith('0')) return '254' + digits.slice(1)
    return '254' + digits
  }

  async function initiateSTK() {
    const formatted = formatPhone(phone)
    if (formatted.length < 12) {
      setErrorMsg('Enter a valid Safaricom number')
      return
    }
    setStep('waiting')
    setErrorMsg(null)

    try {
      const resp = await fetch('/api/mpesa/stk-push', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: formatted, amount: Math.ceil(amount), tenantId }),
      })
      const data = await resp.json()

      if (!resp.ok) {
        setErrorMsg(data.message ?? 'STK Push failed')
        setStep('failed')
        return
      }

      const cid = data.checkoutRequestId
      pollStatus(cid, 0)
    } catch {
      setErrorMsg('Network error. Please try again.')
      setStep('failed')
    }
  }

  async function pollStatus(id: string, count: number) {
    if (count > 36) {
      setStep('failed')
      setErrorMsg('Payment timed out after 3 minutes. Please try again.')
      return
    }

    await new Promise((r) => setTimeout(r, 5000))
    setPollCount(count + 1)

    try {
      const resp = await fetch('/api/mpesa/query', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ checkoutRequestId: id, tenantId }),
      })
      const data = await resp.json()

      if (data.status === 'completed') {
        setStep('success')
        setTimeout(onSuccess, 1500)
      } else if (data.status === 'failed' || data.status === 'cancelled') {
        setStep('failed')
        setErrorMsg(data.message ?? 'Payment was not completed')
      } else {
        // still pending — keep polling
        pollStatus(id, count + 1)
      }
    } catch {
      pollStatus(id, count + 1)
    }
  }

  if (step === 'waiting') {
    return (
      <div className="p-8 text-center space-y-5">
        <div className="w-20 h-20 rounded-full bg-green-100 mx-auto flex items-center justify-center">
          <Loader2 className="w-10 h-10 text-green-600 animate-spin" />
        </div>
        <h3 className="text-xl font-bold text-slate-800">Waiting for Payment</h3>
        <p className="text-slate-500 text-sm">
          An M-Pesa STK Push has been sent to <strong>{phone}</strong>.<br />
          Please enter your M-Pesa PIN to complete payment.
        </p>
        <div className="bg-green-50 rounded-xl p-4">
          <p className="text-2xl font-bold text-green-600">{formatCurrency(amount)}</p>
          <p className="text-xs text-green-600 mt-1">Amount to pay</p>
        </div>
        <div className="flex items-center justify-center gap-2 text-slate-400 text-sm">
          <span>Checking status</span>
          <span className="flex gap-1">
            {[0, 1, 2].map((i) => (
              <span key={i} className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: `${i * 0.15}s` }} />
            ))}
          </span>
          <span>({pollCount * 5}s)</span>
        </div>
        <button onClick={onCancel} className="text-sm text-slate-400 hover:text-red-500 underline">Cancel</button>
      </div>
    )
  }

  if (step === 'success') {
    return (
      <div className="p-8 text-center space-y-4">
        <CheckCircle2 className="w-16 h-16 text-green-500 mx-auto" />
        <h3 className="text-xl font-bold text-green-600">Payment Received!</h3>
        <p className="text-slate-500">{formatCurrency(amount)} received via M-Pesa</p>
      </div>
    )
  }

  if (step === 'failed') {
    return (
      <div className="p-8 text-center space-y-4">
        <XCircle className="w-16 h-16 text-red-500 mx-auto" />
        <h3 className="text-xl font-bold text-red-600">Payment Failed</h3>
        <p className="text-slate-500 text-sm">{errorMsg}</p>
        <div className="flex gap-3">
          <button
            onClick={() => { setStep('phone'); setErrorMsg(null) }}
            className="flex-1 flex items-center justify-center gap-2 py-3 bg-green-600 text-white rounded-xl font-medium hover:bg-green-700 transition"
          >
            <RefreshCw className="w-4 h-4" /> Try Again
          </button>
          <button onClick={onCancel} className="flex-1 py-3 bg-slate-100 text-slate-700 rounded-xl font-medium hover:bg-slate-200 transition">
            Cancel
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-5">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-green-100 flex items-center justify-center">
          <Smartphone className="w-5 h-5 text-green-600" />
        </div>
        <div>
          <h3 className="font-bold text-slate-800">M-Pesa Payment</h3>
          <p className="text-xs text-slate-500">Safaricom Lipa na M-Pesa</p>
        </div>
      </div>
      <div className="bg-green-50 rounded-xl p-4 text-center">
        <p className="text-3xl font-bold text-green-600">{formatCurrency(amount)}</p>
      </div>
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-2">Customer Phone Number</label>
        <input
          type="tel"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder="0712 345 678"
          className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-slate-800 focus:outline-none focus:ring-2 focus:ring-green-500"
        />
        {errorMsg && <p className="text-red-500 text-xs mt-1">{errorMsg}</p>}
      </div>
      <div className="flex gap-3">
        <button onClick={initiateSTK} className="flex-1 py-3 bg-green-600 hover:bg-green-700 text-white font-bold rounded-xl transition">
          Send STK Push
        </button>
        <button onClick={onCancel} className="px-4 py-3 bg-slate-100 text-slate-700 rounded-xl hover:bg-slate-200 transition">
          Back
        </button>
      </div>
    </div>
  )
}
