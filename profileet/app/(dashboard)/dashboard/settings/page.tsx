'use client'

import { useState } from 'react'
import { useAuth } from '@/context/AuthContext'
import { useSidebar } from '@/context/SidebarContext'
import { authHeader } from '@/lib/auth'
import {
  Menu, Lock, Bell, Shield, LogOut, Eye, EyeOff,
  CheckCircle, AlertCircle, ChevronRight, Loader2,
} from 'lucide-react'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'

type Tab = 'security' | 'notifications' | 'privacy'

const TABS: { id: Tab; label: string; icon: React.ElementType }[] = [
  { id: 'security',      label: 'Security',      icon: Lock   },
  { id: 'notifications', label: 'Notifications', icon: Bell   },
  { id: 'privacy',       label: 'Privacy',        icon: Shield },
]


const DEFAULT_NOTIFS = {
  newInquiry:    true,
  bookingUpdate: true,
  reviewPosted:  true,
  paymentAlert:  true,
  weeklyDigest:  false,
  marketing:     false,
}

type NotifKey = keyof typeof DEFAULT_NOTIFS

function useLocalNotifications() {
  const stored =
    typeof window !== 'undefined'
      ? JSON.parse(localStorage.getItem('sk_notif_prefs') ?? 'null')
      : null
  const [prefs, setPrefs] = useState<typeof DEFAULT_NOTIFS>(stored ?? DEFAULT_NOTIFS)

  function toggle(key: NotifKey) {
    setPrefs(prev => {
      const next = { ...prev, [key]: !prev[key] }
      localStorage.setItem('sk_notif_prefs', JSON.stringify(next))
      return next
    })
  }
  return { prefs, toggle }
}


