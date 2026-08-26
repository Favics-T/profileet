'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import {
  Menu,
  ImagePlus,
  X,
  TrendingUp,
  TrendingDown,
  Eye,
  MessageSquare,
  Star,
  Clock,
  AlertCircle,
  Inbox,
} from 'lucide-react'
import { useProfile } from '@/context/ProfileContext'
import { useInquiry } from '@/context/InquiryContext'
import { useReview } from '@/context/ReviewContext'
import { usePortfolio } from '@/context/PortfolioContext'
import { useSidebar } from '@/context/SidebarContext'
import { authHeader } from '@/lib/auth'
import { InquiryStatus } from '@/type/index'
import Card from '@/component/ui/Card'
import Badge from '@/component/ui/Badge'
import Avatar from '@/component/ui/Avatar'
import Button from '@/component/ui/Button'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'

interface ViewStats {
  total: number
  thisWeek: number
  lastWeek: number
}

function useProfileViewStats() {
  const [stats, setStats] = useState<ViewStats | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [requestId, setRequestId] = useState(0)

  useEffect(() => {
    async function fetchStats() {
      setIsLoading(true)
      setError(null)
      try {
        const res = await fetch(`${API_URL}/profile/views/stats`, { headers: { ...authHeader() } })
        if (!res.ok) throw new Error(`Failed to load view stats (${res.status})`)
        const data: ViewStats = await res.json()
        setStats(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load view stats')
      } finally {
        setIsLoading(false)
      }
    }
    fetchStats()
  }, [requestId])

  return { stats, isLoading, error, retry: () => setRequestId(id => id + 1) }
}

function formatViewChange(stats: ViewStats | null): { label: string; up: boolean } | null {
  if (!stats) return null
  if (stats.lastWeek === 0) {
    return stats.thisWeek > 0 ? { label: 'New this week', up: true } : null
  }
  const pct = Math.round(((stats.thisWeek - stats.lastWeek) / stats.lastWeek) * 100)
  if (pct === 0) return { label: 'No change', up: true }
  return { label: `${pct > 0 ? '+' : ''}${pct}%`, up: pct > 0 }
}

function timeAgo(iso: string): string {
  const minutes = Math.floor((Date.now() - new Date(iso).getTime()) / 60000)
  if (minutes < 1) return 'Just now'
  if (minutes < 60) return `${minutes} minute${minutes === 1 ? '' : 's'} ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours} hour${hours === 1 ? '' : 's'} ago`
  const days = Math.floor(hours / 24)
  return `${days} day${days === 1 ? '' : 's'} ago`
}

function StatCardSkeleton() {
  return (
    <Card variant="light" className="animate-pulse">
      <div className="h-3 w-1/2 rounded bg-border-light" />
      <div className="mt-3 h-7 w-1/3 rounded bg-border-light" />
      <div className="mt-3 h-3 w-2/5 rounded bg-border-light" />
    </Card>
  )
}

function RequestRowSkeleton() {
  return (
    <div className="flex items-center gap-3.5 py-4 animate-pulse">
      <div className="h-10 w-10 shrink-0 rounded-full bg-border-light" />
      <div className="flex-1 space-y-2">
        <div className="h-3.5 w-1/3 rounded bg-border-light" />
        <div className="h-3 w-1/2 rounded bg-border-light" />
      </div>
      <div className="h-8 w-20 rounded-xl bg-border-light" />
      <div className="h-8 w-20 rounded-xl bg-border-light" />
    </div>
  )
}

export default function DashboardPage() {
  const { toggle } = useSidebar()
  const { profile, updateProfile, isLoading: profileLoading } = useProfile()
  const { inquiries, updateStatus, isLoading: inquiriesLoading, error: inquiriesError, refetch: refetchInquiries } = useInquiry()
  const { reviews, isLoading: reviewsLoading } = useReview()
  const { items: portfolioItems, isLoading: portfolioLoading } = usePortfolio()
  const { stats: viewStats, isLoading: viewsLoading, error: viewsError, retry: retryViews } = useProfileViewStats()

  const [bannerDismissed, setBannerDismissed] = useState(false)
  const [togglingAvailability, setTogglingAvailability] = useState(false)
  const [actioningId, setActioningId] = useState<string | null>(null)
  const [actioningKind, setActioningKind] = useState<'accept' | 'decline' | null>(null)

  const nameParts = profile.fullName.trim().split(/\s+/).filter(Boolean)
  const displayName =
    nameParts.length === 0 ? 'Artisan' : nameParts.length === 1 ? nameParts[0] : `${nameParts[0]} ${nameParts[1][0]}`

  const showBanner = !portfolioLoading && !bannerDismissed && portfolioItems.length < 5

  const newInquiries = inquiries.filter(i => i.status === 'New')
  const avgRating = reviews.length ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length : null
  const viewChange = formatViewChange(viewStats)

  const statsLoading = viewsLoading || inquiriesLoading || reviewsLoading

  async function handleToggleAvailability() {
    setTogglingAvailability(true)
    try {
      await updateProfile({ available: !profile.available })
    } catch {
      
    } finally {
      setTogglingAvailability(false)
    }
  }

  async function handleAction(id: string, kind: 'accept' | 'decline') {
    setActioningId(id)
    setActioningKind(kind)
    const status: InquiryStatus = kind === 'accept' ? 'Booked' : 'Declined'
    await updateStatus(id, status)
    setActioningId(null)
    setActioningKind(null)
  }

  return (
    <div className="px-5 py-6 sm:px-8">
      <button onClick={toggle} className="mb-4 text-brand-dark lg:hidden" aria-label="Open sidebar">
        <Menu className="h-5 w-5" />
      </button>

      {/* Welcome header */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-brand-dark sm:text-3xl">
            {profileLoading ? 'Welcome back.' : `Welcome back, ${displayName}.`}
          </h1>
          <p className="mt-1 text-sm text-accent-terracotta">
            Here&apos;s what&apos;s happening with your artisan business today.
          </p>
        </div>

        <button
          role="switch"
          aria-checked={profile.available}
          onClick={handleToggleAvailability}
          disabled={togglingAvailability}
          className="inline-flex items-center gap-2.5 rounded-full border border-border-light bg-white px-3.5 py-2 text-sm font-medium text-brand-dark disabled:opacity-60"
        >
          {profile.available ? 'Available' : 'Unavailable'}
          <span
            className={`relative h-5 w-9 shrink-0 rounded-full transition-colors ${
              profile.available ? 'bg-emerald-500' : 'bg-border-light'
            }`}
          >
            <span
              className={`absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-transform ${
                profile.available ? 'translate-x-4.5' : 'translate-x-0.5'
              }`}
            />
          </span>
        </button>
      </div>

      {/* Incomplete profile banner */}
      {showBanner && (
        <Card variant="light" className="mt-6 border-accent-gold/30 bg-accent-gold/10">
          <div className="flex flex-wrap items-center gap-4">
            <ImagePlus className="h-8 w-8 shrink-0 text-accent-terracotta" />
            <div className="min-w-0 flex-1">
              <p className="font-semibold text-brand-dark">Complete your profile — add portfolio photos</p>
              <p className="mt-0.5 text-sm text-brand-dark/60">
                Profiles with 5+ photos get 40% more inquiries
              </p>
            </div>
            <Link href="/dashboard/portfolio/new">
              <Button variant="primary">Add Photos</Button>
            </Link>
            <button
              onClick={() => setBannerDismissed(true)}
              className="text-brand-dark/40 hover:text-brand-dark"
              aria-label="Dismiss"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </Card>
      )}

      {/* Stats row */}
      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
        {statsLoading ? (
          <>
            <StatCardSkeleton />
            <StatCardSkeleton />
            <StatCardSkeleton />
          </>
        ) : (
          <>
            <Card variant="light">
              <div className="flex items-center justify-between text-brand-dark/60">
                <span className="text-sm">Profile Views</span>
                <Eye className="h-4 w-4" />
              </div>
              <p className="mt-2 text-2xl font-bold text-brand-dark">{viewStats ? viewStats.total.toLocaleString() : '—'}</p>
              {viewsError ? (
                <button onClick={retryViews} className="mt-1 text-xs font-medium text-error underline">
                  Retry
                </button>
              ) : (
                viewChange && (
                  <p className={`mt-1 flex items-center gap-1 text-xs font-medium ${viewChange.up ? 'text-emerald-600' : 'text-error'}`}>
                    {viewChange.up ? <TrendingUp className="h-3.5 w-3.5" /> : <TrendingDown className="h-3.5 w-3.5" />}
                    {viewChange.label}
                  </p>
                )
              )}
            </Card>

            <Card variant="light">
              <div className="flex items-center justify-between text-brand-dark/60">
                <span className="text-sm">New Inquiries</span>
                <MessageSquare className="h-4 w-4" />
              </div>
              <p className="mt-2 text-2xl font-bold text-brand-dark">{newInquiries.length}</p>
              {newInquiries.length > 0 && (
                <Badge variant="gold" className="mt-1.5">
                  Needs Action
                </Badge>
              )}
            </Card>

            <Card variant="light">
              <div className="flex items-center justify-between text-brand-dark/60">
                <span className="text-sm">Average Rating</span>
                <Star className="h-4 w-4" />
              </div>
              <p className="mt-2 text-2xl font-bold text-brand-dark">{avgRating ? avgRating.toFixed(1) : '—'}</p>
              <p className="mt-1 text-xs text-brand-dark/50">({reviews.length} Reviews)</p>
            </Card>
          </>
        )}
      </div>

      {/* Recent Requests */}
      <div className="mt-8">
        <div className="mb-2 flex items-center justify-between">
          <h2 className="text-lg font-bold text-brand-dark">Recent Requests</h2>
          <Link href="/dashboard/inquiries" className="text-sm font-medium text-accent-gold">
            View All &rarr;
          </Link>
        </div>

        <Card variant="light" className="p-0">
          {inquiriesError ? (
            <div className="flex flex-col items-center gap-3 px-6 py-10 text-center">
              <AlertCircle className="h-6 w-6 text-error" />
              <p className="text-sm text-error">{inquiriesError}</p>
              <Button variant="outline" onClick={() => refetchInquiries()}>
                Retry
              </Button>
            </div>
          ) : inquiriesLoading ? (
            <div className="divide-y divide-border-light px-5">
              <RequestRowSkeleton />
              <RequestRowSkeleton />
            </div>
          ) : newInquiries.length === 0 ? (
            <div className="flex flex-col items-center gap-2 px-6 py-12 text-center">
              <Inbox className="h-7 w-7 text-brand-dark/30" />
              <p className="text-sm text-brand-dark/60">No recent requests right now.</p>
            </div>
          ) : (
            <div className="divide-y divide-border-light px-5">
              {newInquiries.map(inq => {
                const isBusy = actioningId === inq.id
                return (
                  <div key={inq.id} className="flex flex-wrap items-center gap-3.5 py-4">
                    <Avatar name={inq.client} size="md" />
                    <div className="min-w-0 flex-1">
                      <p className="font-bold text-brand-dark">{inq.client}</p>
                      <p className="truncate text-sm text-brand-dark/60">{inq.service}</p>
                      <p className="mt-0.5 flex items-center gap-1 text-xs text-brand-dark/40">
                        <Clock className="h-3 w-3" />
                        {timeAgo(inq.createdAt)}
                      </p>
                    </div>
                    <div className="flex shrink-0 items-center gap-2">
                      <Button
                        variant="outline"
                        disabled={isBusy}
                        loading={isBusy && actioningKind === 'decline'}
                        onClick={() => handleAction(inq.id, 'decline')}
                      >
                        Decline
                      </Button>
                      <Button
                        variant="primary"
                        disabled={isBusy}
                        loading={isBusy && actioningKind === 'accept'}
                        onClick={() => handleAction(inq.id, 'accept')}
                      >
                        Accept
                      </Button>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </Card>
      </div>
    </div>
  )
}
