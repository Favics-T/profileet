'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { MapPin, AlertCircle, Loader2, Star, ImageOff } from 'lucide-react'
import Card from '@/component/ui/Card'
import Badge from '@/component/ui/Badge'
import Avatar from '@/component/ui/Avatar'
import RatingStars from '@/component/ui/RatingStars'
import Button from '@/component/ui/Button'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'

interface PortfolioItem {
  id: string
  title: string
  tag: string
  description: string
  imageUrl: string
}

interface Review {
  id: string
  client: string
  initials: string
  color: string
  service: string
  rating: number
  date: string
  text: string
}

interface Artisan {
  id: string
  artisanId: string
  fullName: string
  specialty: string
  location: string
  bio: string
  styles: string[]
  available: boolean
  avatar: string | null
  rating: number
  reviews: number
  portfolioItems: PortfolioItem[]
  reviewsList: Review[]
}

interface AvailabilityEntry {
  date: string
  status: 'open' | 'busy' | 'off'
}

type Tab = 'portfolio' | 'about' | 'reviews' | 'availability'

const TABS: { value: Tab; label: string }[] = [
  { value: 'portfolio', label: 'Portfolio' },
  { value: 'about', label: 'About' },
  { value: 'reviews', label: 'Reviews' },
  { value: 'availability', label: 'Availability' },
]

const DAY_STATUS_STYLE: Record<AvailabilityEntry['status'], string> = {
  open: 'bg-emerald-500/15 text-emerald-700',
  busy: 'bg-accent-gold/20 text-accent-gold',
  off: 'bg-brand-dark/10 text-brand-dark/40',
}

