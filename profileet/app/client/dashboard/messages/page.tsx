'use client'

import { useEffect, useState } from 'react'
import { Circle, Search, Send } from 'lucide-react'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'

type Message = {
  id: number
  from: 'client' | 'designer'
  text: string
  time: string
}

type Conversation = {
  id: number
  designer: string
  initials: string
  color: string
  lastMessage: string
  time: string
  unread: number
  messages: Message[]
}

export default function MessagesPage() {
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [activeId, setActiveId] = useState(0)
  const [search, setSearch] = useState('')
  const [input, setInput] = useState('')

  useEffect(() => {
    fetch(`${API_URL}/messages`)
      .then((res) => res.json())
      .then((data: Conversation[]) => {
        setConversations(data)
        setActiveId(data[0]?.id ?? 0)
      })
      .catch(() => setConversations([]))
  }, [])

  const activeConvo = conversations.find((c) => c.id === activeId)
  const filtered = conversations.filter((c) =>
    c.designer.toLowerCase().includes(search.toLowerCase())
  )

  const refreshConversations = async () => {
    const res = await fetch(`${API_URL}/messages`)
    setConversations(await res.json())
  }

  const sendMessage = async () => {
    if (!input.trim() || !activeId) return
    await fetch(`${API_URL}/messages/${activeId}/messages`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: input }),
    })
    setInput('')
    await refreshConversations()
  }

  const openConversation = async (id: number) => {
    setActiveId(id)
    await fetch(`${API_URL}/messages/${id}/read`, { method: 'PATCH' })
    await refreshConversations()
  }

  if (!activeConvo) {
    return <div className="text-gray-400">Loading...</div>
  }

  return (
    <div>
      <div className="mb-5">
        <h2 className="text-xl font-bold text-gray-800 mb-1">Messages</h2>
        <p className="text-sm text-gray-500">Chat with your designers and tailors</p>
      </div>

      <div
        className="bg-white border border-gray-100 rounded-2xl overflow-hidden"
        style={{ height: 'calc(100vh - 200px)', minHeight: '480px', display: 'flex' }}
      >
        <aside className="w-72 shrink-0 border-r border-gray-100 flex flex-col">
          <div className="p-3 border-b border-gray-100">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
              <input
                type="text"
                placeholder="Search conversations..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-gray-50 border border-gray-100 rounded-xl pl-8 pr-3 py-2 text-xs outline-none"
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto">
            {filtered.map((conversation) => (
              <button
                key={conversation.id}
                onClick={() => openConversation(conversation.id)}
                className="w-full flex items-start gap-3 px-4 py-3.5 text-left border-b border-gray-50"
                style={activeId === conversation.id ? { background: '#fff3ee' } : {}}
              >
                <div
                  className="w-9 h-9 rounded-xl flex items-center justify-center text-xs font-bold text-white shrink-0"
                  style={{ background: conversation.color }}
                >
                  {conversation.initials}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-0.5">
                    <p className="text-xs font-semibold text-gray-800 truncate">{conversation.designer}</p>
                    <span className="text-xs text-gray-400 shrink-0 ml-1">{conversation.time}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <p className="text-xs text-gray-500 truncate">{conversation.lastMessage}</p>
                    {conversation.unread > 0 && (
                      <span
                        className="ml-1 shrink-0 w-4 h-4 rounded-full text-white text-xs flex items-center justify-center font-semibold"
                        style={{ background: '#FF6500', fontSize: '10px' }}
                      >
                        {conversation.unread}
                      </span>
                    )}
                  </div>
                </div>
              </button>
            ))}
          </div>
        </aside>

        <section className="flex-1 flex flex-col min-w-0">
          <div className="px-5 py-3.5 border-b border-gray-100 flex items-center gap-3">
            <div
              className="w-8 h-8 rounded-xl flex items-center justify-center text-xs font-bold text-white shrink-0"
              style={{ background: activeConvo.color }}
            >
              {activeConvo.initials}
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-800">{activeConvo.designer}</p>
              <div className="flex items-center gap-1 text-xs text-green-500">
                <Circle className="w-2 h-2 fill-green-500" />
                Online
              </div>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3">
            {activeConvo.messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.from === 'client' ? 'justify-end' : 'justify-start'}`}
              >
                <div className="max-w-xs">
                  <div
                    className="px-4 py-2.5 rounded-2xl text-sm"
                    style={
                      message.from === 'client'
                        ? { background: '#FF6500', color: '#fff', borderBottomRightRadius: '4px' }
                        : { background: '#f3f4f6', color: '#1f2937', borderBottomLeftRadius: '4px' }
                    }
                  >
                    {message.text}
                  </div>
                  <p className={`text-xs text-gray-400 mt-1 ${message.from === 'client' ? 'text-right' : 'text-left'}`}>
                    {message.time}
                  </p>
                </div>
              </div>
            ))}
          </div>

          <div className="px-4 py-3 border-t border-gray-100 flex items-center gap-3">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
              placeholder="Type a message..."
              className="flex-1 bg-gray-50 border border-gray-100 rounded-xl px-4 py-2.5 text-sm outline-none transition-all"
            />
            <button
              onClick={sendMessage}
              className="w-9 h-9 rounded-xl flex items-center justify-center text-white shrink-0 transition-all"
              style={{ background: '#FF6500' }}
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </section>
      </div>
    </div>
  )
}
