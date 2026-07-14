import { ProfileProvider } from '@/context/ProfileContext'
import { InquiryProvider } from '@/context/InquiryContext'
import { SidebarProvider } from '@/context/SidebarContext'
import DashboardSidebar from '@/components/dashboard/Sidebar'
import { BookingProvider } from '@/context/BookingContext';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <ProfileProvider>
      <BookingProvider>
      <InquiryProvider>
        <SidebarProvider>
          <div className="min-h-screen bg-gray-50 flex">
            <DashboardSidebar />
            <div className="flex-1 lg:ml-64 min-w-0 flex flex-col">
              {children}
            </div>
          </div>
        </SidebarProvider>
      </InquiryProvider>
      </BookingProvider>
    </ProfileProvider>
  )
}
