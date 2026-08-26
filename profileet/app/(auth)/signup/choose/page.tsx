import Link from 'next/link'
import { ArrowRight, Gem, Search, Wrench } from 'lucide-react'
import Card from '@/component/ui/Card'

const CLIENT_SIGNUP_HREF = '/signup/client'
const ARTISAN_SIGNUP_HREF = '/signup/artisan'

export default function ChooseRolePage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-brand-light px-4 py-16">
      <div className="flex flex-col items-center">
        <Gem className="h-8 w-8 text-brand-dark" />
        <span className="mt-2 text-xl font-bold text-brand-dark">ArtisanLink</span>
      </div>

      <h1 className="mt-10 text-center text-4xl font-bold text-brand-dark">How do you want to join?</h1>
      <p className="mt-4 max-w-md text-center text-sm text-brand-dark/60">
        Select your path to continue creating your account. You can always switch later in your settings.
      </p>

      <div className="mt-12 grid w-full max-w-3xl grid-cols-1 gap-6 sm:grid-cols-2">
        <Link href={CLIENT_SIGNUP_HREF} className="block">
          <Card
            variant="light"
            className="flex h-full flex-col items-center text-center transition-all duration-200 hover:-translate-y-0.5 hover:border-accent-gold hover:shadow-md"
          >
            <span className="flex h-16 w-16 items-center justify-center rounded-full bg-text-muted/20">
              <Search className="h-6 w-6 text-brand-dark" />
            </span>
            <h2 className="mt-5 text-lg font-semibold text-brand-dark">Find Artisans</h2>
            <p className="mt-2 text-sm text-brand-dark/60">Discover trusted artisans near you.</p>
            <span className="mt-5 inline-flex items-center gap-1.5 text-sm font-semibold text-accent-gold">
              Join as a Client
              <ArrowRight className="h-4 w-4" />
            </span>
          </Card>
        </Link>

        <Link href={ARTISAN_SIGNUP_HREF} className="block">
          <Card
            variant="light"
            className="flex h-full flex-col items-center text-center transition-all duration-200 hover:-translate-y-0.5 hover:border-accent-gold hover:shadow-md"
          >
            <span className="flex h-16 w-16 items-center justify-center rounded-full bg-accent-gold/15">
              <Wrench className="h-6 w-6 text-accent-gold" />
            </span>
            <h2 className="mt-5 text-lg font-semibold text-brand-dark">Offer Your Services</h2>
            <p className="mt-2 text-sm text-brand-dark/60">Grow your business by reaching new clients.</p>
            <span className="mt-5 inline-flex items-center gap-1.5 text-sm font-semibold text-accent-gold">
              Join as an Artisan
              <ArrowRight className="h-4 w-4" />
            </span>
          </Card>
        </Link>
      </div>

      <p className="mt-10 text-sm text-brand-dark/60">
        Already have an account?{' '}
        <Link href="/login" className="font-semibold text-accent-gold">
          Log In
        </Link>
      </p>
    </main>
  )
}
