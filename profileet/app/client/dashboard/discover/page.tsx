'use client'

import { useEffect, useState } from 'react'
import {
  Search,
  MapPin,
  SlidersHorizontal,
  Bell,
  Bookmark,
  Tag,
  AlertCircle,
  PackageOpen,
} from 'lucide-react'
import Link from 'next/link'
import Card from '@/component/ui/Card'
import Badge from '@/component/ui/Badge'
import Avatar from '@/component/ui/Avatar'
import RatingStars from '@/component/ui/RatingStars'
import Button from '@/component/ui/Button'
import { authHeader } from '@/lib/auth'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'

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
  createdAt: string
}

interface CategoryFilter {
  value: string
  count: number
}

interface ClientProfile {
  firstName: string
  location: string
}

type Tab = 'explore' | 'featured' | 'recent'

const TABS: { value: Tab; label: string }[] = [
  { value: 'explore', label: 'Explore' },
  { value: 'featured', label: 'Featured' },
  { value: 'recent', label: 'Recent' },
]

function sortArtisans(artisans: Artisan[], tab: Tab): Artisan[] {
  const copy = [...artisans]
  if (tab === 'featured') return copy.sort((a, b) => b.rating - a.rating || b.reviews - a.reviews)
  if (tab === 'recent') return copy.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
  return copy
}

function ArtisanCardSkeleton() {
  return (
    <Card variant="light" className="animate-pulse">
      <div className="flex items-start gap-3">
        <div className="h-12 w-12 shrink-0 rounded-full bg-border-light" />
        <div className="flex-1 space-y-2">
          <div className="h-3.5 w-2/3 rounded bg-border-light" />
          <div className="h-3 w-1/2 rounded bg-border-light" />
        </div>
      </div>
      <div className="mt-4 h-3 w-1/3 rounded bg-border-light" />
      <div className="mt-3 space-y-1.5">
        <div className="h-3 w-full rounded bg-border-light" />
        <div className="h-3 w-4/5 rounded bg-border-light" />
      </div>
      <div className="mt-4 h-3 w-1/3 rounded bg-border-light" />
    </Card>
  )
}

