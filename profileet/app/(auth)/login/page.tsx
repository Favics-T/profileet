'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { FcGoogle } from 'react-icons/fc'
import { FaApple } from 'react-icons/fa'
import { AlertCircle, Mail, Lock } from 'lucide-react'
import SplitAuthLayout from '@/component/ui/SplitAuthLayout'
import Input from '@/component/ui/Input'
import Button from '@/component/ui/Button'
import { useAuth } from '@/context/AuthContext'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'

const loginSchema = z.object({
  email: z.string().trim().min(1, 'Email is required').email('Please enter a valid email'),
  password: z.string().min(1, 'Password is required'),
})

type LoginFormValues = z.infer<typeof loginSchema>

export default function LoginPage() {
  const [serverError, setServerError] = useState<string | null>(null)
  const { login } = useAuth()

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
  })

  const onSubmit = async (data: LoginFormValues) => {
    setServerError(null)
    try {
      const res = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: data.email, password: data.password }),
      })
      const json = await res.json()

      if (!res.ok) {
        setServerError(json.error ?? 'Invalid email or password')
        return
      }

      const role = json.role === 'client' ? 'client' : 'designer'
      login(json.token, json.user?.email ?? data.email, role)
    } catch {
      setServerError('Network error. Please check your connection.')
    }
  }

  return (
    <SplitAuthLayout>
      <div className="w-full max-w-[400px]">
        <h1 className="mb-1 text-2xl font-bold text-brand-dark">Welcome Back</h1>
        <p className="mb-6 text-sm text-brand-dark/60">Log in to your ArtisanLink account</p>

        <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
          <Input
            label="Email Address"
            type="email"
            placeholder="you@example.com"
            icon={<Mail className="h-4 w-4" />}
            {...register('email')}
            error={errors.email?.message}
          />

          <div>
            <div className="mb-1.5 flex items-center justify-between">
              <label htmlFor="password" className="text-sm font-medium text-brand-dark">
                Password
              </label>
              <Link href="/forgot-password" className="text-xs font-semibold text-accent-gold">
                Forgot password?
              </Link>
            </div>
            <Input
              id="password"
              type="password"
              placeholder="Enter your password"
              icon={<Lock className="h-4 w-4" />}
              {...register('password')}
              error={errors.password?.message}
            />
          </div>

          {serverError && (
            <div className="flex items-center gap-2 rounded-xl border border-error/30 bg-error/10 px-4 py-3">
              <AlertCircle className="h-4 w-4 shrink-0 text-error" />
              <p role="alert" className="text-xs text-error">
                {serverError}
              </p>
            </div>
          )}

          <Button type="submit" variant="primary" loading={isSubmitting} className="w-full">
            {isSubmitting ? 'Logging in…' : 'Log In'}
          </Button>
        </form>

        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-border-light" />
          </div>
          <div className="relative mx-auto w-fit bg-brand-light px-3 text-xs text-brand-dark/50">
            or continue with
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Button type="button" variant="outline">
            <FcGoogle className="h-5 w-5" />
            Google
          </Button>
          <Button type="button" variant="outline">
            <FaApple className="h-5 w-5" />
            Apple
          </Button>
        </div>

        <p className="mt-6 text-center text-sm text-brand-dark/60">
          Don&apos;t have an account?{' '}
          <Link href="/signup/choose" className="font-semibold text-accent-gold">
            Sign up
          </Link>
        </p>
      </div>
    </SplitAuthLayout>
  )
}