export default function ArtisanProfilePage() {
  const { id } = useParams<{ id: string }>()

  const [artisan, setArtisan] = useState<Artisan | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [tab, setTab] = useState<Tab>('portfolio')

  const [availability, setAvailability] = useState<AvailabilityEntry[]>([])

  useEffect(() => {
    let cancelled = false
    async function fetchArtisan() {
      setIsLoading(true)
      setError(null)
      try {
        const res = await fetch(`${API_URL}/artisans/${id}`)
        if (!res.ok) throw new Error(res.status === 404 ? 'Artisan not found' : `Failed to load artisan (${res.status})`)
        const data: Artisan = await res.json()
        if (!cancelled) setArtisan(data)
      } catch (err) {
        if (!cancelled) setError(err instanceof Error ? err.message : 'Failed to load artisan')
      } finally {
        if (!cancelled) setIsLoading(false)
      }
    }
    fetchArtisan()
    return () => {
      cancelled = true
    }
  }, [id])

  // availability is keyed by the artisan's underlying User id (artisan.artisanId),
  // not the ArtisanProfile id in the URL - fetch once the profile has loaded
  useEffect(() => {
    if (!artisan?.artisanId) return
    fetch(`${API_URL}/availability/artisan/${artisan.artisanId}`)
      .then(res => (res.ok ? res.json() : null))
      .then(data => {
        if (data?.availability) setAvailability(data.availability)
      })
      .catch(() => {})
  }, [artisan?.artisanId])

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 py-24 text-brand-dark/50">
        <Loader2 className="h-6 w-6 animate-spin" />
        <p className="text-sm">Loading profile...</p>
      </div>
    )
  }

  if (error || !artisan) {
    return (
      <div className="mx-auto max-w-lg py-16 text-center">
        <AlertCircle className="mx-auto h-6 w-6 text-error" />
        <p className="mt-3 text-sm text-error">{error || 'Artisan not found'}</p>
      </div>
    )
  }

  const ratingCounts = [5, 4, 3, 2, 1].map(star => artisan.reviewsList.filter(r => Math.round(r.rating) === star).length)
  const maxRatingCount = Math.max(...ratingCounts, 1)

  return (
    <div className="mx-auto max-w-4xl space-y-5">
      {/* Header */}
      <Card variant="light">
        <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center">
          <Avatar src={artisan.avatar} name={artisan.fullName || 'Artisan'} size="lg" />
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-xl font-bold text-brand-dark">{artisan.fullName || 'Unnamed artisan'}</h1>
              <Badge variant={artisan.available ? 'success' : 'neutral'} dot>
                {artisan.available ? 'Available now' : 'Unavailable'}
              </Badge>
            </div>
            <p className="mt-0.5 text-sm text-brand-dark/60">{artisan.specialty || 'Artisan'}</p>
            <div className="mt-2 flex flex-wrap items-center gap-3">
              <RatingStars rating={artisan.rating} reviewCount={artisan.reviews} className="text-brand-dark" />
              {artisan.location && (
                <span className="flex items-center gap-1 text-xs text-brand-dark/50">
                  <MapPin className="h-3.5 w-3.5" /> {artisan.location}
                </span>
              )}
            </div>
          </div>
          <Link href={`/client/dashboard/discover/book/${artisan.id}`}>
            <Button variant="primary">Request a Booking</Button>
          </Link>
        </div>
      </Card>

      {/* Tabs */}
      <div className="flex gap-1 overflow-x-auto rounded-xl border border-border-light bg-white p-1">
        {TABS.map(t => (
          <button
            key={t.value}
            onClick={() => setTab(t.value)}
            className={`min-w-fit flex-1 whitespace-nowrap rounded-lg px-3 py-1.5 text-sm font-semibold transition-colors ${
              tab === t.value ? 'bg-brand-dark text-brand-light' : 'text-brand-dark/50 hover:text-brand-dark'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'portfolio' && (
        <Card variant="light">
          {artisan.portfolioItems.length === 0 ? (
            <EmptyState icon={ImageOff} label="No portfolio items yet." />
          ) : (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              {artisan.portfolioItems.map(item => (
                <div key={item.id} className="overflow-hidden rounded-xl border border-border-light">
                  <div className="aspect-square bg-brand-light bg-cover bg-center" style={{ backgroundImage: `url(${item.imageUrl})` }} />
                  <div className="p-2.5">
                    <p className="truncate text-xs font-semibold text-brand-dark">{item.title}</p>
                    <p className="truncate text-xs text-brand-dark/50">{item.tag}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      )}

      {tab === 'about' && (
        <Card variant="light" className="space-y-4">
          <div>
            <p className="mb-1.5 text-xs font-bold uppercase tracking-wide text-brand-dark/40">Bio</p>
            <p className="text-sm leading-relaxed text-brand-dark/70">{artisan.bio || 'This artisan has not added a bio yet.'}</p>
          </div>
          {artisan.styles.length > 0 && (
            <div>
              <p className="mb-2 text-xs font-bold uppercase tracking-wide text-brand-dark/40">Skills &amp; Specialties</p>
              <div className="flex flex-wrap gap-2">
                {artisan.styles.map(style => (
                  <Badge key={style} variant="neutral">{style}</Badge>
                ))}
              </div>
            </div>
          )}
        </Card>
      )}

      {tab === 'reviews' && (
        <Card variant="light" className="space-y-5">
          <div className="flex flex-col items-start gap-5 sm:flex-row">
            <div className="shrink-0 text-center">
              <p className="text-4xl font-bold text-brand-dark">{artisan.rating.toFixed(1)}</p>
              <RatingStars rating={artisan.rating} className="mt-1 justify-center text-brand-dark" />
              <p className="mt-1 text-xs text-brand-dark/50">{artisan.reviews} reviews</p>
            </div>
            <div className="flex-1 space-y-1.5">
              {[5, 4, 3, 2, 1].map((star, i) => (
                <div key={star} className="flex items-center gap-2">
                  <span className="flex w-8 items-center gap-0.5 text-xs text-brand-dark/50">
                    {star} <Star className="h-3 w-3 fill-current" />
                  </span>
                  <div className="h-1.5 flex-1 rounded-full bg-brand-dark/10">
                    <div
                      className="h-full rounded-full bg-accent-gold"
                      style={{ width: `${(ratingCounts[i] / maxRatingCount) * 100}%` }}
                    />
                  </div>
                  <span className="w-4 text-right text-xs text-brand-dark/40">{ratingCounts[i]}</span>
                </div>
              ))}
            </div>
          </div>

          {artisan.reviewsList.length === 0 ? (
            <EmptyState icon={Star} label="No reviews yet." />
          ) : (
            <div className="space-y-4 border-t border-border-light pt-4">
              {artisan.reviewsList.map(review => (
                <div key={review.id} className="flex gap-3">
                  <Avatar name={review.client} size="sm" />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-sm font-semibold text-brand-dark">{review.client}</p>
                      <span className="shrink-0 text-xs text-brand-dark/40">{review.date}</span>
                    </div>
                    <RatingStars rating={review.rating} className="mt-0.5 text-brand-dark" />
                    <p className="mt-1.5 text-sm text-brand-dark/70">{review.text}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      )}

      {tab === 'availability' && (
        <Card variant="light">
          {availability.length === 0 ? (
            <EmptyState icon={AlertCircle} label="No availability set yet." />
          ) : (
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
              {availability.map(entry => (
                <div key={entry.date} className={`rounded-xl px-3 py-2.5 text-center ${DAY_STATUS_STYLE[entry.status]}`}>
                  <p className="text-xs font-semibold">
                    {new Date(entry.date).toLocaleDateString('en-NG', { day: 'numeric', month: 'short' })}
                  </p>
                  <p className="text-xs capitalize opacity-80">{entry.status}</p>
                </div>
              ))}
            </div>
          )}
        </Card>
      )}
    </div>
  )
}

function EmptyState({ icon: Icon, label }: { icon: React.FC<{ className?: string }>; label: string }) {
  return (
    <div className="flex flex-col items-center gap-3 py-10 text-center">
      <Icon className="h-8 w-8 text-brand-dark/30" />
      <p className="text-sm text-brand-dark/50">{label}</p>
    </div>
  )
}
