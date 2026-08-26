export interface ArtisanLite {
  id: string
  artisanId: string
  fullName: string
  specialty: string
  location: string
  styles: string[]
  avatar: string | null
}

export interface BookingFormState {
  serviceType: string
  preferredDate: string
  quantity: number
  phone: string
  urgent: boolean
  description: string
  photos: string[]
  wantsConsultation: boolean
}

export const EMPTY_BOOKING_FORM: BookingFormState = {
  serviceType: '',
  preferredDate: '',
  quantity: 1,
  phone: '',
  urgent: false,
  description: '',
  photos: [],
  wantsConsultation: false,
}
