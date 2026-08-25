import { ReactNode } from 'react'
import { Handshake } from 'lucide-react'

interface SplitAuthLayoutProps {
  children: ReactNode
  logo?: ReactNode
  brandName?: string
  illustration?: ReactNode
  tagline?: string
  subtext?: string
}

export default function SplitAuthLayout({
  children,
  logo,
  brandName = 'ArtisanLink',
  illustration,
  tagline = 'Connecting craft to community.',
  subtext = 'Discover trusted local professionals for your next high-quality service need.',
}: SplitAuthLayoutProps) {
  return (
    <div className="flex min-h-screen flex-col lg:flex-row bg-brand-light">
      <div className="relative flex flex-col justify-between gap-10 bg-brand-dark px-8 py-8 text-brand-light lg:w-1/2 lg:px-16 lg:py-12">
        <div className="flex items-center gap-2">
          {logo ?? <Handshake className="h-7 w-7" />}
          <span className="text-lg font-semibold tracking-wide">{brandName}</span>
        </div>

        {illustration && <div className="flex flex-1 items-center justify-center">{illustration}</div>}

        <div className="max-w-md">
          <h2 className="mb-2 text-xl font-semibold">{tagline}</h2>
          <p className="text-sm text-text-muted">{subtext}</p>
        </div>
      </div>

      <div className="flex flex-1 items-center justify-center px-4 py-10 lg:py-16">{children}</div>
    </div>
  )
}
