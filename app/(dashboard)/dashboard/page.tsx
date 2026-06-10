'use client'

import { useAuth } from '@/context/AuthContext'
import {
  Eye,
  Star,
  MessageSquare,
  Calendar,
  LogOut,
  Bell,
  Settings,
  PlusCircle,
  Edit3,
  MapPin,
  CheckCircle,
  Clock,
  TrendingUp,
  Scissors,
  ChevronRight,
  User,
} from 'lucide-react'

const stats = [
  { label: 'Profile Views', value: '1,240', icon: Eye, change: '+12%', up: true },
  { label: 'Avg. Rating', value: '4.8', icon: Star, change: '+0.2', up: true },
  { label: 'Inquiries', value: '34', icon: MessageSquare, change: '+8', up: true },
  { label: 'Active Bookings', value: '6', icon: Calendar, change: '-1', up: false },
]

const recentInquiries = [
  { client: 'Amara Obi', service: 'Bridal gown & 2 asoebi', date: 'Jun 10', status: 'New' },
  { client: 'Funke Adeyemi', service: 'Corporate blazer set', date: 'Jun 9', status: 'Replied' },
  { client: 'Chisom Eze', service: 'Ankara two-piece', date: 'Jun 8', status: 'Booked' },
  { client: 'Tola Bello', service: 'Kaftan for husband', date: 'Jun 7', status: 'Replied' },
]

const profileSteps = [
  { label: 'Basic info', done: true },
  { label: 'Profile photo', done: true },
  { label: 'Portfolio (min. 6 pieces)', done: true },
  { label: 'Pricing & services', done: false },
  { label: 'Location & availability', done: false },
]

const completionPct = Math.round(
  (profileSteps.filter((s) => s.done).length / profileSteps.length) * 100
)

const statusColors: Record<string, string> = {
  New: 'bg-amber-100 text-amber-700',
  Replied: 'bg-blue-100 text-blue-700',
  Booked: 'bg-green-100 text-green-700',
}

