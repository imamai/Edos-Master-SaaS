import Link from 'next/link'
import { ArrowRight, BarChart3, CreditCard, Package, ShieldCheck, Smartphone, Store } from 'lucide-react'

const features = [
  {
    icon: Store,
    title: 'Multi-Branch POS',
    desc: 'Run your point of sale across unlimited branches with real-time sync.',
  },
  {
    icon: Smartphone,
    title: 'M-Pesa STK Push',
    desc: 'Accept M-Pesa payments instantly with automated STK push notifications.',
  },
  {
    icon: Package,
    title: 'Inventory Management',
    desc: 'Track stock levels, set reorder alerts, and manage suppliers effortlessly.',
  },
  {
    icon: BarChart3,
    title: 'Advanced Analytics',
    desc: 'Real-time sales reports, profit margins, and business insights.',
  },
  {
    icon: CreditCard,
    title: 'Flexible Billing',
    desc: 'Pay monthly, semi-annually, or yearly via Stripe or M-Pesa.',
  },
  {
    icon: ShieldCheck,
    title: 'Secure & Reliable',
    desc: 'Bank-grade security with role-based access control and audit trails.',
  },
]

const plans = [
  {
    name: 'Basic',
    price: 999,
    desc: 'For small shops',
    features: ['1 Branch', '3 Staff', '500 Products', 'POS Terminal', 'Basic Reports'],
    highlight: false,
  },
  {
    name: 'Pro',
    price: 2499,
    desc: 'Most popular',
    features: ['3 Branches', '15 Staff', '5,000 Products', 'M-Pesa Integration', 'Advanced Reports', 'Customer Loyalty'],
    highlight: true,
  },
  {
    name: 'Enterprise',
    price: 5999,
    desc: 'For large chains',
    features: ['Unlimited Branches', 'Unlimited Staff', 'Unlimited Products', 'White-label', 'Custom Domain', 'API Access'],
    highlight: false,
  },
]

export default function HomePage() {
  const rootDomain = process.env.NEXT_PUBLIC_ROOT_DOMAIN || 'edos.co.ke'

  return (
    <div className="min-h-screen bg-white">
      {/* Nav */}
      <nav className="border-b sticky top-0 bg-white/95 backdrop-blur z-50">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <span className="font-bold text-xl text-blue-600">EdosPoa</span>
          <div className="flex items-center gap-4">
            <Link href="/pricing" className="text-sm text-gray-600 hover:text-gray-900">Pricing</Link>
            <Link href="/login" className="text-sm text-gray-600 hover:text-gray-900">Login</Link>
            <Link
              href="/register"
              className="bg-blue-600 text-white text-sm px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Start Free Trial
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="py-24 px-4 text-center bg-gradient-to-b from-blue-50 to-white">
        <div className="max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-2 bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm font-medium mb-6">
            <span className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
            Built for Kenyan Businesses
          </div>
          <h1 className="text-5xl font-bold text-gray-900 mb-6 leading-tight">
            The Smart POS Platform<br />
            <span className="text-blue-600">Powered by M-Pesa</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            EdosPoa gives every business its own branded POS system with inventory, sales analytics,
            M-Pesa integration, and multi-branch support — all on one platform.
          </p>
          <div className="flex items-center justify-center gap-4 flex-wrap">
            <Link
              href="/register"
              className="bg-blue-600 text-white px-8 py-3 rounded-lg text-lg font-medium hover:bg-blue-700 transition-colors flex items-center gap-2"
            >
              Start 14-Day Free Trial <ArrowRight className="w-5 h-5" />
            </Link>
            <Link
              href="#features"
              className="border border-gray-300 text-gray-700 px-8 py-3 rounded-lg text-lg font-medium hover:bg-gray-50 transition-colors"
            >
              See Features
            </Link>
          </div>
          <p className="text-sm text-gray-500 mt-4">No credit card required · Cancel anytime</p>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Everything you need to run your business</h2>
            <p className="text-gray-600 max-w-xl mx-auto">From the shop floor to the boardroom, EdosPoa has every tool you need.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {features.map((f) => (
              <div key={f.title} className="p-6 border rounded-xl hover:shadow-md transition-shadow">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                  <f.icon className="w-6 h-6 text-blue-600" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">{f.title}</h3>
                <p className="text-gray-600 text-sm">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="py-20 px-4 bg-gray-50">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Simple, transparent pricing</h2>
            <p className="text-gray-600">All prices in KES. VAT inclusive.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {plans.map((plan) => (
              <div
                key={plan.name}
                className={`p-8 rounded-2xl border-2 ${
                  plan.highlight
                    ? 'border-blue-600 bg-blue-600 text-white shadow-xl scale-105'
                    : 'border-gray-200 bg-white'
                }`}
              >
                {plan.highlight && (
                  <div className="text-xs font-semibold uppercase tracking-wide text-blue-200 mb-2">
                    Most Popular
                  </div>
                )}
                <h3 className={`text-xl font-bold mb-1 ${plan.highlight ? 'text-white' : 'text-gray-900'}`}>
                  {plan.name}
                </h3>
                <p className={`text-sm mb-4 ${plan.highlight ? 'text-blue-200' : 'text-gray-500'}`}>{plan.desc}</p>
                <div className="mb-6">
                  <span className={`text-4xl font-bold ${plan.highlight ? 'text-white' : 'text-gray-900'}`}>
                    KES {plan.price.toLocaleString()}
                  </span>
                  <span className={`text-sm ${plan.highlight ? 'text-blue-200' : 'text-gray-500'}`}>/month</span>
                </div>
                <ul className="space-y-2 mb-8">
                  {plan.features.map((f) => (
                    <li key={f} className={`text-sm flex items-center gap-2 ${plan.highlight ? 'text-blue-100' : 'text-gray-600'}`}>
                      <span className={`w-4 h-4 rounded-full flex items-center justify-center text-xs ${plan.highlight ? 'bg-blue-500 text-white' : 'bg-green-100 text-green-600'}`}>✓</span>
                      {f}
                    </li>
                  ))}
                </ul>
                <Link
                  href="/register"
                  className={`block text-center py-2.5 rounded-lg font-medium text-sm transition-colors ${
                    plan.highlight
                      ? 'bg-white text-blue-600 hover:bg-blue-50'
                      : 'bg-blue-600 text-white hover:bg-blue-700'
                  }`}
                >
                  Get Started
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-4 text-center">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Ready to modernize your business?</h2>
          <p className="text-gray-600 mb-8">Join hundreds of Kenyan businesses already using EdosPoa.</p>
          <Link
            href="/register"
            className="bg-blue-600 text-white px-8 py-3 rounded-lg text-lg font-medium hover:bg-blue-700 transition-colors inline-flex items-center gap-2"
          >
            Start Free Trial <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-8 px-4">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <span className="font-bold text-blue-600">EdosPoa</span>
          <p className="text-sm text-gray-500">© {new Date().getFullYear()} EdosPoa. All rights reserved.</p>
          <div className="flex gap-4 text-sm text-gray-600">
            <Link href="/privacy">Privacy</Link>
            <Link href="/terms">Terms</Link>
            <Link href="mailto:support@edos.co.ke">Support</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
