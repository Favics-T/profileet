'use client'

import { useEffect, useState } from 'react'
import { CalendarCheck, Search, ChevronRight } from 'lucide-react'

type Booking = { id: string; client: string; service: string; deliveryDate: string; price: number; status: string }
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'

export default function BookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([])
  const [search, setSearch] = useState('')
  const [activeTab, setActiveTab] = useState<string>('all')

  useEffect(() => {
    fetch(`${API_URL}/bookings`).then(r => r.json()).then(setBookings).catch(() => setBookings([]))
  }, [])

  const filtered = bookings.filter((b) => (activeTab === 'all' || b.status === activeTab) && (b.client.toLowerCase().includes(search.toLowerCase()) || b.service.toLowerCase().includes(search.toLowerCase()) || b.id.toLowerCase().includes(search.toLowerCase())))
  const statuses = ['all', 'pending', 'accepted', 'in_progress', 'completed', 'cancelled']

  return (
    <div>
      <div className="mb-6"><h2 className="text-xl font-bold text-gray-800 mb-1">My Bookings</h2><p className="text-sm text-gray-500">Track all your booking requests and appointments</p></div>
      <div className="relative mb-4"><Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" /><input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search bookings..." className="w-full border border-gray-200 rounded-xl pl-9 pr-4 py-2.5 text-sm outline-none bg-white" /></div>
      <div className="flex gap-1 bg-gray-100 p-1 rounded-xl mb-5 overflow-x-auto">{statuses.map((s) => <button key={s} onClick={() => setActiveTab(s)} className="flex-1 min-w-fit px-3 py-1.5 text-xs font-semibold rounded-lg whitespace-nowrap" style={activeTab === s ? { background: '#fff', color: '#1a1a2e' } : { color: '#9ca3af' }}>{s}</button>)}</div>
      {filtered.length === 0 ? <div className="text-center py-16 text-gray-400"><CalendarCheck className="w-8 h-8 mx-auto mb-3 opacity-30" /><p className="text-sm font-medium">No bookings found</p></div> : <div className="space-y-3">{filtered.map((b) => <div key={b.id} className="bg-white border border-gray-100 rounded-2xl p-5"><div className="flex items-start justify-between"><div><p className="text-sm font-semibold text-gray-800">{b.client}</p><p className="text-xs text-gray-500">{b.service}</p></div><span className="text-xs px-2.5 py-1 rounded-full bg-gray-100">{b.status}</span></div><div className="flex items-center gap-3 text-xs text-gray-400 mt-2"><span>{new Date(b.deliveryDate).toLocaleDateString()}</span><span>·</span><span>₦{b.price.toLocaleString()}</span></div><div className="flex items-center gap-2 mt-3 pt-3 border-t border-gray-100"><span className="text-xs text-gray-400 font-mono">{b.id}</span><button className="ml-auto flex items-center gap-1 text-xs font-medium text-gray-500">View details <ChevronRight className="w-3 h-3" /></button></div></div>)}</div>}
    </div>
  )
}
