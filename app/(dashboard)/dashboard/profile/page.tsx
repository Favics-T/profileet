'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { useProfile } from '@/context/ProfileContext'
import { useRouter } from 'next/navigation'
import { Scissors, ArrowLeft, CheckCircle } from 'lucide-react'
import { useState } from 'react'

const profileSchema = z.object({
  fullName: z.string().min(2, 'Full name must be at least 2 characters'),
  specialty: z.string().min(2, 'Please enter your specialty'),
  location: z.string().min(2, 'Please enter your location'),
  bio: z.string().min(20, 'Bio must be at least 20 characters'),
  phone: z.string().min(10, 'Please enter a valid phone number'),
 yearsOfExperience: z.coerce.number().min(0).max(50),
})

type ProfileFormValues = z.infer<typeof profileSchema>

export default function EditProfilePage() {
  const { profile, updateProfile, completionPct } = useProfile()
  const router = useRouter()
  const [saved, setSaved] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<z.input<typeof profileSchema>, unknown, ProfileFormValues>({
  resolver: zodResolver(profileSchema),
    defaultValues: {
      fullName: profile.fullName,
      specialty: profile.specialty,
      location: profile.location,
      bio: profile.bio,
      phone: profile.phone,
      yearsOfExperience: profile.yearsOfExperience,
    },
  })

  const onSubmit = async (data: ProfileFormValues) => {
    await new Promise((r) => setTimeout(r, 600))
    updateProfile(data)
    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
  }

  return (
    <main className="min-h-screen bg-[#faf8f5] flex flex-col">
      {/* Nav */}
      <header className="px-5 sm:px-10 py-5 flex items-center justify-between border-b border-gray-100 bg-white sticky top-0 z-10">
        <div className="flex items-center gap-2">
          <Scissors className="w-5 h-5 text-amber-600" />
          <span className="font-bold text-xl text-[#422a15]">StyledKraft</span>
        </div>
        <button
          onClick={() => router.push('/dashboard')}
          className="flex items-center gap-2 text-sm text-[#422a15] hover:text-amber-600 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Dashboard
        </button>
      </header>

      <section className="flex-1 px-4 py-8 max-w-2xl mx-auto w-full">

        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-[#422a15]">Edit Profile</h1>
          <p className="text-sm text-gray-500 mt-1">
            Profile strength — {completionPct}% complete
          </p>
          <div className="w-full bg-gray-100 rounded-full h-2 mt-2">
            <div
              className="bg-amber-500 h-2 rounded-full transition-all duration-500"
              style={{ width: `${completionPct}%` }}
            />
          </div>
        </div>

        {/* Success banner */}
        {saved && (
          <div className="flex items-center gap-2 bg-green-50 border border-green-200 rounded-xl px-4 py-3 mb-6">
            <CheckCircle className="w-4 h-4 text-green-600 shrink-0" />
            <p className="text-sm text-green-700 font-medium">Profile updated successfully</p>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-5">

          {/* Full Name */}
          <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm">
            <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 mb-1.5">
              Full Name
            </label>
            <input
              id="fullName"
              type="text"
              placeholder="e.g. Amara Okafor"
              {...register('fullName')}
              aria-invalid={errors.fullName ? 'true' : 'false'}
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-100 transition-all"
            />
            {errors.fullName && (
              <p role="alert" className="text-xs text-red-500 mt-1">{errors.fullName.message}</p>
            )}
          </div>

          {/* Specialty */}
          <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm">
            <label htmlFor="specialty" className="block text-sm font-medium text-gray-700 mb-1.5">
              Specialty
            </label>
            <input
              id="specialty"
              type="text"
              placeholder="e.g. Bridal & Eveningwear"
              {...register('specialty')}
              aria-invalid={errors.specialty ? 'true' : 'false'}
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-100 transition-all"
            />
            {errors.specialty && (
              <p role="alert" className="text-xs text-red-500 mt-1">{errors.specialty.message}</p>
            )}
          </div>

          {/* Location */}
          <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm">
            <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-1.5">
              Location
            </label>
            <input
              id="location"
              type="text"
              placeholder="e.g. Lagos, Nigeria"
              {...register('location')}
              aria-invalid={errors.location ? 'true' : 'false'}
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-100 transition-all"
            />
            {errors.location && (
              <p role="alert" className="text-xs text-red-500 mt-1">{errors.location.message}</p>
            )}
          </div>

          {/* Phone */}
          <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm">
            <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1.5">
              Phone Number
            </label>
            <input
              id="phone"
              type="tel"
              placeholder="e.g. 08012345678"
              {...register('phone')}
              aria-invalid={errors.phone ? 'true' : 'false'}
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-100 transition-all"
            />
            {errors.phone && (
              <p role="alert" className="text-xs text-red-500 mt-1">{errors.phone.message}</p>
            )}
          </div>

          {/* Years of Experience */}
          <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm">
            <label htmlFor="yearsOfExperience" className="block text-sm font-medium text-gray-700 mb-1.5">
              Years of Experience
            </label>
            <input
              id="yearsOfExperience"
              type="number"
              placeholder="e.g. 5"
              {...register('yearsOfExperience')}
              aria-invalid={errors.yearsOfExperience ? 'true' : 'false'}
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-100 transition-all"
            />
            {errors.yearsOfExperience && (
              <p role="alert" className="text-xs text-red-500 mt-1">{errors.yearsOfExperience.message}</p>
            )}
          </div>

          {/* Bio */}
          <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm">
            <label htmlFor="bio" className="block text-sm font-medium text-gray-700 mb-1.5">
              Bio
            </label>
            <textarea
              id="bio"
              rows={4}
              placeholder="Tell clients about your style, experience, and what makes your work unique..."
              {...register('bio')}
              aria-invalid={errors.bio ? 'true' : 'false'}
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-100 transition-all resize-none"
            />
            {errors.bio && (
              <p role="alert" className="text-xs text-red-500 mt-1">{errors.bio.message}</p>
            )}
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-[#422a15] text-white rounded-xl py-2.5 text-sm font-semibold hover:bg-[#5a3a20] disabled:opacity-60 transition-colors"
          >
            {isSubmitting ? 'Saving…' : 'Save Profile'}
          </button>

        </form>
      </section>
    </main>
  )
}