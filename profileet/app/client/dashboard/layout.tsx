'use client'

import { useState } from 'react'
import { Menu } from 'lucide-react'
import ClientSidebar from '@/components/dashboard/ClientSidebar'

export default function ClientDashboardLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="flex min-h-screen bg-brand-light">
      <ClientSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="flex min-w-0 flex-1 flex-col">
        <button
          onClick={() => setSidebarOpen(true)}
          className="p-4 text-brand-dark lg:hidden"
          aria-label="Open sidebar"
        >
          <Menu className="h-5 w-5" />
        </button>

        <main className="flex-1 px-5 py-6 sm:px-8">{children}</main>
      </div>
    </div>
  )
}
