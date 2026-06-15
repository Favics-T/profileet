import Link from 'next/link'
import { PlusCircle, ChevronLeft } from 'lucide-react'

export default function NewPortfolioPage() {
  return (
    <main className="min-h-screen bg-[#faf8f5] px-4 py-10 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl space-y-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.35em] text-gray-400">
              Dashboard / Portfolio / New
            </p>
            <h1 className="mt-3 text-3xl font-bold text-[#422a15]">Add a new portfolio piece</h1>
            <p className="mt-2 max-w-2xl text-sm text-gray-600">
              Upload a new project to show clients your latest work and strengthen your profile.
            </p>
          </div>
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 rounded-2xl border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-[#422a15] shadow-sm transition hover:bg-amber-50"
          >
            <ChevronLeft className="h-4 w-4" /> Back to dashboard
          </Link>
        </div>

        <section className="rounded-[32px] border border-gray-100 bg-white p-8 shadow-sm">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-xl font-semibold text-[#422a15]">Portfolio submission</h2>
              <p className="mt-2 text-sm text-gray-600">
                Provide a title, description, and upload images that showcase your craftsmanship.
              </p>
            </div>
            <div className="inline-flex items-center gap-2 rounded-3xl bg-amber-50 px-4 py-2 text-sm font-semibold text-[#422a15]">
              <PlusCircle className="h-4 w-4" /> Ready to add
            </div>
          </div>

          <div className="mt-8 grid gap-5">
            <div className="rounded-3xl border border-dashed border-gray-200 bg-[#faf8f5] p-8 text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-white shadow-sm">
                <PlusCircle className="h-7 w-7 text-amber-600" />
              </div>
              <h3 className="mt-6 text-lg font-semibold text-[#422a15]">Upload sample images</h3>
              <p className="mt-2 text-sm text-gray-600">
                Add up to 6 high-quality images to make your portfolio stand out.
              </p>
            </div>
            <div className="rounded-3xl border border-gray-200 bg-[#faf8f5] p-6">
              <h3 className="text-base font-semibold text-[#422a15]">What's included</h3>
              <ul className="mt-4 space-y-3 text-sm text-gray-600">
                <li>• High-resolution visuals of your finished work</li>
                <li>• Short description of the project and client needs</li>
                <li>• Service category and location details</li>
              </ul>
            </div>
          </div>
        </section>
      </div>
    </main>
  )
}
