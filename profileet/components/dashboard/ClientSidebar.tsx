'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, Search, CalendarCheck, MessageSquare, UserCircle, Settings, LifeBuoy } from 'lucide-react'
import Button from '@/component/ui/Button'

const NAV_ITEMS = [
  { label: 'Home', href: '/client/dashboard/discover', icon: Home },
  { label: 'Search', href: '/client/dashboard/discover', icon: Search },
  { label: 'Bookings', href: '/client/dashboard/bookings', icon: CalendarCheck },
  { label: 'Messages', href: '/client/dashboard/messages', icon: MessageSquare },
  { label: 'Profile', href: '/client/dashboard/profile', icon: UserCircle },
]

interface ClientSidebarProps {
  isOpen: boolean
  onClose: () => void
}

export default function ClientSidebar({ isOpen, onClose }: ClientSidebarProps) {
  const pathname = usePathname()

  return (
    <>
      {isOpen && <div className="fixed inset-0 z-30 bg-black/40 lg:hidden" onClick={onClose} />}

      <aside
        className={`fixed top-0 left-0 z-40 flex h-screen w-[220px] shrink-0 flex-col overflow-y-auto bg-brand-dark text-brand-light transition-transform duration-200 lg:sticky lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="px-5 pt-6 pb-4">
          <span className="text-lg font-bold tracking-wide">ArtisanLink</span>
          <p className="mt-0.5 text-xs text-text-muted">Client Dashboard</p>
        </div>

        <nav className="flex-1 space-y-0.5 px-3">
          {NAV_ITEMS.map(({ label, href, icon: Icon }) => {
            const active = label === 'Home' ? pathname === href : pathname.startsWith(href)
            return (
              <Link
                key={label}
                href={href}
                onClick={onClose}
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

        <div className="px-3 pb-3">
          <Link href="/client/dashboard/discover" onClick={onClose}>
            <Button variant="primary" className="w-full">
              Book a Service
            </Button>
          </Link>
        </div>

        <div className="space-y-0.5 border-t border-border-dark px-3 py-4">
          <button className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-text-muted transition-colors hover:bg-white/5 hover:text-brand-light">
            <Settings className="h-4 w-4 shrink-0" />
            Settings
          </button>
          <button className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-text-muted transition-colors hover:bg-white/5 hover:text-brand-light">
            <LifeBuoy className="h-4 w-4 shrink-0" />
            Support
          </button>
        </div>
      </aside>
    </>
  )
}
