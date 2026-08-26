'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { FcGoogle } from 'react-icons/fc'
import { FaApple } from 'react-icons/fa'
import { AlertCircle } from 'lucide-react'
import SplitAuthLayout from '@/component/ui/SplitAuthLayout'
import Input from '@/component/ui/Input'
import Button from '@/component/ui/Button'
import { useAuth } from '@/context/AuthContext'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'

const clientSignupSchema = z
  .object({
    fullName: z.string().trim().min(1, 'Full name is required'),
    email: z.string().trim().toLowerCase().email('Please enter a valid email'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
    confirmPassword: z.string(),
    acceptTerms: z.boolean().refine(val => val === true, {
      message: 'You must accept the terms to continue',
    }),
  })
  .refine(data => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  })

type ClientSignupValues = z.infer<typeof clientSignupSchema>

export default function ClientSignupPage() {
  const [serverError, setServerError] = useState<string | null>(null)
  const { login } = useAuth()

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ClientSignupValues>({
    resolver: zodResolver(clientSignupSchema),
  })

  const onSubmit = async (data: ClientSignupValues) => {
    setServerError(null)
    try {
      const res = await fetch(`${API_URL}/auth/client/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: data.fullName,
          email: data.email,
          password: data.password,
        }),
      })
      const json = await res.json()

      if (!res.ok) {
        setServerError(json.error ?? 'Registration failed. Please try again.')
        return
      }

      login(json.token, json.user?.email ?? data.email, 'client')
    } catch {
      setServerError('Network error. Please check your connection.')
    }
  }

  return (
    <SplitAuthLayout>
      <div className="w-full max-w-[400px]">
        <h1 className="mb-6 text-2xl font-bold text-brand-dark">Create your Client Account</h1>

        <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
          <Input
            label="Full Name"
            placeholder="Ada Obi"
            {...register('fullName')}
            error={errors.fullName?.message}
          />
          <Input
            label="Email Address"
            type="email"
            placeholder="you@example.com"
            {...register('email')}
            error={errors.email?.message}
          />
          <Input
            label="Password"
            type="password"
            placeholder="Min. 6 characters"
            {...register('password')}
            error={errors.password?.message}
          />
          <Input
            label="Confirm Password"
            type="password"
            placeholder="Re-enter your password"
            {...register('confirmPassword')}
            error={errors.confirmPassword?.message}
          />

          <div>
            <label className="flex items-start gap-2.5 text-sm text-brand-dark/70">
              <input
                type="checkbox"
                className="mt-0.5 h-4 w-4 rounded border-border-light accent-accent-gold"
                {...register('acceptTerms')}
              />
              <span>
                I agree to the{' '}
                <Link href="/terms" className="font-medium text-accent-gold">
                  Terms &amp; Conditions
                </Link>
              </span>
            </label>
            {errors.acceptTerms && (
              <p role="alert" className="mt-1.5 text-xs text-error">
                {errors.acceptTerms.message}
              </p>
            )}
          </div>

          {serverError && (
            <div className="flex items-center gap-2 rounded-xl border border-error/30 bg-error/10 px-4 py-3">
              <AlertCircle className="h-4 w-4 shrink-0 text-error" />
              <p role="alert" className="text-xs text-error">
                {serverError}
              </p>
            </div>
          )}

          <Button type="submit" variant="secondary" loading={isSubmitting} className="w-full">
            {isSubmitting ? 'Creating account…' : 'Create Account'}
          </Button>
        </form>

        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-border-light" />
          </div>
          <div className="relative mx-auto w-fit bg-brand-light px-3 text-xs text-brand-dark/50">or</div>
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
          Already have an account?{' '}
          <Link href="/login" className="font-semibold text-accent-gold">
            Log In
          </Link>
        </p>
      </div>
    </SplitAuthLayout>
  )
}
