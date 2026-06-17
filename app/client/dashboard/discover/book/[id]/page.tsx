'use client'

import { useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import {
  ArrowLeft,
  Calendar,
  Ruler,
  Palette,
  Video,
  CheckCircle,
  ChevronRight,
  Clock,
  Info,
  Sparkles,
  User,
} from 'lucide-react'
import Link from 'next/link'

/* ─── Designer data (shared with discover page) ─── */
const DESIGNERS: Record<string, {
  id: string; name: string; specialty: string; location: string
  rating: number; reviews: number; startingPrice: number; initials: string; color: string
}> = {
  '1': { id: '1', name: 'Adaeze Nwosu',  specialty: 'Bridal & Ankara',      location: 'Lagos, VI',       rating: 4.9, reviews: 84,  startingPrice: 45000, initials: 'AN', color: '#1a1a2e' },
  '2': { id: '2', name: 'Emeka Fashola', specialty: 'Streetwear & Casual',   location: 'Lagos, Ikeja',    rating: 4.7, reviews: 52,  startingPrice: 20000, initials: 'EF', color: '#1a1a2e' },
  '3': { id: '3', name: 'Fatima Aliyu',  specialty: 'Kaftan & Aso-oke',      location: 'Abuja, Wuse',     rating: 4.8, reviews: 67,  startingPrice: 35000, initials: 'FA', color: '#1a1a2e' },
  '4': { id: '4', name: 'Chidi Okafor',  specialty: 'Corporate & Suits',     location: 'Port Harcourt',   rating: 4.6, reviews: 39,  startingPrice: 30000, initials: 'CO', color: '#1a1a2e' },
  '5': { id: '5', name: 'Ngozi Eze',     specialty: 'Evening & Cocktail',    location: 'Lagos, Lekki',    rating: 5.0, reviews: 101, startingPrice: 60000, initials: 'NE', color: '#1a1a2e' },
  '6': { id: '6', name: 'Bayo Adeleke',  specialty: 'Agbada & Traditional',  location: 'Ibadan',          rating: 4.5, reviews: 28,  startingPrice: 25000, initials: 'BA', color: '#1a1a2e' },
}

const FABRIC_OPTIONS = ['Ankara', 'Lace', 'Aso-oke', 'Silk', 'Chiffon', 'Cotton', 'Velvet', 'George', 'Adire']
const COLOR_PALETTE = [
  '#1a1a2e', '#FF6500', '#be185d', '#7c3aed', '#0ea5e9', '#16a34a',
  '#d97706', '#dc2626', '#0d9488', '#6366f1', '#ec4899', '#f59e0b',
]
const OCCASION_OPTIONS = ['Wedding', 'Birthday', 'Corporate Event', 'Graduation', 'Party', 'Everyday Wear', 'Traditional Ceremony', 'Other']
const CONSULTATION_SLOTS = ['9:00 AM', '10:00 AM', '11:00 AM', '12:00 PM', '2:00 PM', '3:00 PM', '4:00 PM', '5:00 PM']

type Step = 'booking' | 'design' | 'measurements' | 'consultation' | 'confirm'

interface BookingForm {
  deliveryDate: string
  occasion: string
  quantity: number
  urgentOrder: boolean
  // Design
  designNotes: string
  fabrics: string[]
  colors: string[]
  inspirationRef: string
  // Measurements (in cm)
  chest: string; waist: string; hips: string; shoulder: string
  sleeveLength: string; dressLength: string; height: string; weight: string
  // Consultation
  wantConsultation: boolean
  consultationDate: string
  consultationTime: string
  consultationNote: string
}

const STEPS: { key: Step; label: string; icon: React.FC<{ className?: string }> }[] = [
  { key: 'booking',       label: 'Booking',      icon: Calendar  },
  { key: 'design',        label: 'Design',       icon: Palette   },
  { key: 'measurements',  label: 'Measurements', icon: Ruler     },
  { key: 'consultation',  label: 'Consultation', icon: Video     },
  { key: 'confirm',       label: 'Confirm',      icon: CheckCircle },
]

export default function BookPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const designer = DESIGNERS[id]

  const [step, setStep] = useState<Step>('booking')
  const [submitted, setSubmitted] = useState(false)
  const [form, setForm] = useState<BookingForm>({
    deliveryDate: '',
    occasion: '',
    quantity: 1,
    urgentOrder: false,
    designNotes: '',
    fabrics: [],
    colors: [],
    inspirationRef: '',
    chest: '', waist: '', hips: '', shoulder: '',
    sleeveLength: '', dressLength: '', height: '', weight: '',
    wantConsultation: false,
    consultationDate: '',
    consultationTime: '',
    consultationNote: '',
  })

  if (!designer) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-gray-400">
        <p className="text-lg font-semibold">Designer not found</p>
        <Link href="/client/dashboard/discover" className="mt-4 text-sm text-orange-500 underline">
          Back to Discover
        </Link>
      </div>
    )
  }

  const update = (field: Partial<BookingForm>) => setForm(prev => ({ ...prev, ...field }))

  const toggleFabric = (fabric: string) => {
    update({ fabrics: form.fabrics.includes(fabric) ? form.fabrics.filter(f => f !== fabric) : [...form.fabrics, fabric] })
  }
  const toggleColor = (color: string) => {
    update({ colors: form.colors.includes(color) ? form.colors.filter(c => c !== color) : [...form.colors, color] })
  }

  const stepIndex = STEPS.findIndex(s => s.key === step)
  const goNext = () => { if (stepIndex < STEPS.length - 1) setStep(STEPS[stepIndex + 1].key) }
  const goPrev = () => { if (stepIndex > 0) setStep(STEPS[stepIndex - 1].key) }

  const handleSubmit = () => setSubmitted(true)

  /* ── Success screen ── */
  if (submitted) {
    return (
      <div className="max-w-lg mx-auto py-16 text-center">
        <div
          className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6"
          style={{ background: 'linear-gradient(135deg,#FF6500,#ff8c3a)' }}
        >
          <CheckCircle className="w-10 h-10 text-white" />
        </div>
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Booking Submitted! 🎉</h2>
        <p className="text-gray-500 text-sm mb-1">
          Your order with <span className="font-semibold text-gray-700">{designer.name}</span> has been submitted.
        </p>
        <p className="text-gray-400 text-xs mb-8">
          You will receive a confirmation once the designer accepts your request.
          {form.wantConsultation && ' A consultation invite will be sent to you shortly.'}
        </p>
        <div className="bg-orange-50 border border-orange-100 rounded-2xl p-4 text-left mb-8">
          <p className="text-xs font-semibold text-orange-600 uppercase tracking-wide mb-2">Booking Summary</p>
          <div className="space-y-1.5 text-sm text-gray-600">
            <div className="flex justify-between"><span className="text-gray-400">Designer</span><span className="font-medium">{designer.name}</span></div>
            <div className="flex justify-between"><span className="text-gray-400">Delivery</span><span className="font-medium">{form.deliveryDate}</span></div>
            <div className="flex justify-between"><span className="text-gray-400">Occasion</span><span className="font-medium">{form.occasion}</span></div>
            <div className="flex justify-between"><span className="text-gray-400">Qty</span><span className="font-medium">{form.quantity} piece{form.quantity > 1 ? 's' : ''}</span></div>
            {form.fabrics.length > 0 && <div className="flex justify-between"><span className="text-gray-400">Fabric</span><span className="font-medium">{form.fabrics.join(', ')}</span></div>}
            {form.wantConsultation && <div className="flex justify-between"><span className="text-gray-400">Consultation</span><span className="font-medium text-orange-500">{form.consultationDate} @ {form.consultationTime}</span></div>}
          </div>
        </div>
        <button
          onClick={() => router.push('/client/dashboard/bookings')}
          className="w-full py-3 rounded-xl text-white font-semibold text-sm transition-all hover:opacity-90"
          style={{ background: 'linear-gradient(135deg,#FF6500,#ff8c3a)' }}
        >
          View My Bookings
        </button>
        <button
          onClick={() => router.push('/client/dashboard/discover')}
          className="w-full py-3 rounded-xl text-gray-500 font-medium text-sm mt-3 hover:bg-gray-100 transition-all"
        >
          Back to Discover
        </button>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto">

      {/* ── Back ── */}
      <Link
        href="/client/dashboard/discover"
        className="inline-flex items-center gap-1.5 text-sm text-gray-400 hover:text-gray-700 mb-5 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" /> Back to Discover
      </Link>

      {/* ── Designer mini card ── */}
      <div className="bg-white border border-gray-100 rounded-2xl p-4 flex items-center gap-4 mb-6 shadow-sm">
        <div
          className="w-12 h-12 rounded-xl flex items-center justify-center text-sm font-bold text-white shrink-0"
          style={{ background: designer.color }}
        >
          {designer.initials}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-bold text-gray-800">{designer.name}</p>
          <p className="text-xs text-gray-500">{designer.specialty} · {designer.location}</p>
        </div>
        <div className="text-right shrink-0">
          <p className="text-xs text-gray-400">Starting from</p>
          <p className="text-sm font-bold" style={{ color: '#FF6500' }}>₦{designer.startingPrice.toLocaleString()}</p>
        </div>
      </div>

      {/* ── Step indicator ── */}
      <div className="flex items-center gap-1 mb-8">
        {STEPS.map((s, i) => {
          const isDone = i < stepIndex
          const isActive = s.key === step
          const Icon = s.icon
          return (
            <div key={s.key} className="flex items-center flex-1">
              <button
                onClick={() => i <= stepIndex && setStep(s.key)}
                className="flex flex-col items-center gap-1 flex-1"
                disabled={i > stepIndex}
              >
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center transition-all"
                  style={
                    isActive
                      ? { background: '#FF6500', color: '#fff' }
                      : isDone
                      ? { background: '#f0fdf4', color: '#16a34a' }
                      : { background: '#f3f4f6', color: '#9ca3af' }
                  }
                >
                  {isDone ? <CheckCircle className="w-4 h-4" /> : <Icon className="w-4 h-4" />}
                </div>
                <span
                  className="text-xs font-medium hidden sm:block"
                  style={{ color: isActive ? '#FF6500' : isDone ? '#16a34a' : '#9ca3af' }}
                >
                  {s.label}
                </span>
              </button>
              {i < STEPS.length - 1 && (
                <div
                  className="h-0.5 flex-1 mx-1 rounded-full transition-all"
                  style={{ background: isDone ? '#16a34a' : '#e5e7eb' }}
                />
              )}
            </div>
          )
        })}
      </div>

      {/* ══════════════════════════════════
          STEP 1 — BOOKING DETAILS
      ══════════════════════════════════ */}
      {step === 'booking' && (
        <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm space-y-5">
          <div>
            <h3 className="text-base font-bold text-gray-800 flex items-center gap-2 mb-1">
              <Calendar className="w-4 h-4" style={{ color: '#FF6500' }} />
              Booking Details
            </h3>
            <p className="text-xs text-gray-400">Set your delivery date and basic order info</p>
          </div>

          {/* Delivery date */}
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1.5">
              Delivery Date <span className="text-red-400">*</span>
            </label>
            <input
              type="date"
              value={form.deliveryDate}
              min={new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0]}
              onChange={e => update({ deliveryDate: e.target.value })}
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none transition-all"
              onFocus={e => { e.target.style.borderColor = '#FF6500'; e.target.style.boxShadow = '0 0 0 3px rgba(255,101,0,0.1)' }}
              onBlur={e => { e.target.style.borderColor = '#e5e7eb'; e.target.style.boxShadow = 'none' }}
            />
            <p className="text-xs text-gray-400 mt-1 flex items-center gap-1">
              <Info className="w-3 h-3" /> Minimum 7 days from today for standard orders
            </p>
          </div>

          {/* Occasion */}
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1.5">
              Occasion / Purpose <span className="text-red-400">*</span>
            </label>
            <div className="flex flex-wrap gap-2">
              {OCCASION_OPTIONS.map(occ => (
                <button
                  key={occ}
                  onClick={() => update({ occasion: occ })}
                  className="px-3 py-1.5 rounded-full text-xs font-medium border transition-all"
                  style={
                    form.occasion === occ
                      ? { background: '#FF6500', color: '#fff', borderColor: '#FF6500' }
                      : { background: '#fff', color: '#6b7280', borderColor: '#e5e7eb' }
                  }
                >
                  {occ}
                </button>
              ))}
            </div>
          </div>

          {/* Quantity */}
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1.5">Number of Pieces</label>
            <div className="flex items-center gap-3">
              <button
                onClick={() => update({ quantity: Math.max(1, form.quantity - 1) })}
                className="w-9 h-9 rounded-xl border border-gray-200 flex items-center justify-center text-gray-600 hover:bg-gray-50 transition-all text-lg font-bold"
              >−</button>
              <span className="w-8 text-center text-sm font-bold text-gray-800">{form.quantity}</span>
              <button
                onClick={() => update({ quantity: form.quantity + 1 })}
                className="w-9 h-9 rounded-xl border border-gray-200 flex items-center justify-center text-gray-600 hover:bg-gray-50 transition-all text-lg font-bold"
              >+</button>
            </div>
          </div>

          {/* Urgent */}
          <div className="flex items-center justify-between bg-amber-50 border border-amber-100 rounded-xl px-4 py-3">
            <div>
              <p className="text-sm font-semibold text-amber-700">Urgent Order</p>
              <p className="text-xs text-amber-500">Rush processing (additional fees may apply)</p>
            </div>
            <button
              onClick={() => update({ urgentOrder: !form.urgentOrder })}
              className="w-11 h-6 rounded-full transition-all relative shrink-0"
              style={{ background: form.urgentOrder ? '#FF6500' : '#e5e7eb' }}
            >
              <span
                className="absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-all"
                style={{ left: form.urgentOrder ? '26px' : '2px' }}
              />
            </button>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════
          STEP 2 — DESIGN CUSTOMISATION
      ══════════════════════════════════ */}
      {step === 'design' && (
        <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm space-y-5">
          <div>
            <h3 className="text-base font-bold text-gray-800 flex items-center gap-2 mb-1">
              <Palette className="w-4 h-4" style={{ color: '#FF6500' }} />
              Custom Design
            </h3>
            <p className="text-xs text-gray-400">Tell the designer exactly how you want your outfit to look</p>
          </div>

          {/* Design notes */}
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1.5">
              Design Description <span className="text-red-400">*</span>
            </label>
            <textarea
              rows={5}
              placeholder="Describe your dream outfit in as much detail as possible. E.g. 'A floor-length A-line bridal gown with off-shoulder neckline, floral lace overlay on the bodice, cinched waist with a bow at the back, and a cathedral train...'"
              value={form.designNotes}
              onChange={e => update({ designNotes: e.target.value })}
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none transition-all resize-none leading-relaxed"
              onFocus={e => { e.target.style.borderColor = '#FF6500'; e.target.style.boxShadow = '0 0 0 3px rgba(255,101,0,0.1)' }}
              onBlur={e => { e.target.style.borderColor = '#e5e7eb'; e.target.style.boxShadow = 'none' }}
            />
            <p className="text-xs text-gray-400 mt-1">{form.designNotes.length} / 1000 characters</p>
          </div>

          {/* Fabric preference */}
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1.5">Preferred Fabric(s)</label>
            <div className="flex flex-wrap gap-2">
              {FABRIC_OPTIONS.map(fabric => (
                <button
                  key={fabric}
                  onClick={() => toggleFabric(fabric)}
                  className="px-3 py-1.5 rounded-full text-xs font-medium border transition-all"
                  style={
                    form.fabrics.includes(fabric)
                      ? { background: '#1a1a2e', color: '#fff', borderColor: '#1a1a2e' }
                      : { background: '#fff', color: '#6b7280', borderColor: '#e5e7eb' }
                  }
                >
                  {fabric}
                </button>
              ))}
            </div>
          </div>

          {/* Color picks */}
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1.5">Preferred Color(s)</label>
            <div className="flex flex-wrap gap-2">
              {COLOR_PALETTE.map(color => (
                <button
                  key={color}
                  onClick={() => toggleColor(color)}
                  className="w-8 h-8 rounded-full border-2 transition-all"
                  style={{
                    background: color,
                    borderColor: form.colors.includes(color) ? '#FF6500' : 'transparent',
                    boxShadow: form.colors.includes(color) ? '0 0 0 2px #fff, 0 0 0 4px #FF6500' : '0 1px 3px rgba(0,0,0,0.2)',
                    transform: form.colors.includes(color) ? 'scale(1.15)' : 'scale(1)',
                  }}
                  aria-label={`Select color ${color}`}
                />
              ))}
            </div>
            <p className="text-xs text-gray-400 mt-1">Or describe a custom color in your design notes above</p>
          </div>

          {/* Inspiration ref */}
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1.5">Inspiration / Reference Link (optional)</label>
            <input
              type="url"
              placeholder="Paste a Pinterest, Instagram, or photo link..."
              value={form.inspirationRef}
              onChange={e => update({ inspirationRef: e.target.value })}
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none transition-all"
              onFocus={e => { e.target.style.borderColor = '#FF6500'; e.target.style.boxShadow = '0 0 0 3px rgba(255,101,0,0.1)' }}
              onBlur={e => { e.target.style.borderColor = '#e5e7eb'; e.target.style.boxShadow = 'none' }}
            />
          </div>

          <div className="bg-orange-50 border border-orange-100 rounded-xl px-4 py-3 flex items-start gap-2">
            <Sparkles className="w-4 h-4 text-orange-400 shrink-0 mt-0.5" />
            <p className="text-xs text-orange-600">
              The more detail you provide, the better your designer can bring your vision to life. You can also share inspiration images via Messages after booking.
            </p>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════
          STEP 3 — MEASUREMENTS
      ══════════════════════════════════ */}
      {step === 'measurements' && (
        <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm space-y-5">
          <div>
            <h3 className="text-base font-bold text-gray-800 flex items-center gap-2 mb-1">
              <Ruler className="w-4 h-4" style={{ color: '#FF6500' }} />
              Your Measurements
            </h3>
            <p className="text-xs text-gray-400">All measurements should be in centimetres (cm)</p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {([
              { field: 'chest',        label: 'Chest / Bust',     placeholder: 'e.g. 90' },
              { field: 'waist',        label: 'Waist',            placeholder: 'e.g. 74' },
              { field: 'hips',         label: 'Hips',             placeholder: 'e.g. 98' },
              { field: 'shoulder',     label: 'Shoulder Width',   placeholder: 'e.g. 40' },
              { field: 'sleeveLength', label: 'Sleeve Length',    placeholder: 'e.g. 58' },
              { field: 'dressLength',  label: 'Dress / Outfit Length', placeholder: 'e.g. 120' },
              { field: 'height',       label: 'Height',           placeholder: 'e.g. 165' },
              { field: 'weight',       label: 'Weight (kg)',       placeholder: 'e.g. 65' },
            ] as { field: keyof BookingForm; label: string; placeholder: string }[]).map(({ field, label, placeholder }) => (
              <div key={field}>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">{label}</label>
                <div className="relative">
                  <input
                    type="number"
                    placeholder={placeholder}
                    value={form[field] as string}
                    onChange={e => update({ [field]: e.target.value } as Partial<BookingForm>)}
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 pr-10 text-sm outline-none transition-all"
                    onFocus={e => { e.target.style.borderColor = '#FF6500'; e.target.style.boxShadow = '0 0 0 3px rgba(255,101,0,0.1)' }}
                    onBlur={e => { e.target.style.borderColor = '#e5e7eb'; e.target.style.boxShadow = 'none' }}
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400">
                    {field === 'weight' ? 'kg' : 'cm'}
                  </span>
                </div>
              </div>
            ))}
          </div>

          <div className="bg-blue-50 border border-blue-100 rounded-xl px-4 py-3 flex items-start gap-2">
            <Info className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
            <p className="text-xs text-blue-600">
              Not sure how to measure yourself? You can request a measurement guide or schedule a physical consultation in the next step. Leave blank if unsure — the designer will follow up.
            </p>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════
          STEP 4 — CONSULTATION
      ══════════════════════════════════ */}
      {step === 'consultation' && (
        <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm space-y-5">
          <div>
            <h3 className="text-base font-bold text-gray-800 flex items-center gap-2 mb-1">
              <Video className="w-4 h-4" style={{ color: '#FF6500' }} />
              Book a Consultation
            </h3>
            <p className="text-xs text-gray-400">Optionally schedule a video/chat call with {designer.name} to discuss your order</p>
          </div>

          {/* Toggle */}
          <div className="flex items-center justify-between bg-orange-50 border border-orange-100 rounded-xl px-4 py-4">
            <div>
              <p className="text-sm font-bold text-gray-800">Add a Consultation</p>
              <p className="text-xs text-gray-500 mt-0.5">15–30 min in-app video/chat call with {designer.name}</p>
            </div>
            <button
              onClick={() => update({ wantConsultation: !form.wantConsultation })}
              className="w-11 h-6 rounded-full transition-all relative shrink-0"
              style={{ background: form.wantConsultation ? '#FF6500' : '#e5e7eb' }}
            >
              <span
                className="absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-all"
                style={{ left: form.wantConsultation ? '26px' : '2px' }}
              />
            </button>
          </div>

          {form.wantConsultation && (
            <>
              {/* Date */}
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">
                  Preferred Consultation Date <span className="text-red-400">*</span>
                </label>
                <input
                  type="date"
                  value={form.consultationDate}
                  min={new Date().toISOString().split('T')[0]}
                  onChange={e => update({ consultationDate: e.target.value })}
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none transition-all"
                  onFocus={e => { e.target.style.borderColor = '#FF6500'; e.target.style.boxShadow = '0 0 0 3px rgba(255,101,0,0.1)' }}
                  onBlur={e => { e.target.style.borderColor = '#e5e7eb'; e.target.style.boxShadow = 'none' }}
                />
              </div>

              {/* Time slots */}
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">
                  Preferred Time Slot <span className="text-red-400">*</span>
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {CONSULTATION_SLOTS.map(slot => (
                    <button
                      key={slot}
                      onClick={() => update({ consultationTime: slot })}
                      className="flex items-center justify-center gap-1 px-2 py-2 rounded-xl text-xs font-medium border transition-all"
                      style={
                        form.consultationTime === slot
                          ? { background: '#FF6500', color: '#fff', borderColor: '#FF6500' }
                          : { background: '#fff', color: '#6b7280', borderColor: '#e5e7eb' }
                      }
                    >
                      <Clock className="w-3 h-3" /> {slot}
                    </button>
                  ))}
                </div>
              </div>

              {/* Note for consultation */}
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">What do you want to discuss? (optional)</label>
                <textarea
                  rows={3}
                  placeholder="e.g. 'I want to go over fabric choices and get a clearer idea of the silhouette...'"
                  value={form.consultationNote}
                  onChange={e => update({ consultationNote: e.target.value })}
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none transition-all resize-none"
                  onFocus={e => { e.target.style.borderColor = '#FF6500'; e.target.style.boxShadow = '0 0 0 3px rgba(255,101,0,0.1)' }}
                  onBlur={e => { e.target.style.borderColor = '#e5e7eb'; e.target.style.boxShadow = 'none' }}
                />
              </div>
            </>
          )}

          {!form.wantConsultation && (
            <div className="text-center py-6 text-gray-400">
              <User className="w-8 h-8 mx-auto mb-2 opacity-30" />
              <p className="text-sm">Skip and go straight to confirmation</p>
              <p className="text-xs mt-1">You can still message the designer directly after booking</p>
            </div>
          )}
        </div>
      )}

      {/* ══════════════════════════════════
          STEP 5 — CONFIRM
      ══════════════════════════════════ */}
      {step === 'confirm' && (
        <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm space-y-4">
          <div>
            <h3 className="text-base font-bold text-gray-800 flex items-center gap-2 mb-1">
              <CheckCircle className="w-4 h-4" style={{ color: '#FF6500' }} />
              Confirm Your Order
            </h3>
            <p className="text-xs text-gray-400">Review your booking details before submitting</p>
          </div>

          <div className="divide-y divide-gray-100 space-y-0">
            {/* Booking */}
            <Section title="Booking Info" onEdit={() => setStep('booking')}>
              <Row label="Delivery Date">{form.deliveryDate || <span className="text-red-400">Not set</span>}</Row>
              <Row label="Occasion">{form.occasion || <span className="text-red-400">Not set</span>}</Row>
              <Row label="Quantity">{form.quantity} piece{form.quantity > 1 ? 's' : ''}</Row>
              <Row label="Urgent">{form.urgentOrder ? '✅ Yes' : 'No'}</Row>
            </Section>

            {/* Design */}
            <Section title="Design" onEdit={() => setStep('design')}>
              <Row label="Description">{form.designNotes || <span className="text-gray-400 italic">None</span>}</Row>
              {form.fabrics.length > 0 && <Row label="Fabrics">{form.fabrics.join(', ')}</Row>}
              {form.colors.length > 0 && (
                <Row label="Colors">
                  <div className="flex gap-1">
                    {form.colors.map(c => (
                      <span key={c} className="w-4 h-4 rounded-full inline-block border border-white shadow" style={{ background: c }} />
                    ))}
                  </div>
                </Row>
              )}
              {form.inspirationRef && <Row label="Ref Link">{form.inspirationRef}</Row>}
            </Section>

            {/* Measurements */}
            <Section title="Measurements (cm)" onEdit={() => setStep('measurements')}>
              {(['chest','waist','hips','shoulder'] as (keyof BookingForm)[]).map(f =>
                form[f] ? <Row key={f} label={f.charAt(0).toUpperCase()+f.slice(1)}>{form[f] as string} cm</Row> : null
              )}
              {!form.chest && !form.waist && !form.hips && (
                <p className="text-xs text-gray-400 italic py-1">No measurements entered — designer will follow up</p>
              )}
            </Section>

            {/* Consultation */}
            <Section title="Consultation" onEdit={() => setStep('consultation')}>
              {form.wantConsultation
                ? <>
                    <Row label="Date">{form.consultationDate || <span className="text-red-400">Not set</span>}</Row>
                    <Row label="Time">{form.consultationTime || <span className="text-red-400">Not set</span>}</Row>
                    {form.consultationNote && <Row label="Notes">{form.consultationNote}</Row>}
                  </>
                : <p className="text-xs text-gray-400 italic py-1">No consultation requested</p>}
            </Section>
          </div>

          {/* Policy note */}
          <div className="bg-gray-50 border border-gray-100 rounded-xl px-4 py-3">
            <p className="text-xs text-gray-500">
              By submitting, you agree to the designer&apos;s terms. A deposit may be required before work begins. Cancellation policies vary per designer.
            </p>
          </div>
        </div>
      )}

      {/* ── Navigation buttons ── */}
      <div className="flex gap-3 mt-6">
        {stepIndex > 0 && (
          <button
            onClick={goPrev}
            className="flex-1 py-3 rounded-xl border border-gray-200 text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-all"
          >
            Back
          </button>
        )}
        {stepIndex < STEPS.length - 1 ? (
          <button
            onClick={goNext}
            className="flex-1 py-3 rounded-xl text-white text-sm font-semibold transition-all hover:opacity-90 flex items-center justify-center gap-2"
            style={{ background: 'linear-gradient(135deg,#FF6500,#ff8c3a)' }}
          >
            Continue <ChevronRight className="w-4 h-4" />
          </button>
        ) : (
          <button
            onClick={handleSubmit}
            className="flex-1 py-3 rounded-xl text-white text-sm font-semibold transition-all hover:opacity-90 flex items-center justify-center gap-2"
            style={{ background: 'linear-gradient(135deg,#FF6500,#ff8c3a)' }}
          >
            <CheckCircle className="w-4 h-4" /> Submit Booking
          </button>
        )}
      </div>
    </div>
  )
}

/* ─── Small helper components ─── */
function Section({ title, onEdit, children }: { title: string; onEdit: () => void; children: React.ReactNode }) {
  return (
    <div className="py-4">
      <div className="flex items-center justify-between mb-2">
        <p className="text-xs font-bold text-gray-700 uppercase tracking-wide">{title}</p>
        <button
          onClick={onEdit}
          className="text-xs font-medium hover:underline"
          style={{ color: '#FF6500' }}
        >
          Edit
        </button>
      </div>
      <div className="space-y-1.5">{children}</div>
    </div>
  )
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-4 text-sm">
      <span className="text-gray-400 text-xs shrink-0">{label}</span>
      <span className="text-gray-700 text-xs text-right font-medium max-w-xs break-words">{children}</span>
    </div>
  )
}
