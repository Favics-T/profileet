'use client'

import { useState } from 'react'
import { useAuth } from '@/context/AuthContext'
import {
  Eye, Star, MessageSquare, Calendar, LogOut, Bell,
  Settings, PlusCircle, Edit3, MapPin, CheckCircle,
  Clock, TrendingUp, Scissors, ChevronRight, User, Menu, X,
} from 'lucide-react'
import { useRouter }  from 'next/navigation'
import { useProfile } from '@/context/ProfileContext'
import { useInquiry } from '@/context/InquiryContext'




const stats = [
  { label: 'Profile Views', value: '1,240', icon: Eye, change: '+12%', up: true },
  { label: 'Avg. Rating', value: '4.8', icon: Star, change: '+0.2', up: true },
  { label: 'Inquiries', value: '34', icon: MessageSquare, change: '+8', up: true },
  { label: 'Active Bookings', value: '6', icon: Calendar, change: '-1', up: false },
]

const recentInquiries = [
  { client: 'Amara Obi', service: 'Bridal gown & 2 asoebi', date: 'Jun 10', status: 'New' },
  { client: 'Funke Adeyemi', service: 'Corporate blazer set', date: 'Jun 9', status: 'Replied' },
  { client: 'Chisom Eze', service: 'Ankara two-piece', date: 'Jun 8', status: 'Booked' },
  { client: 'Tola Bello', service: 'Kaftan for husband', date: 'Jun 7', status: 'Replied' },
]

// const profileSteps = [
//   { label: 'Basic info', done: true },
//   { label: 'Profile photo', done: true },
//   { label: 'Portfolio (min. 6 pieces)', done: true },
//   { label: 'Pricing & services', done: false },
//   { label: 'Location & availability', done: false },
// ]


// const completionPct = Math.round(
//   (profileSteps.filter((s) => s.done).length / profileSteps.length) * 100
// )

const statusColors: Record<string, string> = {
  New: 'bg-amber-100 text-amber-700',
  Replied: 'bg-blue-100 text-blue-700',
  Booked: 'bg-green-100 text-green-700',
}



