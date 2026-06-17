'use client'

import { useState, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useSidebar } from '@/context/SidebarContext'
import {
  Upload, X, CheckCircle, ImagePlus, Tag, Menu, ArrowLeft,
  Trash2, Eye, Sparkles,
} from 'lucide-react'

interface PortfolioItem {
  id: string
  dataUrl: string
  title: string
  tag: string
  description: string
}

const TAGS = ['Bridal', 'Traditional', 'Corporate', 'Eveningwear', 'Casual', 'Ankara', 'Wedding', 'Other']

export default function PortfolioNewPage() {
  const router = useRouter()
  const { toggle } = useSidebar()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [items, setItems] = useState<PortfolioItem[]>([])
  const [dragging, setDragging] = useState(false)
  const [saved, setSaved] = useState(false)
  const [preview, setPreview] = useState<PortfolioItem | null>(null)

  const processFiles = useCallback((files: FileList | null) => {
    if (!files) return
    Array.from(files).forEach(file => {
      if (!file.type.startsWith('image/')) return
      const reader = new FileReader()
      reader.onload = e => {
        const dataUrl = e.target?.result as string
        setItems(prev => [...prev, {
          id: crypto.randomUUID(),
          dataUrl,
          title: file.name.replace(/\.[^.]+$/, '').replace(/[-_]/g, ' '),
          tag: 'Other',
          description: '',
        }])
      }
      reader.readAsDataURL(file)
    })
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setDragging(false)
    processFiles(e.dataTransfer.files)
  }, [processFiles])

  const updateItem = (id: string, field: keyof PortfolioItem, value: string) => {
    setItems(prev => prev.map(it => it.id === id ? { ...it, [field]: value } : it))
  }

  const removeItem = (id: string) => {
    setItems(prev => prev.filter(it => it.id !== id))
  }

  const handleSave = async () => {
    if (items.length === 0) return
    await new Promise(r => setTimeout(r, 800))
    setSaved(true)
    setTimeout(() => {
      setSaved(false)
      router.push('/dashboard')
    }, 2000)
  }

  return (
    <>
      {/* Top bar */}
      <header className="bg-white border-b border-gray-100 px-4 sm:px-8 py-4 flex items-center justify-between sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <button onClick={toggle} className="lg:hidden p-2 rounded-xl hover:bg-gray-100 text-gray-600 shrink-0">
            <Menu className="w-5 h-5" />
          </button>
          <button onClick={() => router.push('/dashboard')} className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 transition-colors">
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Dashboard</span>
          </button>
          <span className="text-gray-300">/</span>
          <h1 className="text-base font-bold text-[#422a15]">Add Portfolio</h1>
        </div>
        <button
          onClick={handleSave}
          disabled={items.length === 0 || saved}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#FF6500] text-white text-sm font-semibold hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
        >
          {saved ? <><CheckCircle className="w-4 h-4" /> Saved!</> : <><Upload className="w-4 h-4" /> Publish {items.length > 0 ? `(${items.length})` : ''}</>}
        </button>
      </header>

      <div className="p-4 sm:p-6 lg:p-8 max-w-4xl mx-auto w-full space-y-5">

        {/* Drop zone */}
        <div
          onDragOver={e => { e.preventDefault(); setDragging(true) }}
          onDragLeave={() => setDragging(false)}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`border-2 border-dashed rounded-2xl p-10 text-center cursor-pointer transition-all ${
            dragging
              ? 'border-[#FF6500] bg-orange-50'
              : 'border-gray-200 hover:border-amber-300 hover:bg-amber-50/30'
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={e => processFiles(e.target.files)}
          />
          <div className="w-14 h-14 bg-amber-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <ImagePlus className="w-7 h-7 text-amber-500" />
          </div>
          <p className="font-semibold text-gray-700 mb-1">Drop images here or click to browse</p>
          <p className="text-xs text-gray-400">Supports JPG, PNG, WEBP · Max 10 images</p>
        </div>

        {/* Tip */}
        {items.length === 0 && (
          <div className="flex items-start gap-3 bg-amber-50 border border-amber-100 rounded-2xl px-4 py-3">
            <Sparkles className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
            <p className="text-xs text-amber-700">
              <strong>Pro tip:</strong> Upload at least 6 pieces to unlock the &quot;Portfolio Verified&quot; badge on your public profile. Quality photos attract more clients.
            </p>
          </div>
        )}

        {/* Uploaded items */}
        {items.length > 0 && (
          <div className="space-y-4">
            <p className="text-sm font-semibold text-gray-700">{items.length} photo{items.length > 1 ? 's' : ''} ready to publish</p>
            {items.map(item => (
              <div key={item.id} className="bg-white rounded-2xl border border-gray-100 p-4 flex gap-4">
                {/* Thumbnail */}
                <div className="w-24 h-24 rounded-xl overflow-hidden shrink-0 relative group cursor-pointer" onClick={() => setPreview(item)}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={item.dataUrl} alt={item.title} className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <Eye className="w-5 h-5 text-white" />
                  </div>
                </div>

                {/* Fields */}
                <div className="flex-1 min-w-0 space-y-2.5">
                  <input
                    type="text"
                    value={item.title}
                    onChange={e => updateItem(item.id, 'title', e.target.value)}
                    placeholder="Outfit title (e.g. Ivory Bridal Gown)"
                    className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-[#FF6500] focus:ring-2 focus:ring-[#FF6500]/10 transition-all"
                  />

                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <Tag className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none" />
                      <select
                        value={item.tag}
                        onChange={e => updateItem(item.id, 'tag', e.target.value)}
                        className="w-full border border-gray-200 rounded-xl pl-8 pr-3 py-2 text-sm outline-none focus:border-[#FF6500] focus:ring-2 focus:ring-[#FF6500]/10 transition-all bg-white appearance-none"
                      >
                        {TAGS.map(t => <option key={t} value={t}>{t}</option>)}
                      </select>
                    </div>
                    <button
                      onClick={() => removeItem(item.id)}
                      className="p-2 rounded-xl border border-gray-200 text-gray-400 hover:border-red-300 hover:text-red-500 transition-all shrink-0"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <input
                    type="text"
                    value={item.description}
                    onChange={e => updateItem(item.id, 'description', e.target.value)}
                    placeholder="Short description (optional)"
                    className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-[#FF6500] focus:ring-2 focus:ring-[#FF6500]/10 transition-all"
                  />
                </div>
              </div>
            ))}

            {/* Add more */}
            <button
              onClick={() => fileInputRef.current?.click()}
              className="w-full py-3 rounded-2xl border-2 border-dashed border-gray-200 text-sm font-medium text-gray-400 hover:border-amber-300 hover:text-amber-600 transition-all"
            >
              + Add more photos
            </button>
          </div>
        )}
      </div>

      {/* Preview lightbox */}
      {preview && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4" onClick={() => setPreview(null)}>
          <div className="relative max-w-lg w-full" onClick={e => e.stopPropagation()}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={preview.dataUrl} alt={preview.title} className="w-full rounded-2xl object-contain max-h-[80vh]" />
            <div className="absolute top-3 right-3">
              <button onClick={() => setPreview(null)} className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center text-white hover:bg-white/40">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="mt-3 text-center">
              <p className="text-white font-semibold">{preview.title}</p>
              <span className="text-xs text-white/60">{preview.tag}</span>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