function Toggle({ on, onToggle }: { on: boolean; onToggle: () => void }) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 focus:outline-none ${
        on ? 'bg-[#FF6500]' : 'bg-gray-200'
      }`}
    >
      <span
        className={`inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ${
          on ? 'translate-x-4' : 'translate-x-0'
        }`}
      />
    </button>
  )
}


function SecurityTab() {
  const { logout } = useAuth()
  const [current, setCurrent]     = useState('')
  const [next, setNext]           = useState('')
  const [confirm, setConfirm]     = useState('')
  const [showCurrent, setShowCurrent] = useState(false)
  const [showNext, setShowNext]       = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [loading, setLoading]     = useState(false)
  const [success, setSuccess]     = useState(false)
  const [error, setError]         = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setSuccess(false)

    if (next.length < 6) {
      setError('New password must be at least 6 characters.')
      return
    }
    if (next !== confirm) {
      setError('New passwords do not match.')
      return
    }

    setLoading(true)
    try {
      const res = await fetch(`${API_URL}/auth/password`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', ...authHeader() },
        body: JSON.stringify({ currentPassword: current, newPassword: next }),
      })
      const json = await res.json()
      if (!res.ok) { setError(json.error ?? 'Failed to update password.'); return }
      setSuccess(true)
      setCurrent(''); setNext(''); setConfirm('')
    } catch {
      setError('Network error. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const inputClass =
    'w-full border border-gray-200 rounded-xl px-4 py-2.5 pr-10 text-sm outline-none transition-all focus:border-[#FF6500] focus:ring-2 focus:ring-[#FF6500]/10'

  return (
    <div className="space-y-6">
      {/* Change password */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
        <h2 className="text-base font-semibold text-[#422a15] mb-1">Change password</h2>
        <p className="text-sm text-gray-500 mb-5">
          Update your password to keep your account secure.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Current */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Current password
            </label>
            <div className="relative">
              <input
                type={showCurrent ? 'text' : 'password'}
                value={current}
                onChange={e => setCurrent(e.target.value)}
                placeholder="••••••••"
                className={inputClass}
                required
              />
              <button
                type="button"
                onClick={() => setShowCurrent(v => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showCurrent ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* New */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              New password
            </label>
            <div className="relative">
              <input
                type={showNext ? 'text' : 'password'}
                value={next}
                onChange={e => setNext(e.target.value)}
                placeholder="Min. 6 characters"
                className={inputClass}
                required
              />
              <button
                type="button"
                onClick={() => setShowNext(v => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showNext ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Confirm */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Confirm new password
            </label>
            <div className="relative">
              <input
                type={showConfirm ? 'text' : 'password'}
                value={confirm}
                onChange={e => setConfirm(e.target.value)}
                placeholder="••••••••"
                className={inputClass}
                required
              />
              <button
                type="button"
                onClick={() => setShowConfirm(v => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Feedback */}
          {error && (
            <div className="flex items-center gap-2 bg-red-50 border border-red-100 rounded-xl px-4 py-3">
              <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
              <p className="text-xs text-red-600">{error}</p>
            </div>
          )}
          {success && (
            <div className="flex items-center gap-2 bg-green-50 border border-green-100 rounded-xl px-4 py-3">
              <CheckCircle className="w-4 h-4 text-green-500 shrink-0" />
              <p className="text-xs text-green-600">Password updated successfully.</p>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#422a15] text-white text-sm font-semibold hover:bg-[#5a3a20] transition-colors disabled:opacity-60"
          >
            {loading && <Loader2 className="w-4 h-4 animate-spin" />}
            {loading ? 'Updating…' : 'Update password'}
          </button>
        </form>
      </div>

      {/* Sessions */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
        <h2 className="text-base font-semibold text-[#422a15] mb-1">Active session</h2>
        <p className="text-sm text-gray-500 mb-4">
          Sign out of your current session on this device.
        </p>
        <button
          onClick={logout}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-red-200 text-red-600 text-sm font-semibold hover:bg-red-50 transition-colors"
        >
          <LogOut className="w-4 h-4" />
          Sign out
        </button>
      </div>
    </div>
  )
}


const NOTIF_ITEMS: { key: NotifKey; label: string; desc: string }[] = [
  { key: 'newInquiry',    label: 'New inquiry',        desc: 'When a client sends you a new inquiry'         },
  { key: 'bookingUpdate', label: 'Booking updates',    desc: 'Status changes on any of your bookings'        },
  { key: 'reviewPosted',  label: 'New review',         desc: 'When a client leaves you a review'             },
  { key: 'paymentAlert',  label: 'Payment alerts',     desc: 'Deposit or payment activity on your bookings'  },
  { key: 'weeklyDigest',  label: 'Weekly digest',      desc: 'A summary of your activity every Monday'       },
  { key: 'marketing',     label: 'Tips & promotions',  desc: 'Product updates, offers, and design tips'      },
]

function NotificationsTab() {
  const { prefs, toggle } = useLocalNotifications()
  const [saved, setSaved] = useState(false)

  function handleSave() {
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      <div className="px-6 pt-6 pb-4 border-b border-gray-100">
        <h2 className="text-base font-semibold text-[#422a15]">Email notifications</h2>
        <p className="text-sm text-gray-500 mt-0.5">
          Choose which emails you receive from StyledKraft.
        </p>
      </div>

      <ul className="divide-y divide-gray-50">
        {NOTIF_ITEMS.map(({ key, label, desc }) => (
          <li key={key} className="flex items-center justify-between px-6 py-4 gap-4">
            <div>
              <p className="text-sm font-medium text-gray-800">{label}</p>
              <p className="text-xs text-gray-400 mt-0.5">{desc}</p>
            </div>
            <Toggle on={prefs[key]} onToggle={() => toggle(key)} />
          </li>
        ))}
      </ul>

      <div className="px-6 py-4 border-t border-gray-100 flex items-center gap-3">
        <button
          onClick={handleSave}
          className="px-5 py-2.5 rounded-xl bg-[#FF6500] text-white text-sm font-semibold hover:opacity-90 transition-all"
        >
          Save preferences
        </button>
        {saved && (
          <span className="flex items-center gap-1.5 text-xs text-green-600 font-medium">
            <CheckCircle className="w-3.5 h-3.5" />
            Saved
          </span>
        )}
      </div>
    </div>
  )
}


const PRIVACY_ITEMS = [
  {
    label: 'Profile visibility',
    desc:  'Your profile is publicly visible on the StyledKraft directory.',
    value: 'Public',
    soon:  false,
  },
  {
    label: 'Show availability calendar',
    desc:  'Clients can see your availability on your public profile.',
    value: 'Visible',
    soon:  false,
  },
  {
    label: 'Allow direct messages',
    desc:  'Clients can send you messages through the platform.',
    value: 'Enabled',
    soon:  true,
  },
  {
    label: 'Data export',
    desc:  'Download a copy of your profile data, bookings, and reviews.',
    value: 'Request',
    soon:  true,
  },
]

function PrivacyTab() {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      <div className="px-6 pt-6 pb-4 border-b border-gray-100">
        <h2 className="text-base font-semibold text-[#422a15]">Privacy & data</h2>
        <p className="text-sm text-gray-500 mt-0.5">
          Control how your information is used and displayed.
        </p>
      </div>

      <ul className="divide-y divide-gray-50">
        {PRIVACY_ITEMS.map(({ label, desc, value, soon }) => (
          <li
            key={label}
            className="flex items-center justify-between px-6 py-4 gap-4"
          >
            <div>
              <p className="text-sm font-medium text-gray-800">{label}</p>
              <p className="text-xs text-gray-400 mt-0.5">{desc}</p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              {soon && (
                <span className="text-xs font-medium text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full">
                  Soon
                </span>
              )}
              <span className="flex items-center gap-1 text-sm font-medium text-gray-500 hover:text-[#422a15] cursor-default">
                {value}
                <ChevronRight className="w-3.5 h-3.5" />
              </span>
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}



export default function SettingsPage() {
  const { toggle } = useSidebar()
  const [activeTab, setActiveTab] = useState<Tab>('security')

  return (
    <>
      {/* Top bar */}
      <header className="bg-white border-b border-gray-100 px-4 sm:px-8 py-4 flex items-center gap-3 sticky top-0 z-10">
        <button
          onClick={toggle}
          className="lg:hidden p-2 rounded-xl hover:bg-gray-100 text-gray-600 shrink-0"
        >
          <Menu className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-base sm:text-lg font-bold text-[#422a15]">Settings</h1>
          <p className="text-xs text-gray-400 hidden sm:block">
            Manage your account preferences
          </p>
        </div>
      </header>

      <div className="p-4 sm:p-6 lg:p-8 max-w-3xl mx-auto w-full">
        {/* Tab nav */}
        <div className="flex gap-1 bg-gray-100 rounded-xl p-1 mb-6">
          {TABS.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-semibold transition-all duration-200 ${
                activeTab === id
                  ? 'bg-white text-[#422a15] shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <Icon className="w-4 h-4 shrink-0" />
              <span className="hidden sm:inline">{label}</span>
            </button>
          ))}
        </div>

        {/* Tab content */}
        {activeTab === 'security'      && <SecurityTab />}
        {activeTab === 'notifications' && <NotificationsTab />}
        {activeTab === 'privacy'       && <PrivacyTab />}
      </div>
    </>
  )
}
