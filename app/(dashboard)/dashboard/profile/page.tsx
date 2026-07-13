'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { useProfile } from '@/context/ProfileContext'
import { useSidebar } from '@/context/SidebarContext'
import { useAuth } from '@/context/AuthContext'
import {
  User, MapPin,  Sparkles, BookOpen, Clock,
  CheckCircle, Menu, Shield, Bell, Settings, Upload,
  ChevronRight, X,
} from 'lucide-react'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

const profileSchema = z.object({
  fullName:          z.string().min(2, 'Full name must be at least 2 characters'),
  specialty:         z.string().min(2, 'Please enter your specialty'),
  location:          z.string().min(2, 'Please enter your location'),
  bio:               z.string().min(20, 'Bio must be at least 20 characters'),
  phone:             z.string().min(10, 'Please enter a valid phone number'),
  yearsOfExperience: z.coerce.number().min(0).max(50),
})

type ProfileFormValues = z.infer<typeof profileSchema>

type Section = 'account' | 'professional' | 'about' | 'security' | 'notifications'

const NAV_ITEMS: { key: Section; label: string; icon: React.FC<{ className?: string }> }[] = [
  { key: 'account',       label: 'Account',       icon: User },
  { key: 'professional',  label: 'Professional',  icon: Sparkles },
  { key: 'about',         label: 'About',         icon: BookOpen },
  { key: 'security',      label: 'Security',      icon: Shield },
  { key: 'notifications', label: 'Notifications', icon: Bell },
]

function FieldRow({
  label,
  children,
}: {
  label: string
  children: React.ReactNode
}) {
  return (
    <div className="flex items-start gap-6 py-4 border-b border-gray-50 last:border-0">
      <span className="w-36 shrink-0 text-sm text-gray-400 pt-2.5 leading-none">{label}</span>
      <div className="flex-1 min-w-0">{children}</div>
    </div>
  )
}

