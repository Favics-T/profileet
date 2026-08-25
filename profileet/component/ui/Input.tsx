'use client'

import { InputHTMLAttributes, ReactNode, forwardRef, useId, useState } from 'react'
import { Eye, EyeOff } from 'lucide-react'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  icon?: ReactNode
}

const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { label, error, icon, type = 'text', id, className = '', ...props },
  ref
) {
  const [showPassword, setShowPassword] = useState(false)
  const generatedId = useId()
  const inputId = id ?? generatedId
  const isPassword = type === 'password'
  const inputType = isPassword ? (showPassword ? 'text' : 'password') : type

  return (
    <div className="w-full">
      {label && (
        <label htmlFor={inputId} className="mb-1.5 block text-sm font-medium text-brand-dark">
          {label}
        </label>
      )}
      <div className="relative">
        {icon && (
          <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-brand-dark/40">
            {icon}
          </span>
        )}
        <input
          ref={ref}
          id={inputId}
          type={inputType}
          aria-invalid={error ? 'true' : 'false'}
          className={`w-full rounded-xl border bg-white py-2.5 text-sm text-brand-dark outline-none transition-colors placeholder:text-brand-dark/35 ${
            icon ? 'pl-10' : 'pl-4'
          } ${isPassword ? 'pr-10' : 'pr-4'} ${
            error ? 'border-error focus:border-error' : 'border-border-light focus:border-accent-gold'
          } ${className}`}
          {...props}
        />
        {isPassword && (
          <button
            type="button"
            tabIndex={-1}
            onClick={() => setShowPassword(v => !v)}
            aria-label={showPassword ? 'Hide password' : 'Show password'}
            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-brand-dark/40 hover:text-brand-dark"
          >
            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        )}
      </div>
      {error && (
        <p role="alert" className="mt-1.5 text-xs text-error">
          {error}
        </p>
      )}
    </div>
  )
})

export default Input
