'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { useProfile } from '@/context/ProfileContext'
import { useSidebar } from '@/context/SidebarContext'
import { User, MapPin, Phone, Sparkles, BookOpen, Clock, CheckCircle, Menu } from 'lucide-react'
import { useState } from 'react'

const profileSchema = z.object({
  fullName:         z.string().min(2, 'Full name must be at least 2 characters'),
  specialty:        z.string().min(2, 'Please enter your specialty'),
  location:         z.string().min(2, 'Please enter your location'),
  bio:              z.string().min(20, 'Bio must be at least 20 characters'),
  phone:            z.string().min(10, 'Please enter a valid phone number'),
  yearsOfExperience:z.coerce.number().min(0).max(50),
})

type ProfileFormValues = z.infer<typeof profileSchema>

export default function EditProfilePage() {
  const { profile, updateProfile, completionPct } = useProfile()
  const { toggle } = useSidebar()
  const [saved, setSaved] = useState(false)

  const { register, handleSubmit, formState: { errors, isSubmitting } } =
    useForm<z.input<typeof profileSchema>, unknown, ProfileFormValues>({
      resolver: zodResolver(profileSchema),
      defaultValues: {
        fullName:         profile.fullName,
        specialty:        profile.specialty,
        location:         profile.location,
        bio:              profile.bio,
        phone:            profile.phone,
        yearsOfExperience:profile.yearsOfExperience,
      },
    })

  const onSubmit = async (data: ProfileFormValues) => {
    await new Promise((r) => setTimeout(r, 600))
    updateProfile(data)
    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
  }

  return (
    <>
      {/* Top bar */}
      <header className="bg-white border-b border-gray-100 px-4 sm:px-8 py-4 flex items-center gap-3 sticky top-0 z-10">
        <button onClick={toggle} className="lg:hidden p-2 rounded-xl hover:bg-gray-100 text-gray-600 shrink-0">
          <Menu className="w-5 h-5" />
        </button>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3">
            <h1 className="text-base sm:text-lg font-bold text-[#422a15]">Edit Profile</h1>
            <span className="px-2.5 py-0.5 bg-amber-50 text-amber-700 rounded-full text-xs font-semibold">
              {completionPct}% complete
            </span>
          </div>
          <p className="text-xs text-gray-400 hidden sm:block mt-0.5">Complete your profile to attract more clients</p>
        </div>
      </header>

      <div className="p-4 sm:p-6 lg:p-8 max-w-3xl mx-auto w-full">

        {/* Progress bar */}
        <div className="bg-gray-100 rounded-full h-1.5 mb-6 overflow-hidden">
          <div
            className="bg-linear-to-r from-[#FF6500] to-amber-400 h-full transition-all duration-500"
            style={{ width: `${completionPct}%` }}
          />
        </div>

        {/* Success banner */}
        {saved && (
          <div className="flex items-center gap-3 bg-green-50 border border-green-200 rounded-2xl px-4 py-3 mb-6">
            <CheckCircle className="w-5 h-5 text-green-600 shrink-0" />
            <div>
              <p className="text-sm font-semibold text-green-800">Profile updated successfully</p>
              <p className="text-xs text-green-600">Your changes have been saved</p>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-5">

          {/* Basic Information */}
          <div className="bg-white rounded-2xl border border-gray-100 p-6">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-9 h-9 rounded-xl bg-blue-50 flex items-center justify-center">
                <User className="w-4 h-4 text-blue-600" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-gray-900">Basic Information</h2>
                <p className="text-xs text-gray-400">Your name and contact details</p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label htmlFor="fullName" className="block text-xs font-semibold text-gray-700 mb-1.5">Full Name</label>
                <input
                  id="fullName" type="text" placeholder="e.g. Amara Okafor"
                  {...register('fullName')}
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-[#FF6500] focus:ring-2 focus:ring-[#FF6500]/10 transition-all bg-gray-50/50"
                />
                {errors.fullName && <p className="text-xs text-red-500 mt-1">✕ {errors.fullName.message}</p>}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="phone" className="block text-xs font-semibold text-gray-700 mb-1.5">Phone Number</label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                    <input
                      id="phone" type="tel" placeholder="e.g. 08012345678"
                      {...register('phone')}
                      className="w-full border border-gray-200 rounded-xl pl-10 pr-4 py-2.5 text-sm outline-none focus:border-[#FF6500] focus:ring-2 focus:ring-[#FF6500]/10 transition-all bg-gray-50/50"
                    />
                  </div>
                  {errors.phone && <p className="text-xs text-red-500 mt-1">✕ {errors.phone.message}</p>}
                </div>

                <div>
                  <label htmlFor="location" className="block text-xs font-semibold text-gray-700 mb-1.5">Location</label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                    <input
                      id="location" type="text" placeholder="e.g. Lagos, Nigeria"
                      {...register('location')}
                      className="w-full border border-gray-200 rounded-xl pl-10 pr-4 py-2.5 text-sm outline-none focus:border-[#FF6500] focus:ring-2 focus:ring-[#FF6500]/10 transition-all bg-gray-50/50"
                    />
                  </div>
                  {errors.location && <p className="text-xs text-red-500 mt-1">✕ {errors.location.message}</p>}
                </div>
              </div>
            </div>
          </div>

          {/* Professional Profile */}
          <div className="bg-white rounded-2xl border border-gray-100 p-6">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-9 h-9 rounded-xl bg-purple-50 flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-purple-600" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-gray-900">Professional Profile</h2>
                <p className="text-xs text-gray-400">Your expertise and experience</p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label htmlFor="specialty" className="block text-xs font-semibold text-gray-700 mb-1.5">Specialty</label>
                <input
                  id="specialty" type="text" placeholder="e.g. Bridal & Eveningwear"
                  {...register('specialty')}
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-[#FF6500] focus:ring-2 focus:ring-[#FF6500]/10 transition-all bg-gray-50/50"
                />
                {errors.specialty && <p className="text-xs text-red-500 mt-1">✕ {errors.specialty.message}</p>}
              </div>

              <div>
                <label htmlFor="yearsOfExperience" className="block text-xs font-semibold text-gray-700 mb-1.5">Years of Experience</label>
                <div className="relative">
                  <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                  <input
                    id="yearsOfExperience" type="number" placeholder="e.g. 5"
                    {...register('yearsOfExperience')}
                    className="w-full border border-gray-200 rounded-xl pl-10 pr-4 py-2.5 text-sm outline-none focus:border-[#FF6500] focus:ring-2 focus:ring-[#FF6500]/10 transition-all bg-gray-50/50"
                  />
                </div>
                {errors.yearsOfExperience && <p className="text-xs text-red-500 mt-1">✕ {errors.yearsOfExperience.message}</p>}
              </div>
            </div>
          </div>

          {/* About You */}
          <div className="bg-white rounded-2xl border border-gray-100 p-6">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-9 h-9 rounded-xl bg-amber-50 flex items-center justify-center">
                <BookOpen className="w-4 h-4 text-amber-600" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-gray-900">About You</h2>
                <p className="text-xs text-gray-400">Tell clients about yourself</p>
              </div>
            </div>

            <div>
              <label htmlFor="bio" className="block text-xs font-semibold text-gray-700 mb-1.5">Bio</label>
              <textarea
                id="bio" rows={5}
                placeholder="Tell clients about your style, experience, and what makes your work unique..."
                {...register('bio')}
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-[#FF6500] focus:ring-2 focus:ring-[#FF6500]/10 transition-all resize-none bg-gray-50/50 font-sans"
              />
              <p className="text-xs text-gray-400 mt-1">Minimum 20 characters</p>
              {errors.bio && <p className="text-xs text-red-500 mt-1">✕ {errors.bio.message}</p>}
            </div>
          </div>

          {/* Save */}
          <div className="pb-4">
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-[#FF6500] text-white rounded-xl py-3 font-semibold hover:opacity-90 disabled:opacity-60 transition-all disabled:cursor-not-allowed text-sm"
            >
              {isSubmitting ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Saving…
                </span>
              ) : 'Save Profile'}
            </button>
          </div>

        </form>
      </div>
    </>
  )
}
