'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { useAdminAuth } from '@/context/AdminAuthContext'
import { Scissors, Shield } from 'lucide-react'

const loginSchema = z.object({
  email: z.string().email('Please enter a valid email'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
})

type LoginFormValues = z.infer<typeof loginSchema>

export default function AdminLoginPage() {
  const [serverError, setServerError] = useState<string | null>(null)
  const { login } = useAdminAuth()

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
  })

  const onSubmit = async (data: LoginFormValues) => {
    setServerError(null)
    const result = await login(data.email, data.password)
    if (!result.success) {
      setServerError(result.error ?? 'Login failed. Please try again.')
    }
  }

  return (
    <main className="min-h-screen bg-[#0f172a] flex flex-col">

      {/* Nav */}
      <header className="px-5 sm:px-10 py-5 flex items-center gap-3">
        <Scissors className="w-5 h-5 text-amber-500" />
        <span className="font-bold text-xl text-white">StyledKraft</span>
        <span className="text-xs font-semibold text-amber-500 bg-amber-500/10 border border-amber-500/20 px-2.5 py-1 rounded-full ml-1">
          Admin
        </span>
      </header>

      {/* Card */}
      <section className="flex-1 flex items-center justify-center px-4">
        <div className="bg-[#1e293b] rounded-2xl border border-white/10 w-full max-w-md p-6 sm:p-8">

          {/* Icon */}
          <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center mb-6">
            <Shield className="w-6 h-6 text-amber-500" />
          </div>

          <h1 className="text-2xl font-bold text-white mb-1">Admin Sign In</h1>
          <p className="text-sm text-slate-400 mb-8">
            Restricted access — StyledKraft staff only
          </p>

          <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">

            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-slate-300 mb-1.5">
                Email address
              </label>
              <input
                id="email"
                type="email"
                placeholder="you@styledkraft.com"
                {...register('email')}
                aria-invalid={errors.email ? 'true' : 'false'}
                className="w-full bg-[#0f172a] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-slate-500 outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 transition-all"
              />
              {errors.email && (
                <p role="alert" className="text-xs text-red-400 mt-1">
                  {errors.email.message}
                </p>
              )}
            </div>

            {/* Password */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-slate-300 mb-1.5">
                Password
              </label>
              <input
                id="password"
                type="password"
                placeholder="••••••••"
                {...register('password')}
                aria-invalid={errors.password ? 'true' : 'false'}
                className="w-full bg-[#0f172a] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-slate-500 outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 transition-all"
              />
              {errors.password && (
                <p role="alert" className="text-xs text-red-400 mt-1">
                  {errors.password.message}
                </p>
              )}
            </div>

            {/* Server error */}
            {serverError && (
              <div className="bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3">
                <p role="alert" className="text-xs text-red-400">
                  {serverError}
                </p>
              </div>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-amber-500 text-[#0f172a] rounded-xl py-2.5 text-sm font-bold hover:bg-amber-400 disabled:opacity-60 transition-colors mt-2"
            >
              {isSubmitting ? 'Signing in…' : 'Sign in to Admin'}
            </button>

          </form>

        </div>
      </section>

    </main>
  )
}