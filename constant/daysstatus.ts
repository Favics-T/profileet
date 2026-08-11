import { DayStatus } from '@/type/index'


export const DAY_STATUS: Record<DayStatus, { label: string; bg: string; text: string; border: string }> = {
  open: { label: 'Available',    bg: 'bg-green-100',  text: 'text-green-700', border: 'border-green-300' },
  busy: { label: 'Fully Booked', bg: 'bg-red-100',    text: 'text-red-600',   border: 'border-red-300' },
  off:  { label: 'Day Off',      bg: 'bg-gray-100',   text: 'text-gray-500',  border: 'border-gray-300' },
}
