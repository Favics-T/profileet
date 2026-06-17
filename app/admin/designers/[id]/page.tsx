'use client'

import { useState, use } from 'react'
import { useAdminAuth } from '@/context/AdminAuthContext'
import { useRouter } from 'next/navigation'
import {
  Scissors, ArrowLeft, MapPin, Briefcase, Phone,
  CheckCircle, AlertTriangle, XCircle, MessageSquare,
  Calendar, Shield, Plus
} from 'lucide-react'
import { AdminRole, DesignerNote, MockDesigner } from '@/type/index'

// Permissions
const canPerformAction = (role: AdminRole, action: 'verify' | 'suspend' | 'reject' | 'note') => {
  const permissions: Record<AdminRole, string[]> = {
    super_admin: ['verify', 'suspend', 'reject', 'note'],
    profile_manager: ['verify', 'suspend', 'reject', 'note'],
    support_agent: ['note'],
    auditor: [],
  }
  return permissions[role].includes(action)
}

const statusColors: Record<string, string> = {
  Pending: 'bg-amber-500/10 text-amber-400 border border-amber-500/20',
  Verified: 'bg-blue-500/10 text-blue-400 border border-blue-500/20',
  Active: 'bg-green-500/10 text-green-400 border border-green-500/20',
  Suspended: 'bg-red-500/10 text-red-400 border border-red-500/20',
  Rejected: 'bg-slate-500/10 text-slate-400 border border-slate-500/20',
}

const roleLabels: Record<AdminRole, string> = {
  super_admin: 'Super Admin',
  profile_manager: 'Profile Manager',
  support_agent: 'Support Agent',
  auditor: 'Auditor',
}

// Mock data — extended with full profile fields
const mockDesigners: MockDesigner[] = [
  {
    id: '1',
    name: 'Amara Okafor',
    email: 'amara@gmail.com',
    specialty: 'Bridal & Eveningwear',
    location: 'Lagos, Nigeria',
    status: 'Pending',
    joined: 'Jun 10, 2025',
    bio: 'I am a passionate bridal designer with over 7 years of experience creating stunning wedding gowns and asoebi outfits for Nigerian brides. My work blends traditional Yoruba aesthetics with modern silhouettes.',
    phone: '08012345678',
    yearsOfExperience: 7,
    inquiries: 12,
    bookings: 4,
    notes: [],
  },
  {
    id: '2',
    name: 'Funke Adeyemi',
    email: 'funke@gmail.com',
    specialty: 'Corporate Wear',
    location: 'Abuja, Nigeria',
    status: 'Verified',
    joined: 'Jun 8, 2025',
    bio: 'Specialising in corporate and professional attire for Nigerian executives. I bring precision tailoring and attention to detail to every piece I create.',
    phone: '08023456789',
    yearsOfExperience: 5,
    inquiries: 8,
    bookings: 3,
    notes: [
      {
        id: 'n1',
        author: 'Support Agent',
        role: 'support_agent',
        content: 'Designer submitted all required documents. Portfolio reviewed and approved.',
        createdAt: 'Jun 9, 2025',
      },
    ],
  },
  {
    id: '3',
    name: 'Chisom Eze',
    email: 'chisom@gmail.com',
    specialty: 'Ankara & Casual',
    location: 'Enugu, Nigeria',
    status: 'Active',
    joined: 'Jun 5, 2025',
    bio: 'Creative Ankara designer bringing bold patterns and vibrant colors to everyday fashion. I work with clients across Nigeria to create unique casual and semi-formal pieces.',
    phone: '08034567890',
    yearsOfExperience: 3,
    inquiries: 20,
    bookings: 9,
    notes: [],
  },
  {
    id: '4',
    name: 'Tola Bello',
    email: 'tola@gmail.com',
    specialty: 'Traditional Wear',
    location: 'Ibadan, Nigeria',
    status: 'Suspended',
    joined: 'May 28, 2025',
    bio: 'Traditional wear specialist with expertise in Yoruba agbada, buba and iro sets. I have dressed clients for weddings, coronations and cultural festivals across the Southwest.',
    phone: '08045678901',
    yearsOfExperience: 10,
    inquiries: 5,
    bookings: 1,
    notes: [
      {
        id: 'n2',
        author: 'Profile Manager',
        role: 'profile_manager',
        content: 'Account suspended pending investigation into client complaint about undelivered order.',
        createdAt: 'Jun 1, 2025',
      },
    ],
  },
  {
    id: '5',
    name: 'Ngozi Uche',
    email: 'ngozi@gmail.com',
    specialty: 'Eveningwear',
    location: 'Port Harcourt, Nigeria',
    status: 'Pending',
    joined: 'May 25, 2025',
    bio: 'Evening and cocktail wear designer based in Port Harcourt. My pieces are known for their elegant cuts and luxurious fabrics sourced locally and internationally.',
    phone: '08056789012',
    yearsOfExperience: 4,
    inquiries: 3,
    bookings: 0,
    notes: [],
  },
  {
    id: '6',
    name: 'Kemi Ola',
    email: 'kemi@gmail.com',
    specialty: 'Bridal',
    location: 'Lagos, Nigeria',
    status: 'Rejected',
    joined: 'May 20, 2025',
    bio: 'Bridal designer with a focus on minimalist gowns.',
    phone: '08067890123',
    yearsOfExperience: 1,
    inquiries: 0,
    bookings: 0,
    notes: [
      {
        id: 'n3',
        author: 'Profile Manager',
        role: 'profile_manager',
        content: 'Profile rejected — portfolio does not meet minimum quality standards. Designer may reapply in 30 days.',
        createdAt: 'May 21, 2025',
      },
    ],
  },
]

