'use client'

import { markNotificationsSeen, readSeen } from '@/hooks/useNotificationsUnread'
import { useEffect, useSyncExternalStore } from 'react'

// "Last seen" from before this visit, read once per page render (keyed by the
// server's render time) and before MarkSeen moves it forward, so the rows that
// were new when the page opened keep their dot.
const previousSeen = new Map<string, string | null>()
const capturePrevious = (userId: string, seenAt: string) => {
  const key = `${userId}|${seenAt}`
  if (!previousSeen.has(key)) previousSeen.set(key, readSeen(userId))
  return previousSeen.get(key) ?? null
}

/** Records that the person has seen everything up to the server's render time. */
const MarkSeen = ({ userId, seenAt }: { userId: string; seenAt: string }) => {
  useEffect(() => {
    capturePrevious(userId, seenAt)
    markNotificationsSeen(userId, seenAt)
  }, [userId, seenAt])
  return null
}

const noSubscribe = () => () => {}

/**
 * A small yellow dot for activity newer than the last visit. Nothing on a
 * first visit (no earlier "last seen" in this browser).
 */
export const UnreadDot = ({ userId, seenAt, at }: { userId: string; seenAt: string; at: string }) => {
  const previous = useSyncExternalStore(
    noSubscribe,
    () => capturePrevious(userId, seenAt),
    () => null,
  )
  if (!previous || new Date(at) <= new Date(previous)) return null
  return (
    <>
      <span aria-hidden className="size-2 shrink-0 rounded-full bg-brand" />
      <span className="sr-only">New</span>
    </>
  )
}

export default MarkSeen
