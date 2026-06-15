'use client'

import { useState } from 'react'
import { useAdminAuth } from '@/context/AdminAuthContext'
import { useRouter } from 'next/navigation'
import {
  Scissors, Shield, Users, CheckCircle, Clock,
  XCircle, AlertTriangle, LogOut, Menu, X,
  TrendingUp, Eye, MoreVertical, Search
} from 'lucide-react'
import { AdminRole } from '@/type/index'

const roleLabels: Record<AdminRole, string> = {
  super_admin: 'Super Admin',
  profile_manager: 'Profile Manager',
  support_agent: 'Support Agent',
  auditor: 'Auditor',
}

const roleBadgeColors: Record<AdminRole, string> = {
  super_admin: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  profile_manager: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  support_agent: 'bg-green-500/10 text-green-400 border-green-500/20',
  auditor: 'bg-slate-500/10 text-slate-400 border-slate-500/20',
}

const mockDesigners = [
  { id: '1', name: 'Amara Okafor', email: 'amara@gmail.com', specialty: 'Bridal & Eveningwear', location: 'Lagos', status: 'Pending', joined: 'Jun 10' },
  { id: '2', name: 'Funke Adeyemi', email: 'funke@gmail.com', specialty: 'Corporate Wear', location: 'Abuja', status: 'Verified', joined: 'Jun 8' },
  { id: '3', name: 'Chisom Eze', email: 'chisom@gmail.com', specialty: 'Ankara & Casual', location: 'Enugu', status: 'Active', joined: 'Jun 5' },
  { id: '4', name: 'Tola Bello', email: 'tola@gmail.com', specialty: 'Traditional Wear', location: 'Ibadan', status: 'Suspended', joined: 'May 28' },
  { id: '5', name: 'Ngozi Uche', email: 'ngozi@gmail.com', specialty: 'Eveningwear', location: 'Port Harcourt', status: 'Pending', joined: 'May 25' },
  { id: '6', name: 'Kemi Ola', email: 'kemi@gmail.com', specialty: 'Bridal', location: 'Lagos', status: 'Rejected', joined: 'May 20' },
]

const statusColors: Record<string, string> = {
  Pending: 'bg-amber-500/10 text-amber-400 border border-amber-500/20',
  Verified: 'bg-blue-500/10 text-blue-400 border border-blue-500/20',
  Active: 'bg-green-500/10 text-green-400 border border-green-500/20',
  Suspended: 'bg-red-500/10 text-red-400 border border-red-500/20',
  Rejected: 'bg-slate-500/10 text-slate-400 border border-slate-500/20',
}

const stats = [
  { label: 'Total Designers', value: '6', icon: Users, change: '+2 this week' },
  { label: 'Pending Review', value: '2', icon: Clock, change: 'Needs attention' },
  { label: 'Active Profiles', value: '1', icon: TrendingUp, change: 'Live on platform' },
  { label: 'Suspended', value: '1', icon: AlertTriangle, change: 'Under review' },
]

// What each role can do
const canPerformAction = (role: AdminRole, action: 'verify' | 'suspend' | 'reject' | 'view') => {
  const permissions: Record<AdminRole, string[]> = {
    super_admin: ['verify', 'suspend', 'reject', 'view'],
    profile_manager: ['verify', 'suspend', 'reject', 'view'],
    support_agent: ['view'],
    auditor: ['view'],
  }
  return permissions[role].includes(action)
}

type DesignerStatus = 'Pending' | 'Verified' | 'Active' | 'Suspended' | 'Rejected'

