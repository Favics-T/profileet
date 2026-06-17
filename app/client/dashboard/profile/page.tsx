'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Camera, CheckCircle, AlertCircle, Lock, Bell, Trash2 } from 'lucide-react'

const profileSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  email: z.string().email('Please enter a valid email'),
  phone: z.string().min(10, 'Enter a valid phone number').optional().or(z.literal('')),
  location: z.string().optional(),
  bio: z.string().max(160, 'Bio must be 160 characters or less').optional(),
})

type ProfileFormValues = z.infer<typeof profileSchema>

const passwordSchema = z.object({
  currentPassword: z.string().min(6, 'Password must be at least 6 characters'),
  newPassword: z.string().min(6, 'Password must be at least 6 characters'),
  confirmNewPassword: z.string(),
}).refine((d) => d.newPassword === d.confirmNewPassword, {
  message: 'Passwords do not match',
  path: ['confirmNewPassword'],
})

type PasswordFormValues = z.infer<typeof passwordSchema>

type ActiveSection = 'profile' | 'password' | 'notifications'

export default function ProfilePage() {
  const [activeSection, setActiveSection] = useState<ActiveSection>('profile')
  const [profileSuccess, setProfileSuccess] = useState(false)
  const [passwordSuccess, setPasswordSuccess] = useState(false)
  const [bioLength, setBioLength] = useState(0)

  const [notifications, setNotifications] = useState({
    bookingUpdates: true,
    newMessages: true,
    promotions: false,
    reminders: true,
  })

  const focusStyle = { borderColor: '#FF6500', boxShadow: '0 0 0 3px rgba(255,101,0,0.1)' }
  const blurStyle  = { borderColor: '#e5e7eb', boxShadow: 'none' }

  // ── Profile form ──
  const profileForm = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      firstName: 'Ada',
      lastName: 'Obi',
      email: 'ada.obi@example.com',
      phone: '08012345678',
      location: 'Lagos, Nigeria',
      bio: '',
    },
  })

  const onProfileSubmit = async (data: ProfileFormValues) => {
    await new Promise((r) => setTimeout(r, 800))
    console.log('Profile updated:', data)
    setProfileSuccess(true)
    setTimeout(() => setProfileSuccess(false), 3000)
  }

  // ── Password form ──
  const passwordForm = useForm<PasswordFormValues>({
    resolver: zodResolver(passwordSchema),
  })

  const onPasswordSubmit = async (data: PasswordFormValues) => {
    await new Promise((r) => setTimeout(r, 800))
    console.log('Password updated:', data)
    passwordForm.reset()
    setPasswordSuccess(true)
    setTimeout(() => setPasswordSuccess(false), 3000)
  }

  const SECTION_TABS: { label: string; value: ActiveSection; icon: React.FC<{ className?: string }> }[] = [
    { label: 'Profile',       value: 'profile',       icon: ({ className }) => <span className={className}>👤</span> },
    { label: 'Password',      value: 'password',      icon: Lock },
    { label: 'Notifications', value: 'notifications', icon: Bell },
  ]

  return (
    <div className="max-w-2xl">
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-xl font-bold text-gray-800 mb-1">Account Settings</h2>
        <p className="text-sm text-gray-500">Manage your profile and preferences</p>
      </div>

      {/* Avatar section */}
      <div className="bg-white border border-gray-100 rounded-2xl p-5 mb-4 flex items-center gap-4">
        <div className="relative">
          <div
            className="w-16 h-16 rounded-2xl flex items-center justify-center text-xl font-bold text-white"
            style={{ background: '#FF6500' }}
          >
            AO
          </div>
          <button
            className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-white border border-gray-200 flex items-center justify-center shadow-sm hover:bg-gray-50"
            aria-label="Change avatar"
          >
            <Camera className="w-3 h-3 text-gray-500" />
          </button>
        </div>
        <div>
          <p className="text-sm font-semibold text-gray-800">Ada Obi</p>
          <p className="text-xs text-gray-400">ada.obi@example.com</p>
          <span
            className="inline-flex items-center gap-1 mt-1 text-xs font-medium px-2 py-0.5 rounded-full"
            style={{ background: '#fff3ee', color: '#cc5200' }}
          >
            <span className="w-1.5 h-1.5 rounded-full" style={{ background: '#FF6500' }} />
            Client
          </span>
        </div>
      </div>

      {/* Section tabs */}
      <div className="flex gap-1 bg-gray-100 p-1 rounded-xl mb-5">
        {SECTION_TABS.map(({ label, value, icon: Icon }) => (
          <button
            key={value}
            onClick={() => setActiveSection(value)}
            className="flex-1 flex items-center justify-center gap-1.5 py-2 text-xs font-semibold rounded-lg transition-all"
            style={
              activeSection === value
                ? { background: '#fff', color: '#1a1a2e', boxShadow: '0 1px 4px rgba(0,0,0,0.08)' }
                : { background: 'transparent', color: '#9ca3af' }
            }
          >
            <Icon className="w-3.5 h-3.5" />
            {label}
          </button>
        ))}
      </div>

      {/* ── Profile section ── */}
      {activeSection === 'profile' && (
        <div className="bg-white border border-gray-100 rounded-2xl p-6">
          <h3 className="text-sm font-semibold text-gray-700 mb-5">Personal information</h3>

          <form onSubmit={profileForm.handleSubmit(onProfileSubmit)} noValidate className="space-y-4">

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1.5">First name</label>
                <input
                  type="text"
                  {...profileForm.register('firstName')}
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none transition-all"
                  onFocus={e => Object.assign(e.target.style, focusStyle)}
                  onBlur={e => Object.assign(e.target.style, blurStyle)}
                />
                {profileForm.formState.errors.firstName && (
                  <p className="text-xs text-red-500 mt-1">{profileForm.formState.errors.firstName.message}</p>
                )}
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1.5">Last name</label>
                <input
                  type="text"
                  {...profileForm.register('lastName')}
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none transition-all"
                  onFocus={e => Object.assign(e.target.style, focusStyle)}
                  onBlur={e => Object.assign(e.target.style, blurStyle)}
                />
                {profileForm.formState.errors.lastName && (
                  <p className="text-xs text-red-500 mt-1">{profileForm.formState.errors.lastName.message}</p>
                )}
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1.5">Email address</label>
              <input
                type="email"
                {...profileForm.register('email')}
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none transition-all"
                onFocus={e => Object.assign(e.target.style, focusStyle)}
                onBlur={e => Object.assign(e.target.style, blurStyle)}
              />
              {profileForm.formState.errors.email && (
                <p className="text-xs text-red-500 mt-1">{profileForm.formState.errors.email.message}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1.5">Phone number</label>
              <input
                type="tel"
                placeholder="080XXXXXXXX"
                {...profileForm.register('phone')}
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none transition-all"
                onFocus={e => Object.assign(e.target.style, focusStyle)}
                onBlur={e => Object.assign(e.target.style, blurStyle)}
              />
              {profileForm.formState.errors.phone && (
                <p className="text-xs text-red-500 mt-1">{profileForm.formState.errors.phone.message}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1.5">Location</label>
              <input
                type="text"
                placeholder="Lagos, Nigeria"
                {...profileForm.register('location')}
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none transition-all"
                onFocus={e => Object.assign(e.target.style, focusStyle)}
                onBlur={e => Object.assign(e.target.style, blurStyle)}
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-medium text-gray-700">Short bio</label>
                <span className="text-xs text-gray-400">{bioLength}/160</span>
              </div>
              <textarea
                placeholder="Tell designers a bit about yourself..."
                {...profileForm.register('bio', {
                  onChange: (e) => setBioLength(e.target.value.length),
                })}
                rows={3}
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none transition-all resize-none"
                onFocus={e => Object.assign(e.target.style, focusStyle)}
                onBlur={e => Object.assign(e.target.style, blurStyle)}
              />
              {profileForm.formState.errors.bio && (
                <p className="text-xs text-red-500 mt-1">{profileForm.formState.errors.bio.message}</p>
              )}
            </div>

            {profileSuccess && (
              <div className="flex items-center gap-2 bg-green-50 border border-green-200 rounded-xl px-4 py-3">
                <CheckCircle className="w-4 h-4 text-green-500 shrink-0" />
                <p className="text-xs text-green-600">Profile updated successfully</p>
              </div>
            )}

            <button
              type="submit"
              disabled={profileForm.formState.isSubmitting}
              className="w-full text-white rounded-xl py-2.5 text-sm font-semibold transition-colors disabled:opacity-60"
              style={{ background: '#1a1a2e' }}
              onMouseEnter={e => { if (!profileForm.formState.isSubmitting) (e.target as HTMLButtonElement).style.background = '#252540' }}
              onMouseLeave={e => { (e.target as HTMLButtonElement).style.background = '#1a1a2e' }}
            >
              {profileForm.formState.isSubmitting ? 'Saving…' : 'Save changes'}
            </button>
          </form>
        </div>
      )}

      {/* ── Password section ── */}
      {activeSection === 'password' && (
        <div className="bg-white border border-gray-100 rounded-2xl p-6">
          <h3 className="text-sm font-semibold text-gray-700 mb-5">Change password</h3>

          <form onSubmit={passwordForm.handleSubmit(onPasswordSubmit)} noValidate className="space-y-4">
            {(['currentPassword', 'newPassword', 'confirmNewPassword'] as const).map((field) => {
              const labels: Record<typeof field, string> = {
                currentPassword:    'Current password',
                newPassword:        'New password',
                confirmNewPassword: 'Confirm new password',
              }
              return (
                <div key={field}>
                  <label className="block text-xs font-medium text-gray-700 mb-1.5">{labels[field]}</label>
                  <input
                    type="password"
                    placeholder="••••••••"
                    {...passwordForm.register(field)}
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none transition-all"
                    onFocus={e => Object.assign(e.target.style, focusStyle)}
                    onBlur={e => Object.assign(e.target.style, blurStyle)}
                  />
                  {passwordForm.formState.errors[field] && (
                    <p className="text-xs text-red-500 mt-1">{passwordForm.formState.errors[field]?.message}</p>
                  )}
                </div>
              )
            })}

            {passwordSuccess && (
              <div className="flex items-center gap-2 bg-green-50 border border-green-200 rounded-xl px-4 py-3">
                <CheckCircle className="w-4 h-4 text-green-500 shrink-0" />
                <p className="text-xs text-green-600">Password updated successfully</p>
              </div>
            )}

            <button
              type="submit"
              disabled={passwordForm.formState.isSubmitting}
              className="w-full text-white rounded-xl py-2.5 text-sm font-semibold transition-colors disabled:opacity-60"
              style={{ background: '#1a1a2e' }}
              onMouseEnter={e => { if (!passwordForm.formState.isSubmitting) (e.target as HTMLButtonElement).style.background = '#252540' }}
              onMouseLeave={e => { (e.target as HTMLButtonElement).style.background = '#1a1a2e' }}
            >
              {passwordForm.formState.isSubmitting ? 'Updating…' : 'Update password'}
            </button>
          </form>
        </div>
      )}

      {/* ── Notifications section ── */}
      {activeSection === 'notifications' && (
        <div className="bg-white border border-gray-100 rounded-2xl p-6 space-y-1">
          <h3 className="text-sm font-semibold text-gray-700 mb-5">Notification preferences</h3>

          {(Object.entries(notifications) as [keyof typeof notifications, boolean][]).map(([key, value]) => {
            const labels: Record<keyof typeof notifications, { title: string; desc: string }> = {
              bookingUpdates: { title: 'Booking updates',    desc: 'Get notified when your booking status changes' },
              newMessages:    { title: 'New messages',       desc: 'Get notified when a designer messages you' },
              promotions:     { title: 'Promotions & offers', desc: 'Receive occasional deals from StyledKraft' },
              reminders:      { title: 'Appointment reminders', desc: 'Reminders before your scheduled fittings' },
            }
            return (
              <div key={key} className="flex items-center justify-between py-3 border-b border-gray-50 last:border-0">
                <div>
                  <p className="text-sm font-medium text-gray-700">{labels[key].title}</p>
                  <p className="text-xs text-gray-400">{labels[key].desc}</p>
                </div>
                <button
                  onClick={() => setNotifications((prev) => ({ ...prev, [key]: !prev[key] }))}
                  className="w-10 h-5 rounded-full transition-all relative shrink-0 ml-4"
                  style={{ background: value ? '#FF6500' : '#e5e7eb' }}
                  aria-label={`Toggle ${labels[key].title}`}
                >
                  <span
                    className="absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-all"
                    style={{ left: value ? '22px' : '2px' }}
                  />
                </button>
              </div>
            )
          })}

          {/* Danger zone */}
          <div className="pt-6 mt-2">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">Danger zone</p>
            <button className="flex items-center gap-2 text-sm font-medium text-red-400 hover:text-red-600 transition-colors">
              <Trash2 className="w-4 h-4" />
              Delete my account
            </button>
          </div>
        </div>
      )}
    </div>
  )
}