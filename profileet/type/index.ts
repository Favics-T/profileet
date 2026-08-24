export interface DesignerProfile {
  fullName: string
  specialty: string
  location: string
  bio: string
  phone: string
  yearsOfExperience: number
  avatar: string | null
}

export type InquiryStatus = 'New' | 'Replied' | 'Booked'

export interface Inquiry {
  id: string
  client: string
  service: string
  date: string
  status: InquiryStatus
  message: string
}

export type AdminRole = 'super_admin' | 'profile_manager' | 'support_agent' | 'auditor'

export interface AdminUser {
  email: string
  role: AdminRole
  name: string
}

export interface DesignerNote {
  id: string
  author: string
  role: AdminRole
  content: string
  createdAt: string
}

export interface MockDesigner {
  id: string
  name: string
  email: string
  specialty: string
  location: string
  status: 'Pending' | 'Verified' | 'Active' | 'Suspended' | 'Rejected'
  joined: string
  bio: string
  phone: string
  yearsOfExperience: number
  inquiries: number
  bookings: number
  notes: DesignerNote[]
}

export type User = {
  email: string
  role: 'designer' | 'client'
}

export type DayStatus = 'open' | 'busy' | 'off'