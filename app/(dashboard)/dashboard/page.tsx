'use client'

import { useAuth } from '@/context/AuthContext'
import { useProfile } from '@/context/ProfileContext'
import { useInquiry } from '@/context/InquiryContext'
import { useBooking } from '@/context/BookingContext'
import { useSidebar } from '@/context/SidebarContext'
import { useRouter } from 'next/navigation'
import {
  Eye, Star, MessageSquare, Calendar, Bell,
  PlusCircle, Edit3, MapPin, TrendingUp, CheckCircle,
  Clock, Menu, ChevronRight, BarChart2, ArrowUpRight,
} from 'lucide-react'

const statusColors: Record<string, { bg: string; text: string }> = {
  New:     { bg: 'bg-amber-100',  text: 'text-amber-700' },
  Replied: { bg: 'bg-blue-100',   text: 'text-blue-700' },
  Booked:  { bg: 'bg-green-100',  text: 'text-green-700' },
}

export default function DashboardPage() {
  const { user } = useAuth()
  const router = useRouter()
  const { toggle } = useSidebar()
  const { profile, completionPct, incompleteFields } = useProfile()
  const { inquiries } = useInquiry()
  const { bookings } = useBooking()

  const recentInquiries = inquiries.slice(0, 4)

  // ── Computed stats from real data ────────────────────────────────────────
  const activeBookings = bookings.filter(
    (b) => b.status === 'accepted' || b.status === 'in_progress' || b.status === 'pending'
  ).length

  const totalRevenue = bookings
    .filter((b) => b.status === 'completed')
    .reduce((sum, b) => sum + b.price, 0)

  const pendingRevenue = bookings
    .filter((b) => b.status === 'pending' || b.status === 'accepted' || b.status === 'in_progress')
    .reduce((sum, b) => sum + b.price, 0)

  const completedOrders = bookings.filter((b) => b.status === 'completed').length

  const formatNaira = (amount: number) =>
    `₦${amount.toLocaleString('en-NG')}`

  const stats = [
    { label: 'Profile Views',   value: '—',                         icon: Eye,           change: 'Coming soon', up: true },
    { label: 'Avg. Rating',     value: '—',                         icon: Star,          change: 'Coming soon', up: true },
    { label: 'Inquiries',       value: String(inquiries.length),     icon: MessageSquare, change: `${inquiries.filter(i => i.status === 'New').length} new`, up: true },
    { label: 'Active Bookings', value: String(activeBookings),       icon: Calendar,      change: `${bookings.filter(b => b.status === 'pending').length} pending`, up: activeBookings > 0 },
  ]

  const displayName = profile.fullName
    ? profile.fullName.split(' ')[0]
    : user?.email?.split('@')[0] ?? 'Designer'

  return (
    <>
      {/* Top bar */}
      <header className="bg-white border-b border-gray-100 px-4 sm:px-8 py-4 flex items-center justify-between sticky top-0 z-10">
        <div className="flex items-center gap-3 min-w-0">
          <button
            onClick={toggle}
            className="lg:hidden p-2 rounded-xl hover:bg-gray-100 text-gray-600 shrink-0"
          >
            <Menu className="w-5 h-5" />
          </button>
          <div className="min-w-0">
            <h1 className="text-base sm:text-lg font-bold text-[#422a15] truncate">
              Welcome back, {displayName} 👋
            </h1>
            <p className="text-xs text-gray-400 hidden sm:block">
              Here&apos;s what&apos;s happening with your profile today
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button className="relative p-2 rounded-xl hover:bg-gray-100 transition-colors">
            <Bell className="w-5 h-5 text-gray-500" />
            <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-[#FF6500]" />
          </button>
          <button
            onClick={() => router.push('/designer/preview')}
            className="hidden sm:flex items-center gap-1.5 text-xs font-semibold text-amber-600 border border-amber-200 bg-amber-50 px-3 py-1.5 rounded-full hover:bg-amber-100 transition-colors"
          >
            <Eye className="w-3.5 h-3.5" /> View Profile
          </button>
        </div>
      </header>

      <div className="p-4 sm:p-6 lg:p-8 space-y-6">

        {/* Stats row */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          {stats.map(({ label, value, icon: Icon, change, up }) => (
            <div key={label} className="bg-white rounded-2xl border border-gray-100 p-4 sm:p-5">
              <div className="flex items-center justify-between mb-3">
                <p className="text-xs text-gray-500 leading-tight">{label}</p>
                <div className="w-8 h-8 bg-amber-50 rounded-xl flex items-center justify-center shrink-0">
                  <Icon className="w-4 h-4 text-[#FF6500]" />
                </div>
              </div>
              <p className="text-2xl font-bold text-[#422a15]">{value}</p>
              <p className={`text-xs mt-1 font-medium flex items-center gap-0.5 ${up ? 'text-green-600' : 'text-red-500'}`}>
                <ArrowUpRight className={`w-3 h-3 ${up ? '' : 'rotate-180'}`} />
                {change} this week
              </p>
            </div>
          ))}
        </div>

        {/* Middle row — Inquiries + Profile Strength */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">

          {/* Recent Inquiries */}
          <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
              <div>
                <h2 className="font-semibold text-[#422a15]">Recent Inquiries</h2>
                <p className="text-xs text-gray-400 mt-0.5">Your latest client messages</p>
              </div>
              <button
                onClick={() => router.push('/dashboard/inquiries')}
                className="flex items-center gap-1 text-xs text-[#FF6500] font-semibold hover:underline"
              >
                See all <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {recentInquiries.length === 0 ? (
              <div className="py-12 text-center text-gray-400">
                <MessageSquare className="w-8 h-8 mx-auto mb-2 opacity-30" />
                <p className="text-sm">No inquiries yet</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-50">
                {recentInquiries.map((inq) => {
                  const sc = statusColors[inq.status] ?? { bg: 'bg-gray-100', text: 'text-gray-600' }
                  const isNew = inq.status === 'New'
                  const accentColor = inq.status === 'New' ? '#FF6500' : inq.status === 'Booked' ? '#16a34a' : '#3b82f6'
                  const avatarColors: Record<string, string> = {
                    'A': '#be185d', 'F': '#7c3aed', 'C': '#16a34a',
                    'T': '#0ea5e9', 'N': '#d97706', 'O': '#FF6500',
                  }
                  const avatarBg = avatarColors[inq.client[0]] ?? '#422a15'

                  return (
                    <div
                      key={inq.id}
                      className={`relative flex gap-3.5 px-5 py-4 cursor-pointer transition-all group hover:bg-gray-50/80 ${isNew ? 'bg-amber-50/30' : ''}`}
                      onClick={() => router.push('/dashboard/inquiries')}
                    >
                      {/* Left accent bar */}
                      <div
                        className="absolute left-0 top-3 bottom-3 w-0.5 rounded-r-full opacity-0 group-hover:opacity-100 transition-opacity"
                        style={{ background: accentColor }}
                      />

                      {/* Avatar with unread dot */}
                      <div className="relative shrink-0 mt-0.5">
                        <div
                          className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold text-white"
                          style={{ background: avatarBg }}
                        >
                          {inq.client[0]}
                        </div>
                        {isNew && (
                          <span className="absolute -top-0.5 -right-0.5 w-3 h-3 bg-[#FF6500] rounded-full border-2 border-white" />
                        )}
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2 mb-0.5">
                          <p className={`text-sm truncate ${isNew ? 'font-bold text-gray-900' : 'font-semibold text-gray-700'}`}>
                            {inq.client}
                          </p>
                          <span className="text-xs text-gray-400 shrink-0">{inq.date}</span>
                        </div>
                        <p className="text-xs font-medium text-[#FF6500] mb-1">{inq.service}</p>
                        <p className={`text-xs truncate ${isNew ? 'text-gray-600' : 'text-gray-400'}`}>
                          {inq.message}
                        </p>
                      </div>

                      {/* Status badge */}
                      <div className="shrink-0 self-start mt-0.5">
                        <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${sc.bg} ${sc.text}`}>
                          {inq.status}
                        </span>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>

          {/* Profile Strength */}
          <div className="bg-white rounded-2xl border border-gray-100">
            <div className="px-5 py-4 border-b border-gray-100">
              <h2 className="font-semibold text-[#422a15]">Profile Strength</h2>
              <p className="text-xs text-gray-400 mt-0.5">Complete to attract more clients</p>
            </div>
            <div className="px-5 py-4">
              {/* Ring progress */}
              <div className="flex items-center gap-4 mb-4">
                <div className="relative w-16 h-16 shrink-0">
                  <svg className="w-16 h-16 -rotate-90" viewBox="0 0 64 64">
                    <circle cx="32" cy="32" r="26" fill="none" stroke="#f3f4f6" strokeWidth="7" />
                    <circle
                      cx="32" cy="32" r="26" fill="none"
                      stroke="#FF6500" strokeWidth="7"
                      strokeDasharray={`${2 * Math.PI * 26}`}
                      strokeDashoffset={`${2 * Math.PI * 26 * (1 - completionPct / 100)}`}
                      strokeLinecap="round"
                      className="transition-all duration-700"
                    />
                  </svg>
                  <span className="absolute inset-0 flex items-center justify-center text-sm font-bold text-[#422a15]">
                    {completionPct}%
                  </span>
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-800">
                    {completionPct === 100 ? 'All done!' : `${incompleteFields.length} left`}
                  </p>
                  <p className="text-xs text-gray-400 mt-0.5">
                    {completionPct === 100 ? 'Profile complete' : 'Fields to fill'}
                  </p>
                </div>
              </div>

              <div className="space-y-2.5">
                {incompleteFields.slice(0, 4).map(label => (
                  <div key={label} className="flex items-center gap-2 text-xs">
                    <Clock className="w-3.5 h-3.5 text-gray-300 shrink-0" />
                    <span className="text-gray-600">{label}</span>
                  </div>
                ))}
                {completionPct === 100 && (
                  <div className="flex items-center gap-2 text-xs text-green-600 font-medium">
                    <CheckCircle className="w-3.5 h-3.5" />
                    <span>Profile complete!</span>
                  </div>
                )}
              </div>

              {completionPct < 100 && (
                <button
                  onClick={() => router.push('/dashboard/profile')}
                  className="mt-4 w-full py-2 rounded-xl bg-[#FF6500] text-white text-xs font-semibold hover:opacity-90 transition-opacity"
                >
                  Complete Profile
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Earnings preview */}
        <div className="bg-white rounded-2xl border border-gray-100 p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="font-semibold text-[#422a15]">Earnings Overview</h2>
              <p className="text-xs text-gray-400 mt-0.5">June 2026</p>
            </div>
            <button
              onClick={() => router.push('/dashboard/earnings')}
              className="flex items-center gap-1 text-xs text-[#FF6500] font-semibold hover:underline"
            >
              Full report <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
          <div className="grid grid-cols-3 gap-4">
            {[
              { label: 'Total Revenue',    value: formatNaira(totalRevenue),   icon: BarChart2,   color: 'text-[#FF6500]',  bg: 'bg-orange-50' },
              { label: 'Completed Orders', value: String(completedOrders),     icon: CheckCircle, color: 'text-green-600', bg: 'bg-green-50'  },
              { label: 'Pending Value',    value: formatNaira(pendingRevenue), icon: Clock,       color: 'text-amber-600', bg: 'bg-amber-50'  },
            ].map(({ label, value, icon: Icon, color, bg }) => (
              <div key={label} className="text-center">
                <div className={`w-10 h-10 ${bg} rounded-xl flex items-center justify-center mx-auto mb-2`}>
                  <Icon className={`w-5 h-5 ${color}`} />
                </div>
                <p className="text-base sm:text-lg font-bold text-[#422a15]">{value}</p>
                <p className="text-xs text-gray-400 mt-0.5">{label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <div>
          <h2 className="font-semibold text-[#422a15] mb-3">Quick Actions</h2>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            {[
              { icon: PlusCircle, label: 'Add Portfolio',  desc: 'Upload new work',    href: '/dashboard/portfolio/new' },
              { icon: Edit3,      label: 'Edit Profile',   desc: 'Update your info',   href: '/dashboard/profile' },
              { icon: MapPin,     label: 'Set Location',   desc: 'Add your city',      href: '/dashboard/profile' },
              { icon: TrendingUp, label: 'Boost Profile',  desc: 'Get more visibility',href: '/dashboard/boost' },
            ].map(({ icon: Icon, label, desc, href }) => (
              <button
                key={label}
                onClick={() => router.push(href)}
                className="bg-white border border-gray-100 rounded-2xl p-4 text-left hover:border-amber-200 hover:shadow-sm transition-all group"
              >
                <div className="w-9 h-9 bg-amber-50 rounded-xl flex items-center justify-center mb-3 group-hover:bg-amber-100 transition-colors">
                  <Icon className="w-4 h-4 text-amber-600" />
                </div>
                <p className="text-sm font-semibold text-[#422a15]">{label}</p>
                <p className="text-xs text-gray-400 mt-0.5 hidden sm:block">{desc}</p>
              </button>
            ))}
          </div>
        </div>

      </div>
    </>
  )
}
