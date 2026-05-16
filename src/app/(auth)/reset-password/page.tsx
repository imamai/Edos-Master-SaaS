'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import toast from 'react-hot-toast'
import { createClient } from '@/lib/supabase/client'
import { Loader2, ArrowLeft } from 'lucide-react'

const schema = z.object({
  email: z.string().email('Enter a valid email'),
})

type FormData = z.infer<typeof schema>

export default function ResetPasswordPage() {
  const supabase = createClient()
  const [sent, setSent] = useState(false)

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
  })

  const onSubmit = async (data: FormData) => {
    const { error } = await supabase.auth.resetPasswordForEmail(data.email, {
      redirectTo: `${window.location.origin}/api/auth/callback?next=/update-password`,
    })
    if (error) {
      toast.error(error.message)
      return
    }
    setSent(true)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-8">
        <Link href="/login" className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 mb-6">
          <ArrowLeft className="w-4 h-4" /> Back to login
        </Link>

        {sent ? (
          <div className="text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">✉️</span>
            </div>
            <h1 className="text-xl font-bold text-gray-900 mb-2">Check your email</h1>
            <p className="text-gray-500 text-sm">We sent a password reset link. Check your inbox and spam folder.</p>
          </div>
        ) : (
          <>
            <div className="mb-8">
              <h1 className="text-2xl font-bold text-gray-900">Reset password</h1>
              <p className="text-gray-500 text-sm mt-1">Enter your email and we'll send a reset link.</p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
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
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-blue-600 text-white py-2.5 rounded-lg font-medium text-sm hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
                Send Reset Link
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  )
}
