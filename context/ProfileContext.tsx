'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { DesignerProfile } from '@/type/index'

interface ProfileContextType {
  profile: DesignerProfile
  updateProfile: (data: Partial<DesignerProfile>) => void
  completionPct: number
  incompleteFields: string[]
}

const defaultProfile: DesignerProfile = {
  fullName: '',
  specialty: '',
  location: '',
  bio: '',
  phone: '',
  yearsOfExperience: 0,
  avatar: null,
}

const TRACKED_FIELDS: { key: keyof DesignerProfile; label: string }[] = [
  { key: 'fullName', label: 'Full name' },
  { key: 'avatar', label: 'Profile photo' },
  { key: 'specialty', label: 'Specialty' },
  { key: 'location', label: 'Location' },
  { key: 'bio', label: 'Bio' },
  { key: 'phone', label: 'Phone number' },
  { key: 'yearsOfExperience', label: 'Years of experience' },
]

const STORAGE_KEY = 'styledkraft_designer_profile'

function getCompletionData(profile: DesignerProfile) {
  const incomplete = TRACKED_FIELDS.filter(({ key }) => {
    const val = profile[key]
    return val === '' || val === null || val === 0
  })

  const completionPct = Math.round(
    ((TRACKED_FIELDS.length - incomplete.length) / TRACKED_FIELDS.length) * 100
  )

  return {
    completionPct,
    incompleteFields: incomplete.map((f) => f.label),
  }
}

function loadProfile(): DesignerProfile {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) return { ...defaultProfile, ...JSON.parse(stored) }
  } catch {
    // localStorage unavailable or corrupted
  }
  return defaultProfile
}

const ProfileContext = createContext<ProfileContextType | null>(null)

export function ProfileProvider({ children }: { children: ReactNode }) {
  const [profile, setProfile] = useState<DesignerProfile>(defaultProfile)
  const [hydrated, setHydrated] = useState(false)

  // Load from localStorage on mount
  useEffect(() => {
    setProfile(loadProfile())
    setHydrated(true)
  }, [])

  // Save to localStorage whenever profile changes
  useEffect(() => {
    if (!hydrated) return
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(profile))
    } catch {
      // localStorage unavailable
    }
  }, [profile, hydrated])

  function updateProfile(data: Partial<DesignerProfile>) {
    setProfile((prev) => ({ ...prev, ...data }))
  }

  const { completionPct, incompleteFields } = getCompletionData(profile)

  return (
    <ProfileContext.Provider value={{ profile, updateProfile, completionPct, incompleteFields }}>
      {children}
    </ProfileContext.Provider>
  )
}

export function useProfile() {
  const ctx = useContext(ProfileContext)
  if (!ctx) throw new Error('useProfile must be used within ProfileProvider')
  return ctx
}