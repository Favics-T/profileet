'use client'

import { Circle } from 'lucide-react'

export default function MessagesPage() {
  return (
    <div>
      <div className="mb-5">
        <h2 className="text-xl font-bold text-gray-800 mb-1">Messages</h2>
        <p className="text-sm text-gray-500">Chat with your designers and tailors</p>
      </div>

      <div
        className="bg-white border border-gray-100 rounded-2xl flex flex-col items-center justify-center gap-2 text-center px-6"
        style={{ height: 'calc(100vh - 200px)', minHeight: '480px' }}
      >
        <Circle className="w-8 h-8 text-gray-300" />
        <p className="text-sm font-semibold text-gray-600">Messaging is coming soon</p>
        <p className="text-xs text-gray-400 max-w-xs">
          Client-side messaging isn&apos;t available yet. Check back later.
        </p>
      </div>
    </div>
  )
}
