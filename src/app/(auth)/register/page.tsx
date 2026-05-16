'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import toast from 'react-hot-toast'
import { createClient } from '@/lib/supabase/client'
import { slugify, formatCurrency } from '@/lib/utils'
import { CheckCircle, Loader2 } from 'lucide-react'

interface Plan {
  id: string
  name: string
  slug: string
  description: string | null
  price_monthly: number
  max_products: number
  max_users: number
  max_branches: number
  features: string[]
}

const schema = z.object({
  full_name: z.string().min(2, 'Enter your full name'),
  email: z.string().email('Enter a valid email'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  business_name: z.string().min(2, 'Enter your business name'),
  subdomain: z
    .string()
    .min(3, 'At least 3 characters')
    .max(30, 'Max 30 characters')
    .regex(/^[a-z0-9-]+$/, 'Only lowercase letters, numbers, and hyphens'),
  phone: z.string().optional(),
})

type FormData = z.infer<typeof schema>

const ROOT_DOMAIN = process.env.NEXT_PUBLIC_ROOT_DOMAIN || 'edos.co.ke'
const RESERVED = ['admin', 'www', 'api', 'app', 'mail', 'smtp', 'pop', 'imap', 'staging', 'dev']

export default function RegisterPage() {
  const router = useRouter()
  const supabase = createClient()
  const [step, setStep] = useState(1)
  const [checkingSubdomain, setCheckingSubdomain] = useState(false)
  const [subdomainAvailable, setSubdomainAvailable] = useState<boolean | null>(null)
  const [plans, setPlans] = useState<Plan[]>([])
  const [selectedPlanSlug, setSelectedPlanSlug] = useState('basic')

  useEffect(() => {
    supabase
      .from('plans')
      .select('id, name, slug, description, price_monthly, max_products, max_users, max_branches, features')
      .eq('is_active', true)
      .order('price_monthly')
      .then(({ data }) => {
        if (data && data.length > 0) {
          setPlans(data as Plan[])
          setSelectedPlanSlug((data[0] as Plan).slug)
        }
      })
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const { register, handleSubmit, watch, setValue, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
  })

  const businessName = watch('business_name')
  const subdomain = watch('subdomain')

  const handleBusinessNameBlur = () => {
    if (businessName && !subdomain) {
      setValue('subdomain', slugify(businessName).substring(0, 30))
    }
  }

  const checkSubdomain = async (value: string) => {
    if (!value || value.length < 3 || RESERVED.includes(value)) {
      setSubdomainAvailable(RESERVED.includes(value) ? false : null)
      return
    }
    setCheckingSubdomain(true)
    const { data } = await supabase
      .from('tenants')
      .select('id')
      .eq('subdomain', value)
      .single()
    setSubdomainAvailable(!data)
    setCheckingSubdomain(false)
  }

  const onSubmit = async (data: FormData) => {
    if (RESERVED.includes(data.subdomain)) {
      toast.error('That subdomain is reserved. Please choose another.')
      return
    }
    if (subdomainAvailable === false) {
      toast.error('That subdomain is already taken.')
      return
    }

    // Create auth user + tenant in one server-side call (bypasses email rate limits)
    const res = await fetch('/api/tenants', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: data.business_name,
        subdomain: data.subdomain,
        owner_email: data.email,
        owner_name: data.full_name,
        phone: data.phone,
        plan_slug: selectedPlanSlug,
        password: data.password,
      }),
    })

    if (!res.ok) {
      const err = await res.json()
      toast.error(err.message || 'Failed to create business account')
      return
    }

    toast.success('Account created! Check your email to confirm and access your dashboard.')
    router.push('/login')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-8">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Create your account</h1>
          <p className="text-gray-500 text-sm mt-1">14-day free trial · No credit card required</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
            <input
              {...register('full_name')}
              type="text"
              placeholder="Jane Wanjiku"
              className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            {errors.full_name && <p className="text-red-500 text-xs mt-1">{errors.full_name.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Business Name</label>
            <input
              {...register('business_name')}
              type="text"
              placeholder="Wanjiku Supermarket"
              onBlur={handleBusinessNameBlur}
              className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            {errors.business_name && <p className="text-red-500 text-xs mt-1">{errors.business_name.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Your Subdomain</label>
            <div className="flex items-center border border-gray-300 rounded-lg focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-transparent overflow-hidden">
              <input
                {...register('subdomain')}
                type="text"
                placeholder="wanjiku"
                onChange={(e) => {
                  setValue('subdomain', e.target.value.toLowerCase())
                  checkSubdomain(e.target.value.toLowerCase())
                }}
                className="flex-1 px-3 py-2.5 text-sm focus:outline-none"
              />
              <span className="bg-gray-50 px-3 py-2.5 text-sm text-gray-500 border-l border-gray-300">
                .{ROOT_DOMAIN}
              </span>
            </div>
            {errors.subdomain && <p className="text-red-500 text-xs mt-1">{errors.subdomain.message}</p>}
            {checkingSubdomain && <p className="text-gray-400 text-xs mt-1">Checking availability...</p>}
            {!checkingSubdomain && subdomainAvailable === true && (
              <p className="text-green-600 text-xs mt-1 flex items-center gap-1">
                <CheckCircle className="w-3 h-3" /> Available!
              </p>
            )}
            {!checkingSubdomain && subdomainAvailable === false && (
              <p className="text-red-500 text-xs mt-1">That subdomain is taken or reserved.</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
              {...register('email')}
              type="email"
              placeholder="you@business.com"
              className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <input
              {...register('password')}
              type="password"
              placeholder="Min. 8 characters"
              className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Phone (optional)</label>
            <input
              {...register('phone')}
              type="tel"
              placeholder="0712345678"
              className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {plans.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Choose a Plan</label>
              <div className="space-y-2">
                {plans.map((plan) => (
                  <label
                    key={plan.slug}
                    className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                      selectedPlanSlug === plan.slug
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <input
                      type="radio"
                      name="plan"
                      value={plan.slug}
                      checked={selectedPlanSlug === plan.slug}
                      onChange={() => setSelectedPlanSlug(plan.slug)}
                      className="mt-0.5 accent-blue-600"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-sm font-semibold text-gray-900">{plan.name}</span>
                        <span className="text-sm font-medium text-blue-600 whitespace-nowrap">
                          {plan.price_monthly === 0 ? 'Free trial' : `${formatCurrency(plan.price_monthly)}/mo`}
                        </span>
                      </div>
                      {plan.description && (
                        <p className="text-xs text-gray-500 mt-0.5">{plan.description}</p>
                      )}
                      <div className="flex gap-3 mt-1 text-xs text-gray-400">
                        <span>{plan.max_products === -1 ? 'Unlimited products' : `${plan.max_products} products`}</span>
                        <span>{plan.max_users === -1 ? 'Unlimited users' : `${plan.max_users} users`}</span>
                        <span>{plan.max_branches === -1 ? 'Unlimited branches' : `${plan.max_branches} branch${plan.max_branches !== 1 ? 'es' : ''}`}</span>
                      </div>
                    </div>
                  </label>
                ))}
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-blue-600 text-white py-2.5 rounded-lg font-medium text-sm hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
            Create Account
          </button>
        </form>

        <p className="text-center text-xs text-gray-400 mt-4">
          By creating an account, you agree to our{' '}
          <Link href="/terms" className="underline">Terms of Service</Link> and{' '}
          <Link href="/privacy" className="underline">Privacy Policy</Link>.
        </p>

        <p className="text-center text-sm text-gray-600 mt-4">
          Already have an account?{' '}
          <Link href="/login" className="text-blue-600 font-medium hover:underline">Sign in</Link>
        </p>
      </div>
    </div>
  )
}
