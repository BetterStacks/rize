'use client'

import { markNotificationsSeen } from '@/hooks/useNotificationsUnread'
import { useEffect } from 'react'

/** Records that the person has seen everything up to the server's render time. */
const MarkSeen = ({ userId, seenAt }: { userId: string; seenAt: string }) => {
  useEffect(() => {
    markNotificationsSeen(userId, seenAt)
  }, [userId, seenAt])
  return null
}

export default MarkSeen