type DesignerStatus = 'Pending' | 'Verified' | 'Active' | 'Suspended' | 'Rejected'

export default function DesignerDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = use(params)
  const { admin } = useAdminAuth()
  const router = useRouter()

  const found = mockDesigners.find((d) => d.id === id)

  const [designer, setDesigner] = useState<MockDesigner | null>(found ?? null)
  const [noteInput, setNoteInput] = useState('')
  const [noteSaved, setNoteSaved] = useState(false)

  if (!admin) return null

  if (!designer) {
    return (
      <main className="min-h-screen bg-[0f172a] flex items-center justify-center">
        <div className="text-center">
          <p className="text-white font-semibold text-lg mb-2">Designer not found</p>
          <button
            onClick={() => router.push('/admin/dashboard')}
            className="text-sm text-amber-400 hover:text-amber-300"
          >
            Back to dashboard
          </button>
        </div>
      </main>
    )
  }

  function updateStatus(status: DesignerStatus) {
    setDesigner((prev) => prev ? { ...prev, status } : prev)
  }

  function addNote() {
    if (!noteInput.trim() || !admin) return
    const newNote: DesignerNote = {
      id: `n${Date.now()}`,
      author: admin.name,
      role: admin.role,
      content: noteInput.trim(),
      createdAt: new Date().toLocaleDateString('en-GB', {
        day: 'numeric', month: 'short', year: 'numeric'
      }),
    }
    setDesigner((prev) =>
      prev ? { ...prev, notes: [...prev.notes, newNote] } : prev
    )
    setNoteInput('')
    setNoteSaved(true)
    setTimeout(() => setNoteSaved(false), 3000)
  }

  return (
    <main className="min-h-screen bg-[0f172a] text-gray-600">

      {/* Nav */}
      <header className="px-5 shadow sm:px-10 py-5 flex items-center justify-between border-b border-white/10 bg-[1e293b] sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <Scissors className="w-5 h-5 text-amber-500" />
          <span className="font-bold tet-white">StyledKraft</span>
          <span className="text-xs font-semibold text-amber-500 bg-amber-500/10 border border-amber-500/20 px-2.5 py-1 rounded-full">
            Admin
          </span>
        </div>
        <button
          onClick={() => router.push('/admin/dashboard')}
          className="flex items-center gap-2 text-sm text-slate-400 hover:text-amber-400 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Dashboard
        </button>
      </header>

      <div className="max-w-3xl mx-auto px-4 py-8 space-y-6">

        {/* Hero card */}
        <div className="bg-[1e293b] shadow rounded-2xl border border-white/10 p-6">
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-amber-500/20 flex items-center justify-center text-2xl font-bold text-amber-400">
                {designer.name[0]}
              </div>
              <div>
                <h1 className="text-xl font-bold text-whie mb-1">{designer.name}</h1>
                <p className="text-sm text-slate-400 mb-2">{designer.email}</p>
                <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${statusColors[designer.status]}`}>
                  {designer.status}
                </span>
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex items-center gap-2 flex-wrap">
              {canPerformAction(admin.role, 'verify') && designer.status === 'Pending' && (
                <button
                  onClick={() => updateStatus('Verified')}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-500/10 border border-blue-500/20 text-blue-400 rounded-xl text-sm font-semibold hover:bg-blue-500/20 transition-colors"
                >
                  <CheckCircle className="w-4 h-4" />
                  Verify
                </button>
              )}
              {canPerformAction(admin.role, 'verify') && designer.status === 'Verified' && (
                <button
                  onClick={() => updateStatus('Active')}
                  className="flex items-center gap-2 px-4 py-2 bg-green-500/10 border border-green-500/20 text-green-400 rounded-xl text-sm font-semibold hover:bg-green-500/20 transition-colors"
                >
                  <CheckCircle className="w-4 h-4" />
                  Set Active
                </button>
              )}
              {canPerformAction(admin.role, 'suspend') && designer.status === 'Active' && (
                <button
                  onClick={() => updateStatus('Suspended')}
                  className="flex items-center gap-2 px-4 py-2 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl text-sm font-semibold hover:bg-red-500/20 transition-colors"
                >
                  <AlertTriangle className="w-4 h-4" />
                  Suspend
                </button>
              )}
              {canPerformAction(admin.role, 'reject') && designer.status === 'Pending' && (
                <button
                  onClick={() => updateStatus('Rejected')}
                  className="flex items-center gap-2 px-4 py-2 bg-slate-500/10 border border-slate-500/20 text-slate-400 rounded-xl text-sm font-semibold hover:bg-slate-500/20 transition-colors"
                >
                  <XCircle className="w-4 h-4" />
                  Reject
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Profile details */}
        <div className="bg-[1e293b] rounded-2xl border border-white/10 p-6 shadow">
          <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-4">
            Profile Details
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-5">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-amber-500/10 rounded-lg flex items-center justify-center shrink-0">
                <Briefcase className="w-4 h-4 text-amber-500" />
              </div>
              <div>
                <p className="text-xs text-slate-500">Specialty</p>
                <p className="text-sm text-white font-medium">{designer.specialty}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-amber-500/10 rounded-lg flex items-center justify-center shrink-0">
                <MapPin className="w-4 h-4 text-amber-500" />
              </div>
              <div>
                <p className="text-xs text-slate-500">Location</p>
                <p className="text-sm text-white font-medium">{designer.location}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-amber-500/10 rounded-lg flex items-center justify-center shrink-0">
                <Phone className="w-4 h-4 text-amber-500" />
              </div>
              <div>
                <p className="text-xs text-slate-500">Phone</p>
                <p className="text-sm text-white font-medium">{designer.phone}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-amber-500/10 rounded-lg flex items-center justify-center shrink-0">
                <Calendar className="w-4 h-4 text-amber-500" />
              </div>
              <div>
                <p className="text-xs text-slate-500">Joined</p>
                <p className="text-sm text-white font-medium">{designer.joined}</p>
              </div>
            </div>
          </div>

          {/* Bio */}
          <div className="bg-[0f172a] shadow rounded-xl px-4 py-3">
            <p className="text-xs text-slate-800 mb-1">Bio</p>
            <p className="text-sm text-slate-800 leading-relaxed">{designer.bio}</p>
          </div>
        </div>

        {/* Activity */}
        <div className="bg-[1e293b] shadow rounded-2xl border border-white/10 p-6">
          <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-4">
            Activity
          </h2>
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-[#0f172a] rounded-xl p-4 text-center">
              <p className="text-2xl font-bold text-white">{designer.yearsOfExperience}</p>
              <p className="text-xs text-slate-500 mt-1">Yrs Experience</p>
            </div>
            <div className="bg-[#0f172a] rounded-xl p-4 text-center">
              <MessageSquare className="w-5 h-5 text-amber-500 mx-auto mb-1" />
              <p className="text-2xl font-bold text-white">{designer.inquiries}</p>
              <p className="text-xs text-slate-500 mt-1">Inquiries</p>
            </div>
            <div className="bg-[#0f172a] rounded-xl p-4 text-center">
              <Calendar className="w-5 h-5 text-amber-500 mx-auto mb-1" />
              <p className="text-2xl font-bold text-white">{designer.bookings}</p>
              <p className="text-xs text-slate-500 mt-1">Bookings</p>
            </div>
          </div>
        </div>

        {/* Internal notes */}
        <div className="bg-[1e293b] shadow rounded-2xl border border-white/10 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider">
              Internal Notes
            </h2>
            <div className="flex items-center gap-1">
              <Shield className="w-3.5 h-3.5 text-slate-500" />
              <span className="text-xs text-slate-500">Staff only</span>
            </div>
          </div>

          {/* Existing notes */}
          {designer.notes.length === 0 && (
            <p className="text-sm text-slate-500 mb-4">No notes yet.</p>
          )}
          <div className="space-y-3 mb-5">
            {designer.notes.map((note) => (
              <div key={note.id} className="bg-[#0f172a] rounded-xl px-4 py-3">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-amber-400">{note.author}</span>
                    <span className="text-xs text-slate-600">·</span>
                    <span className="text-xs text-slate-500">{roleLabels[note.role]}</span>
                  </div>
                  <span className="text-xs text-slate-600">{note.createdAt}</span>
                </div>
                <p className="text-sm text-slate-300 leading-relaxed">{note.content}</p>
              </div>
            ))}
          </div>

          {/* Add note */}
          {canPerformAction(admin.role, 'note') ? (
            <div className="space-y-3">
              {noteSaved && (
                <div className="flex items-center gap-2 bg-green-500/10 border border-green-500/20 rounded-xl px-4 py-2.5">
                  <CheckCircle className="w-4 h-4 text-green-400 shrink-0" />
                  <p className="text-xs text-green-400 font-medium">Note added successfully</p>
                </div>
              )}
              <textarea
                rows={3}
                placeholder="Add an internal note about this designer..."
                value={noteInput}
                onChange={(e) => setNoteInput(e.target.value)}
                className="w-full bg-[#0f172a] border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder:text-slate-500 outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 transition-all resize-none"
              />
              <button
                onClick={addNote}
                disabled={!noteInput.trim()}
                className="flex items-center gap-2 px-4 py-2.5 bg-amber-500 text-[#0f172a] rounded-xl text-sm font-bold hover:bg-amber-400 disabled:opacity-40 transition-colors"
              >
                <Plus className="w-4 h-4" />
                Add Note
              </button>
            </div>
          ) : (
            <p className="text-xs text-slate-600 italic">
              Your role does not have permission to add notes.
            </p>
          )}
        </div>

      </div>
    </main>
  )
}