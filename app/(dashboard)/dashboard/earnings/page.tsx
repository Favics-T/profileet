'use client'

import { useState } from 'react'
import { useSidebar } from '@/context/SidebarContext'
import {
  Menu, TrendingUp, CheckCircle, Clock, Star,
  ArrowUpRight, ArrowDownRight, BarChart2, Calendar,
} from 'lucide-react'

/* ─── MOCK DATA ─── */
const MONTHLY_DATA = [
  { month: 'Jan', revenue: 210000, orders: 4 },
  { month: 'Feb', revenue: 185000, orders: 3 },
  { month: 'Mar', revenue: 320000, orders: 6 },
  { month: 'Apr', revenue: 275000, orders: 5 },
  { month: 'May', revenue: 410000, orders: 7 },
  { month: 'Jun', revenue: 371000, orders: 5 },
]

const TRANSACTIONS = [
  { id: 'BK-2404', client: 'Chidinma Eze',    service: 'Evening Gown',       amount: 75000,  date: 'Jun 10', status: 'paid',    color: '#16a34a' },
  { id: 'BK-2403', client: 'Funke Adeyemi',   service: 'Corporate Blazer Set', amount: 27500, date: 'Jun 14', status: 'deposit', color: '#7c3aed' },
  { id: 'BK-2402', client: 'Tunde Balogun',   service: 'Agbada Set',          amount: 42500,  date: 'Jun 16', status: 'deposit', color: '#0ea5e9' },
  { id: 'BK-2401', client: 'Amara Obiechina', service: 'Bridal Gown',         amount: 120000, date: 'Jun 17', status: 'pending', color: '#be185d' },
  { id: 'BK-2405', client: 'Emeka Nwosu',     service: 'Ankara Shirts',       amount: 36000,  date: 'Jun 12', status: 'cancelled', color: '#d97706' },
]

const TOP_SERVICES = [
  { service: 'Bridal Gown',         count: 12, revenue: 1440000, pct: 100 },
  { service: 'Evening Gown',        count: 9,  revenue: 675000,  pct: 47 },
  { service: 'Agbada Set',          count: 8,  revenue: 680000,  pct: 47 },
  { service: 'Corporate Blazer Set',count: 6,  revenue: 330000,  pct: 23 },
  { service: 'Ankara Styles',       count: 14, revenue: 252000,  pct: 18 },
]

const maxRevenue = Math.max(...MONTHLY_DATA.map(d => d.revenue))

const txStatus: Record<string, { label: string; bg: string; text: string }> = {
  paid:      { label: 'Full Payment',   bg: 'bg-green-100',  text: 'text-green-700' },
  deposit:   { label: 'Deposit',        bg: 'bg-blue-100',   text: 'text-blue-700' },
  pending:   { label: 'Awaiting Deposit', bg: 'bg-amber-100', text: 'text-amber-700' },
  cancelled: { label: 'Cancelled',      bg: 'bg-red-100',    text: 'text-red-500' },
}

