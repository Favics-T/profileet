import { ProfileProvider } from '@/context/ProfileContext'
import { InquiryProvider } from '@/context/InquiryContext'
import { SidebarProvider } from '@/context/SidebarContext'
import ArtisanSidebar from '@/components/dashboard/ArtisanSidebar'
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
                <div className="flex min-h-screen bg-brand-light">
                  <ArtisanSidebar />
                  <div className="flex min-w-0 flex-1 flex-col">
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
