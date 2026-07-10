'use client'
import { cn } from '@/lib/utils'
import { useTheme } from 'next-themes'
import Image from 'next/image'
import React from 'react'

const Logo = ({ className }: { className?: string }) => {
  const { resolvedTheme } = useTheme()
  const [mounted, setMounted] = React.useState(false)
  React.useEffect(() => setMounted(true), [])

  if (!mounted) return <div className={cn('rounded-xl size-10', className)} />

  return resolvedTheme === 'dark' ? (
    <Image
      width={42}
      height={42}
      className={cn('rounded-xl size-10', className)}
      alt=""
      src={'/logo-dark.png'}
    />
  ) : (
    <Image
      width={42}
      height={42}
      className={cn('rounded-xl size-10', className)}
      alt=""
      src={'/logo-light.png'}
    />
  )
}

export default Logo