export default function EditProfilePage() {
  const { profile, updateProfile, completionPct } = useProfile()
  const { user } = useAuth()
  const { toggle } = useSidebar()
  const router = useRouter()
  const [saved, setSaved] = useState(false)
  const [activeSection, setActiveSection] = useState<Section>('account')

  const { register, handleSubmit, formState: { errors, isSubmitting } } =
    useForm<z.input<typeof profileSchema>, unknown, ProfileFormValues>({
      resolver: zodResolver(profileSchema),
      defaultValues: {
        fullName:          profile.fullName,
        specialty:         profile.specialty,
        location:          profile.location,
        bio:               profile.bio,
        phone:             profile.phone,
        yearsOfExperience: profile.yearsOfExperience,
      },
    })

  const onSubmit = async (data: ProfileFormValues) => {
    await new Promise(r => setTimeout(r, 600))
    updateProfile(data)
    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
  }

  const displayName = profile.fullName || user?.email?.split('@')[0] || 'Designer'
  const initials = displayName.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase()

  return (
    <>
      {/* Top bar */}
      <header className="bg-white border-b border-gray-100 px-4 sm:px-8 py-4 flex items-center gap-3 sticky top-0 z-10">
        <button onClick={toggle} className="lg:hidden p-2 rounded-xl hover:bg-gray-100 text-gray-600 shrink-0">
          <Menu className="w-5 h-5" />
        </button>
        <div className="flex-1">
          <h1 className="text-base sm:text-lg font-bold text-[#422a15]">Settings</h1>
          <p className="text-xs text-gray-400 hidden sm:block mt-0.5">Manage your account and profile</p>
        </div>
      </header>

      <div className="p-4 sm:p-6 lg:p-8">
        <div className="max-w-3xl mx-auto bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden flex flex-col lg:flex-row gap-4 min-h-[36rem]">

          {/* ── Left settings nav ── */}
          <aside className="w-full lg:w-48 shrink-0 border-b border-gray-100 lg:border-b-0 lg:border-r p-3 flex flex-col gap-0.5">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider px-3 pt-2 pb-3">Settings</p>
            {NAV_ITEMS.map(({ key, label, icon: Icon }) => {
              const isActive = activeSection === key
              return (
                <button
                  key={key}
                  onClick={() => setActiveSection(key)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all text-left ${
                    isActive ? 'bg-gray-100 text-[#422a15]' : 'text-gray-400 hover:bg-gray-50 hover:text-gray-700'
                  }`}
                >
                  <span className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 transition-all ${
                    isActive ? 'bg-[#1a1a2e] text-white' : 'bg-transparent'
                  }`}>
                    <Icon className="w-3.5 h-3.5" />
                  </span>
                  {label}
                </button>
              )
            })}
          </aside>

          {/* ── Main content ── */}
          <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex-1 flex flex-col min-w-0">
            {/* Content header */}
            <div className="flex items-center justify-between px-7 pt-6 pb-5 border-b border-gray-100">
              <h2 className="text-base font-bold text-gray-900 capitalize">{activeSection}</h2>
              <button
                type="button"
                onClick={() => router.push('/dashboard')}
                className="w-7 h-7 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors"
              >
                <X className="w-3.5 h-3.5 text-gray-500" />
              </button>
            </div>

            {/* Scrollable fields */}
            <div className="flex-1 px-7 py-2 overflow-y-auto">

              {/* ── ACCOUNT ── */}
              {activeSection === 'account' && (
                <div>
                  {/* Display picture */}
                  <FieldRow label="Display Picture">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-full bg-linear-to-br from-amber-400 to-[#FF6500] flex items-center justify-center text-white font-bold text-base shrink-0">
                        {initials}
                      </div>
                      <button
                        type="button"
                        className="text-sm font-medium text-gray-600 hover:text-[#FF6500] flex items-center gap-1.5 transition-colors"
                      >
                        <Upload className="w-3.5 h-3.5" /> Upload
                      </button>
                    </div>
                  </FieldRow>

                  {/* Full name */}
                  <FieldRow label="Full Name">
                    <input
                      type="text"
                      placeholder="e.g. Amara Okafor"
                      {...register('fullName')}
                      className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-[#422a15] focus:ring-2 focus:ring-[#422a15]/8 transition-all bg-white"
                    />
                    {errors.fullName && <p className="text-xs text-red-500 mt-1.5">✕ {errors.fullName.message}</p>}
                  </FieldRow>

                  {/* Phone */}
                  <FieldRow label="Phone Number">
                    <div className="flex gap-2">
                      <div className="flex items-center gap-1.5 border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-gray-600 bg-white shrink-0 cursor-default">
                        🇳🇬 <span>+234</span> <ChevronRight className="w-3 h-3 text-gray-400 rotate-90" />
                      </div>
                      <input
                        type="tel"
                        placeholder="08012345678"
                        {...register('phone')}
                        className="flex-1 min-w-0 border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-[#422a15] focus:ring-2 focus:ring-[#422a15]/8 transition-all bg-white"
                      />
                    </div>
                    {errors.phone && <p className="text-xs text-red-500 mt-1.5">✕ {errors.phone.message}</p>}
                  </FieldRow>

                  {/* Location */}
                  <FieldRow label="Location">
                    <div className="relative">
                      <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none" />
                      <input
                        type="text"
                        placeholder="e.g. Lagos, Nigeria"
                        {...register('location')}
                        className="w-full border border-gray-200 rounded-xl pl-9 pr-4 py-2.5 text-sm outline-none focus:border-[#422a15] focus:ring-2 focus:ring-[#422a15]/8 transition-all bg-white"
                      />
                    </div>
                    {errors.location && <p className="text-xs text-red-500 mt-1.5">✕ {errors.location.message}</p>}
                  </FieldRow>

                  {/* Join date — read only */}
                  <FieldRow label="Account Type">
                    <div className="flex items-center justify-between border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-700 bg-white cursor-default">
                      <span>Designer</span>
                      <ChevronRight className="w-3.5 h-3.5 text-gray-400 rotate-90" />
                    </div>
                  </FieldRow>

                  <FieldRow label="Join Date">
                    <p className="text-sm text-gray-500 pt-2.5">June 1, 2026</p>
                  </FieldRow>

                  <FieldRow label="Last Active">
                    <p className="text-sm text-gray-500 pt-2.5">2 hours ago</p>
                  </FieldRow>
                </div>
              )}

              {/* ── PROFESSIONAL ── */}
              {activeSection === 'professional' && (
                <div>
                  <FieldRow label="Specialty">
                    <input
                      type="text"
                      placeholder="e.g. Bridal & Eveningwear"
                      {...register('specialty')}
                      className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-[#422a15] focus:ring-2 focus:ring-[#422a15]/8 transition-all bg-white"
                    />
                    {errors.specialty && <p className="text-xs text-red-500 mt-1.5">✕ {errors.specialty.message}</p>}
                  </FieldRow>

                  <FieldRow label="Experience">
                    <div className="relative">
                      <Clock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none" />
                      <input
                        type="number"
                        placeholder="e.g. 5"
                        {...register('yearsOfExperience')}
                        className="w-full border border-gray-200 rounded-xl pl-9 pr-4 py-2.5 text-sm outline-none focus:border-[#422a15] focus:ring-2 focus:ring-[#422a15]/8 transition-all bg-white"
                      />
                    </div>
                    {errors.yearsOfExperience && <p className="text-xs text-red-500 mt-1.5">✕ {errors.yearsOfExperience.message}</p>}
                    <p className="text-xs text-gray-400 mt-1.5">Years of professional experience</p>
                  </FieldRow>

                  <FieldRow label="Profile Status">
                    <div className="flex items-center justify-between border border-gray-200 rounded-xl px-4 py-2.5 text-sm bg-white cursor-default">
                      <span className="text-gray-700">{completionPct}% complete</span>
                      <div className="flex items-center gap-2">
                        <div className="w-20 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                          <div className="h-full bg-[#FF6500] rounded-full" style={{ width: `${completionPct}%` }} />
                        </div>
                        <ChevronRight className="w-3.5 h-3.5 text-gray-400 rotate-90" />
                      </div>
                    </div>
                  </FieldRow>

                  <FieldRow label="Public Profile">
                    <button
                      type="button"
                      onClick={() => router.push('/designer/preview')}
                      className="flex items-center gap-2 text-sm font-medium text-[#FF6500] hover:underline transition-colors"
                    >
                      View your public page <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </FieldRow>
                </div>
              )}

              {/* ── ABOUT ── */}
              {activeSection === 'about' && (
                <div>
                  <FieldRow label="Bio">
                    <textarea
                      rows={6}
                      placeholder="Tell clients about your style, experience, and what makes your work unique..."
                      {...register('bio')}
                      className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-[#422a15] focus:ring-2 focus:ring-[#422a15]/8 transition-all resize-none font-sans bg-white leading-relaxed"
                    />
                    <p className="text-xs text-gray-400 mt-1.5">Minimum 20 characters · Shown on your public profile</p>
                    {errors.bio && <p className="text-xs text-red-500 mt-1">✕ {errors.bio.message}</p>}
                  </FieldRow>
                </div>
              )}

              {/* ── SECURITY ── */}
              {activeSection === 'security' && (
                <div>
                  <FieldRow label="Password">
                    <button
                      type="button"
                      className="flex items-center gap-2 border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      Change password <ChevronRight className="w-3.5 h-3.5 text-gray-400" />
                    </button>
                  </FieldRow>
                  <FieldRow label="Two-Factor Auth">
                    <div className="flex items-center justify-between border border-gray-200 rounded-xl px-4 py-2.5 text-sm bg-white">
                      <span className="text-gray-500">Not enabled</span>
                      <button type="button" className="text-xs font-semibold text-[#FF6500] hover:underline">Enable</button>
                    </div>
                  </FieldRow>
                  <FieldRow label="Active Sessions">
                    <div className="border border-gray-200 rounded-xl px-4 py-3 text-sm">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-gray-700">Chrome on Windows</p>
                          <p className="text-xs text-gray-400 mt-0.5">Lagos, Nigeria · Current session</p>
                        </div>
                        <span className="w-2 h-2 bg-green-500 rounded-full" />
                      </div>
                    </div>
                  </FieldRow>
                </div>
              )}

              {/* ── NOTIFICATIONS ── */}
              {activeSection === 'notifications' && (
                <div>
                  {[
                    { label: 'New Inquiries',    desc: 'When a client sends a new message', on: true },
                    { label: 'Booking Updates',  desc: 'Accepted, declined, or completed orders', on: true },
                    { label: 'Review Alerts',    desc: 'When a client leaves a review', on: false },
                    { label: 'Payment Received', desc: 'When a deposit is confirmed', on: true },
                    { label: 'Marketing Emails', desc: 'Tips, promotions, and platform news', on: false },
                  ].map(item => (
                    <FieldRow key={item.label} label={item.label}>
                      <div className="flex items-center justify-between">
                        <p className="text-xs text-gray-400">{item.desc}</p>
                        {/* Toggle */}
                        <div className={`w-10 h-6 rounded-full relative cursor-pointer transition-colors shrink-0 ml-4 ${item.on ? 'bg-[#422a15]' : 'bg-gray-200'}`}>
                          <span className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow-sm transition-all ${item.on ? 'left-5' : 'left-1'}`} />
                        </div>
                      </div>
                    </FieldRow>
                  ))}
                </div>
              )}
            </div>

            {/* ── Footer actions ── */}
            <div className="flex items-center justify-between px-7 py-4 border-t border-gray-100 bg-gray-50/50 shrink-0">
              {saved && (
                <span className="flex items-center gap-1.5 text-xs font-medium text-green-600">
                  <CheckCircle className="w-3.5 h-3.5" /> Saved successfully
                </span>
              )}
              {!saved && <span />}
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => router.push('/dashboard')}
                  className="px-5 py-2 rounded-xl text-sm font-semibold text-gray-600 hover:bg-gray-100 transition-colors border border-gray-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || activeSection === 'security' || activeSection === 'notifications'}
                  className="px-5 py-2 rounded-xl text-sm font-semibold text-white bg-[#422a15] hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed transition-all flex items-center gap-2"
                >
                  {isSubmitting ? (
                    <><span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin inline-block" /> Saving…</>
                  ) : 'Save Changes'}
                </button>
              </div>
            </div>
          </form>

        </div>
      </div>
    </>
  )
}
