'use client'

import { useState } from 'react'
import { useInquiry } from '@/context/InquiryContext'
import { useSidebar } from '@/context/SidebarContext'
import { InquiryStatus } from '@/type/index'
import { MessageSquare, ChevronRight, X, Menu } from 'lucide-react'

const statusColors: Record<string, string> = {
  New:     'bg-amber-100 text-amber-700',
  Replied: 'bg-blue-100 text-blue-700',
  Booked:  'bg-green-100 text-green-700',
}

const filters: (InquiryStatus | 'All')[] = ['All', 'New', 'Replied', 'Booked']

export default function InquiriesPage() {
  const { filtered, filterStatus, setFilterStatus, updateStatus, inquiries } = useInquiry()
  const { toggle } = useSidebar()
  const [selectedId, setSelectedId] = useState<string | null>(null)

  const selectedInquiry = inquiries.find((i) => i.id === selectedId) ?? null
  const newCount = inquiries.filter(i => i.status === 'New').length

  return (
    <>
      {/* Top bar */}
      <header className="bg-white border-b border-gray-100 px-4 sm:px-8 py-4 flex items-center justify-between sticky top-0 z-10">
        <div className="flex items-center gap-3 min-w-0">
          <button onClick={toggle} className="lg:hidden p-2 rounded-xl hover:bg-gray-100 text-gray-600 shrink-0">
            <Menu className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-base sm:text-lg font-bold text-[#422a15]">Inquiries</h1>
            <p className="text-xs text-gray-400 hidden sm:block">
              {inquiries.length} total · {newCount} new
            </p>
          </div>
        </div>
        {newCount > 0 && (
          <span className="text-xs font-semibold px-3 py-1.5 rounded-full bg-amber-50 text-amber-700">
            {newCount} new
          </span>
        )}
      </header>

      <div className="p-4 sm:p-6 lg:p-8">

        {/* Filters */}
        <div className="flex gap-2 mb-5 flex-wrap">
          {filters.map((f) => (
            <button
              key={f}
              onClick={() => setFilterStatus(f)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
                filterStatus === f
                  ? 'bg-[#422a15] text-white'
                  : 'bg-white border border-gray-200 text-gray-600 hover:border-amber-300'
              }`}
            >
              {f}
            </button>
          ))}
        </div>

        {/* Inquiry list */}
        <div className="space-y-2.5">
          {filtered.length === 0 && (
            <div className="text-center py-16 text-gray-400">
              <MessageSquare className="w-8 h-8 mx-auto mb-3 opacity-40" />
              <p className="text-sm font-medium">No inquiries found</p>
            </div>
          )}

          {filtered.map((inquiry) => (
            <div
              key={inquiry.id}
              onClick={() => setSelectedId(inquiry.id)}
              className="bg-white rounded-2xl border border-gray-100 px-5 py-4 flex items-center gap-4 cursor-pointer hover:border-amber-200 hover:shadow-sm transition-all"
            >
              <div className="w-10 h-10 rounded-full bg-linear-to-br from-amber-200 to-amber-400 flex items-center justify-center text-[#422a15] font-bold text-sm shrink-0">
                {inquiry.client[0]}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-800 truncate">{inquiry.client}</p>
                <p className="text-xs text-gray-400 truncate">{inquiry.service}</p>
              </div>
              <div className="flex flex-col sm:flex-row items-end sm:items-center gap-2 shrink-0">
                <span className="text-xs text-gray-400">{inquiry.date}</span>
                <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${statusColors[inquiry.status]}`}>
                  {inquiry.status}
                </span>
                <ChevronRight className="w-4 h-4 text-gray-300 hidden sm:block" />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Detail drawer */}
      {selectedInquiry && (
        <>
          <div className="fixed inset-0 z-30 bg-black/40" onClick={() => setSelectedId(null)} />
          <div className="fixed bottom-0 left-0 right-0 z-40 bg-white rounded-t-2xl p-6 shadow-xl sm:max-w-lg sm:left-auto sm:right-6 sm:bottom-6 sm:rounded-2xl">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-linear-to-br from-amber-200 to-amber-400 flex items-center justify-center text-[#422a15] font-bold text-sm">
                  {selectedInquiry.client[0]}
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-800">{selectedInquiry.client}</p>
                  <p className="text-xs text-gray-400">{selectedInquiry.service}</p>
                </div>
              </div>
              <button onClick={() => setSelectedId(null)} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="bg-gray-50 rounded-xl px-4 py-3 mb-5">
              <p className="text-sm text-gray-700 leading-relaxed">{selectedInquiry.message}</p>
            </div>

            <div className="flex items-center justify-between mb-5">
              <span className="text-xs text-gray-400">{selectedInquiry.date}</span>
              <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${statusColors[selectedInquiry.status]}`}>
                {selectedInquiry.status}
              </span>
            </div>

            <div className="flex gap-2">
              {selectedInquiry.status !== 'Replied' && (
                <button
                  onClick={() => { updateStatus(selectedInquiry.id, 'Replied'); setSelectedId(null) }}
                  className="flex-1 bg-blue-50 text-blue-700 border border-blue-100 rounded-xl py-2.5 text-sm font-semibold hover:bg-blue-100 transition-colors"
                >
                  Mark as Replied
                </button>
              )}
              {selectedInquiry.status !== 'Booked' && (
                <button
                  onClick={() => { updateStatus(selectedInquiry.id, 'Booked'); setSelectedId(null) }}
                  className="flex-1 bg-green-50 text-green-700 border border-green-100 rounded-xl py-2.5 text-sm font-semibold hover:bg-green-100 transition-colors"
                >
                  Mark as Booked
                </button>
              )}
            </div>
          </div>
        </>
      )}
    </>
  )
}
