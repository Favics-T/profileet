import { Star } from 'lucide-react'

interface RatingStarsProps {
  rating: number
  reviewCount?: number
  className?: string
}

export default function RatingStars({ rating, reviewCount, className = '' }: RatingStarsProps) {
  return (
    <div className={`inline-flex items-center gap-1.5 ${className}`}>
      <div className="flex items-center">
        {Array.from({ length: 5 }).map((_, i) => (
          <Star
            key={i}
            className={`h-4 w-4 ${
              i < Math.round(rating) ? 'fill-accent-gold text-accent-gold' : 'fill-none text-current opacity-25'
            }`}
          />
        ))}
      </div>
      <span className="text-sm font-semibold">{rating.toFixed(1)}</span>
      {typeof reviewCount === 'number' && <span className="text-sm opacity-60">({reviewCount})</span>}
    </div>
  )
}
