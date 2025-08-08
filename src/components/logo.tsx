'use client'
import { cn } from '@/lib/utils'
import { useTheme } from 'next-themes'
import Image from 'next/image'
import React from 'react'

const Logo = ({ className }: { className?: string }) => {
  const { theme } = useTheme()
  return theme === 'dark' ? (
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
