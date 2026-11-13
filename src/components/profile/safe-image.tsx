'use client'

import Image from 'next/image'
import { ReactNode, useState } from 'react'
import { canOptimize, usableImageSrc } from './person-avatar'

type SafeImageProps = {
  src?: string | null;
  sizes: string;
  className?: string;
  /** Shown when there is no usable src or the image fails to load. */
  fallback?: ReactNode;
}

/**
 * A `fill` image for user-supplied URLs: hosts the optimizer can't fetch are
 * loaded directly, and a failed load shows `fallback` (or nothing), never
 * alt text. Decorative: the surrounding card carries the name.
 */
const SafeImage = ({ src, sizes, className, fallback = null }: SafeImageProps) => {
  const usable = usableImageSrc(src)
  const [failedSrc, setFailedSrc] = useState<string | null>(null)
  if (!usable || failedSrc === usable) return <>{fallback}</>
  return (
    <Image
      src={usable}
      alt=""
      fill
      sizes={sizes}
      unoptimized={!canOptimize(usable)}
      className={className}
      style={{ objectFit: 'cover' }}
      onError={() => setFailedSrc(usable)}
    />
  )
}

export default SafeImage
