import { HTMLAttributes } from 'react'

type BadgeVariant = 'gold' | 'terracotta' | 'success' | 'neutral'

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant
  dot?: boolean
}

const variantClasses: Record<BadgeVariant, string> = {
  gold: 'bg-accent-gold/15 text-accent-gold',
  terracotta: 'bg-accent-terracotta/15 text-accent-terracotta',
  success: 'bg-emerald-500/15 text-emerald-600',
  neutral: 'bg-border-light/60 text-brand-dark',
}

export default function Badge({ variant = 'neutral', dot = false, className = '', children, ...props }: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${variantClasses[variant]} ${className}`}
      {...props}
    >
      {dot && <span className="h-1.5 w-1.5 rounded-full bg-current" />}
      {children}
    </span>
  )
}