export default function EarningsPage() {
  const { toggle } = useSidebar()
  const [period, setPeriod] = useState<'monthly' | 'yearly'>('monthly')

  const totalRevenue   = MONTHLY_DATA.reduce((s, d) => s + d.revenue, 0)
  const totalOrders    = MONTHLY_DATA.reduce((s, d) => s + d.orders, 0)
  const avgOrderValue  = Math.round(totalRevenue / totalOrders)
  const currentMonth   = MONTHLY_DATA[MONTHLY_DATA.length - 1]
  const prevMonth      = MONTHLY_DATA[MONTHLY_DATA.length - 2]
  const revenueChange  = Math.round(((currentMonth.revenue - prevMonth.revenue) / prevMonth.revenue) * 100)

  return (
    <>
      {/* Top bar */}
      <header className="bg-white border-b border-gray-100 px-4 sm:px-8 py-4 flex items-center justify-between sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <button onClick={toggle} className="lg:hidden p-2 rounded-xl hover:bg-gray-100 text-gray-600 shrink-0">
            <Menu className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-base sm:text-lg font-bold text-[#422a15]">Earnings</h1>
            <p className="text-xs text-gray-400 hidden sm:block">Your revenue overview</p>
          </div>
        </div>
        <div className="flex gap-1 bg-gray-100 p-1 rounded-xl">
          {(['monthly', 'yearly'] as const).map(p => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all capitalize ${
                period === p ? 'bg-white text-[#422a15] shadow-sm' : 'text-gray-400'
              }`}
            >
              {p}
            </button>
          ))}
        </div>
      </header>

      <div className="p-4 sm:p-6 lg:p-8 space-y-5">

        {/* KPI cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          {[
            {
              label: 'Total Revenue', value: `₦${(totalRevenue / 1000).toFixed(0)}k`,
              icon: BarChart2, color: 'text-[#FF6500]', bg: 'bg-orange-50',
              change: `${revenueChange > 0 ? '+' : ''}${revenueChange}% vs last month`, up: revenueChange >= 0,
            },
            {
              label: 'Total Orders', value: `${totalOrders}`,
              icon: CheckCircle, color: 'text-green-600', bg: 'bg-green-50',
              change: '+3 vs last month', up: true,
            },
            {
              label: 'Avg. Order Value', value: `₦${(avgOrderValue / 1000).toFixed(1)}k`,
              icon: TrendingUp, color: 'text-purple-600', bg: 'bg-purple-50',
              change: '+5% this month', up: true,
            },
            {
              label: 'Pending Deposits', value: '₦120k',
              icon: Clock, color: 'text-amber-600', bg: 'bg-amber-50',
              change: '1 booking awaiting', up: false,
            },
          ].map(({ label, value, icon: Icon, color, bg, change, up }) => (
            <div key={label} className="bg-white rounded-2xl border border-gray-100 p-4 sm:p-5">
              <div className="flex items-center justify-between mb-3">
                <p className="text-xs text-gray-500">{label}</p>
                <div className={`w-8 h-8 ${bg} rounded-xl flex items-center justify-center shrink-0`}>
                  <Icon className={`w-4 h-4 ${color}`} />
                </div>
              </div>
              <p className="text-xl sm:text-2xl font-bold text-[#422a15]">{value}</p>
              <p className={`text-xs mt-1 flex items-center gap-0.5 font-medium ${up ? 'text-green-600' : 'text-amber-600'}`}>
                {up ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                {change}
              </p>
            </div>
          ))}
        </div>

        {/* Revenue bar chart */}
        <div className="bg-white rounded-2xl border border-gray-100 p-5">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="font-semibold text-[#422a15]">Revenue Trend</h2>
              <p className="text-xs text-gray-400 mt-0.5">Jan – Jun 2026</p>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-gray-400">
              <Calendar className="w-3.5 h-3.5" />
              <span>2026</span>
            </div>
          </div>

          {/* Bar chart */}
          <div className="flex items-end gap-2 sm:gap-3 h-40">
            {MONTHLY_DATA.map((d, i) => {
              const height = Math.round((d.revenue / maxRevenue) * 100)
              const isLast = i === MONTHLY_DATA.length - 1
              return (
                <div key={d.month} className="flex-1 flex flex-col items-center gap-1.5">
                  <div className="w-full flex flex-col items-center justify-end" style={{ height: '140px' }}>
                    <div
                      className={`w-full rounded-t-lg transition-all duration-500 ${isLast ? 'bg-[#FF6500]' : 'bg-amber-100 hover:bg-amber-200'}`}
                      style={{ height: `${height}%` }}
                      title={`₦${d.revenue.toLocaleString()}`}
                    />
                  </div>
                  <span className={`text-xs font-medium ${isLast ? 'text-[#FF6500]' : 'text-gray-400'}`}>{d.month}</span>
                </div>
              )
            })}
          </div>

          <div className="mt-4 grid grid-cols-3 gap-3 pt-4 border-t border-gray-100">
            {MONTHLY_DATA.slice(-3).map(d => (
              <div key={d.month} className="text-center">
                <p className="text-xs text-gray-400">{d.month}</p>
                <p className="text-sm font-bold text-[#422a15]">₦{(d.revenue / 1000).toFixed(0)}k</p>
                <p className="text-xs text-gray-400">{d.orders} orders</p>
              </div>
            ))}
          </div>
        </div>

        {/* 2-column: Top services + Recent transactions */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-5">

          {/* Top services */}
          <div className="bg-white rounded-2xl border border-gray-100 p-5">
            <h2 className="font-semibold text-[#422a15] mb-4">Top Services</h2>
            <div className="space-y-4">
              {TOP_SERVICES.map(({ service, count, revenue, pct }) => (
                <div key={service}>
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-2">
                      <Star className="w-3.5 h-3.5 text-amber-400" />
                      <span className="text-sm font-medium text-gray-700">{service}</span>
                    </div>
                    <div className="text-right">
                      <span className="text-xs font-bold text-[#422a15]">₦{(revenue / 1000).toFixed(0)}k</span>
                      <span className="text-xs text-gray-400 ml-2">({count} orders)</span>
                    </div>
                  </div>
                  <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-linear-to-r from-[#FF6500] to-amber-400 rounded-full transition-all duration-700"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recent transactions */}
          <div className="bg-white rounded-2xl border border-gray-100 p-5">
            <h2 className="font-semibold text-[#422a15] mb-4">Recent Transactions</h2>
            <div className="space-y-3">
              {TRANSACTIONS.map(tx => {
                const { label, bg, text } = txStatus[tx.status]
                return (
                  <div key={tx.id} className="flex items-center gap-3">
                    <div
                      className="w-9 h-9 rounded-xl flex items-center justify-center text-xs font-bold text-white shrink-0"
                      style={{ background: tx.color }}
                    >
                      {tx.client[0]}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-800 truncate">{tx.client}</p>
                      <p className="text-xs text-gray-400 truncate">{tx.service}</p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className={`text-sm font-bold ${tx.status === 'cancelled' ? 'text-red-400 line-through' : 'text-[#422a15]'}`}>
                        ₦{tx.amount.toLocaleString()}
                      </p>
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${bg} ${text}`}>
                        {label}
                      </span>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>

      </div>
    </>
  )
}
