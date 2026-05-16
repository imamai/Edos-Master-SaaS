import { createClient } from '@/lib/supabase/server'
import { formatCurrency } from '@/lib/utils'
import { CheckCircle } from 'lucide-react'

export default async function PlansPage() {
  const supabase = await createClient()
  const { data: plans } = await supabase.from('plans').select('*').order('price_monthly')

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Plans</h1>
          <p className="text-sm text-gray-500">Manage subscription plans and pricing</p>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {plans?.map((plan) => (
          <div key={plan.id} className="bg-white rounded-xl border p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900">{plan.name}</h2>
              <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${plan.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                {plan.is_active ? 'Active' : 'Inactive'}
              </span>
            </div>

            <p className="text-sm text-gray-500 mb-4">{plan.description}</p>

            <div className="space-y-2 mb-6">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Monthly</span>
                <span className="font-semibold">{formatCurrency(plan.price_monthly)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Semi-annual</span>
                <span className="font-semibold">{formatCurrency(plan.price_semiannual)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Yearly</span>
                <span className="font-semibold">{formatCurrency(plan.price_yearly)}</span>
              </div>
            </div>

            <div className="border-t pt-4 space-y-1 mb-6">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Branches</span>
                <span className="font-medium">{plan.max_branches === -1 ? 'Unlimited' : plan.max_branches}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Users</span>
                <span className="font-medium">{plan.max_users === -1 ? 'Unlimited' : plan.max_users}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Products</span>
                <span className="font-medium">{plan.max_products === -1 ? 'Unlimited' : plan.max_products.toLocaleString()}</span>
              </div>
            </div>

            <ul className="space-y-1.5">
              {(plan.features as string[]).map((f: string) => (
                <li key={f} className="flex items-center gap-2 text-sm text-gray-600">
                  <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                  {f}
                </li>
              ))}
            </ul>

            {plan.stripe_monthly_price_id && (
              <div className="mt-4 pt-4 border-t">
                <p className="text-xs text-gray-400 font-mono truncate">
                  Stripe: {plan.stripe_monthly_price_id}
                </p>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
