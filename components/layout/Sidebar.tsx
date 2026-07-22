'use client'

import { useRouter, usePathname } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'
import { useInquiry } from '@/context/InquiryContext'
import { useProfile } from '@/context/ProfileContext'
import { useSidebar } from '@/context/SidebarContext'
import {
  Scissors, TrendingUp, User, MessageSquare, Calendar,
  Star, Settings, LogOut, X, BarChart2, ExternalLink, CalendarDays,
} from 'lucide-react'

const navItems = [
  { icon: TrendingUp,    label: 'Dashboard',    href: '/dashboard' },
  { icon: User,          label: 'My Profile',   href: '/dashboard/profile' },
  { icon: MessageSquare, label: 'Inquiries',    href: '/dashboard/inquiries' },
  { icon: Calendar,      label: 'Bookings',     href: '/dashboard/bookings' },
  { icon: CalendarDays,  label: 'Availability', href: '/dashboard/availability' },
  { icon: Star,          label: 'Reviews',      href: '/dashboard/reviews' },
  { icon: BarChart2,     label: 'Earnings',     href: '/dashboard/earnings' },
  { icon: Settings,      label: 'Settings',     href: '/dashboard/settings' },
]

export default function DashboardSidebar() {
  const { logout, user } = useAuth()
  const { profile } = useProfile()
  const { inquiries } = useInquiry()
  const { isOpen, close } = useSidebar()
  const router = useRouter()
  const pathname = usePathname()

  const newInquiriesCount = inquiries.filter(i => i.status === 'New').length

  const navigate = (href: string) => {
    router.push(href)
    close()
  }

  const displayName = profile.fullName || user?.email?.split('@')[0] || 'Designer'
  const initials = displayName.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase()

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/40 lg:hidden"
          onClick={close}
        />
      )}

      <aside
        className={`fixed top-0 left-0 z-40 h-screen w-64 bg-white border-r border-gray-100 flex flex-col
          transform transition-transform duration-300 ease-in-out
          ${isOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0`}
      >
        {/* Logo */}
        <div className="px-6 py-5 flex items-center justify-between border-b border-gray-100">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-[#FF6500] rounded-lg flex items-center justify-center">
              <Scissors className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-lg tracking-tight text-[#422a15]">StyledKraft</span>
          </div>
          <button onClick={close} className="lg:hidden p-1 rounded-lg hover:bg-gray-100 text-gray-400">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Profile chip */}
        <div className="px-4 py-3 border-b border-gray-100">
          <div className="flex items-center gap-3 px-2">
            <div className="w-9 h-9 rounded-full bg-linear-to-br from-amber-400 to-[#FF6500] flex items-center justify-center text-white font-bold text-sm shrink-0">
              {initials}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-[#422a15] truncate">{displayName}</p>
              <p className="text-xs text-gray-400 truncate">{profile.specialty || 'Fashion Designer'}</p>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
          {navItems.map(({ icon: Icon, label, href }) => {
            const isActive = href === '/dashboard' ? pathname === href : pathname.startsWith(href)
            const badge = label === 'Inquiries' && newInquiriesCount > 0 ? newInquiriesCount : null
            return (
              <button
                key={label}
                onClick={() => navigate(href)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-[#FF6500] text-white shadow-sm shadow-[#FF6500]/30'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-[#422a15]'
                }`}
              >
                <Icon className="w-4 h-4 shrink-0" />
                <span className="flex-1 text-left">{label}</span>
                {badge && (
                  <span className={`text-xs font-bold px-1.5 py-0.5 rounded-full min-w-5 text-center ${
                    isActive ? 'bg-white/25 text-white' : 'bg-[#FF6500] text-white'
                  }`}>
                    {badge}
                  </span>
                )}
              </button>
            )
          })}
        </nav>

        {/* Bottom actions */}
        <div className="p-3 border-t border-gray-100 space-y-0.5">
          <button
            onClick={() => navigate('/designer/preview')}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-amber-600 hover:bg-amber-50 transition-all"
          >
            <ExternalLink className="w-4 h-4 shrink-0" />
            <span>View Public Profile</span>
          </button>
          <button
            onClick={logout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-gray-500 hover:bg-red-50 hover:text-red-600 transition-all"
          >
            <LogOut className="w-4 h-4 shrink-0" />
            <span>Log out</span>
          </button>
        </div>
      </aside>
    </>
  )
}