export default function DashboardPage() {
  const { user, logout } = useAuth()

  const firstName = user?.email.split('@')[0] ?? 'Designer'

  return (
    <div className="min-h-screen bg-[#faf8f5] flex">
      {/* Sidebar */}
      <aside className="w-64 bg-white text-[#422a15] flex flex-col min-h-screen fixed top-0 left-0">
        <div className="p-6 ">
          <div className="flex items-center gap-2">
                      <span className="font-bold text-lg tracking-wide">StyledKraft</span>
          </div>
        
        </div>

        <nav className="flex-1 p-4 space-y-1">
          {[
            { icon: TrendingUp, label: 'Dashboard', active: true },
            { icon: User, label: 'My Profile' },
            { icon: MessageSquare, label: 'Inquiries', badge: 3 },
            { icon: Calendar, label: 'Bookings' },
            { icon: Star, label: 'Reviews' },
            { icon: Settings, label: 'Settings' },
          ].map(({ icon: Icon, label, active, badge }) => (
            <button
              key={label}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
                active
                  ? 'bg-amber-500 text-white font-semibold'
                  : 'text-[#422a15] hover:bg-[#5a3a20]'
              }`}
            >
              <Icon className="w-4 h-4 flex-shrink-0" />
              <span className="flex-1 text-left">{label}</span>
              {badge && (
                <span className="bg-amber-400 text-[#422a15] text-xs font-bold px-1.5 py-0.5 rounded-full">
                  {badge}
                </span>
              )}
            </button>
          ))}
        </nav>

        <div className="p-4 ">
          <button
            onClick={logout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-[#5a3a20] hover:bg-[#5a3a20] hover:text-white transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span>Log out</span>
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 ml-64">
        {/* Top bar */}
        <header className="bg-white border-b border-gray-100 shadow px-8 py-4 flex items-center justify-between sticky top-0 z-10">
          <div>
            <h1 className="text-xl font-bold text-[#422a15]">
              Welcome back, {firstName} 
            </h1>
            <p className="text-sm text-gray-500">Here's what's happening with your profile today.</p>
          </div>
          <div className="flex items-center gap-4">
            <button className="relative p-2 rounded-full hover:bg-gray-100 transition-colors">
              <Bell className="w-5 h-5 text-gray-600" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-amber-500 rounded-full" />
            </button>
            <div className="w-9 h-9 rounded-full bg-amber-100 flex items-center justify-center text-[#422a15] font-bold text-sm">
              {firstName[0].toUpperCase()}
            </div>
          </div>
        </header>

        <div className="p-8 space-y-8">
          {/* Availability banner */}
         

          {/* Stats */}
          <div className="grid grid-cols-4 gap-5">
            {stats.map(({ label, value, icon: Icon, change, up }) => (
              <div key={label} className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm text-gray-500">{label}</span>
                  <div className="w-9 h-9 bg-amber-50 rounded-lg flex items-center justify-center">
                    <Icon className="w-4 h-4 text-amber-600" />
                  </div>
                </div>
                <p className="text-2xl font-bold text-[#422a15]">{value}</p>
                <p className={`text-xs mt-1 font-medium ${up ? 'text-green-600' : 'text-red-500'}`}>
                  {change} this week
                </p>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-3 gap-6">
            {/* Recent inquiries */}
            <div className="col-span-2 bg-white rounded-xl border border-gray-100 shadow-sm">
              <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                <h2 className="font-semibold text-[#422a15]">Recent Inquiries</h2>
                <button className="text-xs text-amber-600 font-medium flex items-center gap-1 hover:text-amber-700">
                  View all <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
              <div className="divide-y divide-gray-50">
                {recentInquiries.map(({ client, service, date, status }) => (
                  <div key={client} className="flex items-center gap-4 px-6 py-4">
                    <div className="w-9 h-9 rounded-full bg-amber-100 flex items-center justify-center text-[#422a15] font-bold text-sm flex-shrink-0">
                      {client[0]}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-800 truncate">{client}</p>
                      <p className="text-xs text-gray-500 truncate">{service}</p>
                    </div>
                    <div className="flex items-center gap-3 flex-shrink-0">
                      <span className="text-xs text-gray-400">{date}</span>
                      <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${statusColors[status]}`}>
                        {status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Profile completion */}
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm">
              <div className="px-6 py-4 border-b border-gray-100">
                <h2 className="font-semibold text-[#422a15]">Profile Strength</h2>
                <p className="text-xs text-gray-500 mt-0.5">Complete your profile to attract more clients</p>
              </div>
              <div className="px-6 py-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">{completionPct}% complete</span>
                  <span className="text-xs text-amber-600 font-semibold">
                    {profileSteps.filter((s) => !s.done).length} remaining
                  </span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-2 mb-5">
                  <div
                    className="bg-amber-500 h-2 rounded-full transition-all"
                    style={{ width: `${completionPct}%` }}
                  />
                </div>
                <ul className="space-y-3">
                  {profileSteps.map(({ label, done }) => (
                    <li key={label} className="flex items-center gap-3 text-sm">
                      {done ? (
                        <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                      ) : (
                        <Clock className="w-4 h-4 text-gray-300 flex-shrink-0" />
                      )}
                      <span className={done ? 'text-gray-500 line-through' : 'text-gray-700 font-medium'}>
                        {label}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          {/* Quick actions */}
          <div>
            <h2 className="font-semibold text-[#422a15] mb-4">Quick Actions</h2>
            <div className="grid grid-cols-4 gap-4">
              {[
                { icon: PlusCircle, label: 'Add Portfolio Piece', desc: 'Upload new work' },
                { icon: Edit3, label: 'Edit Profile', desc: 'Update your info' },
                { icon: MapPin, label: 'Set Location', desc: 'Add your city' },
                { icon: TrendingUp, label: 'Boost Profile', desc: 'Get more visibility' },
              ].map(({ icon: Icon, label, desc }) => (
                <button
                  key={label}
                  className="bg-white border border-gray-100 rounded-xl p-5 text-left hover:border-amber-300 hover:shadow-md transition-all group"
                >
                  <div className="w-10 h-10 bg-amber-50 rounded-lg flex items-center justify-center mb-3 group-hover:bg-amber-100 transition-colors">
                    <Icon className="w-5 h-5 text-amber-600" />
                  </div>
                  <p className="text-sm font-semibold text-[#422a15]">{label}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{desc}</p>
                </button>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
