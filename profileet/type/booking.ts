export type BookingStatus = 'pending' | 'accepted' | 'in_progress' | 'completed' | 'cancelled'

export interface Measurement {
  chest?: string; 
  waist?: string;
   hips?: string;
    shoulder?: string
  sleeveLength?: string;
   dressLength?: string;
    height?: string; 
    weight?: string
}

export interface Consultation {
  requested: boolean
  date?: string; time?: string; note?: string
  status: 'pending' | 'confirmed' | 'done' | 'none'
}

export interface BookingRequest {
  id: string
  client: string
  initials: string
  clientColor: string
  clientPhone?: string
  service: string
  occasion: string
  deliveryDate: string
  quantity: number
  urgent: boolean
  status: BookingStatus
  receivedAt: string
  price: number
  depositPaid: boolean
  depositAmount: number
  designNotes: string
  fabrics: string[]
  colors: string[]
  inspirationRef?: string
  measurements: Measurement
  consultation: Consultation
}