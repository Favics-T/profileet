'use client'

import { useState } from 'react'
import { Send, Search, Circle } from 'lucide-react'

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

const MOCK_CONVERSATIONS: Conversation[] = [
  {
    id: 1,
    designer: 'Adaeze Nwosu',
    initials: 'AN',
    color: '#FF6500',
    lastMessage: 'Your gown is ready for the second fitting!',
    time: '10:42 AM',
    unread: 2,
    messages: [
      { id: 1, from: 'client',   text: 'Hi Adaeze, I just confirmed my booking. Looking forward to working with you!', time: 'Mon 9:00 AM' },
      { id: 2, from: 'designer', text: 'Thank you! I\'ve received your brief. Let\'s schedule the first fitting for next week.', time: 'Mon 9:15 AM' },
      { id: 3, from: 'client',   text: 'Perfect, Tuesday works for me. I\'ll bring the fabric samples.', time: 'Mon 9:20 AM' },
      { id: 4, from: 'designer', text: 'Great! I\'ll confirm the exact time shortly.', time: 'Mon 9:22 AM' },
      { id: 5, from: 'designer', text: 'Your gown is ready for the second fitting!', time: 'Today 10:42 AM' },
    ],
  },
  {
    id: 2,
    designer: 'Emeka Fashola',
    initials: 'EF',
    color: '#1a1a2e',
    lastMessage: 'I\'ve sent you the measurement form.',
    time: 'Yesterday',
    unread: 0,
    messages: [
      { id: 1, from: 'client',   text: 'Hello Emeka, I placed a booking for 3 casual pieces. Just checking in.', time: 'Yesterday 2:00 PM' },
      { id: 2, from: 'designer', text: 'Got it! I\'ve sent you the measurement form. Please fill it out before our call.', time: 'Yesterday 3:10 PM' },
    ],
  },
  {
    id: 3,
    designer: 'Ngozi Eze',
    initials: 'NE',
    color: '#be185d',
    lastMessage: 'Thank you for the kind review! 🙏',
    time: 'Jun 10',
    unread: 0,
    messages: [
      { id: 1, from: 'client',   text: 'Ngozi, the evening dress was absolutely stunning. Left you a 5-star review!', time: 'Jun 10 4:00 PM' },
      { id: 2, from: 'designer', text: 'Thank you for the kind review! 🙏 It was a pleasure working with you. Come back anytime!', time: 'Jun 10 4:30 PM' },
    ],
  },
]

export default function MessagesPage() {
  const [activeId, setActiveId] = useState<number>(1)
  const [search, setSearch] = useState('')
  const [input, setInput] = useState('')
  const [conversations, setConversations] = useState(MOCK_CONVERSATIONS)

  const activeConvo = conversations.find((c) => c.id === activeId)!

  const filteredConvos = conversations.filter((c) =>
    c.designer.toLowerCase().includes(search.toLowerCase())
  )

  const sendMessage = () => {
    if (!input.trim()) return
    const newMsg: Message = {
      id: Date.now(),
      from: 'client',
      text: input.trim(),
      time: 'Just now',
    }
    setConversations((prev) =>
      prev.map((c) =>
        c.id === activeId
          ? { ...c, messages: [...c.messages, newMsg], lastMessage: input.trim(), time: 'Just now', unread: 0 }
          : c
      )
    )
    setInput('')
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') sendMessage()
  }

  // Mark as read when opening convo
  const openConvo = (id: number) => {
    setActiveId(id)
    setConversations((prev) =>
      prev.map((c) => (c.id === id ? { ...c, unread: 0 } : c))
    )
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-5">
        <h2 className="text-xl font-bold text-gray-800 mb-1">Messages</h2>
        <p className="text-sm text-gray-500">Chat with your designers and tailors</p>
      </div>

      <div
        className="bg-white border border-gray-100 rounded-2xl overflow-hidden"
        style={{ height: 'calc(100vh - 200px)', minHeight: '480px', display: 'flex' }}
      >
        {/* ── Conversation list ── */}
        <div className="w-72 shrink-0 border-r border-gray-100 flex flex-col">
          {/* Search */}
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

          {/* List */}
          <div className="flex-1 overflow-y-auto">
            {filteredConvos.map((convo) => (
              <button
                key={convo.id}
                onClick={() => openConvo(convo.id)}
                className="w-full flex items-start gap-3 px-4 py-3.5 text-left transition-colors hover:bg-gray-50 border-b border-gray-50"
                style={activeId === convo.id ? { background: '#fff3ee' } : {}}
              >
                <div
                  className="w-9 h-9 rounded-xl flex items-center justify-center text-xs font-bold text-white shrink-0"
                  style={{ background: convo.color }}
                >
                  {convo.initials}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-0.5">
                    <p className="text-xs font-semibold text-gray-800 truncate">{convo.designer}</p>
                    <span className="text-xs text-gray-400 shrink-0 ml-1">{convo.time}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <p className="text-xs text-gray-500 truncate">{convo.lastMessage}</p>
                    {convo.unread > 0 && (
                      <span
                        className="ml-1 shrink-0 w-4 h-4 rounded-full text-white text-xs flex items-center justify-center font-semibold"
                        style={{ background: '#FF6500', fontSize: '10px' }}
                      >
                        {convo.unread}
                      </span>
                    )}
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* ── Chat thread ── */}
        <div className="flex-1 flex flex-col min-w-0">

          {/* Thread header */}
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

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3">
            {activeConvo.messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${msg.from === 'client' ? 'justify-end' : 'justify-start'}`}
              >
                <div className="max-w-xs">
                  <div
                    className="px-4 py-2.5 rounded-2xl text-sm"
                    style={
                      msg.from === 'client'
                        ? { background: '#FF6500', color: '#fff', borderBottomRightRadius: '4px' }
                        : { background: '#f3f4f6', color: '#1f2937', borderBottomLeftRadius: '4px' }
                    }
                  >
                    {msg.text}
                  </div>
                  <p className={`text-xs text-gray-400 mt-1 ${msg.from === 'client' ? 'text-right' : 'text-left'}`}>
                    {msg.time}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Input */}
          <div className="px-4 py-3 border-t border-gray-100 flex items-center gap-3">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Type a message..."
              className="flex-1 bg-gray-50 border border-gray-100 rounded-xl px-4 py-2.5 text-sm outline-none transition-all"
              onFocus={e => {
                e.target.style.borderColor = '#FF6500'
                e.target.style.boxShadow = '0 0 0 3px rgba(255,101,0,0.1)'
              }}
              onBlur={e => {
                e.target.style.borderColor = '#f3f4f6'
                e.target.style.boxShadow = 'none'
              }}
            />
            <button
              onClick={sendMessage}
              disabled={!input.trim()}
              className="w-9 h-9 rounded-xl flex items-center justify-center text-white shrink-0 transition-all disabled:opacity-40"
              style={{ background: '#FF6500' }}
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}