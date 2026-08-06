import { ProfileProvider } from '@/context/ProfileContext'
import { PortfolioProvider } from '@/context/PortfolioContext'
import { ReviewProvider } from '@/context/ReviewContext'

export default function DesignerLayout({ children }: { children: React.ReactNode }) {
  return (
    <ProfileProvider>
      <PortfolioProvider>
        <ReviewProvider>
          {children}
        </ReviewProvider>
      </PortfolioProvider>
    </ProfileProvider>
  )
}
