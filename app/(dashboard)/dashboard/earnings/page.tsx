'use client'

import { useSidebar } from '@/context/SidebarContext'
import { useBooking } from '@/context/BookingContext'
import { useState } from 'react'
import {
  Menu, TrendingUp, CheckCircle, Clock,
  ArrowUpRight, ArrowDownRight, BarChart2, Calendar,
} from 'lucide-react'

const fmt = (n: number) => `₦${n.toLocaleString('en-NG')}`
const fmtK = (n: number) => `₦${(n / 1000).toFixed(0)}k`

const MONTH_NAMES = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']

const txStatus: Record<string, { label: string; bg: string; text: string }> = {
  paid:      { label: 'Full Payment',    bg: 'bg-green-100',  text: 'text-green-700' },
  deposit:   { label: 'Deposit Paid',    bg: 'bg-blue-100',   text: 'text-blue-700' },
  pending:   { label: 'Awaiting Deposit',bg: 'bg-amber-100',  text: 'text-amber-700' },
  cancelled: { label: 'Cancelled',       bg: 'bg-red-100',    text: 'text-red-500' },
}

function getPaymentStatus(b: { status: string; depositPaid: boolean }) {
  if (b.status === 'cancelled') return 'cancelled'
  if (b.status === 'completed') return 'paid'
  if (b.depositPaid) return 'deposit'
  return 'pending'
}

