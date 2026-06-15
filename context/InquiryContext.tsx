'use client'

import { createContext, useContext, useState, ReactNode } from 'react'
import { Inquiry, InquiryStatus } from '@/type/index'

interface InquiryContextType {
  inquiries: Inquiry[]
  filtered: Inquiry[]
  filterStatus: InquiryStatus | 'All'
  setFilterStatus: (status: InquiryStatus | 'All') => void
  updateStatus: (id: string, status: InquiryStatus) => void
}

const defaultInquiries: Inquiry[] = [
  {
    id: '1',
    client: 'Amara Obi',
    service: 'Bridal gown & 2 asoebi',
    date: 'Jun 10',
    status: 'New',
    message: 'Hi, I need a bridal gown and 2 asoebi dresses for my wedding in August. Can we discuss pricing?',
  },
  {
    id: '2',
    client: 'Funke Adeyemi',
    service: 'Corporate blazer set',
    date: 'Jun 9',
    status: 'Replied',
    message: 'I would like a corporate blazer set in navy blue. Size 12. What is your turnaround time?',
  },
  {
    id: '3',
    client: 'Chisom Eze',
    service: 'Ankara two-piece',
    date: 'Jun 8',
    status: 'Booked',
    message: 'Please I want an Ankara two-piece for a naming ceremony. I have the fabric already.',
  },
  {
    id: '4',
    client: 'Tola Bello',
    service: 'Kaftan for husband',
    date: 'Jun 7',
    status: 'Replied',
    message: 'I want to order a kaftan for my husband. He is a size XL. What fabrics do you work with?',
  },
  {
    id: '5',
    client: 'Ngozi Uche',
    service: 'Ball gown for dinner',
    date: 'Jun 6',
    status: 'New',
    message: 'I have a black tie dinner in July and need a stunning ball gown. Budget is flexible.',
  },
]

const InquiryContext = createContext<InquiryContextType | null>(null)

export function InquiryProvider({ children }: { children: ReactNode }) {
  const [inquiries, setInquiries] = useState<Inquiry[]>(defaultInquiries)
  const [filterStatus, setFilterStatus] = useState<InquiryStatus | 'All'>('All')

  const filtered = filterStatus === 'All'
    ? inquiries
    : inquiries.filter((i) => i.status === filterStatus)

  function updateStatus(id: string, status: InquiryStatus) {
    setInquiries((prev) =>
      prev.map((i) => (i.id === id ? { ...i, status } : i))
    )
  }

  return (
    <InquiryContext.Provider value={{ inquiries, filtered, filterStatus, setFilterStatus, updateStatus }}>
      {children}
    </InquiryContext.Provider>
  )
}

export function useInquiry() {
  const ctx = useContext(InquiryContext)
  if (!ctx) throw new Error('useInquiry must be used within InquiryProvider')
  return ctx
}