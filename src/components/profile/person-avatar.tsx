'use client'

import { cn } from '@/lib/utils'
import Image from 'next/image'
import { useState } from 'react'

// Hosts next.config.ts lets the image optimizer fetch. Anything else (an R2
// bucket domain, a pasted link) is loaded as-is instead of 400ing in the
// optimizer and showing alt text.
const OPTIMIZED_HOSTS = [
  /\.amazonaws\.com$/,
  /\.supabase\.co$/,
  /(^|\.)googleusercontent\.com$/,
  /^avatars\.githubusercontent\.com$/,
  /^media\.licdn\.com$/,
  /^static\.licdn\.com$/,
  /^i\.pinimg\.com$/,
  /^res\.cloudinary\.com$/,
]

/** A usable image src, or null for empty values, "/" and creative-* avatar ids. */
export const usableImageSrc = (src?: string | null): string | null => {
  const value = src?.trim()
  if (!value || value === '/' || value.startsWith('creative-')) return null
  if (value.startsWith('/')) return value
  try {
    const url = new URL(value)
    return url.protocol === 'https:' || url.protocol === 'http:' ? value : null
  } catch {
    return null
  }
}

export const canOptimize = (src: string) => {
  if (src.startsWith('/')) return true
  try {
    const { hostname } = new URL(src)
    return OPTIMIZED_HOSTS.some((re) => re.test(hostname))
  } catch {
    return false
  }
}

export const initialsOf = (name?: string | null) => {
  const words = (name || '').trim().split(/\s+/).filter(Boolean)
  if (words.length === 0) return '?'
  if (words.length === 1) return words[0].charAt(0).toUpperCase()
  return (words[0].charAt(0) + words[words.length - 1].charAt(0)).toUpperCase()
}

type PersonAvatarProps = {
  src?: string | null;
  name?: string | null;
  /** Rendered size in px, used for `sizes` and the initials scale. */
  size: number;
  className?: string;
  /** Only for the one avatar at the top of the page. */
  priority?: boolean;
}

/**
 * The one avatar treatment: the photo when there is one and it loads,
 * otherwise initials on a soft yellow tint. Never shows alt text.
 */
const PersonAvatar = ({ src, name, size, className, priority }: PersonAvatarProps) => {
  const usable = usableImageSrc(src)
  const [failedSrc, setFailedSrc] = useState<string | null>(null)
  const showImage = !!usable && failedSrc !== usable

  return (
    <span
      role="img"
      aria-label={name ? `${name}` : 'Profile photo'}
      style={{ width: size, height: size }}
      className={cn(
        'relative inline-flex shrink-0 select-none items-center justify-center overflow-hidden rounded-full',
        'bg-[#FFF3C2] text-[#1F1B16] dark:bg-[#3A3220] dark:text-[#F3EEE6]',
        className,
      )}
    >
      {showImage ? (
        <Image
          src={usable}
          alt=""
          fill
          sizes={`${size}px`}
          priority={priority}
          unoptimized={!canOptimize(usable)}
          className="object-cover"
          onError={() => setFailedSrc(usable)}
        />
      ) : (
        <span
          aria-hidden
          className="font-instrument leading-none"
          style={{ fontSize: Math.max(11, Math.round(size * 0.42)) }}
        >
          {initialsOf(name)}
        </span>
      )}
    </span>
  )
}

export default PersonAvatar
