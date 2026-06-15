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