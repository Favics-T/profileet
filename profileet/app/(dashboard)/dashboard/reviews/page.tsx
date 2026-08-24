'use client'

import { useState } from 'react'
import { useSidebar } from '@/context/SidebarContext'
import { useReview } from '@/context/ReviewContext'
import { Star, Menu, MessageSquare, TrendingUp, ThumbsUp, Flag, ChevronDown, Loader2 } from 'lucide-react'

function StarDisplay({ rating, size = 'sm' }: { rating: number; size?: 'sm' | 'lg' }) {
  const cls = size === 'lg' ? 'w-5 h-5' : 'w-3.5 h-3.5'
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map(i => (
        <Star key={i} className={`${cls} ${i <= rating ? 'text-amber-400 fill-amber-400' : 'text-gray-200 fill-gray-200'}`} />
      ))}
    </div>
  )
}

type FilterVal = 'all' | '5' | '4' | '3'

export default function ReviewsPage() {
  const { toggle } = useSidebar()
  const { reviews, isLoading, error, submitReply, markHelpful } = useReview()

  const [replyText, setReplyText] = useState<Record<string, string>>({})
  const [replyOpen, setReplyOpen] = useState<string | null>(null)
  const [filter, setFilter] = useState<FilterVal>('all')
  const [submitting, setSubmitting] = useState<string | null>(null)

  const avgRating = reviews.length
    ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1)
    : '—'

  const fiveStars = reviews.filter(r => r.rating === 5).length
  const filtered = filter === 'all' ? reviews : reviews.filter(r => r.rating === Number(filter))

  const handleSubmitReply = async (id: string) => {
    const text = replyText[id]?.trim()
    if (!text) return
    setSubmitting(id)
    await submitReply(id, text)
    setReplyText(prev => ({ ...prev, [id]: '' }))
    setReplyOpen(null)
    setSubmitting(null)
  }

  return (
    <>
      {/* Top bar */}
      <header className="bg-white border-b border-gray-100 px-4 sm:px-8 py-4 flex items-center gap-3 sticky top-0 z-10">
        <button onClick={toggle} className="lg:hidden p-2 rounded-xl hover:bg-gray-100 text-gray-600 shrink-0">
          <Menu className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-base sm:text-lg font-bold text-[#422a15]">Reviews</h1>
          <p className="text-xs text-gray-400 hidden sm:block">{reviews.length} client reviews</p>
        </div>
      </header>

      <div className="p-4 sm:p-6 lg:p-8 space-y-5 max-w-3xl mx-auto w-full">

        {error && (
          <div className="bg-red-50 border border-red-100 text-red-600 text-sm rounded-xl px-4 py-3">{error}</div>
        )}

        {isLoading ? (
          <div className="flex items-center justify-center py-20 text-gray-400">
            <Loader2 className="w-6 h-6 animate-spin mr-2" /> Loading reviews…
          </div>
        ) : (
          <>
            {/* Summary card */}
            <div className="bg-white rounded-2xl border border-gray-100 p-5">
              <div className="flex items-center gap-6 sm:gap-10">
                {/* Big rating */}
                <div className="text-center shrink-0">
                  <p className="text-5xl font-black text-[#422a15]">{avgRating}</p>
                  {reviews.length > 0 && <StarDisplay rating={Math.round(Number(avgRating))} size="lg" />}
                  <p className="text-xs text-gray-400 mt-1">{reviews.length} reviews</p>
                </div>

                {/* Breakdown bars */}
                <div className="flex-1 space-y-1.5">
                  {[5, 4, 3, 2, 1].map(star => {
                    const count = reviews.filter(r => r.rating === star).length
                    const pct = reviews.length ? Math.round((count / reviews.length) * 100) : 0
                    return (
                      <div key={star} className="flex items-center gap-2">
                        <span className="text-xs text-gray-400 w-2">{star}</span>
                        <Star className="w-3 h-3 text-amber-400 fill-amber-400 shrink-0" />
                        <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                          <div className="h-full bg-amber-400 rounded-full" style={{ width: `${pct}%` }} />
                        </div>
                        <span className="text-xs text-gray-400 w-6 text-right">{count}</span>
                      </div>
                    )
                  })}
                </div>

                {/* Right stats */}
                {reviews.length > 0 && (
                  <div className="hidden sm:flex flex-col gap-3 shrink-0">
                    <div className="text-center bg-green-50 rounded-xl px-4 py-2.5">
                      <p className="text-lg font-bold text-green-700">
                        {Math.round((fiveStars / reviews.length) * 100)}%
                      </p>
                      <p className="text-xs text-green-600">5-star rate</p>
                    </div>
                    <div className="text-center bg-blue-50 rounded-xl px-4 py-2.5">
                      <p className="text-lg font-bold text-blue-700">
                        {reviews.filter(r => r.replied).length}/{reviews.length}
                      </p>
                      <p className="text-xs text-blue-600">Replied</p>
                    </div>
                  </div>
                )}
              </div>

              {reviews.length > 0 && (
                <div className="mt-4 flex items-center gap-2 bg-amber-50 rounded-xl px-3 py-2.5">
                  <TrendingUp className="w-4 h-4 text-amber-500 shrink-0" />
                  <p className="text-xs text-amber-700 font-medium">
                    Replying to reviews increases profile trust by <strong>35%</strong> — respond to all pending reviews below.
                  </p>
                </div>
              )}
            </div>

            {/* Filter tabs */}
            {reviews.length > 0 && (
              <div className="flex gap-1 bg-gray-100 p-1 rounded-xl">
                {([
                  { label: 'All Reviews', value: 'all' },
                  { label: '5 Stars', value: '5' },
                  { label: '4 Stars', value: '4' },
                  { label: '3 Stars', value: '3' },
                ] as { label: string; value: FilterVal }[]).map(f => (
                  <button
                    key={f.value}
                    onClick={() => setFilter(f.value)}
                    className="flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all whitespace-nowrap"
                    style={filter === f.value
                      ? { background: '#fff', color: '#FF6500', boxShadow: '0 1px 4px rgba(0,0,0,0.08)' }
                      : { background: 'transparent', color: '#9ca3af' }}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
            )}

            {/* Empty state */}
            {reviews.length === 0 && (
              <div className="bg-white rounded-2xl border border-gray-100 p-10 text-center">
                <Star className="w-8 h-8 text-gray-200 fill-gray-200 mx-auto mb-3" />
                <p className="text-sm font-medium text-gray-500">No reviews yet</p>
                <p className="text-xs text-gray-400 mt-1">Client reviews will appear here once they start coming in.</p>
              </div>
            )}

            {/* Review list */}
            <div className="space-y-4">
              {filtered.map(review => (
                <div key={review.id} className="bg-white rounded-2xl border border-gray-100 p-5">
                  {/* Header */}
                  <div className="flex items-start gap-3 mb-3">
                    <div
                      className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold text-white shrink-0"
                      style={{ background: review.color }}
                    >
                      {review.initials}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <p className="text-sm font-semibold text-gray-800">{review.client}</p>
                          <p className="text-xs text-gray-400">{review.service}</p>
                        </div>
                        <span className="text-xs text-gray-400 shrink-0">{review.date}</span>
                      </div>
                      <StarDisplay rating={review.rating} />
                    </div>
                  </div>

                  {/* Review text */}
                  <p className="text-sm text-gray-700 leading-relaxed mb-3">"{review.text}"</p>

                  {/* Designer reply */}
                  {review.replied && review.reply && (
                    <div className="bg-amber-50 border border-amber-100 rounded-xl p-3 mb-3">
                      <p className="text-xs font-bold text-amber-700 mb-1.5 flex items-center gap-1">
                        <MessageSquare className="w-3 h-3" /> Your Reply
                      </p>
                      <p className="text-xs text-amber-800 leading-relaxed">{review.reply}</p>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex items-center gap-3 pt-2 border-t border-gray-50">
                    <button
                      onClick={() => markHelpful(review.id)}
                      className="flex items-center gap-1.5 text-xs font-medium text-gray-400 hover:text-green-600 transition-colors"
                    >
                      <ThumbsUp className="w-3.5 h-3.5" />
                      Helpful ({review.helpful})
                    </button>
                    <button className="flex items-center gap-1.5 text-xs font-medium text-gray-400 hover:text-gray-600 transition-colors">
                      <Flag className="w-3.5 h-3.5" /> Report
                    </button>
                    <div className="flex-1" />
                    {!review.replied && (
                      <button
                        onClick={() => setReplyOpen(replyOpen === review.id ? null : review.id)}
                        className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-xl bg-[#FF6500] text-white hover:opacity-90 transition-all"
                      >
                        <MessageSquare className="w-3.5 h-3.5" /> Reply
                        <ChevronDown className={`w-3 h-3 transition-transform ${replyOpen === review.id ? 'rotate-180' : ''}`} />
                      </button>
                    )}
                  </div>

                  {/* Reply box */}
                  {replyOpen === review.id && (
                    <div className="mt-3 pt-3 border-t border-gray-100">
                      <textarea
                        rows={3}
                        value={replyText[review.id] || ''}
                        onChange={e => setReplyText(prev => ({ ...prev, [review.id]: e.target.value }))}
                        placeholder={`Reply to ${review.client}…`}
                        className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-[#FF6500] focus:ring-2 focus:ring-[#FF6500]/10 resize-none font-sans transition-all"
                      />
                      <div className="flex justify-end gap-2 mt-2">
                        <button
                          onClick={() => setReplyOpen(null)}
                          className="px-3 py-1.5 text-xs font-semibold text-gray-500 hover:text-gray-700"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={() => handleSubmitReply(review.id)}
                          disabled={!replyText[review.id]?.trim() || submitting === review.id}
                          className="px-4 py-1.5 text-xs font-semibold rounded-xl bg-[#FF6500] text-white hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed transition-all flex items-center gap-1.5"
                        >
                          {submitting === review.id ? <><Loader2 className="w-3 h-3 animate-spin" /> Saving…</> : 'Post Reply'}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </>
  )
}
