'use client'

import { useEffect, useMemo, useState } from 'react'
import { Menu, ChevronLeft, ChevronRight, CalendarRange, AlertCircle, Loader2, X } from 'lucide-react'
import { useSidebar } from '@/context/SidebarContext'
import { authHeader } from '@/lib/auth'
import Card from '@/component/ui/Card'
import Button from '@/component/ui/Button'
import Badge from '@/component/ui/Badge'
import { DayStatus } from '@/type/index'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
]
const WEEKDAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

const STATUS_LABEL: Record<DayStatus, string> = {
  open: 'Available',
  busy: 'Busy',
  off: 'Off',
}
const STATUS_ORDER: DayStatus[] = ['open', 'busy', 'off']

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

interface BookingRow {
  deliveryDate: string
  status: string
}


function normalizeDateKeys(raw: Record<string, DayStatus>): Record<string, DayStatus> {
  const out: Record<string, DayStatus> = {}
  for (const [k, v] of Object.entries(raw)) out[k.slice(0, 10)] = v
  return out
}

async function fetchAllBookings(): Promise<BookingRow[]> {
  const limit = 100
  let page = 1
  let all: BookingRow[] = []
  for (;;) {
    const res = await fetch(`${API_URL}/bookings?page=${page}&limit=${limit}`, { headers: { ...authHeader() } })
    if (!res.ok) throw new Error(`Failed to load bookings (${res.status})`)
    const json: { data: BookingRow[]; total: number } = await res.json()
    all = all.concat(json.data)
    if (all.length >= json.total || json.data.length === 0 || page > 20) break
    page++
  }
  return all
}

type ConfirmOff = { mode: 'single'; key: string } | { mode: 'range'; keys: string[] }

