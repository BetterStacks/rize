import { cn } from '@/lib/utils'
import Image from 'next/image'
import React from 'react'

const Logo = ({ className }: { className?: string }) => {
  return (
    <>
      {/* One mark in both themes: the light-mode file was a placeholder star. */}
      <Image
        width={42}
        height={42}
        className={cn('rounded-xl size-10', className)}
        alt=""
        src={'/logo-dark.png'}
      />
    </>
  )
}

export default Logo
