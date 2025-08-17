'use client'

import { useScrollFix } from '@/hooks/useScrollFix'
import { ReactNode } from 'react'

interface ScrollFixWrapperProps {
  children: ReactNode
}

export default function ScrollFixWrapper({ children }: ScrollFixWrapperProps) {
  useScrollFix()
  
  return <>{children}</>
}