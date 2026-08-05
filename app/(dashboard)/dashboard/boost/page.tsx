'use client'

import { useState } from 'react'
import { useSidebar } from '@/context/SidebarContext'
import {
  Menu, TrendingUp, Zap, Star, Globe, BadgeCheck,
  ChevronRight, CheckCircle, Lock,
} from 'lucide-react'

type Plan = 'starter' | 'pro' | 'elite'

interface BoostPlan {
  id: Plan
  name: string
  price: string
  period: string
  color: string
  accent: string
  badge?: string
  features: { text: string; included: boolean }[]
}

const PLANS: BoostPlan[] = [
  {
    id: 'starter',
    name: 'Starter Boost',
    price: '₦3,500',
    period: 'per week',
    color: 'border-gray-200',
    accent: 'bg-gray-50',
    features: [
      { text: 'Featured badge on profile',       included: true  },
      { text: 'Priority in search results',      included: true  },
      { text: '2× more profile impressions',     included: true  },
      { text: 'Top placement in category',       included: false },
      { text: 'Analytics dashboard',             included: false },
      { text: 'Homepage feature spot',           included: false },
    ],
  },
  {
    id: 'pro',
    name: 'Pro Boost',
    price: '₦9,500',
    period: 'per month',
    color: 'border-[#FF6500]',
    accent: 'bg-orange-50',
    badge: 'Most Popular',
    features: [
      { text: 'Featured badge on profile',       included: true },
      { text: 'Priority in search results',      included: true },
      { text: '5× more profile impressions',     included: true },
      { text: 'Top placement in category',       included: true },
      { text: 'Analytics dashboard',             included: true },
      { text: 'Homepage feature spot',           included: false },
    ],
  },
  {
    id: 'elite',
    name: 'Elite Boost',
    price: '₦22,000',
    period: 'per month',
    color: 'border-[#422a15]',
    accent: 'bg-amber-50',
    badge: 'Best Value',
    features: [
      { text: 'Featured badge on profile',       included: true },
      { text: 'Priority in search results',      included: true },
      { text: '10× more profile impressions',    included: true },
      { text: 'Top placement in category',       included: true },
      { text: 'Analytics dashboard',             included: true },
      { text: 'Homepage feature spot',           included: true },
    ],
  },
]

const PERKS = [
  {
    icon: TrendingUp,
    title: 'More visibility',
    desc: 'Boosted profiles appear at the top of search results and category listings.',
  },
  {
    icon: Zap,
    title: 'Instant activation',
    desc: 'Your boost goes live immediately after payment — no waiting for approval.',
  },
  {
    icon: Star,
    title: 'Verified badge',
    desc: 'A featured badge builds trust and makes your profile stand out instantly.',
  },
  {
    icon: Globe,
    title: 'Wider reach',
    desc: 'Get in front of clients browsing the platform, not just your followers.',
  },
]

export default function BoostPage() {
  const { toggle } = useSidebar()
  const [selected, setSelected] = useState<Plan>('pro')
  const [showComingSoon, setShowComingSoon] = useState(false)

  const plan = PLANS.find(p => p.id === selected)!

  return (
    <>
      {/* Top bar */}
      <header className="bg-white border-b border-gray-100 px-4 sm:px-8 py-4 flex items-center gap-3 sticky top-0 z-10">
        <button
          onClick={toggle}
          className="lg:hidden p-2 rounded-xl hover:bg-gray-100 text-gray-600 shrink-0"
        >
          <Menu className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-base sm:text-lg font-bold text-[#422a15]">Boost Profile</h1>
          <p className="text-xs text-gray-400 hidden sm:block">
            Get more visibility and grow your client base
          </p>
        </div>
      </header>

      <div className="p-4 sm:p-6 lg:p-8 max-w-4xl mx-auto w-full space-y-8">

        {/* Hero banner */}
        <div className="bg-gradient-to-r from-[#422a15] to-[#6b3f1f] rounded-2xl p-6 sm:p-8 text-white overflow-hidden relative">
          <div className="absolute -right-8 -top-8 w-40 h-40 bg-white/5 rounded-full" />
          <div className="absolute -right-4 bottom-0 w-24 h-24 bg-[#FF6500]/20 rounded-full" />
          <BadgeCheck className="w-10 h-10 text-[#FF6500] mb-3" />
          <h2 className="text-xl sm:text-2xl font-bold mb-2">
            Reach more clients, faster
          </h2>
          <p className="text-sm text-white/70 max-w-md leading-relaxed">
            Boost puts your profile in front of clients who are actively looking for designers
            like you. Choose a plan and start getting more bookings today.
          </p>
        </div>

        {/* Why boost */}
        <div>
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">
            Why boost?
          </h2>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            {PERKS.map(({ icon: Icon, title, desc }) => (
              <div key={title} className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm">
                <div className="w-9 h-9 bg-orange-50 rounded-xl flex items-center justify-center mb-3">
                  <Icon className="w-4 h-4 text-[#FF6500]" />
                </div>
                <p className="text-sm font-semibold text-[#422a15] mb-1">{title}</p>
                <p className="text-xs text-gray-400 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Plans */}
        <div>
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">
            Choose a plan
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {PLANS.map(p => (
              <button
                key={p.id}
                onClick={() => setSelected(p.id)}
                className={`text-left rounded-2xl border-2 p-5 transition-all duration-200 relative overflow-hidden ${p.color} ${
                  selected === p.id ? 'shadow-md scale-[1.02]' : 'hover:shadow-sm bg-white'
                } ${selected === p.id ? p.accent : 'bg-white'}`}
              >
                {p.badge && (
                  <span className="absolute top-3 right-3 text-xs font-bold px-2 py-0.5 rounded-full bg-[#FF6500] text-white">
                    {p.badge}
                  </span>
                )}
                <p className="text-sm font-bold text-[#422a15] mb-1">{p.name}</p>
                <p className="text-2xl font-extrabold text-[#422a15]">{p.price}</p>
                <p className="text-xs text-gray-400 mb-4">{p.period}</p>
                <ul className="space-y-2">
                  {p.features.map(({ text, included }) => (
                    <li key={text} className={`flex items-start gap-2 text-xs ${included ? 'text-gray-700' : 'text-gray-300'}`}>
                      {included
                        ? <CheckCircle className="w-3.5 h-3.5 text-green-500 shrink-0 mt-0.5" />
                        : <Lock className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                      }
                      {text}
                    </li>
                  ))}
                </ul>
              </button>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <p className="font-semibold text-[#422a15]">
              {plan.name} — {plan.price} <span className="text-gray-400 font-normal text-sm">{plan.period}</span>
            </p>
            <p className="text-xs text-gray-400 mt-0.5">
              Cancel any time. No long-term commitment.
            </p>
          </div>
          <div className="flex flex-col items-start sm:items-end gap-2">
            <button
              onClick={() => setShowComingSoon(true)}
              className="flex items-center gap-2 px-6 py-3 rounded-xl bg-[#FF6500] text-white text-sm font-bold hover:opacity-90 transition-all"
            >
              Activate Boost <ChevronRight className="w-4 h-4" />
            </button>
            {showComingSoon && (
              <p className="text-xs text-amber-600 font-medium flex items-center gap-1">
                <Zap className="w-3.5 h-3.5" />
                Payment coming soon — we&apos;re integrating Paystack!
              </p>
            )}
          </div>
        </div>

      </div>
    </>
  )
}
