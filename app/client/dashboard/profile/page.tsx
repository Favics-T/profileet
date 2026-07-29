'use client'

import { useEffect, useState } from 'react'
import { Camera, CheckCircle, Lock, Bell, Trash2 } from 'lucide-react'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'

type ClientProfile = {
  firstName: string
  lastName: string
  email: string
  phone: string
  location: string
  bio: string
  bookingUpdates: boolean
  newMessages: boolean
  promotions: boolean
  reminders: boolean
}

export default function ProfilePage() {
  const [profile, setProfile] = useState<ClientProfile | null>(null)
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    fetch(`${API_URL}/client/profile`)
      .then((res) => res.json())
      .then(setProfile)
      .catch(() => setProfile(null))
  }, [])

  const save = async () => {
    if (!profile) return
    await fetch(`${API_URL}/client/profile`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(profile),
    })
    setSuccess(true)
    setTimeout(() => setSuccess(false), 2000)
  }

  if (!profile) return <div className="text-gray-400">Loading...</div>

  const initials = `${profile.firstName?.[0] ?? 'A'}${profile.lastName?.[0] ?? 'O'}`

  return (
    <div className="max-w-2xl">
      <div className="mb-6">
        <h2 className="text-xl font-bold text-gray-800 mb-1">Account Settings</h2>
        <p className="text-sm text-gray-500">Manage your profile and preferences</p>
      </div>

      <div className="bg-white border border-gray-100 rounded-2xl p-5 mb-4 flex items-center gap-4">
        <div className="relative">
          <div
            className="w-16 h-16 rounded-2xl flex items-center justify-center text-xl font-bold text-white"
            style={{ background: '#FF6500' }}
          >
            {initials}
          </div>
          <button
            className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-white border border-gray-200 flex items-center justify-center shadow-sm hover:bg-gray-50"
            aria-label="Change avatar"
          >
            <Camera className="w-3 h-3 text-gray-500" />
          </button>
        </div>
        <div>
          <p className="text-sm font-semibold text-gray-800">
            {profile.firstName} {profile.lastName}
          </p>
          <p className="text-xs text-gray-400">{profile.email}</p>
          <span
            className="inline-flex items-center gap-1 mt-1 text-xs font-medium px-2 py-0.5 rounded-full"
            style={{ background: '#fff3ee', color: '#cc5200' }}
          >
            Client
          </span>
        </div>
      </div>

      <div className="bg-white border border-gray-100 rounded-2xl p-6 space-y-4">
        <Field label="Email address">
          <input
            className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none"
            value={profile.email}
            onChange={(e) => setProfile({ ...profile, email: e.target.value })}
          />
        </Field>
        <Field label="Phone number">
          <input
            className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none"
            value={profile.phone}
            onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
          />
        </Field>
        <Field label="Location">
          <input
            className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none"
            value={profile.location}
            onChange={(e) => setProfile({ ...profile, location: e.target.value })}
          />
        </Field>
        <Field label="Short bio">
          <textarea
            className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none"
            rows={3}
            value={profile.bio}
            onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
          />
        </Field>

        <div className="space-y-2 pt-2">
          <ToggleRow
            label="Booking updates"
            value={profile.bookingUpdates}
            onToggle={() => setProfile({ ...profile, bookingUpdates: !profile.bookingUpdates })}
          />
          <ToggleRow
            label="New messages"
            value={profile.newMessages}
            onToggle={() => setProfile({ ...profile, newMessages: !profile.newMessages })}
          />
          <ToggleRow
            label="Promotions"
            value={profile.promotions}
            onToggle={() => setProfile({ ...profile, promotions: !profile.promotions })}
          />
          <ToggleRow
            label="Reminders"
            value={profile.reminders}
            onToggle={() => setProfile({ ...profile, reminders: !profile.reminders })}
          />
        </div>

        {success && (
          <div className="flex items-center gap-2 bg-green-50 border border-green-200 rounded-xl px-4 py-3">
            <CheckCircle className="w-4 h-4 text-green-500 shrink-0" />
            <p className="text-xs text-green-600">Profile saved successfully</p>
          </div>
        )}

        <button
          onClick={save}
          className="w-full text-white rounded-xl py-2.5 text-sm font-semibold"
          style={{ background: '#1a1a2e' }}
        >
          Save changes
        </button>
      </div>
    </div>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-xs font-medium text-gray-700 mb-1.5">{label}</label>
      {children}
    </div>
  )
}

function ToggleRow({
  label,
  value,
  onToggle,
}: {
  label: string
  value: boolean
  onToggle: () => void
}) {
  return (
    <div className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
      <span className="text-sm text-gray-700">{label}</span>
      <button
        onClick={onToggle}
        className="w-10 h-5 rounded-full transition-all relative shrink-0"
        style={{ background: value ? '#FF6500' : '#e5e7eb' }}
        aria-label={`Toggle ${label}`}
      >
        <span
          className="absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-all"
          style={{ left: value ? '22px' : '2px' }}
        />
      </button>
    </div>
  )
}
