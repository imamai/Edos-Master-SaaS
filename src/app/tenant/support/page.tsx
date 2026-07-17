import { Mail, Phone, MessageCircle } from 'lucide-react'

const SUPPORT_EMAIL = process.env.NEXT_PUBLIC_SUPPORT_EMAIL || 'support@edoscentre.co.ke'
const SUPPORT_PHONE = process.env.NEXT_PUBLIC_SUPPORT_PHONE || '+254 700 000000'

export default function SupportPage() {
  return (
    <div className="p-6 max-w-2xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Support</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">Get in touch — this page always stays reachable, even if your account is suspended.</p>
      </div>

      <div className="space-y-3">
        <a href={`mailto:${SUPPORT_EMAIL}`}
          className="flex items-center gap-4 bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-xl p-4 hover:border-blue-400 dark:hover:border-blue-600 transition-colors">
          <div className="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-950 flex items-center justify-center flex-shrink-0">
            <Mail className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <p className="font-medium text-gray-900 dark:text-white">Email us</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">{SUPPORT_EMAIL}</p>
          </div>
        </a>

        <a href={`tel:${SUPPORT_PHONE.replace(/\s+/g, '')}`}
          className="flex items-center gap-4 bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-xl p-4 hover:border-blue-400 dark:hover:border-blue-600 transition-colors">
          <div className="w-10 h-10 rounded-lg bg-green-100 dark:bg-green-950 flex items-center justify-center flex-shrink-0">
            <Phone className="w-5 h-5 text-green-600 dark:text-green-400" />
          </div>
          <div>
            <p className="font-medium text-gray-900 dark:text-white">Call us</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">{SUPPORT_PHONE}</p>
          </div>
        </a>

        <div className="flex items-start gap-4 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-800 rounded-xl p-4">
          <div className="w-10 h-10 rounded-lg bg-gray-200 dark:bg-slate-700 flex items-center justify-center flex-shrink-0">
            <MessageCircle className="w-5 h-5 text-gray-600 dark:text-gray-300" />
          </div>
          <div>
            <p className="font-medium text-gray-900 dark:text-white">Billing questions</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              If your account is suspended, mention your business name and we&apos;ll help you sort payment quickly —
              your data stays intact and access resumes as soon as it&apos;s renewed.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
