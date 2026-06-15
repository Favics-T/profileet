import { ProfileProvider } from '@/context/ProfileContext'
import { InquiryProvider } from '@/context/InquiryContext'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ProfileProvider>
      <InquiryProvider>
        {children}
      </InquiryProvider>
    </ProfileProvider>
  )
}