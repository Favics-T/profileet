'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { DesignerProfile } from '@/type/index'
import { authHeader } from '@/lib/auth'

interface ProfileContextType {
  profile: DesignerProfile
  updateProfile: (data: Partial<DesignerProfile>) => Promise<void>
  completionPct: number
  incompleteFields: string[]
  isLoading: boolean
  error: string | null
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
  { key: 'fullName',          label: 'Full name' },
  { key: 'avatar',            label: 'Profile photo' },
  { key: 'specialty',         label: 'Specialty' },
  { key: 'location',          label: 'Location' },
  { key: 'bio',               label: 'Bio' },
  { key: 'phone',             label: 'Phone number' },
  { key: 'yearsOfExperience', label: 'Years of experience' },
]

const STORAGE_KEY = 'styledkraft_designer_profile'
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'

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
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

   useEffect(() => {
    async function fetchProfile() {
      try {
        setIsLoading(true)
        setError(null)
        const res = await fetch(`${API_URL}/profile`, {
          headers: { ...authHeader() },
        })
        if (!res.ok) throw new Error(`Failed to load profile (${res.status})`)
        const data = await res.json()

        
        const loaded: DesignerProfile = {
          fullName:          data.fullName          ?? '',
          specialty:         data.specialty         ?? '',
          location:          data.location          ?? '',
          bio:               data.bio               ?? '',
          phone:             data.phone             ?? '',
          yearsOfExperience: data.yearsOfExperience ?? 0,
          avatar:            data.avatar            ?? null,
        }

        setProfile(loaded)
                try { localStorage.setItem(STORAGE_KEY, JSON.stringify(loaded)) } 
                catch { /* ignore */ }
      } catch (err) {
       
        try {
          const stored = localStorage.getItem(STORAGE_KEY)
          if (stored) setProfile({ ...defaultProfile, ...JSON.parse(stored) })
        } catch { /* ignore */ }
        setError(err instanceof Error ? err.message : 'Could not load profile')
      } finally {
        setIsLoading(false)
      }
    }
    fetchProfile()
  }, [])

  
  async function updateProfile(data: Partial<DesignerProfile>) {
    
    const previous = profile
    const next = { ...profile, ...data }
    setProfile(next)
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(next)) } catch { /* ignore */ }

    try {
      const res = await fetch(`${API_URL}/profile`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', ...authHeader() },
        body: JSON.stringify(data),
      })
      if (!res.ok) throw new Error(`Failed to save profile (${res.status})`)
      const saved = await res.json()
      
      setProfile({
        fullName:          saved.fullName          ?? '',
        specialty:         saved.specialty         ?? '',
        location:          saved.location          ?? '',
        bio:               saved.bio               ?? '',
        phone:             saved.phone             ?? '',
        yearsOfExperience: saved.yearsOfExperience ?? 0,
        avatar:            saved.avatar            ?? null,
      })
    } catch (err) {
            setProfile(previous)
      try { localStorage.setItem(STORAGE_KEY, JSON.stringify(previous)) } catch { /* ignore */ }
      setError(err instanceof Error ? err.message : 'Failed to save profile')
      throw err
    }
  }

  const { completionPct, incompleteFields } = getCompletionData(profile)

  return (
    <ProfileContext.Provider value={{ profile, updateProfile, completionPct, incompleteFields, isLoading, error }}>
      {children}
    </ProfileContext.Provider>
  )
}

export function useProfile() {
  const ctx = useContext(ProfileContext)
  if (!ctx) throw new Error('useProfile must be used within ProfileProvider')
  return ctx
}