export default function DiscoverPage() {
  const [clientProfile, setClientProfile] = useState<ClientProfile | null>(null)

  const [categories, setCategories] = useState<CategoryFilter[]>([])
  const [activeCategory, setActiveCategory] = useState<string | null>(null)

  const [search, setSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [availableOnly, setAvailableOnly] = useState(false)
  const [activeTab, setActiveTab] = useState<Tab>('explore')

  const [artisans, setArtisans] = useState<Artisan[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [requestId, setRequestId] = useState(0)

  useEffect(() => {
    fetch(`${API_URL}/client/profile`, { headers: { ...authHeader() } })
      .then(res => (res.ok ? res.json() : null))
      .then(data => {
        if (data) setClientProfile({ firstName: data.firstName ?? '', location: data.location ?? '' })
      })
      .catch(() => {})
  }, [])

  useEffect(() => {
    fetch(`${API_URL}/artisans/filters`)
      .then(res => (res.ok ? res.json() : null))
      .then(data => {
        if (data?.specialties) setCategories(data.specialties)
      })
      .catch(() => {})
  }, [])

  useEffect(() => {
    const timeout = setTimeout(() => setDebouncedSearch(search.trim()), 400)
    return () => clearTimeout(timeout)
  }, [search])

  useEffect(() => {
    async function fetchArtisans() {
      const params = new URLSearchParams()
      if (activeCategory) params.set('specialty', activeCategory)
      if (debouncedSearch) params.set('q', debouncedSearch)
      if (availableOnly) params.set('available', 'true')

      setIsLoading(true)
      setError(null)

      try {
        const res = await fetch(`${API_URL}/artisans?${params.toString()}`)
        if (!res.ok) throw new Error(`Failed to load artisans (${res.status})`)
        const data: Artisan[] = await res.json()
        setArtisans(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load artisans')
      } finally {
        setIsLoading(false)
      }
    }
    fetchArtisans()
  }, [activeCategory, debouncedSearch, availableOnly, requestId])

  const hasActiveFilters = Boolean(activeCategory || debouncedSearch || availableOnly)
  const clearFilters = () => {
    setActiveCategory(null)
    setSearch('')
    setAvailableOnly(false)
  }

  const sorted = sortArtisans(artisans, activeTab)

  return (
    <div>
      {/* Top bar */}
      <div className="mb-6 flex flex-wrap items-center gap-3">
        <div className="relative min-w-55 flex-1">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-brand-dark/40" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search artisans, items..."
            className="w-full rounded-xl border border-border-light bg-white py-2.5 pl-10 pr-4 text-sm text-brand-dark outline-none transition-colors focus:border-accent-gold"
          />
        </div>

        <span className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-full border border-border-light bg-white px-3 py-2 text-xs font-medium text-brand-dark">
          <MapPin className="h-3.5 w-3.5 text-accent-terracotta" />
          {clientProfile?.location ? `Near ${clientProfile.location}` : 'Set your location'}
        </span>

        <div className="flex items-center gap-4 text-sm">
          {TABS.map(tab => (
            <button
              key={tab.value}
              onClick={() => setActiveTab(tab.value)}
              className={`border-b-2 pb-0.5 transition-colors ${
                activeTab === tab.value
                  ? 'border-brand-dark font-semibold text-brand-dark'
                  : 'border-transparent text-brand-dark/50 hover:text-brand-dark'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <button
          onClick={() => setAvailableOnly(v => !v)}
          className={`inline-flex items-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-medium transition-colors ${
            availableOnly
              ? 'border-accent-gold bg-accent-gold/15 text-brand-dark'
              : 'border-border-light bg-white text-brand-dark hover:border-accent-gold'
          }`}
        >
          <SlidersHorizontal className="h-4 w-4" />
          Filter
        </button>

        <div className="ml-auto flex items-center gap-3">
          <button className="text-brand-dark/60 hover:text-brand-dark" aria-label="Notifications">
            <Bell className="h-5 w-5" />
          </button>
          <button className="text-brand-dark/60 hover:text-brand-dark" aria-label="Saved artisans">
            <Bookmark className="h-5 w-5" />
          </button>
          <Avatar name={clientProfile?.firstName || 'You'} size="sm" />
        </div>
      </div>

      {/* Heading */}
      <h1 className="text-3xl font-bold text-brand-dark">Find your next expert.</h1>
      <p className="mt-1.5 max-w-xl text-sm text-brand-dark/60">
        Connect with skilled artisans in your area for custom tailoring, repairs, and bespoke creations.
      </p>

      {/* Categories */}
      {categories.length > 0 && (
        <div className="mt-8">
          <div className="mb-3 flex items-center justify-between">
            <span className="text-sm font-semibold text-brand-dark">Categories</span>
            <button className="text-sm font-medium text-accent-gold">View all &rarr;</button>
          </div>
          <div className="flex flex-wrap gap-2">
            {categories.map(category => {
              const active = activeCategory === category.value
              return (
                <button
                  key={category.value}
                  onClick={() => setActiveCategory(active ? null : category.value)}
                  className={`inline-flex items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-sm font-medium transition-colors ${
                    active
                      ? 'border-accent-gold bg-accent-gold text-brand-dark'
                      : 'border-border-light bg-white text-brand-dark hover:border-accent-gold'
                  }`}
                >
                  <Tag className="h-3.5 w-3.5" />
                  {category.value}
                </button>
              )
            })}
          </div>
        </div>
      )}

      {/* Artisan grid */}
      <div className="mt-8">
        <h2 className="mb-4 text-lg font-bold text-brand-dark">
          {activeCategory ? `Top ${activeCategory} Near You` : 'Top Artisans Near You'}
        </h2>

        {error && (
          <div className="flex flex-col items-center gap-3 rounded-2xl border border-error/30 bg-error/10 px-6 py-10 text-center">
            <AlertCircle className="h-6 w-6 text-error" />
            <p className="text-sm text-error">{error}</p>
            <Button variant="outline" onClick={() => setRequestId(id => id + 1)}>
              Retry
            </Button>
          </div>
        )}

        {!error && isLoading && (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <ArtisanCardSkeleton key={i} />
            ))}
          </div>
        )}

        {!error && !isLoading && sorted.length === 0 && (
          <div className="flex flex-col items-center gap-3 rounded-2xl border border-border-light bg-white px-6 py-14 text-center">
            <PackageOpen className="h-8 w-8 text-brand-dark/30" />
            <p className="text-sm font-medium text-brand-dark">
              {hasActiveFilters ? 'No artisans match your filters.' : 'No artisans found yet.'}
            </p>
            {hasActiveFilters && (
              <Button variant="ghost" onClick={clearFilters}>
                Clear filters
              </Button>
            )}
          </div>
        )}

        {!error && !isLoading && sorted.length > 0 && (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
            {sorted.map(artisan => (
              <Link key={artisan.id} href={`/client/dashboard/discover/${artisan.id}`}>
                <Card variant="light" className="relative h-full transition-shadow hover:shadow-md">
                  {artisan.available && (
                    <Badge variant="success" dot className="absolute right-4 top-4">
                      Available now
                    </Badge>
                  )}

                  <div className="flex items-center gap-3">
                    <Avatar src={artisan.avatar} name={artisan.fullName || 'Artisan'} size="lg" />
                    <div className="min-w-0">
                      <p className="truncate font-bold text-brand-dark">{artisan.fullName || 'Unnamed artisan'}</p>
                      <p className="truncate text-xs text-brand-dark/60">{artisan.specialty || 'Artisan'}</p>
                    </div>
                  </div>

                  <div className="mt-3">
                    <RatingStars rating={artisan.rating} reviewCount={artisan.reviews} className="text-brand-dark" />
                  </div>

                  {artisan.bio && <p className="mt-3 line-clamp-2 text-sm text-brand-dark/60">{artisan.bio}</p>}

                  {artisan.styles.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-1.5">
                      {artisan.styles.slice(0, 3).map(style => (
                        <Badge key={style} variant="neutral">
                          {style}
                        </Badge>
                      ))}
                    </div>
                  )}

                  {artisan.location && (
                    <div className="mt-4 flex items-center gap-1.5 border-t border-border-light pt-3 text-xs text-brand-dark/50">
                      <MapPin className="h-3.5 w-3.5" />
                      {artisan.location}
                    </div>
                  )}
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