export default function EarningsPage() {
  const { toggle } = useSidebar()
  const { bookings } = useBooking()
  const [period, setPeriod] = useState<'monthly' | 'yearly'>('monthly')

    const monthlyMap: Record<number, { revenue: number; orders: number }> = {}
  bookings.forEach(b => {
    if (b.status === 'cancelled') return
    const date = new Date(b.receivedAt)
    if (isNaN(date.getTime())) return
    const m = date.getMonth()
    if (!monthlyMap[m]) monthlyMap[m] = { revenue: 0, orders: 0 }
    monthlyMap[m].revenue += b.price
    monthlyMap[m].orders += 1
  })

  const monthlyData = Object.entries(monthlyMap)
    .map(([m, v]) => ({ month: MONTH_NAMES[Number(m)], monthNum: Number(m), ...v }))
    .sort((a, b) => a.monthNum - b.monthNum)

  const maxRevenue = Math.max(...monthlyData.map(d => d.revenue), 1)

  // KPI totals
  const totalRevenue   = bookings.filter(b => b.status === 'completed').reduce((s, b) => s + b.price, 0)
  const totalOrders    = bookings.filter(b => b.status !== 'cancelled').length
  const avgOrderValue  = totalOrders > 0 ? Math.round(
    bookings.filter(b => b.status !== 'cancelled').reduce((s, b) => s + b.price, 0) / totalOrders
  ) : 0
  const pendingDeposits = bookings
    .filter(b => !b.depositPaid && b.status !== 'cancelled' && b.status !== 'completed')
    .reduce((s, b) => s + b.depositAmount, 0)

  
  const revenueChange = monthlyData.length >= 2
    ? Math.round(
        ((monthlyData[monthlyData.length - 1].revenue - monthlyData[monthlyData.length - 2].revenue)
          / monthlyData[monthlyData.length - 2].revenue) * 100
      )
    : 0

 
  const transactions = [...bookings]
    .sort((a, b) => new Date(b.receivedAt).getTime() - new Date(a.receivedAt).getTime())
    .slice(0, 6)

  
  const serviceMap: Record<string, { count: number; revenue: number }> = {}
  bookings.filter(b => b.status !== 'cancelled').forEach(b => {
    if (!serviceMap[b.service]) serviceMap[b.service] = { count: 0, revenue: 0 }
    serviceMap[b.service].count += 1
    serviceMap[b.service].revenue += b.price
  })
  const topServices = Object.entries(serviceMap)
    .map(([service, v]) => ({ service, ...v }))
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 5)
  const maxServiceRevenue = Math.max(...topServices.map(s => s.revenue), 1)

  const displayMonths = period === 'monthly' ? monthlyData.slice(-6) : monthlyData

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
              label: 'Total Revenue', value: fmtK(totalRevenue),
              icon: BarChart2, color: 'text-[#FF6500]', bg: 'bg-orange-50',
              change: monthlyData.length >= 2 ? `${revenueChange > 0 ? '+' : ''}${revenueChange}% vs last month` : 'No comparison yet',
              up: revenueChange >= 0,
            },
            {
              label: 'Total Orders', value: `${totalOrders}`,
              icon: CheckCircle, color: 'text-green-600', bg: 'bg-green-50',
              change: `${bookings.filter(b => b.status === 'completed').length} completed`,
              up: true,
            },
            {
              label: 'Avg. Order Value', value: fmtK(avgOrderValue),
              icon: TrendingUp, color: 'text-purple-600', bg: 'bg-purple-50',
              change: 'Per active booking',
              up: true,
            },
            {
              label: 'Pending Deposits', value: fmtK(pendingDeposits),
              icon: Clock, color: 'text-amber-600', bg: 'bg-amber-50',
              change: `${bookings.filter(b => !b.depositPaid && b.status !== 'cancelled').length} awaiting`,
              up: false,
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
              <p className="text-xs text-gray-400 mt-0.5">From your booking records</p>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-gray-400">
              <Calendar className="w-3.5 h-3.5" />
              <span>{new Date().getFullYear()}</span>
            </div>
          </div>

          {displayMonths.length === 0 ? (
            <div className="h-40 flex items-center justify-center text-sm text-gray-400">
              No revenue data yet — complete some bookings to see trends here.
            </div>
          ) : (
            <>
              <div className="flex items-end gap-2 sm:gap-3 h-40">
                {displayMonths.map((d, i) => {
                  const height = Math.round((d.revenue / maxRevenue) * 100)
                  const isLast = i === displayMonths.length - 1
                  return (
                    <div key={d.month} className="flex-1 flex flex-col items-center gap-1.5">
                      <div className="w-full flex flex-col items-center justify-end" style={{ height: '140px' }}>
                        <div
                          className={`w-full rounded-t-lg transition-all duration-500 ${isLast ? 'bg-[#FF6500]' : 'bg-amber-100 hover:bg-amber-200'}`}
                          style={{ height: `${height}%` }}
                          title={fmt(d.revenue)}
                        />
                      </div>
                      <span className={`text-xs font-medium ${isLast ? 'text-[#FF6500]' : 'text-gray-400'}`}>{d.month}</span>
                    </div>
                  )
                })}
              </div>

              <div className="mt-4 grid grid-cols-3 gap-3 pt-4 border-t border-gray-100">
                {displayMonths.slice(-3).map(d => (
                  <div key={d.month} className="text-center">
                    <p className="text-xs text-gray-400">{d.month}</p>
                    <p className="text-sm font-bold text-[#422a15]">{fmtK(d.revenue)}</p>
                    <p className="text-xs text-gray-400">{d.orders} orders</p>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

        {/* 2-column: Top services + Recent transactions */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-5">

          {/* Top services */}
          <div className="bg-white rounded-2xl border border-gray-100 p-5">
            <h2 className="font-semibold text-[#422a15] mb-4">Top Services</h2>
            {topServices.length === 0 ? (
              <p className="text-sm text-gray-400 py-6 text-center">No service data yet</p>
            ) : (
              <div className="space-y-4">
                {topServices.map(({ service, count, revenue }) => {
                  const pct = Math.round((revenue / maxServiceRevenue) * 100)
                  return (
                    <div key={service}>
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-sm font-medium text-gray-700 truncate mr-2">{service}</span>
                        <div className="text-right shrink-0">
                          <span className="text-xs font-bold text-[#422a15]">{fmtK(revenue)}</span>
                          <span className="text-xs text-gray-400 ml-2">({count})</span>
                        </div>
                      </div>
                      <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-linear-to-r from-[#FF6500] to-amber-400 rounded-full transition-all duration-700"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>

          {/* Recent transactions */}
          <div className="bg-white rounded-2xl border border-gray-100 p-5">
            <h2 className="font-semibold text-[#422a15] mb-4">Recent Transactions</h2>
            {transactions.length === 0 ? (
              <p className="text-sm text-gray-400 py-6 text-center">No transactions yet</p>
            ) : (
              <div className="space-y-3">
                {transactions.map(b => {
                  const pmtStatus = getPaymentStatus(b)
                  const { label, bg, text } = txStatus[pmtStatus]
                  const displayAmount = b.status === 'completed' ? b.price : b.depositPaid ? b.depositAmount : b.depositAmount
                  return (
                    <div key={b.id} className="flex items-center gap-3">
                      <div
                        className="w-9 h-9 rounded-xl flex items-center justify-center text-xs font-bold text-white shrink-0"
                        style={{ background: b.clientColor }}
                      >
                        {b.initials}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-gray-800 truncate">{b.client}</p>
                        <p className="text-xs text-gray-400 truncate">{b.service}</p>
                      </div>
                      <div className="text-right shrink-0">
                        <p className={`text-sm font-bold ${b.status === 'cancelled' ? 'text-red-400 line-through' : 'text-[#422a15]'}`}>
                          {fmt(displayAmount)}
                        </p>
                        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${bg} ${text}`}>
                          {label}
                        </span>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>

        </div>
      </div>
    </>
  )
}
