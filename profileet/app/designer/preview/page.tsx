'use client'

import { useEffect } from 'react'
import { useProfile } from '@/context/ProfileContext'
import { usePortfolio } from '@/context/PortfolioContext'
import { useReview } from '@/context/ReviewContext'
import { useRouter } from 'next/navigation'
import {
  MapPin, Star, Award, ArrowLeft, Image as ImageIcon,
  MessageCircle, Briefcase, Clock,
} from 'lucide-react'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'

const TAG_COLORS: Record<string, { bg: string; text: string }> = {
  Bridal:      { bg: 'bg-pink-100',   text: 'text-pink-700'   },
  Casual:      { bg: 'bg-blue-100',   text: 'text-blue-700'   },
  Corporate:   { bg: 'bg-indigo-100', text: 'text-indigo-700' },
  Traditional: { bg: 'bg-amber-100',  text: 'text-amber-700'  },
  Evening:     { bg: 'bg-purple-100', text: 'text-purple-700' },
  Other:       { bg: 'bg-gray-100',   text: 'text-gray-600'   },
}

export default function DesignerPreviewPage() {
  const router = useRouter()
  const { profile } = useProfile()
  const { items } = usePortfolio()
  const { reviews } = useReview()

  // Record this page view (public — no auth needed)
  useEffect(() => {
    fetch(`${API_URL}/profile/views`, { method: 'POST' }).catch(() => {})
  }, [])

  const avgRating = reviews.length
    ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1)
    : null

  const initials = profile.fullName
    ? profile.fullName.split(' ').slice(0, 2).map(w => w[0]?.toUpperCase()).join('')
    : '?'

  return (
    <div className="min-h-screen bg-[#faf8f5]">

      {/* Back bar */}
      <header className="sticky top-0 z-10 bg-white border-b border-gray-100 px-4 sm:px-8 py-3 flex items-center justify-between">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-sm font-medium text-[#422a15] hover:text-[#FF6500] transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Dashboard
        </button>
        <span className="text-xs text-gray-400 font-medium px-3 py-1 bg-amber-50 rounded-full border border-amber-100">
          Preview — how clients see you
        </span>
      </header>

      <div className="max-w-3xl mx-auto px-4 py-8 space-y-6">

        {/* Hero card */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          {/* Cover strip */}
          <div className="h-24 bg-gradient-to-r from-[#422a15] to-[#FF6500]" />
          <div className="px-6 pb-6">
            {/* Avatar */}
            <div className="flex items-end justify-between -mt-10 mb-4">
              <div className="w-20 h-20 rounded-2xl border-4 border-white shadow-md overflow-hidden bg-amber-100 flex items-center justify-center shrink-0">
                {profile.avatar ? (
                  <img src={profile.avatar} alt={profile.fullName} className="w-full h-full object-cover" />
                ) : (
                  <span className="text-2xl font-bold text-[#422a15]">{initials}</span>
                )}
              </div>
              <button className="mt-12 px-4 py-2 rounded-xl bg-[#FF6500] text-white text-sm font-semibold hover:opacity-90 transition-all">
                Book Now
              </button>
            </div>

            {/* Name + meta */}
            <h1 className="text-xl font-bold text-[#422a15]">
              {profile.fullName || 'Your Name'}
            </h1>
            <p className="text-sm text-[#FF6500] font-medium mt-0.5">
              {profile.specialty || 'Fashion Designer'}
            </p>

            <div className="flex flex-wrap items-center gap-3 mt-3">
              {profile.location && (
                <span className="flex items-center gap-1 text-xs text-gray-500">
                  <MapPin className="w-3.5 h-3.5" /> {profile.location}
                </span>
              )}
              {profile.yearsOfExperience > 0 && (
                <span className="flex items-center gap-1 text-xs text-gray-500">
                  <Award className="w-3.5 h-3.5" /> {profile.yearsOfExperience} yrs experience
                </span>
              )}
              {avgRating && (
                <span className="flex items-center gap-1 text-xs font-semibold text-amber-600">
                  <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                  {avgRating} ({reviews.length} review{reviews.length !== 1 ? 's' : ''})
                </span>
              )}
            </div>

            {profile.bio && (
              <p className="text-sm text-gray-600 mt-4 leading-relaxed">{profile.bio}</p>
            )}
          </div>
        </div>

        {/* Stats strip */}
        <div className="grid grid-cols-3 gap-3">
          {[
            { icon: Briefcase,     label: 'Bookings',  value: '—'      },
            { icon: MessageCircle, label: 'Reviews',   value: String(reviews.length) },
            { icon: Clock,         label: 'Response',  value: '< 24h'  },
          ].map(({ icon: Icon, label, value }) => (
            <div key={label} className="bg-white rounded-2xl border border-gray-100 p-4 text-center shadow-sm">
              <Icon className="w-5 h-5 text-[#FF6500] mx-auto mb-1.5" />
              <p className="text-lg font-bold text-[#422a15]">{value}</p>
              <p className="text-xs text-gray-400">{label}</p>
            </div>
          ))}
        </div>

        {/* Portfolio */}
        {items.length > 0 && (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-100">
              <h2 className="font-semibold text-[#422a15]">Portfolio</h2>
              <p className="text-xs text-gray-400 mt-0.5">
                {items.length} piece{items.length !== 1 ? 's' : ''}
              </p>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 p-3">
              {items.map(item => {
                const tag = TAG_COLORS[item.tag] ?? TAG_COLORS.Other
                return (
                  <div
                    key={item.id}
                    className="relative aspect-square rounded-xl overflow-hidden group bg-gray-100"
                  >
                    {item.imageUrl ? (
                      <img
                        src={item.imageUrl}
                        alt={item.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <ImageIcon className="w-8 h-8 text-gray-300" />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-2.5">
                      <p className="text-white text-xs font-semibold truncate">{item.title}</p>
                      <span className={`text-xs px-1.5 py-0.5 rounded-full font-medium w-fit mt-0.5 ${tag.bg} ${tag.text}`}>
                        {item.tag}
                      </span>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* Reviews */}
        {reviews.length > 0 && (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
              <div>
                <h2 className="font-semibold text-[#422a15]">Client Reviews</h2>
                <p className="text-xs text-gray-400 mt-0.5">
                  {avgRating} avg · {reviews.length} review{reviews.length !== 1 ? 's' : ''}
                </p>
              </div>
              <div className="flex items-center gap-0.5">
                {[1, 2, 3, 4, 5].map(i => (
                  <Star
                    key={i}
                    className={`w-4 h-4 ${Number(avgRating) >= i ? 'fill-amber-400 text-amber-400' : 'text-gray-200'}`}
                  />
                ))}
              </div>
            </div>
            <ul className="divide-y divide-gray-50">
              {reviews.slice(0, 4).map(r => (
                <li key={r.id} className="px-5 py-4">
                  <div className="flex items-start gap-3">
                    <div
                      className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold text-white shrink-0"
                      style={{ background: r.color }}
                    >
                      {r.initials}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-sm font-semibold text-gray-800">{r.client}</p>
                        <div className="flex items-center gap-0.5 shrink-0">
                          {[1, 2, 3, 4, 5].map(i => (
                            <Star
                              key={i}
                              className={`w-3.5 h-3.5 ${r.rating >= i ? 'fill-amber-400 text-amber-400' : 'text-gray-200'}`}
                            />
                          ))}
                        </div>
                      </div>
                      <p className="text-xs text-[#FF6500] mt-0.5">{r.service}</p>
                      <p className="text-sm text-gray-600 mt-1 leading-relaxed">{r.text}</p>
                      {r.reply && (
                        <div className="mt-2 pl-3 border-l-2 border-[#FF6500]/30">
                          <p className="text-xs text-gray-500 italic">&ldquo;{r.reply}&rdquo;</p>
                        </div>
                      )}
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Contact CTA */}
        <div className="bg-gradient-to-r from-[#422a15] to-[#6b3f1f] rounded-2xl p-6 text-center text-white">
          <h2 className="font-bold text-lg mb-1">Ready to work together?</h2>
          <p className="text-sm text-white/70 mb-4">Send a message or book a consultation</p>
          <div className="flex gap-3 justify-center">
            <button className="px-5 py-2 rounded-xl bg-[#FF6500] text-white text-sm font-semibold hover:opacity-90 transition-all">
              Book Now
            </button>
            <button className="px-5 py-2 rounded-xl bg-white/10 text-white text-sm font-semibold hover:bg-white/20 transition-all border border-white/20">
              Send Message
            </button>
          </div>
        </div>

      </div>
    </div>
  )
}
