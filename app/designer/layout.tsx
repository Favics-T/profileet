import { ProfileProvider } from '@/context/ProfileContext'

export default function DesignerLayout({ children }: { children: React.ReactNode }) {
  return (
    <ProfileProvider>
      {children}
    </ProfileProvider>
  )
}
