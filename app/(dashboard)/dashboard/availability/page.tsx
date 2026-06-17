'use client'

import { useState } from 'react'
import { useSidebar } from '@/context/SidebarContext'
import { Menu, ChevronLeft, ChevronRight, CheckCircle, Info } from 'lucide-react'

type DayStatus = 'open' | 'busy' | 'off'

const DAY_STATUS: Record<DayStatus, { label: string; bg: string; text: string; border: string }> = {
  open: { label: 'Available',    bg: 'bg-green-100',  text: 'text-green-700', border: 'border-green-300' },
  busy: { label: 'Fully Booked', bg: 'bg-red-100',    text: 'text-red-600',   border: 'border-red-300' },
  off:  { label: 'Day Off',      bg: 'bg-gray-100',   text: 'text-gray-500',  border: 'border-gray-300' },
}

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

function getDaysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate()
}
function getFirstDayOfMonth(year: number, month: number) {
  return new Date(year, month, 1).getDay()
}

const MONTH_NAMES = ['January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December']

export default function AvailabilityPage() {
  const { toggle } = useSidebar()
  const today = new Date()
  const [year, setYear] = useState(today.getFullYear())
  const [month, setMonth] = useState(today.getMonth())
  const [dayStatuses, setDayStatuses] = useState<Record<string, DayStatus>>({})
  const [saved, setSaved] = useState(false)
  const [selectedDay, setSelectedDay] = useState<number | null>(null)

  const daysInMonth = getDaysInMonth(year, month)
  const firstDay    = getFirstDayOfMonth(year, month)

  const key = (d: number) => `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`

  const setStatus = (day: number, status: DayStatus) => {
    setDayStatuses(prev => ({ ...prev, [key(day)]: status }))
    setSelectedDay(null)
  }

  const prevMonth = () => {
    if (month === 0) { setYear(y => y - 1); setMonth(11) }
    else setMonth(m => m - 1)
    setSelectedDay(null)
  }
  const nextMonth = () => {
    if (month === 11) { setYear(y => y + 1); setMonth(0) }
    else setMonth(m => m + 1)
    setSelectedDay(null)
  }

  const handleSave = async () => {
    await new Promise(r => setTimeout(r, 600))
    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
  }

  const openDays = Object.values(dayStatuses).filter(s => s === 'open').length
  const busyDays = Object.values(dayStatuses).filter(s => s === 'busy').length

  return (
    <>
      {/* Top bar */}
      <header className="bg-white border-b border-gray-100 px-4 sm:px-8 py-4 flex items-center justify-between sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <button onClick={toggle} className="lg:hidden p-2 rounded-xl hover:bg-gray-100 text-gray-600 shrink-0">
            <Menu className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-base sm:text-lg font-bold text-[#422a15]">Availability</h1>
            <p className="text-xs text-gray-400 hidden sm:block">Set your open and busy days for clients to see</p>
          </div>
        </div>
        <button
          onClick={handleSave}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#FF6500] text-white text-sm font-semibold hover:opacity-90 transition-all"
        >
          {saved ? <><CheckCircle className="w-4 h-4" /> Saved!</> : 'Save Changes'}
        </button>
      </header>

      <div className="p-4 sm:p-6 lg:p-8 max-w-2xl mx-auto w-full space-y-5">

        {/* Legend */}
        <div className="flex flex-wrap gap-2">
          {(Object.entries(DAY_STATUS) as [DayStatus, typeof DAY_STATUS[DayStatus]][]).map(([status, cfg]) => (
            <span key={status} className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${cfg.bg} ${cfg.text} ${cfg.border}`}>
              <span className={`w-2 h-2 rounded-full inline-block ${status === 'open' ? 'bg-green-500' : status === 'busy' ? 'bg-red-400' : 'bg-gray-400'}`} />
              {cfg.label}
            </span>
          ))}
        </div>

        {/* Calendar card */}
        <div className="bg-white rounded-2xl border border-gray-100 p-5">
          {/* Month navigation */}
          <div className="flex items-center justify-between mb-5">
            <button onClick={prevMonth} className="p-2 rounded-xl hover:bg-gray-100 transition-colors">
              <ChevronLeft className="w-4 h-4 text-gray-600" />
            </button>
            <h2 className="font-bold text-[#422a15]">{MONTH_NAMES[month]} {year}</h2>
            <button onClick={nextMonth} className="p-2 rounded-xl hover:bg-gray-100 transition-colors">
              <ChevronRight className="w-4 h-4 text-gray-600" />
            </button>
          </div>

          {/* Day headers */}
          <div className="grid grid-cols-7 mb-2">
            {WEEKDAYS.map(d => (
              <div key={d} className="text-center text-xs font-semibold text-gray-400 py-1">{d}</div>
            ))}
          </div>

          {/* Day grid */}
          <div className="grid grid-cols-7 gap-1">
            {Array.from({ length: firstDay }).map((_, i) => <div key={`empty-${i}`} />)}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const day = i + 1
              const k = key(day)
              const status = dayStatuses[k]
              const isToday = day === today.getDate() && month === today.getMonth() && year === today.getFullYear()
              const isPast = new Date(year, month, day) < new Date(today.getFullYear(), today.getMonth(), today.getDate())
              const isSelected = selectedDay === day
              const cfg = status ? DAY_STATUS[status] : null

              return (
                <button
                  key={day}
                  onClick={() => !isPast && setSelectedDay(isSelected ? null : day)}
                  disabled={isPast}
                  className={`
                    aspect-square rounded-xl text-xs font-semibold transition-all flex items-center justify-center relative
                    ${isPast ? 'opacity-30 cursor-not-allowed text-gray-400' : 'cursor-pointer'}
                    ${isSelected ? 'ring-2 ring-[#FF6500] ring-offset-1' : ''}
                    ${cfg ? `${cfg.bg} ${cfg.text}` : isToday ? 'bg-[#FF6500]/10 text-[#FF6500]' : 'hover:bg-gray-50 text-gray-700'}
                  `}
                >
                  {day}
                  {isToday && !status && <span className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-[#FF6500] rounded-full" />}
                </button>
              )
            })}
          </div>
        </div>

        {/* Status picker for selected day */}
        {selectedDay && (
          <div className="bg-white rounded-2xl border border-gray-100 p-5">
            <p className="text-sm font-semibold text-gray-700 mb-3">
              Set status for <span className="text-[#FF6500]">{MONTH_NAMES[month]} {selectedDay}</span>
            </p>
            <div className="flex gap-2">
              {(Object.entries(DAY_STATUS) as [DayStatus, typeof DAY_STATUS[DayStatus]][]).map(([status, cfg]) => (
                <button
                  key={status}
                  onClick={() => setStatus(selectedDay, status)}
                  className={`flex-1 py-2.5 rounded-xl text-xs font-semibold border transition-all ${cfg.bg} ${cfg.text} ${cfg.border} hover:opacity-80`}
                >
                  {cfg.label}
                </button>
              ))}
              {dayStatuses[key(selectedDay)] && (
                <button
                  onClick={() => { setDayStatuses(prev => { const n = { ...prev }; delete n[key(selectedDay!)]; return n }); setSelectedDay(null) }}
                  className="px-3 py-2.5 rounded-xl text-xs font-semibold border border-gray-200 text-gray-500 hover:bg-gray-50"
                >
                  Clear
                </button>
              )}
            </div>
          </div>
        )}

        {/* Summary */}
        <div className="bg-white rounded-2xl border border-gray-100 p-5">
          <h3 className="font-semibold text-[#422a15] mb-3">This Month Summary</h3>
          <div className="grid grid-cols-3 gap-3 text-center">
            <div className="bg-green-50 rounded-xl p-3">
              <p className="text-xl font-bold text-green-700">{openDays}</p>
              <p className="text-xs text-green-600 mt-0.5">Open days</p>
            </div>
            <div className="bg-red-50 rounded-xl p-3">
              <p className="text-xl font-bold text-red-600">{busyDays}</p>
              <p className="text-xs text-red-500 mt-0.5">Fully booked</p>
            </div>
            <div className="bg-gray-50 rounded-xl p-3">
              <p className="text-xl font-bold text-gray-600">{daysInMonth - openDays - busyDays}</p>
              <p className="text-xs text-gray-500 mt-0.5">Unset days</p>
            </div>
          </div>
        </div>

        {/* Info */}
        <div className="flex items-start gap-2 bg-amber-50 border border-amber-100 rounded-2xl px-4 py-3">
          <Info className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
          <p className="text-xs text-amber-700">
            Your availability is shown on your public profile. Clients won&apos;t be able to request bookings on days marked <strong>Fully Booked</strong>.
          </p>
        </div>

      </div>
    </>
  )
}
