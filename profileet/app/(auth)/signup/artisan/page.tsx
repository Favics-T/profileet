'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { AlertCircle, ChevronDown } from 'lucide-react'
import SplitAuthLayout from '@/component/ui/SplitAuthLayout'
import Input from '@/component/ui/Input'
import Button from '@/component/ui/Button'
import { useAuth } from '@/context/AuthContext'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'

const TRADE_CATEGORIES = [
  { value: 'tailor', label: 'Tailor / Fashion Designer' },
  { value: 'makeup artist', label: 'Makeup Artist' },
  { value: 'hairdresser', label: 'Hairdresser' },
  { value: 'chef', label: 'Chef' },
]

const artisanSignupSchema = z
  .object({
    fullName: z.string().trim().min(1, 'Full name is required'),
    businessName: z.string().trim().min(1, 'Business/trade name is required'),
    specialty: z.string().min(1, 'Please select a trade category'),
    city: z.string().trim().min(1, 'City is required'),
    state: z.string().trim().min(1, 'State is required'),
    email: z.string().trim().toLowerCase().email('Please enter a valid email'),
    phone: z.string().trim().min(1, 'Phone number is required'),
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

type ArtisanSignupValues = z.infer<typeof artisanSignupSchema>

export default function ArtisanSignupPage() {
  const [serverError, setServerError] = useState<string | null>(null)
  const { login } = useAuth()

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ArtisanSignupValues>({
    resolver: zodResolver(artisanSignupSchema),
  })

  const onSubmit = async (data: ArtisanSignupValues) => {
    setServerError(null)
    try {
      const res = await fetch(`${API_URL}/auth/artisan/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: data.fullName,
          businessName: data.businessName,
          specialty: data.specialty,
          city: data.city,
          state: data.state,
          email: data.email,
          password: data.password,
        }),
      })
      const json = await res.json()

      if (!res.ok) {
        setServerError(json.error ?? 'Registration failed. Please try again.')
        return
      }

      login(json.token, json.user?.email ?? data.email, 'designer')
    } catch {
      setServerError('Network error. Please check your connection.')
    }
  }

  return (
    <SplitAuthLayout>
      <div className="w-full max-w-[400px]">
        <h1 className="mb-1 text-2xl font-bold text-brand-dark">Create your Artisan Account</h1>
        <p className="mb-6 text-sm text-brand-dark/60">Showcase your skills to new clients.</p>

        <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
          <Input
            label="Full Name"
            placeholder="Jane Doe"
            {...register('fullName')}
            error={errors.fullName?.message}
          />
          <Input
            label="Business/Trade Name"
            placeholder="Doe Carpentry"
            {...register('businessName')}
            error={errors.businessName?.message}
          />

          <div>
            <label htmlFor="specialty" className="mb-1.5 block text-sm font-medium text-brand-dark">
              Primary Trade Category
            </label>
            <div className="relative">
              <select
                id="specialty"
                defaultValue=""
                aria-invalid={errors.specialty ? 'true' : 'false'}
                {...register('specialty')}
                className={`w-full appearance-none rounded-xl border bg-white py-2.5 pl-4 pr-10 text-sm text-brand-dark outline-none transition-colors ${
                  errors.specialty ? 'border-error focus:border-error' : 'border-border-light focus:border-accent-gold'
                }`}
              >
                <option value="" disabled>
                  Select a category
                </option>
                {TRADE_CATEGORIES.map(category => (
                  <option key={category.value} value={category.value}>
                    {category.label}
                  </option>
                ))}
              </select>
              <ChevronDown className="pointer-events-none absolute right-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-brand-dark/40" />
            </div>
            {errors.specialty && (
              <p role="alert" className="mt-1.5 text-xs text-error">
                {errors.specialty.message}
              </p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Input label="City" placeholder="Lagos" {...register('city')} error={errors.city?.message} />
            <Input label="State" placeholder="Lagos" {...register('state')} error={errors.state?.message} />
          </div>

          <Input
            label="Email Address"
            type="email"
            placeholder="you@example.com"
            {...register('email')}
            error={errors.email?.message}
          />
          <Input
            label="Phone Number"
            type="tel"
            placeholder="(555) 123-4567"
            {...register('phone')}
            error={errors.phone?.message}
          />

          <div className="grid grid-cols-2 gap-3">
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
              placeholder="Re-enter password"
              {...register('confirmPassword')}
              error={errors.confirmPassword?.message}
            />
          </div>

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
                </Link>{' '}
                and{' '}
                <Link href="/privacy" className="font-medium text-accent-gold">
                  Privacy Policy
                </Link>
                .
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

          <Button type="submit" variant="primary" loading={isSubmitting} className="w-full">
            {isSubmitting ? 'Creating account…' : 'Create Account'}
          </Button>
        </form>

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
