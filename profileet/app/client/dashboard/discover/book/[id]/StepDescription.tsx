'use client'

import { useCallback, useRef, useState } from 'react'
import { ImagePlus, X } from 'lucide-react'
import Button from '@/component/ui/Button'
import type { BookingFormState } from './types'

const MAX_PHOTOS = 6

interface StepDescriptionProps {
  form: BookingFormState
  onChange: (patch: Partial<BookingFormState>) => void
  onBack: () => void
  onNext: () => void
}

export default function StepDescription({ form, onChange, onBack, onNext }: StepDescriptionProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [dragging, setDragging] = useState(false)

  const processFiles = useCallback((files: FileList | null) => {
    if (!files) return
    const imageFiles = Array.from(files).filter(file => file.type.startsWith('image/'))
    if (imageFiles.length === 0) return

    // read all dropped/selected files in parallel, then commit once - reading
    // form.photos inside each FileReader.onload would race when multiple files
    // are dropped together and only the last one's update would stick
    Promise.all(
      imageFiles.map(
        file =>
          new Promise<string>(resolve => {
            const reader = new FileReader()
            reader.onload = e => resolve(e.target?.result as string)
            reader.readAsDataURL(file)
          })
      )
    ).then(dataUrls => {
      onChange({ photos: [...form.photos, ...dataUrls].slice(0, MAX_PHOTOS) })
    })
  }, [form.photos, onChange])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setDragging(false)
    processFiles(e.dataTransfer.files)
  }, [processFiles])

  const removePhoto = (index: number) => {
    onChange({ photos: form.photos.filter((_, i) => i !== index) })
  }

  const canContinue = Boolean(form.description.trim())

  return (
    <div>
      <h1 className="text-xl font-bold text-brand-dark">Job Description</h1>
      <p className="mt-1 text-sm text-brand-dark/60">Step 2 of 3 &mdash; Tell the artisan exactly what you need.</p>

      <div className="mt-6 space-y-5">
        <div>
          <label className="mb-1.5 block text-sm font-medium text-brand-dark">Describe what you need</label>
          <textarea
            rows={5}
            value={form.description}
            onChange={e => onChange({ description: e.target.value })}
            placeholder="e.g. I need this fixed/made by a specific date, here's what's involved and any preferences I have..."
            className="w-full rounded-xl border border-border-light bg-white px-4 py-3 text-sm text-brand-dark outline-none transition-colors placeholder:text-brand-dark/35 focus:border-accent-gold"
          />
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium text-brand-dark">
            Photos <span className="font-normal text-brand-dark/40">(optional)</span>
          </label>
          <div
            onDragOver={e => { e.preventDefault(); setDragging(true) }}
            onDragLeave={() => setDragging(false)}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`cursor-pointer rounded-2xl border-2 border-dashed p-6 text-center transition-colors ${
              dragging ? 'border-accent-gold bg-accent-gold/5' : 'border-border-light hover:border-accent-gold/60'
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={e => processFiles(e.target.files)}
            />
            <ImagePlus className="mx-auto h-6 w-6 text-brand-dark/30" />
            <p className="mt-2 text-sm font-medium text-brand-dark">Drop images here or click to browse</p>
            <p className="mt-0.5 text-xs text-brand-dark/40">Up to {MAX_PHOTOS} photos</p>
          </div>

          {form.photos.length > 0 && (
            <div className="mt-3 grid grid-cols-4 gap-2 sm:grid-cols-6">
              {form.photos.map((photo, i) => (
                <div key={i} className="group relative aspect-square overflow-hidden rounded-xl border border-border-light">
                  <img src={photo} alt="" className="h-full w-full object-cover" />
                  <button
                    type="button"
                    onClick={() => removePhoto(i)}
                    className="absolute right-1 top-1 flex h-5 w-5 items-center justify-center rounded-full bg-brand-dark/70 text-white opacity-0 transition-opacity group-hover:opacity-100"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="flex items-start justify-between gap-4 rounded-xl border border-border-light bg-brand-light/50 px-4 py-3.5">
          <div>
            <p className="text-sm font-medium text-brand-dark">Request a consultation call before starting</p>
            <p className="mt-0.5 text-xs text-brand-dark/50">The artisan will reach out to confirm details by phone or video before starting the work.</p>
          </div>
          <button
            type="button"
            role="switch"
            aria-checked={form.wantsConsultation}
            onClick={() => onChange({ wantsConsultation: !form.wantsConsultation })}
            className={`relative h-6 w-11 shrink-0 rounded-full transition-colors ${form.wantsConsultation ? 'bg-accent-gold' : 'bg-border-light'}`}
          >
            <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white transition-transform ${form.wantsConsultation ? 'translate-x-5' : 'translate-x-0.5'}`} />
          </button>
        </div>
      </div>

      <div className="mt-8 flex justify-between">
        <Button variant="outline" onClick={onBack}>
          Back
        </Button>
        <Button variant="primary" disabled={!canContinue} onClick={onNext}>
          Continue
        </Button>
      </div>
    </div>
  )
}