export default function DashboardPage() {
  const { user, logout } = useAuth()
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const { profile, completionPct, incompleteFields } = useProfile() 

  const { inquiries } = useInquiry()
const newInquiriesCount = inquiries.filter((i) => i.status === 'New').length

const navItems = [
  { icon: TrendingUp, label: 'Dashboard', active: true, href: '/dashboard' },
  { icon: User, label: 'My Profile', href: '/dashboard/profile' },
  { icon: MessageSquare, label: 'Inquiries', badge: newInquiriesCount, href: '/dashboard/inquiries' },
  { icon: Calendar, label: 'Bookings', href: '/dashboard/bookings' },
  { icon: Star, label: 'Reviews', href: '/dashboard/reviews' },
  { icon: Settings, label: 'Settings', href: '/dashboard/settings' },
]

  // const firstName = user?.email.split('@')[0] ?? 'Designer'

  const displayName = profile.fullName
  ? profile.fullName.split(' ')[0]
  : user?.email.split('@')[0] ?? 'Designer'

  return (
    <div className="min-h-screen bg-[#ffffff] flex">

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 z-40 border-r border-amber-100 h-screen w-64 bg-white flex flex-col
          transform transition-transform duration-300 ease-in-out
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
          lg:translate-x-0`}
      >
        <div className="p-6 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Scissors className="w-5 h-5 text-[#FF6500]" />
            <span className="font-bold text-lg tracking-wide text-[#422a15]">StyledKraft</span>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden p-1 rounded-lg hover:bg-gray-100 text-gray-500"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {navItems.map(({ icon: Icon, label, active, badge,href }) => (
            <button
              key={label}
              
              onClick={() => { 
                router.push(href)
                setSidebarOpen(false)}}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
                active
                  ? 'bg-[#FF6500] text-white font-semibold'
                  : 'text-[#422a15] hover:bg-amber-50'
              }`}
            >
              <Icon className="w-4 h-4 shrink-0" />
              <span className="flex-1 text-left">{label}</span>
              {badge && (
                <span className="bg-[#FF6500] text-[#422a15] text-xs font-bold px-1.5 py-0.5 rounded-full">
                  {badge}
                </span>
              )}
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-gray-100">
          <button
            onClick={logout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-[#422a15] hover:bg-red-50 hover:text-red-600 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span>Log out</span>
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 lg:ml-64 min-w-0">

        {/* Top bar */}
        <header className="bg-white border-b border-gray-100 shadow-sm px-4 sm:px-8 py-4 flex items-center justify-between sticky top-0 z-10">
          <div className="flex items-center gap-3 min-w-0">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 rounded-lg hover:bg-gray-100 text-gray-600 shrink-0"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="min-w-0">
              <h1 className="text-base sm:text-xl font-bold text-[#422a15] truncate">
                Welcome back, {displayName} 👋
              </h1>
              <p className="text-xs sm:text-sm text-gray-500 hidden sm:block">
                Here&apos;s what&apos;s happening with your profile today.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 sm:gap-4">
            <button type="button" className="relative p-2 rounded-full hover:bg-gray-100 transition-colors">
              <Bell className="w-5 h-5 text-gray-600" />
              <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-[#FF6500]" />
            </button>
            <button
              type="button"
              onClick={() => router.push('/dashboard/profile/preview')}
              className="hidden sm:inline-flex items-center gap-2 text-xs font-medium text-amber-600 border border-amber-200 bg-amber-50 px-3 py-1.5 rounded-full hover:bg-amber-100 transition-colors"
            >
              View Profile
            </button>
          </div>
        </header>

        <div className="p-4 sm:p-6 lg:p-8 space-y-6 lg:space-y-8">

          {/* Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-5">
            {stats.map(({ label, value, icon: Icon, change, up }) => (
              <div key={label} className="bg-white rounded-xl border border-gray-100 p-4 sm:p-5 shadow-sm">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs sm:text-sm text-gray-500 leading-tight">{label}</span>
                  <div className="w-8 h-8 sm:w-9 sm:h-9 bg-amber-50 rounded-lg flex items-center justify-center shrink-0">
                    <Icon className="w-4 h-4 text-[#FF6500]" />
                  </div>
                </div>
                <p className="text-xl sm:text-2xl font-bold text-[#422a15]">{value}</p>
                <p className={`text-xs mt-1 font-medium ${up ? 'text-green-600' : 'text-red-500'}`}>
                  {change} this week
                </p>
              </div>
            ))}
          </div>

          {/* Inquiries + Profile strength */}
          {/* Profile strength */}
<div className="bg-white rounded-xl border border-gray-100 shadow-sm">
  <div className="px-4 sm:px-6 py-4 border-b border-gray-100">
    <h2 className="font-semibold text-[#422a15]">Profile Strength</h2>
    <p className="text-xs text-gray-500 mt-0.5">Complete your profile to attract more clients</p>
  </div>
  <div className="px-4 sm:px-6 py-4">
    <div className="flex items-center justify-between mb-2">
      <span className="text-sm font-medium text-gray-700">{completionPct}% complete</span>
      <span className="text-xs text-[#FF6500] font-semibold">
        {incompleteFields.length} remaining
      </span>
    </div>
    <div className="w-full bg-gray-100 rounded-full h-2 mb-5">
      <div
        className="bg-[#FF6500] h-2 rounded-full transition-all"
        style={{ width: `${completionPct}%` }}
      />
    </div>
    <ul className="space-y-3">
      {incompleteFields.map((label) => (
        <li key={label} className="flex items-center gap-3 text-sm">
          <Clock className="w-4 h-4 text-gray-300 shrink-0" />
          <span className="text-gray-700 font-medium">{label}</span>
        </li>
      ))}
    </ul>
    {completionPct === 100 && (
      <div className="flex items-center gap-2 text-sm text-green-600 font-medium">
        <CheckCircle className="w-4 h-4" />
        <span>Profile complete!</span>
      </div>
    )}
  </div>
</div>

          {/* Quick actions */}
          <div>
            <h2 className="font-semibold text-[#422a15] mb-4">Quick Actions</h2>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
              {[
                { icon: PlusCircle, label: 'Add Portfolio Piece', desc: 'Upload new work', href: '/dashboard/portfolio/new' },
  { icon: Edit3, label: 'Edit Profile', desc: 'Update your info', href: '/dashboard/profile' },
  { icon: MapPin, label: 'Set Location', desc: 'Add your city', href: '/dashboard/profile?section=location' },
  { icon: TrendingUp, label: 'Boost Profile', desc: 'Get more visibility', href: '/dashboard/boost' },
              ].map(({ icon: Icon, label, desc,href }) => (
                <button
                  key={label}
                  onClick={() => router.push(href)}
                  className="bg-white border border-gray-100 rounded-xl p-4 sm:p-5 text-left hover:border-amber-300 hover:shadow-md transition-all group"
                >
                  <div className="w-9 h-9 sm:w-10 sm:h-10 bg-amber-50 rounded-lg flex items-center justify-center mb-3 group-hover:bg-amber-100 transition-colors">
                    <Icon className="w-4 h-4 sm:w-5 sm:h-5 text-amber-600" />
                  </div>
                  <p className="text-xs sm:text-sm font-semibold text-[#422a15]">{label}</p>
                  <p className="text-xs text-gray-500 mt-0.5 hidden sm:block">{desc}</p>
                </button>
              ))}
            </div>
          </div>

        </div>
      </main>
    </div>
  )
}
