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

export interface NewBookingPayload {
  client: string
  clientPhone?: string
  service: string
  occasion: string
  deliveryDate: string
  quantity?: number
  urgent?: boolean
  price: number
  depositAmount: number
  designNotes?: string
  fabrics?: string[]
  colors?: string[]
  inspirationRef?: string
  measurements?: Measurement
  consultation?: Consultation
}
export interface BookingContextType {
  bookings: BookingRequest[]
  filtered: BookingRequest[]
  activeTab: BookingStatus | 'all'
  setActiveTab: (tab: BookingStatus | 'all') => void
  search: string
  setSearch: (value: string) => void
  selected: BookingRequest | null
  setSelected: (booking: BookingRequest | null) => void
  confirmAction: { id: string; action: 'accept' | 'cancel' | 'complete' } | null
  setConfirmAction: (action: { id: string; action: 'accept' | 'cancel' | 'complete' } | null) => void
  paymentModal: BookingRequest | null
  setPaymentModal: (booking: BookingRequest | null) => void
  applyAction: (id: string, action: 'accept' | 'cancel' | 'complete') => void
  confirmConsult: (id: string) => void
  markDepositPaid: (id: string) => void
    addBooking: (data: NewBookingPayload) => Promise<void>
  
  deleteBooking: (id: string) => Promise<void>
  counts: Record<BookingStatus, number>
  pendingCount: number
  isLoading: boolean
  error: string | null
}