export default function AdminDashboardPage() {
  const { admin, logout } = useAdminAuth()
  const router = useRouter()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [search, setSearch] = useState('')
  const [filterStatus, setFilterStatus] = useState<DesignerStatus | 'All'>('All')
  const [designers, setDesigners] = useState(mockDesigners)

  if (!admin) return null

  const filtered = designers.filter((d) => {
    const matchesSearch =
      d.name.toLowerCase().includes(search.toLowerCase()) ||
      d.email.toLowerCase().includes(search.toLowerCase())
    const matchesStatus = filterStatus === 'All' || d.status === filterStatus
    return matchesSearch && matchesStatus
  })

  function updateDesignerStatus(id: string, status: DesignerStatus) {
    setDesigners((prev) =>
      prev.map((d) => (d.id === id ? { ...d, status } : d))
    )
  }

  const statusFilters: (DesignerStatus | 'All')[] = ['All', 'Pending', 'Verified', 'Active', 'Suspended', 'Rejected']

  return (
    <div className="min-h-screen bg-[#0f172a] flex">

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/60 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`fixed top-0 left-0 z-40 h-screen w-64 bg-[#1e293b] border-r border-white/10 flex flex-col
        transform transition-transform duration-300 ease-in-out
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0`}
      >
        {/* Logo */}
        <div className="p-6 flex items-center justify-between border-b border-white/10">
          <div className="flex items-center gap-2">
            <Scissors className="w-5 h-5 text-amber-500" />
            <span className="font-bold text-white">StyledKraft</span>
            <span className="text-xs font-semibold text-amber-500 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded-full">
              Admin
            </span>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden p-1 rounded-lg hover:bg-white/10 text-slate-400"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Admin info */}
        <div className="px-4 py-4 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-amber-500/20 flex items-center justify-center text-amber-400 font-bold text-sm">
              {admin.name[0]}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-white truncate">{admin.name}</p>
              <span className={`text-xs font-medium px-2 py-0.5 rounded-full border ${roleBadgeColors[admin.role]}`}>
                {roleLabels[admin.role]}
              </span>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 p-4 space-y-1">
          <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm bg-amber-500/10 text-amber-400 font-semibold">
            <Shield className="w-4 h-4" />
            Designer Profiles
          </button>
        </nav>

        {/* Logout */}
        <div className="p-4 border-t border-white/10">
          <button
            onClick={logout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-slate-400 hover:bg-red-500/10 hover:text-red-400 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            Sign out
          </button>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 lg:ml-64 min-w-0">

        {/* Top bar */}
        <header className="bg-[#1e293b] border-b border-white/10 px-4 sm:px-8 py-4 flex items-center justify-between sticky top-0 z-10">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 rounded-lg hover:bg-white/10 text-slate-400"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-base sm:text-lg font-bold text-white">
                Designer Profiles
              </h1>
              <p className="text-xs text-slate-400 hidden sm:block">
                Manage and review designer profiles on the platform
              </p>
            </div>
          </div>
          <div className="w-9 h-9 rounded-full bg-amber-500/20 flex items-center justify-center text-amber-400 font-bold text-sm flex-shrink-0">
            {admin.name[0]}
          </div>
        </header>

        <div className="p-4 sm:p-6 lg:p-8 space-y-6">

          {/* Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-5">
            {stats.map(({ label, value, icon: Icon, change }) => (
              <div key={label} className="bg-[#1e293b] rounded-xl border border-white/10 p-4 sm:p-5">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs text-slate-400">{label}</span>
                  <div className="w-8 h-8 bg-amber-500/10 rounded-lg flex items-center justify-center">
                    <Icon className="w-4 h-4 text-amber-500" />
                  </div>
                </div>
                <p className="text-2xl font-bold text-white">{value}</p>
                <p className="text-xs text-slate-500 mt-1">{change}</p>
              </div>
            ))}
          </div>

          {/* Search + filters */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input
                type="text"
                placeholder="Search by name or email..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-[#1e293b] border border-white/10 rounded-xl pl-9 pr-4 py-2.5 text-sm text-white placeholder:text-slate-500 outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 transition-all"
              />
            </div>
            <div className="flex gap-2 flex-wrap">
              {statusFilters.map((f) => (
                <button
                  key={f}
                  onClick={() => setFilterStatus(f)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                    filterStatus === f
                      ? 'bg-amber-500 text-[#0f172a]'
                      : 'bg-[#1e293b] border border-white/10 text-slate-400 hover:border-amber-500/40'
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>

          {/* Designer table */}
          <div className="bg-[#1e293b] rounded-xl border border-white/10 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/10">
                    <th className="text-left px-6 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">Designer</th>
                    <th className="text-left px-6 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider hidden sm:table-cell">Specialty</th>
                    <th className="text-left px-6 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider hidden md:table-cell">Location</th>
                    <th className="text-left px-6 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">Status</th>
                    <th className="text-left px-6 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider hidden sm:table-cell">Joined</th>
                    <th className="px-6 py-3" />
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {filtered.length === 0 && (
                    <tr>
                      <td colSpan={6} className="text-center py-12 text-slate-500 text-sm">
                        No designers found
                      </td>
                    </tr>
                  )}
                  {filtered.map((designer) => (
                    <tr key={designer.id} className="hover:bg-white/5 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-amber-500/20 flex items-center justify-center text-amber-400 font-bold text-sm flex-shrink-0">
                            {designer.name[0]}
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-semibold text-white truncate">{designer.name}</p>
                            <p className="text-xs text-slate-500 truncate">{designer.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 hidden sm:table-cell">
                        <p className="text-sm text-slate-300">{designer.specialty}</p>
                      </td>
                      <td className="px-6 py-4 hidden md:table-cell">
                        <p className="text-sm text-slate-300">{designer.location}</p>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${statusColors[designer.status]}`}>
                          {designer.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 hidden sm:table-cell">
                        <p className="text-sm text-slate-400">{designer.joined}</p>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-1 justify-end">
                          {canPerformAction(admin.role, 'view') && (
                            <button
                              onClick={() => router.push(`/admin/designers/${designer.id}`)}
                              className="p-1.5 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
                              title="View profile"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                          )}
                          {canPerformAction(admin.role, 'verify') && designer.status === 'Pending' && (
                            <button
                              onClick={() => updateDesignerStatus(designer.id, 'Verified')}
                              className="p-1.5 rounded-lg hover:bg-green-500/10 text-slate-400 hover:text-green-400 transition-colors"
                              title="Verify"
                            >
                              <CheckCircle className="w-4 h-4" />
                            </button>
                          )}
                          {canPerformAction(admin.role, 'suspend') && designer.status === 'Active' && (
                            <button
                              onClick={() => updateDesignerStatus(designer.id, 'Suspended')}
                              className="p-1.5 rounded-lg hover:bg-red-500/10 text-slate-400 hover:text-red-400 transition-colors"
                              title="Suspend"
                            >
                              <AlertTriangle className="w-4 h-4" />
                            </button>
                          )}
                          {canPerformAction(admin.role, 'reject') && designer.status === 'Pending' && (
                            <button
                              onClick={() => updateDesignerStatus(designer.id, 'Rejected')}
                              className="p-1.5 rounded-lg hover:bg-slate-500/10 text-slate-400 hover:text-slate-300 transition-colors"
                              title="Reject"
                            >
                              <XCircle className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      </main>
    </div>
  )
}