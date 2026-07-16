'use client'

import { useState, useEffect } from 'react'
import { formatCurrency } from '@/lib/utils'
import toast from 'react-hot-toast'
import type { CartItem, CartCustomer, PriceMode } from '@/store/cart'
import { DollarSign, Smartphone, CreditCard, Users, X, CheckCircle2, Loader2, AlertCircle, Hash } from 'lucide-react'
import MpesaPayment from './MpesaPayment'

interface Props {
  total: number
  subtotal: number
  discountAmount: number
  taxAmount: number
  customer: CartCustomer | null
  items: CartItem[]
  priceMode: PriceMode
  tenantId: string
  branchId: string | null
  cashierId: string
  onClose: () => void
  onSuccess: (saleId: string, receiptNumber: string) => void
}

type Step = 'method' | 'cash' | 'card' | 'mpesa' | 'mpesa_manual' | 'credit' | 'processing' | 'done'

function generateReceiptNumber(): string {
  const ts = Date.now().toString().slice(-8)
  const rand = Math.floor(Math.random() * 1000).toString().padStart(3, '0')
  return `RCP-${ts}-${rand}`
}

function ModalWrapper({ children, onClose }: { children: React.ReactNode; onClose: () => void }) {
  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        {children}
      </div>
    </div>
  )
}

