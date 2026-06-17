'use client'

import { useProfile } from '@/context/ProfileContext'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import {
  Scissors, MapPin, Star, Clock, MessageSquare,
  ArrowLeft, CheckCircle, Share2, AtSign, Globe,
  Calendar, Award,
} from 'lucide-react'

/* ─── MOCK portfolio & reviews ─── */
const PORTFOLIO = [
  { id: 1, title: 'Bridal Gown — Ivory Lace', tag: 'Bridal', bg: 'from-rose-100 to-pink-50', emoji: '👗' },
  { id: 2, title: 'Agbada Set — Royal Blue', tag: 'Traditional', bg: 'from-blue-100 to-indigo-50', emoji: '🥻' },
  { id: 3, title: 'Corporate Blazer Set', tag: 'Corporate', bg: 'from-gray-100 to-slate-50', emoji: '🧥' },
  { id: 4, title: 'Evening Gown — Emerald', tag: 'Eveningwear', bg: 'from-emerald-100 to-green-50', emoji: '✨' },
  { id: 5, title: 'Ankara Two-Piece', tag: 'Casual', bg: 'from-orange-100 to-amber-50', emoji: '🌺' },
  { id: 6, title: 'Wedding Guest Set', tag: 'Bridal', bg: 'from-purple-100 to-violet-50', emoji: '💜' },
]

const REVIEWS = [
  { name: 'Amara Obi',     rating: 5, date: 'Jun 2026', text: 'My bridal gown was absolutely stunning. The craftsmanship and attention to detail exceeded all my expectations. Every guest was complimenting it!', initials: 'AO', color: '#be185d' },
  { name: 'Chidinma Eze',  rating: 5, date: 'May 2026', text: 'Fast turnaround and the evening gown fit perfectly on the first try. Will definitely come back for more outfits!', initials: 'CE', color: '#16a34a' },
  { name: 'Tunde Balogun', rating: 4, date: 'Apr 2026', text: 'Beautiful agbada set, very professional designer. Communication was great throughout the whole process.', initials: 'TB', color: '#0ea5e9' },
]

const SERVICES = [
  { name: 'Bridal & Wedding', desc: 'Bridal gowns, bridesmaids, asoebi', from: '₦80,000' },
  { name: 'Traditional Wear', desc: 'Agbada, iro & buba, kaftan sets', from: '₦35,000' },
  { name: 'Corporate Outfits', desc: 'Blazers, skirt suits, trouser sets', from: '₦25,000' },
  { name: 'Evening & Cocktail', desc: 'Gowns, jumpsuits, mini dresses', from: '₦30,000' },
]

function Stars({ rating }: { rating: number }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map(i => (
        <Star key={i} className={`w-3.5 h-3.5 ${i <= rating ? 'text-amber-400 fill-amber-400' : 'text-gray-200'}`} />
      ))}
    </div>
  )
}

