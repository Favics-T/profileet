'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { FcGoogle } from 'react-icons/fc'
import { Scissors, Eye, EyeOff, AlertCircle } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import Link from 'next/link'

type Role = 'designer' | 'client'
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'


const designerSchema = z.object({
  email: z.string().email('Please enter a valid email'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
})


const clientSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  email: z.string().email('Please enter a valid email'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
})

type DesignerFormValues = z.infer<typeof designerSchema>
type ClientFormValues = z.infer<typeof clientSchema>

function getStrength(password: string): number {
  let score = 0
  if (password.length >= 6) score++
  if (password.length >= 10) score++
  if (/[A-Z]/.test(password) && /[0-9]/.test(password)) score++
  if (/[^A-Za-z0-9]/.test(password)) score++
  return score
}

const strengthColors = ['#E24B4A', '#EF9F27', '#1D9E75', '#1D9E75']
const strengthLabels = ['Weak', 'Fair', 'Good', 'Strong']


function DesignerForm({ onSuccess }: { onSuccess: (token: string, email: string) => void }) {
  const [serverError, setServerError] = useState<string | null>(null)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [passwordValue, setPasswordValue] = useState('')

  const strength = getStrength(passwordValue)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<DesignerFormValues>({
    resolver: zodResolver(designerSchema),
  })

  const onSubmit = async (data: DesignerFormValues) => {
    setServerError(null)
    try {
      const res = await fetch(`${API_URL}/auth/signup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: data.email.split('@')[0],
          email: data.email,
          password: data.password,
          role: 'designer',
        }),
      })
      const json = await res.json()
      if (!res.ok) { setServerError(json.error ?? 'Registration failed.'); return }
      onSuccess(json.token, json.studio?.email ?? data.email)
    } catch {
      setServerError('Network error. Please check your connection.')
    }
  }

  const focusStyle = { borderColor: '#FF6500', boxShadow: '0 0 0 3px rgba(255,101,0,0.1)' }
  const blurStyle  = { borderColor: '#e5e7eb', boxShadow: 'none' }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">

      {/* Email */}
      <div>
        <label htmlFor="d-email" className="block text-sm font-medium text-gray-700 mb-1.5">
          Email address
        </label>
        <input
          id="d-email"
          type="email"
          placeholder="you@example.com"
          {...register('email')}
          aria-invalid={errors.email ? 'true' : 'false'}
          className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none transition-all"
          onFocus={e => Object.assign(e.target.style, focusStyle)}
          onBlur={e => Object.assign(e.target.style, blurStyle)}
        />
        {errors.email && <p role="alert" className="text-xs text-red-500 mt-1">{errors.email.message}</p>}
      </div>

      {/* Password */}
      <div>
        <label htmlFor="d-password" className="block text-sm font-medium text-gray-700 mb-1.5">
          Password
        </label>
        <div className="relative">
          <input
            id="d-password"
            type={showPassword ? 'text' : 'password'}
            placeholder="Min. 6 characters"
            {...register('password', { onChange: (e) => setPasswordValue(e.target.value) })}
            aria-invalid={errors.password ? 'true' : 'false'}
            className="w-full border border-gray-200 rounded-xl px-4 py-2.5 pr-10 text-sm outline-none transition-all"
            onFocus={e => Object.assign(e.target.style, focusStyle)}
            onBlur={e => Object.assign(e.target.style, blurStyle)}
          />
          <button type="button" onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            aria-label="Toggle password visibility">
            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>
        {passwordValue.length > 0 && (
          <div className="mt-2">
            <div className="flex gap-1 mb-1">
              {[0, 1, 2, 3].map((i) => (
                <div key={i} className="h-0.5 flex-1 rounded-full transition-all duration-200"
                  style={{ background: i < strength ? strengthColors[strength - 1] : '#e5e7eb' }} />
              ))}
            </div>
            <p className="text-xs" style={{ color: strength > 0 ? strengthColors[strength - 1] : '#9ca3af' }}>
              {strength > 0 ? strengthLabels[strength - 1] : ''}
            </p>
          </div>
        )}
        {errors.password && <p role="alert" className="text-xs text-red-500 mt-1">{errors.password.message}</p>}
      </div>

      {/* Confirm password */}
      <div>
        <label htmlFor="d-confirm" className="block text-sm font-medium text-gray-700 mb-1.5">
          Confirm password
        </label>
        <div className="relative">
          <input
            id="d-confirm"
            type={showConfirm ? 'text' : 'password'}
            placeholder="••••••••"
            {...register('confirmPassword')}
            aria-invalid={errors.confirmPassword ? 'true' : 'false'}
            className="w-full border border-gray-200 rounded-xl px-4 py-2.5 pr-10 text-sm outline-none transition-all"
            onFocus={e => Object.assign(e.target.style, focusStyle)}
            onBlur={e => Object.assign(e.target.style, blurStyle)}
          />
          <button type="button" onClick={() => setShowConfirm(!showConfirm)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            aria-label="Toggle confirm password visibility">
            {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>
        {errors.confirmPassword && <p role="alert" className="text-xs text-red-500 mt-1">{errors.confirmPassword.message}</p>}
      </div>

      {serverError && (
        <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-xl px-4 py-3">
          <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
          <p role="alert" className="text-xs text-red-600">{serverError}</p>
        </div>
      )}

      <button type="submit" disabled={isSubmitting}
        className="w-full text-white rounded-xl py-2.5 text-sm font-semibold transition-colors mt-2 disabled:opacity-60"
        style={{ background: '#422a15' }}
        onMouseEnter={e => { if (!isSubmitting) (e.target as HTMLButtonElement).style.background = '#5a3a20' }}
        onMouseLeave={e => { (e.target as HTMLButtonElement).style.background = '#422a15' }}>
        {isSubmitting ? 'Creating account…' : 'Create account'}
      </button>
    </form>
  )
}


function ClientForm({ onSuccess }: { onSuccess: (token: string, email: string) => void }) {
  const [serverError, setServerError] = useState<string | null>(null)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [passwordValue, setPasswordValue] = useState('')

  const strength = getStrength(passwordValue)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ClientFormValues>({
    resolver: zodResolver(clientSchema),
  })

  const onSubmit = async (data: ClientFormValues) => {
    setServerError(null)
    try {
      const res = await fetch(`${API_URL}/auth/signup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: `${data.firstName} ${data.lastName}`.trim(),
          email: data.email,
          password: data.password,
          role: 'client',
        }),
      })
      const json = await res.json()
      if (!res.ok) { setServerError(json.error ?? 'Registration failed.'); return }
      onSuccess(json.token, json.studio?.email ?? data.email)
    } catch {
      setServerError('Network error. Please check your connection.')
    }
  }

  const focusStyle = { borderColor: '#FF6500', boxShadow: '0 0 0 3px rgba(255,101,0,0.1)' }
  const blurStyle  = { borderColor: '#e5e7eb', boxShadow: 'none' }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">

      {/* First + Last name */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label htmlFor="c-firstName" className="block text-sm font-medium text-gray-700 mb-1.5">First name</label>
          <input
            id="c-firstName"
            type="text"
            placeholder="Ada"
            {...register('firstName')}
            aria-invalid={errors.firstName ? 'true' : 'false'}
            className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none transition-all"
            onFocus={e => Object.assign(e.target.style, focusStyle)}
            onBlur={e => Object.assign(e.target.style, blurStyle)}
          />
          {errors.firstName && <p role="alert" className="text-xs text-red-500 mt-1">{errors.firstName.message}</p>}
        </div>
        <div>
          <label htmlFor="c-lastName" className="block text-sm font-medium text-gray-700 mb-1.5">Last name</label>
          <input
            id="c-lastName"
            type="text"
            placeholder="Obi"
            {...register('lastName')}
            aria-invalid={errors.lastName ? 'true' : 'false'}
            className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none transition-all"
            onFocus={e => Object.assign(e.target.style, focusStyle)}
            onBlur={e => Object.assign(e.target.style, blurStyle)}
          />
          {errors.lastName && <p role="alert" className="text-xs text-red-500 mt-1">{errors.lastName.message}</p>}
        </div>
      </div>

      {/* Email */}
      <div>
        <label htmlFor="c-email" className="block text-sm font-medium text-gray-700 mb-1.5">Email address</label>
        <input
          id="c-email"
          type="email"
          placeholder="you@example.com"
          {...register('email')}
          aria-invalid={errors.email ? 'true' : 'false'}
          className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none transition-all"
          onFocus={e => Object.assign(e.target.style, focusStyle)}
          onBlur={e => Object.assign(e.target.style, blurStyle)}
        />
        {errors.email && <p role="alert" className="text-xs text-red-500 mt-1">{errors.email.message}</p>}
      </div>

      {/* Password */}
      <div>
        <label htmlFor="c-password" className="block text-sm font-medium text-gray-700 mb-1.5">Password</label>
        <div className="relative">
          <input
            id="c-password"
            type={showPassword ? 'text' : 'password'}
            placeholder="Min. 6 characters"
            {...register('password', { onChange: (e) => setPasswordValue(e.target.value) })}
            aria-invalid={errors.password ? 'true' : 'false'}
            className="w-full border border-gray-200 rounded-xl px-4 py-2.5 pr-10 text-sm outline-none transition-all"
            onFocus={e => Object.assign(e.target.style, focusStyle)}
            onBlur={e => Object.assign(e.target.style, blurStyle)}
          />
          <button type="button" onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            aria-label="Toggle password visibility">
            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>
        {passwordValue.length > 0 && (
          <div className="mt-2">
            <div className="flex gap-1 mb-1">
              {[0, 1, 2, 3].map((i) => (
                <div key={i} className="h-0.5 flex-1 rounded-full transition-all duration-200"
                  style={{ background: i < strength ? strengthColors[strength - 1] : '#e5e7eb' }} />
              ))}
            </div>
            <p className="text-xs" style={{ color: strength > 0 ? strengthColors[strength - 1] : '#9ca3af' }}>
              {strength > 0 ? strengthLabels[strength - 1] : ''}
            </p>
          </div>
        )}
        {errors.password && <p role="alert" className="text-xs text-red-500 mt-1">{errors.password.message}</p>}
      </div>

      {/* Confirm password */}
      <div>
        <label htmlFor="c-confirm" className="block text-sm font-medium text-gray-700 mb-1.5">Confirm password</label>
        <div className="relative">
          <input
            id="c-confirm"
            type={showConfirm ? 'text' : 'password'}
            placeholder="••••••••"
            {...register('confirmPassword')}
            aria-invalid={errors.confirmPassword ? 'true' : 'false'}
            className="w-full border border-gray-200 rounded-xl px-4 py-2.5 pr-10 text-sm outline-none transition-all"
            onFocus={e => Object.assign(e.target.style, focusStyle)}
            onBlur={e => Object.assign(e.target.style, blurStyle)}
          />
          <button type="button" onClick={() => setShowConfirm(!showConfirm)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            aria-label="Toggle confirm password visibility">
            {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>
        {errors.confirmPassword && <p role="alert" className="text-xs text-red-500 mt-1">{errors.confirmPassword.message}</p>}
      </div>

      {serverError && (
        <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-xl px-4 py-3">
          <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
          <p role="alert" className="text-xs text-red-600">{serverError}</p>
        </div>
      )}

      <button type="submit" disabled={isSubmitting}
        className="w-full text-white rounded-xl py-2.5 text-sm font-semibold transition-colors mt-2 disabled:opacity-60"
        style={{ background: '#422a15' }}
        onMouseEnter={e => { if (!isSubmitting) (e.target as HTMLButtonElement).style.background = '#5a3a20' }}
        onMouseLeave={e => { (e.target as HTMLButtonElement).style.background = '#422a15' }}>
        {isSubmitting ? 'Creating account…' : 'Create account'}
      </button>
    </form>
  )
}



export default function SignupPage() {
  const [role, setRole] = useState<Role>('designer')
  const { login } = useAuth()
  const router = useRouter()

  const handleRoleSwitch = (newRole: Role) => setRole(newRole)
  const handleSuccess = (token: string, email: string) => {
    login(token, email, role)
    router.push(role === 'client' ? '/client/dashboard' : '/dashboard')
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

        
          <h1 className="text-2xl font-bold text-[#422a15] mb-1">Create your account</h1>
          <p className="text-sm text-gray-500 mb-6">
            {role === 'designer'
              ? 'Join StyledKraft as a designer or tailor'
              : 'Discover and book Nigeria\'s best designers'}
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

          {/* Render correct form based on role */}
          {role === 'designer'
            ? <DesignerForm onSuccess={handleSuccess} />
            : <ClientForm onSuccess={handleSuccess} />
          }

          {/* Footer */}
          <p className="text-center text-xs text-gray-500 mt-6">
            Already have an account?{' '}
            <Link href="/login" className="font-semibold" style={{ color: '#FF6500' }}>
              Sign in
            </Link>
          </p>

        </div>
      </section>
    </main>
  )
}