export default function PaymentModal({ total, subtotal, discountAmount, taxAmount, customer, items, priceMode, tenantId, branchId, cashierId, onClose, onSuccess }: Props) {
  const [step, setStep] = useState<Step>('method')
  const [cashGiven, setCashGiven] = useState<number>(total)
  const change = Math.max(0, cashGiven - total)

  async function completeSale(method: string, payments: { method: string; amount: number; checkoutRequestId?: string; reference?: string }[]) {
    setStep('processing')
    try {
      const receipt = generateReceiptNumber()
      const res = await fetch('/api/sales/complete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tenantId,
          branchId,
          saleData: {
            receipt_number: receipt,
            customer_id: customer?.id ?? null,
            status: 'completed',
            subtotal,
            discount_amount: discountAmount,
            tax_amount: taxAmount,
            total_amount: total,
            paid_amount: payments.reduce((s, p) => s + p.amount, 0),
            change_amount: method === 'cash' ? change : 0,
            payment_method: method,
            price_mode: priceMode,
          },
          items: items.map((i) => ({
            product_id: i.product.is_custom ? null : i.product.id,
            custom_name: i.product.is_custom ? i.product.name : undefined,
            quantity: i.quantity,
            unit_price: i.unit_price,
            vat_rate: i.product.vat_rate,
            discount_amount: i.discount_amount,
            tax_amount: i.tax_amount,
            total_price: i.total_price,
          })),
          payments,
        }),
      })
      const json = await res.json()
      if (!res.ok) {
        toast.error('Sale failed: ' + (json.error ?? 'Unknown error'))
        setStep('method')
        return
      }
      setStep('done')
      setTimeout(() => onSuccess(json.sale.id, receipt), 800)
    } catch {
      toast.error('Sale failed. Check your connection.')
      setStep('method')
    }
  }

  if (step === 'processing') {
    return (
      <ModalWrapper onClose={() => {}}>
        <div className="flex flex-col items-center justify-center py-16 gap-4">
          <Loader2 className="w-12 h-12 text-blue-600 animate-spin" />
          <p className="text-lg font-semibold text-slate-700">Processing payment…</p>
        </div>
      </ModalWrapper>
    )
  }

  if (step === 'done') {
    return (
      <ModalWrapper onClose={() => {}}>
        <div className="flex flex-col items-center justify-center py-16 gap-4">
          <CheckCircle2 className="w-14 h-14 text-green-500" />
          <p className="text-xl font-bold text-slate-800">Payment Successful!</p>
          <p className="text-slate-500">Generating receipt…</p>
        </div>
      </ModalWrapper>
    )
  }

  if (step === 'mpesa') {
    return (
      <ModalWrapper onClose={() => setStep('method')}>
        <MpesaPayment
          amount={total}
          tenantId={tenantId}
          customerPhone={customer?.phone}
          onSuccess={(checkoutRequestId) => completeSale('mpesa', [{ method: 'mpesa', amount: total, checkoutRequestId }])}
          onCancel={() => setStep('method')}
        />
      </ModalWrapper>
    )
  }

  if (step === 'mpesa_manual') {
    return (
      <ModalWrapper onClose={() => setStep('method')}>
        <MpesaTillPayment
          amount={total}
          tenantId={tenantId}
          onConfirm={(reference) => completeSale('mpesa', [{ method: 'mpesa_manual', amount: total, reference }])}
          onCancel={() => setStep('method')}
        />
      </ModalWrapper>
    )
  }

  if (step === 'cash') {
    return (
      <ModalWrapper onClose={() => setStep('method')}>
        <div className="p-6 space-y-6">
          <h3 className="text-xl font-bold text-slate-800">Cash Payment</h3>
          <div className="text-center">
            <p className="text-sm text-slate-500">Amount Due</p>
            <p className="text-4xl font-bold text-blue-600">{formatCurrency(total)}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-600 mb-2">Cash Given</label>
            <input
              type="number"
              value={cashGiven}
              onChange={(e) => setCashGiven(Number(e.target.value))}
              className="w-full px-4 py-3 text-2xl font-bold text-center border border-slate-200 rounded-xl bg-slate-50 text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <div className="grid grid-cols-4 gap-2 mt-3">
              {[total, Math.ceil(total / 500) * 500, Math.ceil(total / 1000) * 1000, Math.ceil(total / 2000) * 2000].map((amt) => (
                <button key={amt} onClick={() => setCashGiven(amt)}
                  className="py-2 bg-slate-100 rounded-lg text-sm font-medium text-slate-700 hover:bg-blue-100 hover:text-blue-700 transition">
                  {formatCurrency(amt)}
                </button>
              ))}
            </div>
          </div>
          {cashGiven >= total && (
            <div className="bg-green-50 rounded-xl p-4 text-center">
              <p className="text-sm text-green-600">Change</p>
              <p className="text-3xl font-bold text-green-600">{formatCurrency(change)}</p>
            </div>
          )}
          {cashGiven < total && (
            <div className="flex items-center gap-2 text-amber-600 bg-amber-50 rounded-xl p-3">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <p className="text-sm">Cash given is less than amount due</p>
            </div>
          )}
          <button
            disabled={cashGiven < total}
            onClick={() => completeSale('cash', [{ method: 'cash', amount: total }])}
            className="w-full py-4 bg-green-600 hover:bg-green-700 disabled:bg-slate-300 text-white font-bold rounded-xl text-lg transition"
          >
            Confirm Cash Payment
          </button>
        </div>
      </ModalWrapper>
    )
  }

  if (step === 'credit') {
    if (!customer) {
      return (
        <ModalWrapper onClose={() => setStep('method')}>
          <div className="p-6 text-center space-y-4">
            <AlertCircle className="w-12 h-12 text-amber-500 mx-auto" />
            <h3 className="text-lg font-bold text-slate-800">Customer Required</h3>
            <p className="text-slate-500 text-sm">Please add a customer to use credit sale.</p>
            <button onClick={() => setStep('method')} className="w-full py-3 bg-blue-600 text-white rounded-xl font-medium">Go Back</button>
          </div>
        </ModalWrapper>
      )
    }
    const available = customer.credit_limit - customer.outstanding_balance
    const canCredit = available >= total
    return (
      <ModalWrapper onClose={() => setStep('method')}>
        <div className="p-6 space-y-5">
          <h3 className="text-xl font-bold text-slate-800">Credit Sale</h3>
          <div className="bg-slate-50 rounded-xl p-4 space-y-2">
            <p className="font-semibold text-slate-800">{customer.name}</p>
            <div className="flex justify-between text-sm"><span className="text-slate-500">Credit Limit</span><span>{formatCurrency(customer.credit_limit)}</span></div>
            <div className="flex justify-between text-sm"><span className="text-slate-500">Outstanding</span><span className="text-red-600">{formatCurrency(customer.outstanding_balance)}</span></div>
            <div className="flex justify-between text-sm border-t pt-2"><span className="text-slate-500">Available</span><span className={`font-bold ${canCredit ? 'text-green-600' : 'text-red-600'}`}>{formatCurrency(available)}</span></div>
          </div>
          <div className="text-center">
            <p className="text-sm text-slate-500">Amount to Credit</p>
            <p className="text-3xl font-bold text-blue-600">{formatCurrency(total)}</p>
          </div>
          {!canCredit && (
            <div className="flex items-center gap-2 text-red-600 bg-red-50 rounded-xl p-3">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <p className="text-sm">Insufficient credit limit</p>
            </div>
          )}
          <button
            disabled={!canCredit}
            onClick={() => completeSale('credit', [{ method: 'credit', amount: total }])}
            className="w-full py-4 bg-orange-600 hover:bg-orange-700 disabled:bg-slate-300 text-white font-bold rounded-xl text-lg transition"
          >
            Confirm Credit Sale
          </button>
        </div>
      </ModalWrapper>
    )
  }

  return (
    <ModalWrapper onClose={onClose}>
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-bold text-slate-800">Select Payment Method</h3>
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-slate-100 transition">
            <X className="w-5 h-5 text-slate-400" />
          </button>
        </div>
        <div className="text-center">
          <p className="text-sm text-slate-500">Total Amount Due</p>
          <p className="text-4xl font-bold text-blue-600 mt-1">{formatCurrency(total)}</p>
          {customer && <p className="text-sm text-slate-500 mt-1">Customer: <span className="font-medium text-slate-700">{customer.name}</span></p>}
        </div>
        <div className="grid grid-cols-2 gap-3">
          {[
            { label: 'Cash', icon: DollarSign, color: 'green', action: () => setStep('cash') },
            { label: 'M-Pesa STK Push', icon: Smartphone, color: 'green', action: () => setStep('mpesa') },
            { label: 'M-Pesa Till/Paybill', icon: Hash, color: 'green', action: () => setStep('mpesa_manual') },
            { label: 'Card', icon: CreditCard, color: 'blue', action: () => completeSale('card', [{ method: 'card', amount: total }]) },
            { label: 'Credit', icon: Users, color: 'orange', action: () => setStep('credit') },
          ].map(({ label, icon: Icon, color, action }) => {
            const cls = color === 'green'
              ? 'border-green-200 hover:bg-green-50 text-green-700'
              : color === 'blue'
              ? 'border-blue-200 hover:bg-blue-50 text-blue-700'
              : 'border-orange-200 hover:bg-orange-50 text-orange-700'
            return (
              <button key={label} onClick={action} className={`flex flex-col items-center gap-3 p-5 rounded-2xl border-2 transition ${cls}`}>
                <Icon className="w-8 h-8" />
                <span className="font-semibold text-sm text-center">{label}</span>
              </button>
            )
          })}
        </div>
      </div>
    </ModalWrapper>
  )
}

