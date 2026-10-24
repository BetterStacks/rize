import { cn } from '@/lib/utils'
import Image from 'next/image'
import React from 'react'

// Both variants are rendered and toggled with CSS so server and client markup match
// (reading the theme via useTheme caused a hydration mismatch).
const Logo = ({ className }: { className?: string }) => {
  return (
    <>
      <Image
        width={42}
        height={42}
        className={cn('rounded-xl size-10 hidden dark:block', className)}
        alt=""
        src={'/logo-dark.png'}
      />
      <Image
        width={42}
        height={42}
        className={cn('rounded-xl size-10 block dark:hidden', className)}
        alt=""
        src={'/logo-light.png'}
      />
    </>
  )
}

export default Logo
