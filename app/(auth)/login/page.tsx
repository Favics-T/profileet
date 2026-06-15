'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { FcGoogle } from 'react-icons/fc'
import { Scissors } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'

const loginSchema = z.object({
  email: z.string().email('Please enter a valid email'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
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
    // Simulate a short network delay for UX realism
    // await new Promise((r) => setTimeout(r, 600))
    // login(data.email);

    try{
      const res = await fetch('https://reqres.in/api/login',{
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({
          email:data.email,
          password:data.password,
        })
      })
        const json = await res.json();
     if (!res.ok) {
      // reqres.in returns { error: "user not found" } or { error: "Missing password" }
      setServerError(json.error ?? 'Login failed. Please try again.')
      return
    }
    login(data.email)
    // login(json.token)
     if (!res.ok) {
      // reqres.in returns { error: "user not found" } or { error: "Missing password" }
      setServerError( json.error??'Network Error, check your internet connection. Please try again.')
      return
    
    }
  
  }
  catch {
      setServerError('Network error.')
    }
  }
  return (
    <main className="min-h-screen bg-[#faf8f5] flex flex-col">
      {/* Nav */}
      <header className="px-5 sm:px-10 py-5 flex items-center gap-2">
        <Scissors className="w-5 h-5 text-amber-600" />
        <span className="font-bold text-xl text-[#422a15]">StyledKraft</span>
      </header>

      {/* Card */}
      <section className="flex-1 flex items-center justify-center px-4">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 w-full max-w-md p-6 sm:p-8">
          <h1 className="text-2xl font-bold text-[#422a15] mb-1">Welcome back</h1>
          <p className="text-sm text-gray-500 mb-6">Sign in to your designer studio</p>

          <button className="w-full flex items-center justify-center gap-3 border border-gray-200 rounded-xl py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors mb-6">
            <FcGoogle className="w-5 h-5" />
            Continue with Google
          </button>

          <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200" />
            </div>
            <div className="relative flex justify-center text-xs text-gray-400 bg-white px-2 w-fit mx-auto">
              or continue with email
            </div>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
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
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-100 transition-all"
              />
              {errors.email && (
                <p role="alert" className="text-xs text-red-500 mt-1">
                  {errors.email.message}
                </p>
              )}
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label htmlFor="password" className="text-sm font-medium text-gray-700">
                  Password
                </label>
                <button type="button" className="text-xs text-amber-600 hover:text-amber-700">
                  Forgot password?
                </button>
              </div>
              <input
                id="password"
                type="password"
                placeholder="••••••••"
                {...register('password')}
                aria-invalid={errors.password ? 'true' : 'false'}
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-100 transition-all"
              />
              {errors.password && (
                <p role="alert" className="text-xs text-red-500 mt-1">
                  {errors.password.message}
                </p>
              )}
            </div>

            {serverError && (
              <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3">
                <p role="alert" className="text-xs text-red-600">
                  {serverError}
                </p>
              </div>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-[#422a15] text-white rounded-xl py-2.5 text-sm font-semibold hover:bg-[#5a3a20] disabled:opacity-60 transition-colors mt-2"
            >
              {isSubmitting ? 'Signing in…' : 'Sign in'}
            </button>
          </form>

          <p className="text-center text-xs text-gray-500 mt-6">
            Don&apos;t have an account?{' '}
            <a href="/signup" className="text-amber-600 font-semibold hover:text-amber-700">
              Create one free
            </a>
          </p>

        </div>
      </section>
    </main>
  )
}
