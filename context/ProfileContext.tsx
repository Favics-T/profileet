'use client'

import { createContext, useContext, useState, ReactNode } from 'react'
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

// Fields that count toward profile strength
const TRACKED_FIELDS: { key: keyof DesignerProfile; label: string }[] = [
  { key: 'fullName', label: 'Full name' },
  { key: 'avatar', label: 'Profile photo' },
  { key: 'specialty', label: 'Specialty' },
  { key: 'location', label: 'Location' },
  { key: 'bio', label: 'Bio' },
  { key: 'phone', label: 'Phone number' },
  { key: 'yearsOfExperience', label: 'Years of experience' },
]

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

const ProfileContext = createContext<ProfileContextType | null>(null)

export function ProfileProvider({ children }: { children: ReactNode }) {
  const [profile, setProfile] = useState<DesignerProfile>(defaultProfile)

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