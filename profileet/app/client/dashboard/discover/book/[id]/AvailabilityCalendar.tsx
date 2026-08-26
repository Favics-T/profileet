'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { Calendar, ChevronLeft, ChevronRight, Loader2 } from 'lucide-react'
import type { DayStatus } from '@/type/index'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
]
const WEEKDAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

const pad = (n: number) => String(n).padStart(2, '0')
const toKey = (y: number, m: number, d: number) => `${y}-${pad(m + 1)}-${pad(d)}`

interface CalendarCell {
  date: Date
  key: string
  inMonth: boolean
}

function buildCalendarGrid(year: number, month: number): CalendarCell[] {
  const firstOfMonth = new Date(year, month, 1)
  const gridStart = new Date(year, month, 1 - firstOfMonth.getDay())
  const cells: CalendarCell[] = []
  for (let i = 0; i < 42; i++) {
    const d = new Date(gridStart)
    d.setDate(gridStart.getDate() + i)
    cells.push({ date: d, key: toKey(d.getFullYear(), d.getMonth(), d.getDate()), inMonth: d.getMonth() === month })
  }
  return cells
}

function formatDisplayDate(key: string): string {
  const [y, m, d] = key.split('-').map(Number)
  return new Date(y, m - 1, d).toLocaleDateString('en-NG', { month: 'short', day: 'numeric', year: 'numeric' })
}

interface AvailabilityCalendarProps {
  artisanId: string
  value: string
  onChange: (date: string) => void
}

export default function AvailabilityCalendar({ artisanId, value, onChange }: AvailabilityCalendarProps) {
  const today = useMemo(() => new Date(), [])
  const todayKey = toKey(today.getFullYear(), today.getMonth(), today.getDate())
  const [year, setYear] = useState(today.getFullYear())
  const [month, setMonth] = useState(today.getMonth())

  const [dayStatuses, setDayStatuses] = useState<Record<string, DayStatus>>({})
  const [loading, setLoading] = useState(true)

  const [open, setOpen] = useState(false)
  const wrapperRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    let cancelled = false
    fetch(`${API_URL}/availability/artisan/${artisanId}`)
      .then(res => (res.ok ? res.json() : null))
      .then(data => {
        if (cancelled || !data) return
        const statuses: Record<string, DayStatus> = {}
        for (const row of data.availability ?? []) {
          statuses[String(row.date).slice(0, 10)] = row.status
        }
        setDayStatuses(statuses)
      })
      .catch(() => {})
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [artisanId])

  useEffect(() => {
    if (!open) return
    const handleClickOutside = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [open])

  const cells = useMemo(() => buildCalendarGrid(year, month), [year, month])

  const prevMonth = () => {
    if (month === 0) { setYear(y => y - 1); setMonth(11) } else setMonth(m => m - 1)
  }
  const nextMonth = () => {
    if (month === 11) { setYear(y => y + 1); setMonth(0) } else setMonth(m => m + 1)
  }

  const selectDate = (key: string) => {
    onChange(key)
    setOpen(false)
  }

  return (
    <div ref={wrapperRef} className="relative">
      <label className="mb-1.5 block text-sm font-medium text-brand-dark">Preferred Date</label>

      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        className="flex w-full items-center justify-between rounded-xl border border-border-light bg-white px-4 py-2.5 text-sm text-brand-dark outline-none transition-colors focus:border-accent-gold"
      >
        <span className={value ? 'text-brand-dark' : 'text-brand-dark/35'}>
          {value ? formatDisplayDate(value) : 'Select a date'}
        </span>
        <Calendar className="h-4 w-4 text-brand-dark/40" />
      </button>

      {open && (
        <div className="absolute left-0 top-full z-30 mt-2 w-full rounded-xl border border-border-light bg-white p-3 shadow-lg sm:w-80">
          <div className="mb-3 flex items-center justify-between">
            <button type="button" onClick={prevMonth} className="rounded-lg p-1.5 text-brand-dark hover:bg-brand-dark/5">
              <ChevronLeft className="h-4 w-4" />
            </button>
            <span className="text-sm font-semibold text-brand-dark">{MONTH_NAMES[month]} {year}</span>
            <button type="button" onClick={nextMonth} className="rounded-lg p-1.5 text-brand-dark hover:bg-brand-dark/5">
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>

          {loading ? (
            <div className="flex items-center justify-center gap-2 py-8 text-xs text-brand-dark/50">
              <Loader2 className="h-3.5 w-3.5 animate-spin" /> Loading availability&hellip;
            </div>
          ) : (
            <>
              <div className="mb-1 grid grid-cols-7 gap-1">
                {WEEKDAY_LABELS.map(d => (
                  <div key={d} className="py-1 text-center text-[11px] font-semibold text-brand-dark/40">{d}</div>
                ))}
              </div>

              <div className="grid grid-cols-7 gap-1">
                {cells.map(cell => {
                  const status = cell.inMonth ? dayStatuses[cell.key] : undefined
                  const isPast = cell.key < todayKey
                  const isOff = status === 'off'
                  const isBusy = status === 'busy'
                  const isSelectable = cell.inMonth && !isPast && !isOff
                  const isSelected = cell.key === value

                  let cellBg = 'bg-transparent'
                  if (cell.inMonth && !isPast) {
                    if (isOff) cellBg = 'bg-red-50'
                    else if (isBusy) cellBg = 'bg-amber-50'
                    else cellBg = 'bg-green-50'
                  }

                  let borderClass = 'border border-transparent'
                  if (cell.inMonth && !isPast) {
                    if (isOff) borderClass = 'border border-red-200'
                    else if (isBusy) borderClass = 'border border-amber-200'
                    else borderClass = 'border border-green-200'
                  }
                  if (isSelected) borderClass = 'border-2 border-brand-dark'
                  else if (cell.key === todayKey) borderClass = 'border-2 border-accent-gold'

                  let textClass = 'text-brand-dark/20'
                  if (cell.inMonth) {
                    if (isPast) textClass = 'text-brand-dark/25'
                    else if (isOff) textClass = 'text-red-400'
                    else if (isBusy) textClass = 'text-amber-700'
                    else textClass = 'text-green-700'
                  }

                  return (
                    <button
                      type="button"
                      key={cell.key}
                      disabled={!isSelectable}
                      onClick={() => selectDate(cell.key)}
                      className={`flex aspect-square w-full items-center justify-center rounded-lg text-xs font-semibold transition-colors ${cellBg} ${borderClass} ${textClass} ${
                        isSelectable ? 'cursor-pointer hover:border-accent-gold/60' : 'cursor-not-allowed'
                      }`}
                    >
                      {cell.date.getDate()}
                    </button>
                  )
                })}
              </div>

              <div className="mt-3 flex flex-wrap items-center gap-3 text-[11px] text-brand-dark/60">
                <span className="flex items-center gap-1">
                  <span className="h-2.5 w-2.5 rounded border border-green-200 bg-green-50" /> Available
                </span>
                <span className="flex items-center gap-1">
                  <span className="h-2.5 w-2.5 rounded border border-amber-200 bg-amber-50" /> Busy
                </span>
                <span className="flex items-center gap-1">
                  <span className="h-2.5 w-2.5 rounded border border-red-200 bg-red-50" /> Unavailable
                </span>
              </div>

              {value && dayStatuses[value] === 'busy' && (
                <p className="mt-2 text-xs text-amber-700">
                  Heads up: the artisan marked this date busy, they may take longer to respond.
                </p>
              )}
            </>
          )}
        </div>
      )}
    </div>
  )
}
