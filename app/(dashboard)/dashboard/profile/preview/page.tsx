'use client'

import { useProfile } from '@/context/ProfileContext'
import { useRouter } from 'next/navigation'
import {
  Scissors, ArrowLeft, MapPin, Star, Briefcase,
  MessageSquare, Heart, Share2, CheckCircle
} from 'lucide-react'

const mockPortfolio = [
  { id: '1', title: 'Bridal Collection', category: 'Bridal', color: 'bg-amber-100' },
  { id: '2', title: 'Corporate Set', category: 'Corporate', color: 'bg-blue-100' },
  { id: '3', title: 'Ankara Fusion', category: 'Casual', color: 'bg-green-100' },
  { id: '4', title: 'Evening Gown', category: 'Eveningwear', color: 'bg-purple-100' },
  { id: '5', title: 'Kaftan Series', category: 'Traditional', color: 'bg-rose-100' },
  { id: '6', title: 'Aso-ebi Set', category: 'Traditional', color: 'bg-orange-100' },
]

const mockReviews = [
  {
    id: '1',
    client: 'Amara Obi',
    rating: 5,
    comment: 'Absolutely stunning work. My bridal gown was everything I dreamed of and more.',
    date: 'May 2025',
  },
  {
    id: '2',
    client: 'Funke Adeyemi',
    rating: 5,
    comment: 'Very professional and delivered on time. The blazer set was perfect for my presentation.',
    date: 'Apr 2025',
  },
  {
    id: '3',
    client: 'Chisom Eze',
    rating: 4,
    comment: 'Great quality and attention to detail. Would definitely book again.',
    date: 'Mar 2025',
  },
]

export default function ProfilePreviewPage() {
  const { profile, completionPct } = useProfile()
  const router = useRouter()

  const displayName = profile.fullName || 'Your Name'
  const displaySpecialty = profile.specialty || 'Your Specialty'
  const displayLocation = profile.location || 'Your Location'
  const displayBio = profile.bio || 'Your bio will appear here once you complete your profile.'
  const displayYears = profile.yearsOfExperience || 0

  return (
    <main className="min-h-screen bg-[#faf8f5]">

      {/* Nav */}
      <header className="px-5 sm:px-10 py-5 flex items-center justify-between border-b border-gray-100 bg-white sticky top-0 z-10">
        <div className="flex items-center gap-2">
          <Scissors className="w-5 h-5 text-amber-600" />
          <span className="font-bold text-xl text-[#422a15]">StyledKraft</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs text-amber-600 font-medium bg-amber-50 px-3 py-1 rounded-full border border-amber-200">
            Preview mode
          </span>
          <button
            onClick={() => router.push('/dashboard/profile')}
            className="flex items-center gap-2 text-sm text-[#422a15] hover:text-amber-600 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Edit Profile
          </button>
        </div>
      </header>

      {/* Incomplete profile warning */}
      {completionPct < 100 && (
        <div className="bg-amber-50 border-b border-amber-200 px-5 sm:px-10 py-3 flex items-center justify-between">
          <p className="text-xs text-amber-700 font-medium">
            Your profile is {completionPct}% complete — clients see a stronger profile when all fields are filled.
          </p>
          <button
            onClick={() => router.push('/dashboard/profile')}
            className="text-xs text-amber-700 font-semibold underline ml-4 flex-shrink-0"
          >
            Complete now
          </button>
        </div>
      )}

      <div className="max-w-3xl mx-auto px-4 py-8 space-y-6">

        {/* Hero card */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">

          {/* Cover */}
          <div className="h-32 bg-gradient-to-r from-amber-400 to-amber-600" />

          {/* Profile info */}
          <div className="px-6 pb-6">
            <div className="flex items-end justify-between -mt-10 mb-4">
              <div className="w-20 h-20 rounded-2xl bg-white border-4 border-white shadow-md flex items-center justify-center text-3xl font-bold text-[#422a15] bg-amber-100">
                {displayName[0].toUpperCase()}
              </div>
              <div className="flex items-center gap-2 mt-12">
                <button className="p-2 rounded-xl border border-gray-200 hover:bg-gray-50 transition-colors">
                  <Share2 className="w-4 h-4 text-gray-500" />
                </button>
                <button className="p-2 rounded-xl border border-gray-200 hover:bg-gray-50 transition-colors">
                  <Heart className="w-4 h-4 text-gray-500" />
                </button>
              </div>
            </div>

            <div className="flex items-start justify-between flex-wrap gap-3">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <h1 className="text-xl font-bold text-[#422a15]">{displayName}</h1>
                  <CheckCircle className="w-4 h-4 text-amber-500 flex-shrink-0" />
                </div>
                <p className="text-sm text-amber-600 font-medium mb-2">{displaySpecialty}</p>
                <div className="flex items-center gap-4 text-xs text-gray-500">
                  {displayLocation && (
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5" />
                      {displayLocation}
                    </span>
                  )}
                  <span className="flex items-center gap-1">
                    <Briefcase className="w-3.5 h-3.5" />
                    {displayYears} years experience
                  </span>
                  <span className="flex items-center gap-1">
                    <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                    4.8 (24 reviews)
                  </span>
                </div>
              </div>

              <button className="bg-[#422a15] text-white px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-[#5a3a20] transition-colors flex items-center gap-2">
                <MessageSquare className="w-4 h-4" />
                Send Inquiry
              </button>
            </div>
          </div>
        </div>

        {/* Bio */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <h2 className="font-semibold text-[#422a15] mb-3">About</h2>
          <p className="text-sm text-gray-600 leading-relaxed">{displayBio}</p>
        </div>

        {/* Portfolio */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-[#422a15]">Portfolio</h2>
            <span className="text-xs text-gray-400">{mockPortfolio.length} pieces</span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {mockPortfolio.map(({ id, title, category, color }) => (
              <div
                key={id}
                className={`${color} rounded-xl aspect-square flex flex-col items-center justify-center p-3 cursor-pointer hover:opacity-90 transition-opacity`}
              >
                <p className="text-xs font-semibold text-gray-700 text-center">{title}</p>
                <p className="text-xs text-gray-500 mt-1">{category}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Reviews */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-[#422a15]">Reviews</h2>
            <div className="flex items-center gap-1">
              <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
              <span className="text-sm font-semibold text-[#422a15]">4.8</span>
              <span className="text-xs text-gray-400 ml-1">(24)</span>
            </div>
          </div>
          <div className="space-y-4">
            {mockReviews.map(({ id, client, rating, comment, date }) => (
              <div key={id} className="border-b border-gray-50 last:border-0 pb-4 last:pb-0">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-full bg-amber-100 flex items-center justify-center text-xs font-bold text-[#422a15]">
                      {client[0]}
                    </div>
                    <span className="text-sm font-semibold text-gray-800">{client}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    {Array.from({ length: rating }).map((_, i) => (
                      <Star key={i} className="w-3 h-3 text-amber-500 fill-amber-500" />
                    ))}
                    <span className="text-xs text-gray-400 ml-1">{date}</span>
                  </div>
                </div>
                <p className="text-xs text-gray-600 leading-relaxed">{comment}</p>
              </div>
            ))}
          </div>
        </div>

      </div>
    </main>
  )
}