'use client'

import { useEffect } from 'react'
import { trackProfileView } from '@/actions/analytics-actions'

interface ViewTrackerProps {
  username: string
}

export default function ViewTracker({ username }: ViewTrackerProps) {
  useEffect(() => {
    // Track the profile view when component mounts
    const trackView = async () => {
      try {
        await trackProfileView(username)
      } catch (error) {
        // Silently handle errors - analytics shouldn't break the user experience
        console.error('Failed to track profile view:', error)
      }
    }

    // Small delay to ensure page is fully loaded
    const timeoutId = setTimeout(trackView, 1000)
    
    return () => clearTimeout(timeoutId)
  }, [username])

  // This component doesn't render anything visible
  return null
}