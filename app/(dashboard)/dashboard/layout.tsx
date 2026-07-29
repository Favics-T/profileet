import { ProfileProvider } from '@/context/ProfileContext'
import { InquiryProvider } from '@/context/InquiryContext'
import { SidebarProvider } from '@/context/SidebarContext'
import DashboardSidebar from '@/components/dashboard/Sidebar'
import { BookingProvider } from '@/context/BookingContext'
import { ReviewProvider } from '@/context/ReviewContext'
import { PortfolioProvider } from '@/context/PortfolioContext'

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <ProfileProvider>
      <BookingProvider>
        <InquiryProvider>
          <ReviewProvider>
            <PortfolioProvider>
              <SidebarProvider>
                <div className="min-h-screen bg-gray-50 flex">
                  <DashboardSidebar />
                  <div className="flex-1 lg:ml-64 min-w-0 flex flex-col">
                    {children}
                  </div>
                </div>
              </SidebarProvider>
            </PortfolioProvider>
          </ReviewProvider>
        </InquiryProvider>
      </BookingProvider>
    </ProfileProvider>
  )
}
