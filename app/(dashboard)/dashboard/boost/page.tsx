'use client'

import { useRouter } from 'next/navigation'
import { Scissors, ArrowLeft } from 'lucide-react'

export default function Boost() {
  const router = useRouter()

  return (
    <main className="min-h-screen bg-[#faf8f5] flex flex-col">
      <header className="px-5 sm:px-10 py-5 flex items-center justify-between border-b border-gray-100 bg-white">
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

      <section className="flex-1 flex items-center justify-center px-4">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-[#422a15] mb-2">Boost</h1>
          <p className="text-sm text-gray-500">This page is coming soon.</p>
        </div>
      </section>
    </main>
  )
}
