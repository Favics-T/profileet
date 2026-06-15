'use client'

import { useState } from 'react'
import { useInquiry } from '@/context/InquiryContext'
import { useRouter } from 'next/navigation'
import { InquiryStatus } from '@/type/index'
import {
  Scissors, ArrowLeft, MessageSquare, ChevronRight, X
} from 'lucide-react'

const statusColors: Record<string, string> = {
  New: 'bg-amber-100 text-amber-700',
  Replied: 'bg-blue-100 text-blue-700',
  Booked: 'bg-green-100 text-green-700',
}

const filters: (InquiryStatus | 'All')[] = ['All', 'New', 'Replied', 'Booked']

export default function InquiriesPage() {
  const { filtered, filterStatus, setFilterStatus, updateStatus, inquiries } = useInquiry()
  const router = useRouter()
  const [selectedId, setSelectedId] = useState<string | null>(null)

  const selectedInquiry = inquiries.find((i) => i.id === selectedId) ?? null

  return (
    <main className="min-h-screen bg-[#faf8f5] flex flex-col">

      {/* Nav */}
      <header className="px-5 sm:px-10 py-5 flex items-center justify-between border-b border-gray-100 bg-white sticky top-0 z-10">
        <div className="flex items-center gap-2">
          <Scissors className="w-5 h-5 text-amber-600" />
          <span className="font-bold text-xl text-[#422a15]">StyledKraft</span>
        </div>
        <button
          onClick={() => router.push('/dashboard')}
          className="flex items-center gap-2 text-sm text-[#422a15] hover:text-amber-600 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Dashboard
        </button>
      </header>

      <section className="flex-1 px-4 py-8 max-w-3xl mx-auto w-full">

        {/* Page header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-[#422a15]">Inquiries</h1>
          <p className="text-sm text-gray-500 mt-1">
            {inquiries.length} total · {inquiries.filter((i) => i.status === 'New').length} new
          </p>
        </div>

        {/* Filters */}
        <div className="flex gap-2 mb-6 flex-wrap">
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
        <div className="space-y-3">
          {filtered.length === 0 && (
            <div className="text-center py-16 text-gray-400">
              <MessageSquare className="w-8 h-8 mx-auto mb-3 opacity-40" />
              <p className="text-sm">No inquiries found</p>
            </div>
          )}

          {filtered.map((inquiry) => (
            <div
              key={inquiry.id}
              onClick={() => setSelectedId(inquiry.id)}
              className="bg-white rounded-xl border border-gray-100 shadow-sm px-5 py-4 flex items-center gap-4 cursor-pointer hover:border-amber-300 transition-all"
            >
              <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center text-[#422a15] font-bold text-sm flex-shrink-0">
                {inquiry.client[0]}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-800 truncate">{inquiry.client}</p>
                <p className="text-xs text-gray-500 truncate">{inquiry.service}</p>
              </div>
              <div className="flex flex-col sm:flex-row items-end sm:items-center gap-2 flex-shrink-0">
                <span className="text-xs text-gray-400">{inquiry.date}</span>
                <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${statusColors[inquiry.status]}`}>
                  {inquiry.status}
                </span>
                <ChevronRight className="w-4 h-4 text-gray-300 hidden sm:block" />
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Inquiry detail drawer */}
      {selectedInquiry && (
        <>
          <div
            className="fixed inset-0 z-30 bg-black/40"
            onClick={() => setSelectedId(null)}
          />
          <div className="fixed bottom-0 left-0 right-0 z-40 bg-white rounded-t-2xl p-6 shadow-xl sm:max-w-lg sm:left-auto sm:right-6 sm:bottom-6 sm:rounded-2xl">

            {/* Drawer header */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center text-[#422a15] font-bold text-sm">
                  {selectedInquiry.client[0]}
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-800">{selectedInquiry.client}</p>
                  <p className="text-xs text-gray-500">{selectedInquiry.service}</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedId(null)}
                className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Message */}
            <div className="bg-[#faf8f5] rounded-xl px-4 py-3 mb-5">
              <p className="text-sm text-gray-700 leading-relaxed">{selectedInquiry.message}</p>
            </div>

            {/* Date + current status */}
            <div className="flex items-center justify-between mb-5">
              <span className="text-xs text-gray-400">{selectedInquiry.date}</span>
              <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${statusColors[selectedInquiry.status]}`}>
                {selectedInquiry.status}
              </span>
            </div>

            {/* Status actions */}
            <div className="flex gap-2">
              {selectedInquiry.status !== 'Replied' && (
                <button
                  onClick={() => {
                    updateStatus(selectedInquiry.id, 'Replied')
                    setSelectedId(null)
                  }}
                  className="flex-1 bg-blue-50 text-blue-700 border border-blue-200 rounded-xl py-2.5 text-sm font-semibold hover:bg-blue-100 transition-colors"
                >
                  Mark as Replied
                </button>
              )}
              {selectedInquiry.status !== 'Booked' && (
                <button
                  onClick={() => {
                    updateStatus(selectedInquiry.id, 'Booked')
                    setSelectedId(null)
                  }}
                  className="flex-1 bg-green-50 text-green-700 border border-green-200 rounded-xl py-2.5 text-sm font-semibold hover:bg-green-100 transition-colors"
                >
                  Mark as Booked
                </button>
              )}
            </div>

          </div>
        </>
      )}

    </main>
  )
}