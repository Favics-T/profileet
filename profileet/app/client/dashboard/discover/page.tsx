'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Search, MapPin, Star, Heart, SlidersHorizontal, X } from 'lucide-react'

type Designer = {
  id: string
  name: string
  specialty: string
  location: string
  rating: number
  reviews: number
  startingPrice: number
  available: boolean
  styles: string[]
  initials: string
  color: string
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'
const STYLE_FILTERS = ['All', 'Bridal', 'Ankara', 'Streetwear', 'Corporate', 'Traditional', 'Evening', 'Kaftan']
const LOCATION_FILTERS = ['All', 'Lagos', 'Abuja', 'Port Harcourt', 'Ibadan']

export default function DiscoverPage() {
  const router = useRouter()
  const [designers, setDesigners] = useState<Designer[]>([])
  const [search, setSearch] = useState('')
  const [activeStyle, setActiveStyle] = useState('All')
  const [activeLocation, setActiveLocation] = useState('All')
  const [availableOnly, setAvailableOnly] = useState(false)
  const [saved, setSaved] = useState<string[]>([])
  const [showFilters, setShowFilters] = useState(false)

  useEffect(() => {
    fetch(`${API_URL}/designers`).then(r => r.json()).then(setDesigners).catch(() => setDesigners([]))
  }, [])

  const filtered = designers.filter((d) => {
    const matchSearch = d.name.toLowerCase().includes(search.toLowerCase()) || d.specialty.toLowerCase().includes(search.toLowerCase())
    const matchStyle = activeStyle === 'All' || d.styles.includes(activeStyle)
    const matchLocation = activeLocation === 'All' || d.location.includes(activeLocation)
    const matchAvailable = !availableOnly || d.available
    return matchSearch && matchStyle && matchLocation && matchAvailable
  })

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-xl font-bold text-gray-800 mb-1">Discover Designers</h2>
        <p className="text-sm text-gray-500">Find and book Nigeria&apos;s top fashion designers and tailors</p>
      </div>
      <div className="flex gap-3 mb-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by name or style..." className="w-full border border-gray-200 rounded-xl pl-9 pr-4 py-2.5 text-sm outline-none bg-white" />
        </div>
        <button onClick={() => setShowFilters(!showFilters)} className="flex items-center gap-2 px-4 py-2.5 border border-gray-200 rounded-xl text-sm font-medium text-gray-600 bg-white">
          <SlidersHorizontal className="w-4 h-4" /> Filters
        </button>
      </div>
      {showFilters && (
        <div className="bg-white border border-gray-100 rounded-2xl p-4 mb-5 space-y-4 shadow-sm">
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Style</p>
            <div className="flex flex-wrap gap-2">{STYLE_FILTERS.map((s) => <button key={s} onClick={() => setActiveStyle(s)} className="px-3 py-1 rounded-full text-xs font-medium border" style={activeStyle === s ? { background: '#FF6500', color: '#fff', borderColor: '#FF6500' } : { background: '#fff', color: '#6b7280', borderColor: '#e5e7eb' }}>{s}</button>)}</div>
          </div>
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Location</p>
            <div className="flex flex-wrap gap-2">{LOCATION_FILTERS.map((l) => <button key={l} onClick={() => setActiveLocation(l)} className="px-3 py-1 rounded-full text-xs font-medium border" style={activeLocation === l ? { background: '#1a1a2e', color: '#fff', borderColor: '#1a1a2e' } : { background: '#fff', color: '#6b7280', borderColor: '#e5e7eb' }}>{l}</button>)}</div>
          </div>
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Available now only</p>
            <button onClick={() => setAvailableOnly(!availableOnly)} className="w-10 h-5 rounded-full relative" style={{ background: availableOnly ? '#FF6500' : '#e5e7eb' }}><span className="absolute top-0.5 w-4 h-4 bg-white rounded-full shadow" style={{ left: availableOnly ? '22px' : '2px' }} /></button>
          </div>
          <button onClick={() => { setActiveStyle('All'); setActiveLocation('All'); setAvailableOnly(false); setSearch('') }} className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-gray-600"><X className="w-3 h-3" /> Reset filters</button>
        </div>
      )}
      <p className="text-xs text-gray-400 mb-4">{filtered.length} designer{filtered.length !== 1 ? 's' : ''} found</p>
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
        {filtered.map((designer) => (
          <div key={designer.id} className="bg-white shadow border border-gray-100 rounded-2xl p-5">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-xl flex items-center justify-center text-sm font-bold text-white shrink-0" style={{ background: designer.color }}>{designer.initials}</div>
                <div><p className="text-sm font-semibold text-gray-800">{designer.name}</p><p className="text-xs text-gray-500">{designer.specialty}</p></div>
              </div>
              <button onClick={() => setSaved((prev) => prev.includes(designer.id) ? prev.filter((s) => s !== designer.id) : [...prev, designer.id])} className="text-gray-300 hover:text-red-400"><Heart className="w-4 h-4" fill={saved.includes(designer.id) ? '#f87171' : 'none'} stroke={saved.includes(designer.id) ? '#f87171' : 'currentColor'} /></button>
            </div>
            <div className="flex items-center justify-between mb-3"><div className="flex items-center gap-1 text-xs text-gray-400"><MapPin className="w-3 h-3" />{designer.location}</div><span className="text-xs font-medium px-2 py-0.5 rounded-full" style={designer.available ? { background: '#f0fdf4', color: '#16a34a' } : { background: '#f9fafb', color: '#9ca3af' }}>{designer.available ? 'Available' : 'Unavailable'}</span></div>
            <div className="flex items-center gap-1 mb-4"><Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" /><span className="text-xs font-semibold text-gray-700">{designer.rating}</span><span className="text-xs text-gray-400">({designer.reviews} reviews)</span></div>
            <div className="flex flex-wrap gap-1 mb-4">{designer.styles.slice(0, 2).map((style) => <span key={style} className="text-xs px-2 py-0.5 rounded-full border border-gray-100 text-gray-500 bg-gray-50">{style}</span>)}</div>
            <div className="flex items-center justify-between pt-3 border-t border-gray-100">
              <div><p className="text-xs text-gray-400">Starting from</p><p className="text-sm font-bold text-gray-800">₦{designer.startingPrice.toLocaleString()}</p></div>
              <button disabled={!designer.available} onClick={() => designer.available && router.push(`/client/dashboard/discover/book/${designer.id}`)} className="px-4 py-1.5 rounded-xl text-xs font-semibold text-white disabled:opacity-40 disabled:cursor-not-allowed" style={{ background: designer.available ? '#FF6500' : '#9ca3af' }}>Book now</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
