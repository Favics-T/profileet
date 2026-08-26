'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, CalendarCheck, CalendarDays, MessageSquare, UserCircle } from 'lucide-react'
import { useSidebar } from '@/context/SidebarContext'

const NAV_ITEMS = [
  { label: 'Home', href: '/dashboard', icon: Home },
  { label: 'Bookings', href: '/dashboard/bookings', icon: CalendarCheck },
  { label: 'Availability', href: '/dashboard/availability', icon: CalendarDays },
  { label: 'Messages', href: '#', icon: MessageSquare },
  { label: 'Profile', href: '/dashboard/profile', icon: UserCircle },
]

export default function ArtisanSidebar() {
  const pathname = usePathname()
  const { isOpen, close } = useSidebar()

  return (
    <>
      {isOpen && <div className="fixed inset-0 z-30 bg-black/40 lg:hidden" onClick={close} />}

      <aside
        className={`fixed top-0 left-0 z-40 flex h-screen w-[220px] shrink-0 flex-col overflow-y-auto bg-brand-dark text-brand-light transition-transform duration-200 lg:sticky lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="px-5 pt-6 pb-4">
          <span className="text-lg font-bold tracking-wide">Artisan Portal</span>
          <p className="mt-0.5 text-xs text-text-muted">Service Provider Dashboard</p>
        </div>

        <nav className="flex-1 space-y-0.5 px-3">
          {NAV_ITEMS.map(({ label, href, icon: Icon }) => {
            const active = label === 'Home' ? pathname === href : href !== '#' && pathname.startsWith(href)
            return (
              <Link
                key={label}
                href={href}
                onClick={close}
                className={`flex items-center gap-3 rounded-lg border-l-2 px-3 py-2.5 text-sm font-medium transition-colors ${
                  active
                    ? 'border-accent-gold bg-white/5 text-accent-gold'
                    : 'border-transparent text-text-muted hover:bg-white/5 hover:text-brand-light'
                }`}
              >
                <Icon className="h-4 w-4 shrink-0" />
                {label}
              </Link>
            )
          })}
        </nav>

        <div className="px-3 pb-6">
          <Link
            href="/dashboard/profile/preview"
            className="flex w-full items-center justify-center rounded-xl border border-accent-gold px-4 py-2.5 text-sm font-semibold text-accent-gold transition-colors hover:bg-accent-gold/10"
          >
            View Public Profile
          </Link>
        </div>
      </aside>
    </>
  )
}
