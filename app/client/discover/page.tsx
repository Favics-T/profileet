'use client'

import { useState } from 'react'
import { Search, MapPin, Star, Heart, SlidersHorizontal, X } from 'lucide-react'

type Designer = {
  id: number
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

const MOCK_DESIGNERS: Designer[] = [
  {
    id: 1,
    name: 'Adaeze Nwosu',
    specialty: 'Bridal & Ankara',
    location: 'Lagos, VI',
    rating: 4.9,
    reviews: 84,
    startingPrice: 45000,
    available: true,
    styles: ['Bridal', 'Ankara', 'Corporate'],
    initials: 'AN',
    color: '#FF6500',
  },
  {
    id: 2,
    name: 'Emeka Fashola',
    specialty: 'Streetwear & Casual',
    location: 'Lagos, Ikeja',
    rating: 4.7,
    reviews: 52,
    startingPrice: 20000,
    available: true,
    styles: ['Streetwear', 'Casual', 'Unisex'],
    initials: 'EF',
    color: '#1a1a2e',
  },
  {
    id: 3,
    name: 'Fatima Aliyu',
    specialty: 'Kaftan & Aso-oke',
    location: 'Abuja, Wuse',
    rating: 4.8,
    reviews: 67,
    startingPrice: 35000,
    available: false,
    styles: ['Kaftan', 'Aso-oke', 'Traditional'],
    initials: 'FA',
    color: '#7c3aed',
  },
  {
    id: 4,
    name: 'Chidi Okafor',
    specialty: 'Corporate & Suits',
    location: 'Port Harcourt',
    rating: 4.6,
    reviews: 39,
    startingPrice: 30000,
    available: true,
    styles: ['Corporate', 'Suits', 'Agbada'],
    initials: 'CO',
    color: '#0369a1',
  },
  {
    id: 5,
    name: 'Ngozi Eze',
    specialty: 'Evening & Cocktail',
    location: 'Lagos, Lekki',
    rating: 5.0,
    reviews: 101,
    startingPrice: 60000,
    available: true,
    styles: ['Evening', 'Cocktail', 'Bridal'],
    initials: 'NE',
    color: '#be185d',
  },
  {
    id: 6,
    name: 'Bayo Adeleke',
    specialty: 'Agbada & Traditional',
    location: 'Ibadan',
    rating: 4.5,
    reviews: 28,
    startingPrice: 25000,
    available: false,
    styles: ['Agbada', 'Traditional', 'Ankara'],
    initials: 'BA',
    color: '#065f46',
  },
]

const STYLE_FILTERS = ['All', 'Bridal', 'Ankara', 'Streetwear', 'Corporate', 'Traditional', 'Evening', 'Kaftan']
const LOCATION_FILTERS = ['All', 'Lagos', 'Abuja', 'Port Harcourt', 'Ibadan']

export default function DiscoverPage() {
  const [search, setSearch] = useState('')
  const [activeStyle, setActiveStyle] = useState('All')
  const [activeLocation, setActiveLocation] = useState('All')
  const [availableOnly, setAvailableOnly] = useState(false)
  const [saved, setSaved] = useState<number[]>([])
  const [showFilters, setShowFilters] = useState(false)

  const toggleSave = (id: number) => {
    setSaved((prev) => prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id])
  }

  const filtered = MOCK_DESIGNERS.filter((d) => {
    const matchSearch =
      d.name.toLowerCase().includes(search.toLowerCase()) ||
      d.specialty.toLowerCase().includes(search.toLowerCase())
    const matchStyle = activeStyle === 'All' || d.styles.includes(activeStyle)
    const matchLocation = activeLocation === 'All' || d.location.includes(activeLocation)
    const matchAvailable = !availableOnly || d.available
    return matchSearch && matchStyle && matchLocation && matchAvailable
  })

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-xl font-bold text-gray-800 mb-1">Discover Designers</h2>
        <p className="text-sm text-gray-500">Find and book Nigeria&apos;s top fashion designers and tailors</p>
      </div>

      {/* Search + filter toggle */}
      <div className="flex gap-3 mb-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search by name or style..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full border border-gray-200 rounded-xl pl-9 pr-4 py-2.5 text-sm outline-none transition-all bg-white"
            onFocus={e => {
              e.target.style.borderColor = '#FF6500'
              e.target.style.boxShadow = '0 0 0 3px rgba(255,101,0,0.1)'
            }}
            onBlur={e => {
              e.target.style.borderColor = '#e5e7eb'
              e.target.style.boxShadow = 'none'
            }}
          />
        </div>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="flex items-center gap-2 px-4 py-2.5 border border-gray-200 rounded-xl text-sm font-medium text-gray-600 bg-white hover:bg-gray-50 transition-all"
          style={showFilters ? { borderColor: '#FF6500', color: '#FF6500' } : {}}
        >
          <SlidersHorizontal className="w-4 h-4" />
          Filters
        </button>
      </div>

      {/* Expanded filters */}
      {showFilters && (
        <div className="bg-white border border-gray-100 rounded-2xl p-4 mb-5 space-y-4 shadow-sm">

          {/* Style chips */}
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Style</p>
            <div className="flex flex-wrap gap-2">
              {STYLE_FILTERS.map((s) => (
                <button
                  key={s}
                  onClick={() => setActiveStyle(s)}
                  className="px-3 py-1 rounded-full text-xs font-medium border transition-all"
                  style={
                    activeStyle === s
                      ? { background: '#FF6500', color: '#fff', borderColor: '#FF6500' }
                      : { background: '#fff', color: '#6b7280', borderColor: '#e5e7eb' }
                  }
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          {/* Location chips */}
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Location</p>
            <div className="flex flex-wrap gap-2">
              {LOCATION_FILTERS.map((l) => (
                <button
                  key={l}
                  onClick={() => setActiveLocation(l)}
                  className="px-3 py-1 rounded-full text-xs font-medium border transition-all"
                  style={
                    activeLocation === l
                      ? { background: '#1a1a2e', color: '#fff', borderColor: '#1a1a2e' }
                      : { background: '#fff', color: '#6b7280', borderColor: '#e5e7eb' }
                  }
                >
                  {l}
                </button>
              ))}
            </div>
          </div>

          {/* Available toggle */}
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Available now only</p>
            <button
              onClick={() => setAvailableOnly(!availableOnly)}
              className="w-10 h-5 rounded-full transition-all relative"
              style={{ background: availableOnly ? '#FF6500' : '#e5e7eb' }}
            >
              <span
                className="absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-all"
                style={{ left: availableOnly ? '22px' : '2px' }}
              />
            </button>
          </div>

          {/* Reset */}
          <button
            onClick={() => { setActiveStyle('All'); setActiveLocation('All'); setAvailableOnly(false); setSearch('') }}
            className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-gray-600"
          >
            <X className="w-3 h-3" /> Reset filters
          </button>
        </div>
      )}

      {/* Results count */}
      <p className="text-xs text-gray-400 mb-4">
        {filtered.length} designer{filtered.length !== 1 ? 's' : ''} found
      </p>

      {/* Designer cards grid */}
      {filtered.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <Search className="w-8 h-8 mx-auto mb-3 opacity-30" />
          <p className="text-sm font-medium">No designers match your filters</p>
          <p className="text-xs mt-1">Try adjusting your search or filters</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map((designer) => (
            <div
              key={designer.id}
              className="bg-white border border-gray-100 rounded-2xl p-5 hover:shadow-md transition-shadow"
            >
              {/* Card header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  {/* Avatar */}
                  <div
                    className="w-11 h-11 rounded-xl flex items-center justify-center text-sm font-bold text-white shrink-0"
                    style={{ background: designer.color }}
                  >
                    {designer.initials}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-800">{designer.name}</p>
                    <p className="text-xs text-gray-500">{designer.specialty}</p>
                  </div>
                </div>
                <button
                  onClick={() => toggleSave(designer.id)}
                  className="text-gray-300 hover:text-red-400 transition-colors"
                  aria-label="Save designer"
                >
                  <Heart
                    className="w-4 h-4"
                    fill={saved.includes(designer.id) ? '#f87171' : 'none'}
                    stroke={saved.includes(designer.id) ? '#f87171' : 'currentColor'}
                  />
                </button>
              </div>

              {/* Location + availability */}
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-1 text-xs text-gray-400">
                  <MapPin className="w-3 h-3" />
                  {designer.location}
                </div>
                <span
                  className="text-xs font-medium px-2 py-0.5 rounded-full"
                  style={
                    designer.available
                      ? { background: '#f0fdf4', color: '#16a34a' }
                      : { background: '#f9fafb', color: '#9ca3af' }
                  }
                >
                  {designer.available ? 'Available' : 'Unavailable'}
                </span>
              </div>

              {/* Rating */}
              <div className="flex items-center gap-1 mb-4">
                <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                <span className="text-xs font-semibold text-gray-700">{designer.rating}</span>
                <span className="text-xs text-gray-400">({designer.reviews} reviews)</span>
              </div>

              {/* Style tags */}
              <div className="flex flex-wrap gap-1 mb-4">
                {designer.styles.slice(0, 2).map((style) => (
                  <span
                    key={style}
                    className="text-xs px-2 py-0.5 rounded-full border border-gray-100 text-gray-500 bg-gray-50"
                  >
                    {style}
                  </span>
                ))}
              </div>

              {/* Price + CTA */}
              <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                <div>
                  <p className="text-xs text-gray-400">Starting from</p>
                  <p className="text-sm font-bold text-gray-800">
                    ₦{designer.startingPrice.toLocaleString()}
                  </p>
                </div>
                <button
                  disabled={!designer.available}
                  className="px-4 py-1.5 rounded-xl text-xs font-semibold text-white transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                  style={{ background: designer.available ? '#FF6500' : '#9ca3af' }}
                >
                  Book now
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}