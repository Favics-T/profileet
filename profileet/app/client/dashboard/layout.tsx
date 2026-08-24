'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import {
  Scissors,
  Compass,
  CalendarCheck,
  MessageSquare,
  UserCircle,
  LogOut,
  Menu,
  X,
} from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import Logo from '@/component/ui/Logo';

const NAV_ITEMS = [
  { label: 'Discover',  href: '/client/dashboard/discover',  icon: Compass },
  { label: 'Bookings',  href: '/client/dashboard/bookings',  icon: CalendarCheck },
  { label: 'Messages',  href: '/client/dashboard/messages',  icon: MessageSquare },
  { label: 'Profile',   href: '/client/dashboard/profile',   icon: UserCircle },
]

export default function ClientDashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const { logout } = useAuth()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const handleLogout = () => {
    logout()
    router.push('/login')
  }

  return (
    <div className="min-h-screen flex">

      {/* ── Sidebar ── */}
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/30 z-20 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <aside
        className={`
          fixed top-0 left-0 h-screen  w-60 bg-white border-r border-gray-100 z-30
          flex flex-col transition-transform duration-200
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
          lg:translate-x-0 lg:static lg:z-auto
        `}
      >
        {/* Logo */}
        <Logo />
        {/* <div className="px-5 py-5 flex items-center justify-between border-b border-gray-100">
          <div className="flex items-center gap-2">
            <div
              className="w-7 h-7 rounded-md flex items-center justify-center shrink-0"
              style={{ background: '#1a1a2e' }}
            >
              <Scissors className="w-3.5 h-3.5" style={{ color: '#FF6500' }} />
            </div>
            <span className="font-bold text-base" style={{ color: '#1a1a2e' }}>
              Styled<span style={{ color: '#FF6500' }}>Kraft</span>
            </span>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden text-gray-400 hover:text-gray-600"
          >
            <X className="w-4 h-4" />
          </button>
        </div> */}

        {/* Client badge */}
        <div className="px-5 pt-4 pb-2">
          <span
            className="inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full"
            style={{ background: 'white', color: '#cc5200' }}
          >
            <span className="w-1.5 h-1.5 rounded-full" style={{ background: '#FF6500' }} />
            Client portal
          </span>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-2 space-y-0.5">
          {NAV_ITEMS.map(({ label, href, icon: Icon }) => {
            const active = pathname.startsWith(href)
            return (
              <Link
                key={href}
                href={href}
                onClick={() => setSidebarOpen(false)}
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all"
                style={
                  active
                    ? { background: '#fff3ee', color: '#FF6500' }
                    : { color: '#6b7280' }
                }
              >
                <Icon className="w-4 h-4 shrink-0" />
                {label}
                {/* Unread badge placeholder for Messages */}
                {label === 'Messages' && (
                  <span
                    className="ml-auto text-xs font-semibold px-1.5 py-0.5 rounded-full text-white"
                    style={{ background: '#FF6500' }}
                  >
                    2
                  </span>
                )}
              </Link>
            )
          })}
        </nav>

        {/* Logout */}
        <div className="px-3 pb-5 border-t border-gray-100 pt-3">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-gray-500 hover:bg-red-50 hover:text-red-500 transition-all"
          >
            <LogOut className="w-4 h-4 shrink-0" />
            Sign out
          </button>
        </div>
      </aside>

      {/* ── Main content ── */}
      <div className="flex-1 flex flex-col  min-w-0">

        {/* Topbar */}
        <header className="bg-white border-b border-gray-100 p-6 shadow flex items-center gap-4 sticky top-0 z-10">
          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden text-gray-500 hover:text-gray-700"
          >
            <Menu className="w-5 h-5" />
          </button>

          {/* Page title — derived from pathname */}
          <h1 className="text-base font-semibold text-gray-800 capitalize">
            {pathname.split('/').pop() ?? 'Dashboard'}
          </h1>

          <div className="ml-auto flex items-center gap-3">
            {/* Avatar placeholder */}
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0"
              style={{ background: '#FF6500' }}
            >
              CL
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 p-5 sm:p-6 bg-white">
          {children}
        </main>
      </div>
    </div>
  )
}