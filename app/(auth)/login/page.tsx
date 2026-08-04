'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { FcGoogle } from 'react-icons/fc'
import { Scissors, Eye, EyeOff, AlertCircle } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import Link from 'next/link'

type Role = 'designer' | 'client'
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'

const loginSchema = z.object({
  email: z.string().email('Please enter a valid email'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
})

type LoginFormValues = z.infer<typeof loginSchema>

export default function LoginPage() {
  const [role, setRole] = useState<Role>('designer')
  const [serverError, setServerError] = useState<string | null>(null)
  const [showPassword, setShowPassword] = useState(false)
  const { login } = useAuth()

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
  })

  const handleRoleSwitch = (newRole: Role) => {
    setRole(newRole)
    setServerError(null)
    reset()
  }

  const onSubmit = async (data: LoginFormValues) => {
    setServerError(null)

    try {
      const res = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: data.email,
          password: data.password,
        }),
      })

      const json = await res.json()

      if (!res.ok) {
        setServerError(json.error ?? 'Login failed. Please try again.')
        return
      }

      // 
      login(json.token, json.studio?.email ?? data.email, role)

    } catch {
      setServerError('Network error. Please check your connection.')
    }
  }

  return (
    <main className="min-h-screen bg-[#faf8f5] flex flex-col">

      {/* Nav */}
      <header className="px-5 sm:px-10 py-5 flex items-center gap-2">
        <Scissors className="w-5 h-5" style={{ color: '#FF6500' }} />
        <span className="font-bold text-xl text-[#422a15]">StyledKraft</span>
      </header>

      {/* Card */}
      <section className="flex-1 flex items-center justify-center px-4 py-10">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 w-full max-w-md p-6 sm:p-8">

          {/* Role toggle */}
          <div className="flex items-center bg-gray-100 rounded-xl p-1 mb-6">
            <button
              type="button"
              onClick={() => handleRoleSwitch('designer')}
              className="flex-1 py-2 text-sm font-semibold rounded-lg transition-all duration-200"
              style={
                role === 'designer'
                  ? { background: '#fff', color: '#422a15', boxShadow: '0 1px 4px rgba(0,0,0,0.08)' }
                  : { background: 'transparent', color: '#9ca3af' }
              }
            >
              Designer / Tailor
            </button>
            <button
              type="button"
              onClick={() => handleRoleSwitch('client')}
              className="flex-1 py-2 text-sm font-semibold rounded-lg transition-all duration-200"
              style={
                role === 'client'
                  ? { background: '#fff', color: '#422a15', boxShadow: '0 1px 4px rgba(0,0,0,0.08)' }
                  : { background: 'transparent', color: '#9ca3af' }
              }
            >
              Client
            </button>
          </div>

          {/* Heading */}
          <h1 className="text-2xl font-bold text-[#422a15] mb-1">Welcome back</h1>
          <p className="text-sm text-gray-500 mb-6">
            {role === 'designer'
              ? 'Sign in to your designer studio'
              : 'Sign in to discover and book designers'}
          </p>

          {/* Google */}
          <button
            type="button"
            className="w-full flex items-center justify-center gap-3 border border-gray-200 rounded-xl py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors mb-6"
          >
            <FcGoogle className="w-5 h-5" />
            Continue with Google
          </button>

          {/* Divider */}
          <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200" />
            </div>
            <div className="relative flex justify-center text-xs text-gray-400 bg-white px-2 w-fit mx-auto">
              or continue with email
            </div>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">

            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1.5">
                Email address
              </label>
              <input
                id="email"
                type="email"
                placeholder="you@example.com"
                {...register('email')}
                aria-invalid={errors.email ? 'true' : 'false'}
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none transition-all"
                onFocus={e => {
                  e.target.style.borderColor = '#FF6500'
                  e.target.style.boxShadow = '0 0 0 3px rgba(255,101,0,0.1)'
                }}
                onBlur={e => {
                  e.target.style.borderColor = '#e5e7eb'
                  e.target.style.boxShadow = 'none'
                }}
              />
              {errors.email && (
                <p role="alert" className="text-xs text-red-500 mt-1">{errors.email.message}</p>
              )}
            </div>

            {/* Password */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label htmlFor="password" className="text-sm font-medium text-gray-700">
                  Password
                </label>
                <button type="button" className="text-xs font-medium" style={{ color: '#FF6500' }}>
                  Forgot password?
                </button>
              </div>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  {...register('password')}
                  aria-invalid={errors.password ? 'true' : 'false'}
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 pr-10 text-sm outline-none transition-all"
                  onFocus={e => {
                    e.target.style.borderColor = '#FF6500'
                    e.target.style.boxShadow = '0 0 0 3px rgba(255,101,0,0.1)'
                  }}
                  onBlur={e => {
                    e.target.style.borderColor = '#e5e7eb'
                    e.target.style.boxShadow = 'none'
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  aria-label="Toggle password visibility"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.password && (
                <p role="alert" className="text-xs text-red-500 mt-1">{errors.password.message}</p>
              )}
            </div>

            {/* Server error */}
            {serverError && (
              <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-xl px-4 py-3">
                <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
                <p role="alert" className="text-xs text-red-600">{serverError}</p>
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full text-white rounded-xl py-2.5 text-sm font-semibold transition-colors mt-2 disabled:opacity-60"
              style={{ background: '#422a15' }}
              onMouseEnter={e => { if (!isSubmitting) (e.target as HTMLButtonElement).style.background = '#5a3a20' }}
              onMouseLeave={e => { (e.target as HTMLButtonElement).style.background = '#422a15' }}
            >
              {isSubmitting ? 'Signing in…' : 'Sign in'}
            </button>
          </form>

          <p className="text-center text-xs text-gray-500 mt-6">
            Don&apos;t have an account?{' '}
            <Link href="/signup" className="font-semibold" style={{ color: '#FF6500' }}>
              Create one free
            </Link>
          </p>

        </div>
      </section>
    </main>
  )
}
