'use client'

import { useAuth } from '@/context/AuthContext'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { Scissors, LogOut, User } from 'lucide-react'

export default function Profile() {
  const { user, isLoading, logout } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/login')
    }
  }, [user, isLoading, router])

  if (isLoading || !user) return null

  return (
    <main className="min-h-screen bg-[#faf8f5] flex flex-col">

      {/* Nav */}
      <header className="px-5 sm:px-10 py-5 flex items-center justify-between border-b border-gray-100 bg-white">
        <div className="flex items-center gap-2">
          <Scissors className="w-5 h-5 text-amber-600" />
          <span className="font-bold text-xl text-[#422a15]">StyledKraft</span>
        </div>
        <button
          onClick={logout}
          className="flex items-center gap-2 text-sm text-[#422a15] hover:text-red-600 transition-colors"
        >
          <LogOut className="w-4 h-4" />
          Log out
        </button>
      </header>

      {/* Content */}
      <section className="flex-1 flex items-center justify-center px-4">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 w-full max-w-md p-8 text-center">

          <div className="w-16 h-16 rounded-full bg-amber-100 flex items-center justify-center mx-auto mb-4">
            <User className="w-8 h-8 text-amber-600" />
          </div>

          <h1 className="text-2xl font-bold text-[#422a15] mb-1">My Profile</h1>
          <p className="text-sm text-gray-500 mb-6">You are signed in as</p>

          <div className="bg-[#faf8f5] rounded-xl px-4 py-3 mb-6">
            <p className="text-sm font-semibold text-[#422a15]">{user.email}</p>
          </div>

          <div className="flex flex-col gap-3">
            <button
              onClick={() => router.push('/dashboard')}
              className="w-full bg-[#422a15] text-white rounded-xl py-2.5 text-sm font-semibold hover:bg-[#5a3a20] transition-colors"
            >
              Go to Dashboard
            </button>
            <button
              onClick={logout}
              className="w-full border border-gray-200 text-gray-600 rounded-xl py-2.5 text-sm font-medium hover:border-red-300 hover:text-red-600 transition-colors"
            >
              Log out
            </button>
          </div>

        </div>
      </section>

    </main>
  )
}