export default function AvailabilityPage() {
  const { toggle } = useSidebar()

  const today = useMemo(() => new Date(), [])
  const todayKey = toKey(today.getFullYear(), today.getMonth(), today.getDate())
  const [year, setYear] = useState(today.getFullYear())
  const [month, setMonth] = useState(today.getMonth())

  const [dayStatuses, setDayStatuses] = useState<Record<string, DayStatus>>({})
  const [bookedDates, setBookedDates] = useState<Set<string>>(new Set())
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [selectedKey, setSelectedKey] = useState<string | null>(null)
  const [popoverStatus, setPopoverStatus] = useState<DayStatus>('open')
  const [savingKey, setSavingKey] = useState<string | null>(null)
  const [actionError, setActionError] = useState<string | null>(null)

  const [confirmOff, setConfirmOff] = useState<ConfirmOff | null>(null)

  const [rangeOpen, setRangeOpen] = useState(false)
  const [rangeStart, setRangeStart] = useState('')
  const [rangeEnd, setRangeEnd] = useState('')
  const [rangeStatus, setRangeStatus] = useState<DayStatus>('open')
  const [rangeSaving, setRangeSaving] = useState(false)
  const [rangeError, setRangeError] = useState<string | null>(null)

  const [reloadToken, setReloadToken] = useState(0)
  const retry = () => setReloadToken(t => t + 1)

  useEffect(() => {
    let cancelled = false
    async function loadAll() {
      setLoading(true)
      setError(null)
      try {
        const [availRes, bookingRows] = await Promise.all([
          fetch(`${API_URL}/availability`, { headers: { ...authHeader() } }),
          fetchAllBookings(),
        ])
        if (!availRes.ok) throw new Error(`Failed to load availability (${availRes.status})`)
        const availData: Record<string, DayStatus> = await availRes.json()
        if (cancelled) return

        const booked = new Set<string>()
        for (const b of bookingRows) {
          if (b.status !== 'cancelled') booked.add(b.deliveryDate.slice(0, 10))
        }

        setDayStatuses(normalizeDateKeys(availData))
        setBookedDates(booked)
      } catch (err) {
        if (!cancelled) setError(err instanceof Error ? err.message : 'Failed to load availability')
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    loadAll()
    return () => {
      cancelled = true
    }
  }, [reloadToken])

  const cells = useMemo(() => buildCalendarGrid(year, month), [year, month])
  const busy = !!savingKey || rangeSaving

  const prevMonth = () => {
    setSelectedKey(null)
    if (month === 0) { setYear(y => y - 1); setMonth(11) } else setMonth(m => m - 1)
  }
  const nextMonth = () => {
    setSelectedKey(null)
    if (month === 11) { setYear(y => y + 1); setMonth(0) } else setMonth(m => m + 1)
  }

  const handleDayClick = (cell: CalendarCell) => {
    if (!cell.inMonth || busy) return
    if (selectedKey === cell.key) { setSelectedKey(null); return }
    setSelectedKey(cell.key)
    setPopoverStatus(dayStatuses[cell.key] ?? 'open')
    setActionError(null)
  }

  const persistSingle = async (key: string, status: DayStatus) => {
    const previous = dayStatuses[key]
    setSavingKey(key)
    setActionError(null)
    setDayStatuses(prev => ({ ...prev, [key]: status }))
    try {
      const res = await fetch(`${API_URL}/availability`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...authHeader() },
        body: JSON.stringify({ date: key, status }),
      })
      if (!res.ok) throw new Error(`Failed to save (${res.status})`)
      setSelectedKey(null)
    } catch (err) {
      setDayStatuses(prev => {
        const next = { ...prev }
        if (previous === undefined) delete next[key]
        else next[key] = previous
        return next
      })
      setActionError(err instanceof Error ? err.message : 'Failed to save availability')
    } finally {
      setSavingKey(null)
    }
  }

  const handleSaveDay = () => {
    if (!selectedKey) return
    if (popoverStatus === 'off' && bookedDates.has(selectedKey)) {
      setConfirmOff({ mode: 'single', key: selectedKey })
      return
    }
    persistSingle(selectedKey, popoverStatus)
  }

  const persistRange = async (keys: string[], status: DayStatus) => {
    const previous = dayStatuses
    setRangeSaving(true)
    setRangeError(null)
    setDayStatuses(prev => {
      const next = { ...prev }
      keys.forEach(k => { next[k] = status })
      return next
    })
    try {
      const res = await fetch(`${API_URL}/availability`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...authHeader() },
        body: JSON.stringify(keys.map(date => ({ date, status }))),
      })
      if (!res.ok) throw new Error(`Failed to save range (${res.status})`)
      setRangeOpen(false)
      setRangeStart('')
      setRangeEnd('')
    } catch (err) {
      setDayStatuses(previous)
      setRangeError(err instanceof Error ? err.message : 'Failed to save date range')
    } finally {
      setRangeSaving(false)
    }
  }

  const handleSaveRange = () => {
    setRangeError(null)
    if (!rangeStart || !rangeEnd) { setRangeError('Pick a start and end date'); return }
    if (rangeStart > rangeEnd) { setRangeError('Start date must be before end date'); return }

    const keys: string[] = []
    const cur = new Date(`${rangeStart}T00:00:00`)
    const end = new Date(`${rangeEnd}T00:00:00`)
    while (cur <= end) {
      keys.push(toKey(cur.getFullYear(), cur.getMonth(), cur.getDate()))
      cur.setDate(cur.getDate() + 1)
    }

    if (rangeStatus === 'off' && keys.some(k => bookedDates.has(k))) {
      setConfirmOff({ mode: 'range', keys })
      return
    }
    persistRange(keys, rangeStatus)
  }

  const handleConfirmOff = () => {
    if (!confirmOff) return
    if (confirmOff.mode === 'single') persistSingle(confirmOff.key, 'off')
    else persistRange(confirmOff.keys, 'off')
    setConfirmOff(null)
  }

  return (
    <>
      <header className="sticky top-0 z-10 flex flex-wrap items-start justify-between gap-4 border-b border-border-light bg-brand-light px-4 py-4 sm:px-8">
        <div className="flex items-start gap-3">
          <button onClick={toggle} className="mt-0.5 rounded-xl p-2 text-brand-dark hover:bg-brand-dark/5 lg:hidden">
            <Menu className="h-5 w-5" />
          </button>
          <div>
            <p className="text-xs font-medium text-brand-dark/40">Dashboard / Availability</p>
            <h1 className="mt-1 text-lg font-bold text-brand-dark">Manage Availability</h1>
            <p className="text-xs text-brand-dark/50">Set the days you&apos;re available for new bookings.</p>
          </div>
        </div>

        <button
          onClick={() => { setRangeOpen(true); setRangeError(null) }}
          className="inline-flex shrink-0 items-center gap-2 rounded-xl border border-accent-gold px-4 py-2.5 text-sm font-semibold text-accent-gold transition-colors hover:bg-accent-gold/10"
        >
          <CalendarRange className="h-4 w-4" />
          Mark a Date Range
        </button>
      </header>

      <div className="space-y-4 p-4 sm:p-6 lg:p-8">
        {error ? (
          <div className="flex flex-col items-center gap-3 rounded-2xl border border-error/30 bg-error/10 px-6 py-10 text-center">
            <AlertCircle className="h-6 w-6 text-error" />
            <p className="text-sm text-error">{error}</p>
            <Button variant="outline" onClick={retry}>Retry</Button>
          </div>
        ) : (
          <Card className="p-5">
            {loading ? (
              <div className="flex items-center justify-center gap-2 py-20 text-sm text-brand-dark/50">
                <Loader2 className="h-4 w-4 animate-spin" /> Loading availability&hellip;
              </div>
            ) : (
              <>
                <div className="mb-5 flex items-center justify-between">
                  <button onClick={prevMonth} className="rounded-xl p-2 text-brand-dark hover:bg-brand-dark/5">
                    <ChevronLeft className="h-4 w-4" />
                  </button>
                  <h2 className="text-sm font-bold text-brand-dark">{MONTH_NAMES[month]} {year}</h2>
                  <button onClick={nextMonth} className="rounded-xl p-2 text-brand-dark hover:bg-brand-dark/5">
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>

                <div className="mb-1 grid grid-cols-7 gap-1">
                  {WEEKDAY_LABELS.map(d => (
                    <div key={d} className="py-1 text-center text-xs font-semibold text-brand-dark/40">{d}</div>
                  ))}
                </div>

                <div className="grid grid-cols-7 gap-1">
                  {cells.map(cell => {
                    const status = cell.inMonth ? dayStatuses[cell.key] : undefined
                    const isToday = cell.key === todayKey
                    const isSelected = cell.key === selectedKey
                    const hasBooking = cell.inMonth && bookedDates.has(cell.key)
                    const isSaving = savingKey === cell.key

                    let cellBg = 'bg-white'
                    if (!cell.inMonth) cellBg = 'bg-transparent'
                    else if (status === 'busy') cellBg = 'bg-accent-gold/20'
                    else if (status === 'off') cellBg = 'bg-gray-100'

                    let borderClass = 'border border-border-light'
                    if (!cell.inMonth) borderClass = 'border border-transparent'
                    else if (isSelected) borderClass = 'border-2 border-brand-dark'
                    else if (isToday) borderClass = 'border-2 border-accent-gold'

                    return (
                      <div key={cell.key} className="relative">
                        <button
                          onClick={() => handleDayClick(cell)}
                          disabled={!cell.inMonth || busy}
                          style={cell.inMonth && status === 'off'
                            ? { backgroundImage: 'repeating-linear-gradient(45deg, rgba(6,59,0,0.08) 0, rgba(6,59,0,0.08) 4px, transparent 4px, transparent 8px)' }
                            : undefined}
                          className={`flex aspect-square w-full flex-col items-center justify-center gap-0.5 rounded-lg text-xs font-semibold transition-colors ${cellBg} ${borderClass} ${
                            !cell.inMonth ? 'cursor-default text-brand-dark/20' : 'cursor-pointer text-brand-dark hover:border-accent-gold/60'
                          } ${isSaving ? 'opacity-50' : ''}`}
                        >
                          {isSaving ? (
                            <Loader2 className="h-3 w-3 animate-spin" />
                          ) : (
                            <>
                              <span>{cell.date.getDate()}</span>
                              {isToday && <span className="text-[9px] font-normal text-accent-gold">Today</span>}
                            </>
                          )}
                          {hasBooking && <span className="absolute right-1.5 top-1.5 h-1.5 w-1.5 rounded-full bg-error" />}
                        </button>

                        {isSelected && (
                          <div className="absolute left-1/2 top-full z-20 mt-2 w-44 -translate-x-1/2 rounded-xl border border-border-light bg-white p-3 text-left shadow-lg">
                            <p className="mb-2 text-xs font-semibold text-brand-dark">
                              {cell.date.toLocaleDateString('en-NG', { month: 'short', day: 'numeric' })}
                            </p>
                            {hasBooking && (
                              <Badge variant="terracotta" className="mb-2 w-full justify-center">Has a booking</Badge>
                            )}
                            <div className="space-y-1">
                              {STATUS_ORDER.map(s => (
                                <button
                                  key={s}
                                  onClick={() => setPopoverStatus(s)}
                                  className={`w-full rounded-lg px-2 py-1.5 text-left text-xs font-medium transition-colors ${
                                    popoverStatus === s ? 'bg-brand-dark text-brand-light' : 'text-brand-dark hover:bg-brand-dark/5'
                                  }`}
                                >
                                  {STATUS_LABEL[s]}
                                </button>
                              ))}
                            </div>
                            {actionError && <p className="mt-2 text-[11px] text-error">{actionError}</p>}
                            <Button onClick={handleSaveDay} loading={savingKey === selectedKey} className="mt-2 w-full">
                              Save
                            </Button>
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              </>
            )}
          </Card>
        )}

        <div className="flex flex-wrap items-center gap-4 text-xs text-brand-dark/60">
          <span className="flex items-center gap-1.5">
            <span className="h-3 w-3 rounded border border-border-light bg-white" /> Available
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-3 w-3 rounded bg-accent-gold/30" /> Busy
          </span>
          <span className="flex items-center gap-1.5">
            <span
              className="h-3 w-3 rounded bg-gray-100"
              style={{ backgroundImage: 'repeating-linear-gradient(45deg, rgba(6,59,0,0.15) 0, rgba(6,59,0,0.15) 2px, transparent 2px, transparent 4px)' }}
            />
            Off
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-error" /> Has Booking
          </span>
        </div>
      </div>

      {rangeOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4"
          onClick={() => !rangeSaving && setRangeOpen(false)}
        >
          <Card className="w-full max-w-sm" onClick={e => e.stopPropagation()}>
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-sm font-bold text-brand-dark">Mark a Date Range</h3>
              <button
                onClick={() => setRangeOpen(false)}
                className="rounded-lg p-1 text-brand-dark/50 hover:bg-brand-dark/5"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="mb-1 block text-xs font-medium text-brand-dark/60">Start date</label>
                <input
                  type="date"
                  value={rangeStart}
                  onChange={e => setRangeStart(e.target.value)}
                  className="w-full rounded-xl border border-border-light px-3 py-2 text-sm text-brand-dark outline-none focus:border-accent-gold"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-brand-dark/60">End date</label>
                <input
                  type="date"
                  value={rangeEnd}
                  onChange={e => setRangeEnd(e.target.value)}
                  className="w-full rounded-xl border border-border-light px-3 py-2 text-sm text-brand-dark outline-none focus:border-accent-gold"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-brand-dark/60">Status</label>
                <div className="flex gap-2">
                  {STATUS_ORDER.map(s => (
                    <button
                      key={s}
                      onClick={() => setRangeStatus(s)}
                      className={`flex-1 rounded-xl border px-3 py-2 text-xs font-semibold transition-colors ${
                        rangeStatus === s ? 'border-brand-dark bg-brand-dark text-brand-light' : 'border-border-light text-brand-dark hover:border-accent-gold/50'
                      }`}
                    >
                      {STATUS_LABEL[s]}
                    </button>
                  ))}
                </div>
              </div>
              {rangeError && <p className="text-xs text-error">{rangeError}</p>}
            </div>

            <div className="mt-5 flex justify-end gap-2">
              <Button variant="ghost" onClick={() => setRangeOpen(false)} disabled={rangeSaving}>Cancel</Button>
              <Button onClick={handleSaveRange} loading={rangeSaving}>Save</Button>
            </div>
          </Card>
        </div>
      )}

      {confirmOff && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <Card className="w-full max-w-sm">
            <div className="flex gap-3">
              <AlertCircle className="h-5 w-5 shrink-0 text-error" />
              <div>
                <h3 className="text-sm font-bold text-brand-dark">Confirmed booking on this day</h3>
                <p className="mt-1 text-xs text-brand-dark/60">
                  {confirmOff.mode === 'single'
                    ? 'This day has a confirmed booking — are you sure you want to mark it unavailable?'
                    : `${confirmOff.keys.filter(k => bookedDates.has(k)).length} day(s) in this range have a confirmed booking — are you sure you want to mark them unavailable?`}
                </p>
              </div>
            </div>
            <div className="mt-5 flex justify-end gap-2">
              <Button variant="ghost" onClick={() => setConfirmOff(null)}>Cancel</Button>
              <Button onClick={handleConfirmOff}>Yes, mark unavailable</Button>
            </div>
          </Card>
        </div>
      )}
    </>
  )
}
