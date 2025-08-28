'use client'

import { trackClick } from '@/actions/analytics-actions'
import { ReactNode } from 'react'

interface ClickTrackerProps {
  username: string
  elementType: 'social_link' | 'project' | 'writing' | 'email' | 'resume'
  elementId?: string
  children: ReactNode
  className?: string
}

export default function ClickTracker({ 
  username, 
  elementType, 
  elementId, 
  children, 
  className 
}: ClickTrackerProps) {
  const handleClick = async () => {
    try {
      await trackClick(username, elementType, elementId)
    } catch (error) {
      // Silently handle errors - analytics shouldn't break the user experience
      console.error('Failed to track click:', error)
    }
  }

  return (
    <div onClick={handleClick} className={className}>
      {children}
    </div>
  )
}