function MpesaTillPayment({ amount, tenantId, onConfirm, onCancel }: {
  amount: number; tenantId: string; onConfirm: (reference: string) => void; onCancel: () => void
}) {
  const [loadingSettings, setLoadingSettings] = useState(true)
  const [shortcode, setShortcode] = useState<string | null>(null)
  const [reference, setReference] = useState('')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    fetch('/api/mpesa/settings')
      .then((r) => r.json())
      .then((data) => setShortcode(data.settings?.shortcode ?? null))
      .catch(() => setShortcode(null))
      .finally(() => setLoadingSettings(false))
  }, [])

  const valid = reference.trim().length >= 6

  function handleConfirm() {
    if (!valid) return
    setSubmitting(true)
    onConfirm(reference.trim())
  }

  return (
    <div className="p-6 space-y-5">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-green-100 flex items-center justify-center">
          <Hash className="w-5 h-5 text-green-600" />
        </div>
        <div>
          <h3 className="font-bold text-slate-800">M-Pesa Till/Paybill</h3>
          <p className="text-xs text-slate-500">Customer pays independently, then you confirm the code</p>
        </div>
      </div>
      <div className="bg-green-50 rounded-xl p-4 text-center space-y-1">
        <p className="text-3xl font-bold text-green-600">{formatCurrency(amount)}</p>
        {!loadingSettings && (
          <p className="text-sm text-green-700">
            {shortcode ? <>Till/Paybill No: <strong>{shortcode}</strong></> : 'Till/Paybill number not configured for this account'}
          </p>
        )}
      </div>
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-2">M-Pesa Confirmation Code</label>
        <input
          type="text"
          value={reference}
          onChange={(e) => setReference(e.target.value.toUpperCase())}
          placeholder="e.g. QGH7XXXXXX"
          className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-slate-800 font-mono tracking-wide focus:outline-none focus:ring-2 focus:ring-green-500"
        />
        <p className="text-xs text-slate-400 mt-1">Read the code from the customer&apos;s M-Pesa confirmation SMS before completing the sale.</p>
      </div>
      <div className="flex gap-3">
        <button onClick={onCancel} className="px-4 py-3 bg-slate-100 text-slate-700 rounded-xl hover:bg-slate-200 transition">
          Back
        </button>
        <button
          disabled={!valid || submitting}
          onClick={handleConfirm}
          className="flex-1 py-3 bg-green-600 hover:bg-green-700 disabled:bg-slate-300 text-white font-bold rounded-xl transition"
        >
          {submitting ? 'Confirming…' : 'Confirm Payment Received'}
        </button>
      </div>
    </div>
  )
}
