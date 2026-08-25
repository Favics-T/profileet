import Image from 'next/image'

type AvatarSize = 'sm' | 'md' | 'lg'

interface AvatarProps {
  src?: string | null
  name: string
  size?: AvatarSize
  className?: string
}

const sizeClasses: Record<AvatarSize, string> = {
  sm: 'w-8 h-8 text-xs',
  md: 'w-10 h-10 text-sm',
  lg: 'w-14 h-14 text-base',
}

function getInitials(name: string): string {
  return name
    .trim()
    .split(/\s+/)
    .map(part => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()
}

export default function Avatar({ src, name, size = 'md', className = '' }: AvatarProps) {
  return (
    <div
      className={`relative flex shrink-0 items-center justify-center overflow-hidden rounded-full bg-brand-dark font-semibold text-brand-light ${sizeClasses[size]} ${className}`}
    >
      {src ? (
        <Image src={src} alt={name} fill sizes="56px" className="object-cover" />
      ) : (
        <span>{getInitials(name)}</span>
      )}
    </div>
  )
}
