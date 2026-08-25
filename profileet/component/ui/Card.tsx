import { HTMLAttributes } from 'react'

type CardVariant = 'light' | 'dark'

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: CardVariant
}

const variantClasses: Record<CardVariant, string> = {
  light: 'bg-white border border-border-light text-brand-dark',
  dark: 'bg-surface border border-border-dark text-brand-light',
}

export default function Card({ variant = 'light', className = '', children, ...props }: CardProps) {
  return (
    <div className={`rounded-2xl p-6 shadow-sm ${variantClasses[variant]} ${className}`} {...props}>
      {children}
    </div>
  )
}
