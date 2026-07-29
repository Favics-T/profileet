'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useSidebar } from '@/context/SidebarContext'
import { usePortfolio } from '@/context/PortfolioContext'
import {
  Menu, PlusCircle, Trash2, Eye, X, ImageOff, Loader2, Tag,
} from 'lucide-react'

const TAG_COLORS: Record<string, string> = {
  Bridal:      'bg-pink-100 text-pink-700',
  Traditional: 'bg-amber-100 text-amber-700',
  Corporate:   'bg-blue-100 text-blue-700',
  Eveningwear: 'bg-purple-100 text-purple-700',
  Casual:      'bg-green-100 text-green-700',
  Ankara:      'bg-orange-100 text-orange-700',
  Wedding:     'bg-rose-100 text-rose-700',
  Other:       'bg-gray-100 text-gray-600',
}

export default function PortfolioPage() {
  const { toggle } = useSidebar()
  const router = useRouter()
  const { items, isLoading, error, deleteItem } = usePortfolio()

  const [preview, setPreview] = useState<{ imageUrl: string; title: string; tag: string; description: string } | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [filterTag, setFilterTag] = useState<string>('All')

  const tags = ['All', ...Array.from(new Set(items.map(i => i.tag))).sort()]
  const filtered = filterTag === 'All' ? items : items.filter(i => i.tag === filterTag)

  const handleDelete = async (id: string) => {
    if (!confirm('Remove this item from your portfolio?')) return
    setDeletingId(id)
    await deleteItem(id)
    setDeletingId(null)
  }

  return (
    <>
      {/* Top bar */}
      <header className="bg-white border-b border-gray-100 px-4 sm:px-8 py-4 flex items-center justify-between sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <button onClick={toggle} className="lg:hidden p-2 rounded-xl hover:bg-gray-100 text-gray-600 shrink-0">
            <Menu className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-base sm:text-lg font-bold text-[#422a15]">Portfolio</h1>
            <p className="text-xs text-gray-400 hidden sm:block">{items.length} piece{items.length !== 1 ? 's' : ''} published</p>
          </div>
        </div>
        <button
          onClick={() => router.push('/dashboard/portfolio/new')}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#FF6500] text-white text-sm font-semibold hover:opacity-90 transition-all"
        >
          <PlusCircle className="w-4 h-4" />
          <span className="hidden sm:inline">Add Photos</span>
          <span className="sm:hidden">Add</span>
        </button>
      </header>

      <div className="p-4 sm:p-6 lg:p-8">

        {error && (
          <div className="mb-4 bg-red-50 border border-red-100 text-red-600 text-sm rounded-xl px-4 py-3">{error}</div>
        )}

        {/* Loading state */}
        {isLoading && (
          <div className="flex items-center justify-center py-24 text-gray-400">
            <Loader2 className="w-6 h-6 animate-spin mr-2" /> Loading portfolio…
          </div>
        )}

        {!isLoading && (
          <>
            {/* Tag filters */}
            {items.length > 0 && (
              <div className="flex gap-2 mb-5 flex-wrap">
                {tags.map(tag => (
                  <button
                    key={tag}
                    onClick={() => setFilterTag(tag)}
                    className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-colors ${
                      filterTag === tag
                        ? 'bg-[#422a15] text-white'
                        : 'bg-white border border-gray-200 text-gray-600 hover:border-amber-300'
                    }`}
                  >
                    {tag}
                  </button>
                ))}
              </div>
            )}

            {/* Empty state */}
            {items.length === 0 && (
              <div className="flex flex-col items-center justify-center py-24 text-center">
                <div className="w-16 h-16 bg-amber-50 rounded-2xl flex items-center justify-center mb-4">
                  <ImageOff className="w-8 h-8 text-amber-300" />
                </div>
                <p className="text-base font-semibold text-gray-700 mb-1">No portfolio items yet</p>
                <p className="text-sm text-gray-400 mb-5 max-w-xs">
                  Showcase your best work! Upload photos of your designs to attract more clients.
                </p>
                <button
                  onClick={() => router.push('/dashboard/portfolio/new')}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#FF6500] text-white text-sm font-semibold hover:opacity-90 transition-all"
                >
                  <PlusCircle className="w-4 h-4" /> Add Your First Photos
                </button>
              </div>
            )}

            {/* Portfolio grid */}
            {filtered.length > 0 && (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
                {filtered.map(item => (
                  <div
                    key={item.id}
                    className="group relative bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm hover:shadow-md transition-all"
                  >
                    {/* Image */}
                    <div className="aspect-square overflow-hidden">
                                            <img
                        src={item.imageUrl}
                        alt={item.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>

                    {/* Hover overlay */}
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-all duration-200 flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100">
                      <button
                        onClick={() => setPreview(item)}
                        className="w-9 h-9 bg-white/90 rounded-xl flex items-center justify-center hover:bg-white transition-colors"
                        title="Preview"
                      >
                        <Eye className="w-4 h-4 text-gray-700" />
                      </button>
                      <button
                        onClick={() => handleDelete(item.id)}
                        disabled={deletingId === item.id}
                        className="w-9 h-9 bg-white/90 rounded-xl flex items-center justify-center hover:bg-red-50 transition-colors"
                        title="Delete"
                      >
                        {deletingId === item.id
                          ? <Loader2 className="w-4 h-4 text-red-500 animate-spin" />
                          : <Trash2 className="w-4 h-4 text-red-500" />}
                      </button>
                    </div>

                    {/* Info */}
                    <div className="p-3">
                      <p className="text-sm font-semibold text-gray-800 truncate">{item.title}</p>
                      <div className="flex items-center gap-1 mt-1">
                        <Tag className="w-3 h-3 text-gray-400 shrink-0" />
                        <span className={`text-xs font-medium px-1.5 py-0.5 rounded-full ${TAG_COLORS[item.tag] ?? TAG_COLORS.Other}`}>
                          {item.tag}
                        </span>
                      </div>
                      {item.description && (
                        <p className="text-xs text-gray-400 mt-1 truncate">{item.description}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* No results for selected filter */}
            {items.length > 0 && filtered.length === 0 && (
              <div className="text-center py-16 text-gray-400">
                <p className="text-sm">No items tagged as <strong>{filterTag}</strong></p>
              </div>
            )}
          </>
        )}
      </div>

      {/* Preview lightbox */}
      {preview && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4" onClick={() => setPreview(null)}>
          <div className="relative max-w-lg w-full" onClick={e => e.stopPropagation()}>
            
            <img src={preview.imageUrl} alt={preview.title} className="w-full rounded-2xl object-contain max-h-[80vh]" />
            <button
              onClick={() => setPreview(null)}
              className="absolute top-3 right-3 w-8 h-8 bg-white/20 rounded-full flex items-center justify-center text-white hover:bg-white/40"
            >
              <X className="w-4 h-4" />
            </button>
            <div className="mt-3 text-center">
              <p className="text-white font-semibold">{preview.title}</p>
              <span className="text-xs text-white/60">{preview.tag}</span>
              {preview.description && <p className="text-xs text-white/60 mt-1">{preview.description}</p>}
            </div>
          </div>
        </div>
      )}
    </>
  )
}