export default function PublicProfilePage() {
  const { profile } = useProfile()
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<'portfolio' | 'reviews' | 'services'>('portfolio')
  const [copied, setCopied] = useState(false)

  const displayName = profile.fullName || 'Your Name'
  const specialty   = profile.specialty || 'Fashion Designer'
  const location    = profile.location || 'Lagos, Nigeria'
  const bio         = profile.bio || 'Professional fashion designer creating bespoke outfits for every occasion. Specialising in bridal wear, traditional attire, and contemporary African fashion.'
  const years       = profile.yearsOfExperience || 5
  const initials    = displayName.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase()

  const handleShare = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">

      {/* Minimal header */}
      <header className="bg-white border-b border-gray-100 px-4 sm:px-8 py-3 flex items-center justify-between sticky top-0 z-10">
        <button
          onClick={() => router.push('/dashboard')}
          className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-800 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="hidden sm:inline">Back to Dashboard</span>
        </button>
        <div className="flex items-center gap-2">
          <Scissors className="w-4 h-4 text-[#FF6500]" />
          <span className="font-bold text-sm text-[#422a15]">StyledKraft</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleShare}
            className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full border border-gray-200 text-gray-600 hover:bg-gray-50 transition-all"
          >
            {copied ? <CheckCircle className="w-3.5 h-3.5 text-green-500" /> : <Share2 className="w-3.5 h-3.5" />}
            {copied ? 'Copied!' : 'Share'}
          </button>
        </div>
      </header>

      {/* Hero banner */}
      <div className="bg-linear-to-br from-[#422a15] via-[#5a3a20] to-[#FF6500] px-4 sm:px-8 py-12 sm:py-16">
        <div className="max-w-3xl mx-auto flex flex-col sm:flex-row items-center sm:items-end gap-6">
          {/* Avatar */}
          <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-3xl bg-linear-to-br from-amber-300 to-[#FF6500] flex items-center justify-center text-3xl font-black text-white shadow-xl shrink-0">
            {initials}
          </div>
          <div className="text-center sm:text-left flex-1">
            <div className="flex items-center justify-center sm:justify-start gap-2 mb-1">
              <h1 className="text-2xl sm:text-3xl font-black text-white">{displayName}</h1>
              <CheckCircle className="w-5 h-5 text-amber-300 fill-amber-300/20" />
            </div>
            <p className="text-amber-200 font-medium mb-2">{specialty}</p>
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 text-sm text-amber-100/80">
              <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" />{location}</span>
              <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" />{years} years experience</span>
              <span className="flex items-center gap-1"><Star className="w-3.5 h-3.5 text-amber-300" />4.8 rating</span>
            </div>
          </div>
          <button
            onClick={() => router.push('/dashboard/bookings')}
            className="shrink-0 bg-white text-[#FF6500] font-bold px-6 py-3 rounded-2xl hover:shadow-lg transition-all text-sm"
          >
            Book Now
          </button>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 sm:px-8 py-6 space-y-5">

        {/* Stats row */}
        <div className="grid grid-cols-4 gap-3">
          {[
            { label: 'Orders Done', value: '120+' },
            { label: 'Happy Clients', value: '98+' },
            { label: 'Avg. Rating', value: '4.8 ★' },
            { label: 'Response Time', value: '< 2h' },
          ].map(({ label, value }) => (
            <div key={label} className="bg-white rounded-2xl border border-gray-100 p-3 sm:p-4 text-center">
              <p className="text-base sm:text-xl font-black text-[#422a15]">{value}</p>
              <p className="text-xs text-gray-400 mt-0.5">{label}</p>
            </div>
          ))}
        </div>

        {/* Bio */}
        <div className="bg-white rounded-2xl border border-gray-100 p-5">
          <h2 className="font-bold text-[#422a15] mb-3 flex items-center gap-2">
            <Award className="w-4 h-4 text-[#FF6500]" /> About
          </h2>
          <p className="text-sm text-gray-600 leading-relaxed">{bio}</p>

          <div className="flex flex-wrap gap-2 mt-4">
            {['Bridal', 'Traditional', 'Corporate', 'Eveningwear', 'Bespoke'].map(tag => (
              <span key={tag} className="px-3 py-1 bg-amber-50 text-amber-700 rounded-full text-xs font-semibold">
                {tag}
              </span>
            ))}
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 bg-gray-100 p-1 rounded-xl">
          {([
            { key: 'portfolio', label: 'Portfolio' },
            { key: 'services',  label: 'Services & Pricing' },
            { key: 'reviews',   label: 'Reviews' },
          ] as { key: typeof activeTab; label: string }[]).map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className="flex-1 py-2 text-xs font-semibold rounded-lg transition-all"
              style={activeTab === tab.key
                ? { background: '#fff', color: '#FF6500', boxShadow: '0 1px 4px rgba(0,0,0,0.08)' }
                : { background: 'transparent', color: '#9ca3af' }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Portfolio */}
        {activeTab === 'portfolio' && (
          <div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {PORTFOLIO.map(item => (
                <div
                  key={item.id}
                  className={`bg-linear-to-br ${item.bg} rounded-2xl aspect-square flex flex-col items-center justify-center gap-2 cursor-pointer hover:shadow-md transition-all group border border-white`}
                >
                  <span className="text-4xl group-hover:scale-110 transition-transform">{item.emoji}</span>
                  <div className="text-center px-2">
                    <p className="text-xs font-bold text-gray-700 leading-tight">{item.title}</p>
                    <span className="text-xs text-gray-400">{item.tag}</span>
                  </div>
                </div>
              ))}
            </div>
            <p className="text-center text-xs text-gray-400 mt-4">Showing 6 of 120+ pieces</p>
          </div>
        )}

        {/* Services */}
        {activeTab === 'services' && (
          <div className="space-y-3">
            {SERVICES.map(({ name, desc, from }) => (
              <div key={name} className="bg-white rounded-2xl border border-gray-100 p-5 flex items-center justify-between gap-4">
                <div>
                  <p className="font-semibold text-gray-800">{name}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{desc}</p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-xs text-gray-400">Starting from</p>
                  <p className="font-black text-[#FF6500]">{from}</p>
                </div>
              </div>
            ))}
            <div className="bg-amber-50 border border-amber-100 rounded-2xl p-4 text-center">
              <p className="text-sm font-semibold text-amber-800">Custom orders welcome</p>
              <p className="text-xs text-amber-600 mt-1">Get in touch for a personalised quote on any design</p>
            </div>
          </div>
        )}

        {/* Reviews */}
        {activeTab === 'reviews' && (
          <div className="space-y-3">
            {/* Summary */}
            <div className="bg-white rounded-2xl border border-gray-100 p-5 flex items-center gap-6">
              <div className="text-center shrink-0">
                <p className="text-5xl font-black text-[#422a15]">4.8</p>
                <Stars rating={5} />
                <p className="text-xs text-gray-400 mt-1">98 reviews</p>
              </div>
              <div className="flex-1 space-y-1.5">
                {[
                  { stars: 5, pct: 78 },
                  { stars: 4, pct: 16 },
                  { stars: 3, pct: 4 },
                  { stars: 2, pct: 1 },
                  { stars: 1, pct: 1 },
                ].map(({ stars, pct }) => (
                  <div key={stars} className="flex items-center gap-2">
                    <span className="text-xs text-gray-400 w-4">{stars}</span>
                    <Star className="w-3 h-3 text-amber-400 fill-amber-400 shrink-0" />
                    <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                      <div className="h-full bg-amber-400 rounded-full" style={{ width: `${pct}%` }} />
                    </div>
                    <span className="text-xs text-gray-400 w-7 text-right">{pct}%</span>
                  </div>
                ))}
              </div>
            </div>

            {REVIEWS.map((r, i) => (
              <div key={i} className="bg-white rounded-2xl border border-gray-100 p-5">
                <div className="flex items-start gap-3 mb-3">
                  <div
                    className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold text-white shrink-0"
                    style={{ background: r.color }}
                  >
                    {r.initials}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-semibold text-gray-800">{r.name}</p>
                      <span className="text-xs text-gray-400">{r.date}</span>
                    </div>
                    <Stars rating={r.rating} />
                  </div>
                </div>
                <p className="text-sm text-gray-600 leading-relaxed">"{r.text}"</p>
              </div>
            ))}
          </div>
        )}

        {/* CTA */}
        <div className="bg-linear-to-br from-[#422a15] to-[#FF6500] rounded-2xl p-6 text-center">
          <h3 className="text-lg font-black text-white mb-2">Ready to create your dream outfit?</h3>
          <p className="text-amber-100 text-sm mb-5">Book a consultation or send an inquiry. I&apos;d love to work with you.</p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button
              onClick={() => router.push('/dashboard/bookings')}
              className="bg-white text-[#FF6500] font-bold px-6 py-2.5 rounded-xl hover:shadow-lg transition-all text-sm"
            >
              <Calendar className="w-4 h-4 inline mr-1.5" />
              Book Now
            </button>
            <button
              onClick={() => router.push('/dashboard/inquiries')}
              className="border-2 border-white/30 text-white font-semibold px-6 py-2.5 rounded-xl hover:bg-white/10 transition-all text-sm"
            >
              <MessageSquare className="w-4 h-4 inline mr-1.5" />
              Send Message
            </button>
          </div>
        </div>

        {/* Social links placeholder */}
        <div className="flex justify-center gap-4 pb-6">
          {[
            { icon: AtSign, label: '@styledkraft' },
            { icon: Globe,     label: 'styledkraft.ng' },
          ].map(({ icon: Icon, label }) => (
            <button key={label} className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-[#FF6500] transition-colors">
              <Icon className="w-4 h-4" /> {label}
            </button>
          ))}
        </div>

      </div>
    </div>
  )
}
