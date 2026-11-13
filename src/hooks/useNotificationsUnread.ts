'use client'

import { useSession } from '@/hooks/useAuth'
import { useQuery } from '@tanstack/react-query'
import { useSyncExternalStore } from 'react'

// "Last seen" lives in this browser only (there is no table for it): the
// server time at which the person last opened /notifications, per user id.
const SEEN_EVENT = 'rize:notifications-seen'
const seenKey = (userId: string) => `rize:notifications:seen:${userId}`

const readSeen = (userId: string): string | null => {
  try {
    return window.localStorage.getItem(seenKey(userId))
  } catch {
    return null
  }
}

export const markNotificationsSeen = (userId: string, seenAt: string) => {
  try {
    const previous = window.localStorage.getItem(seenKey(userId))
    // Never move "last seen" backwards (an older tab, a cached page).
    if (previous && new Date(previous) >= new Date(seenAt)) return
    window.localStorage.setItem(seenKey(userId), seenAt)
  } catch {
    // Storage blocked: the dot stays until storage is available again.
    return
  }
  window.dispatchEvent(new Event(SEEN_EVENT))
}

const subscribe = (onChange: () => void) => {
  window.addEventListener('storage', onChange)
  window.addEventListener(SEEN_EVENT, onChange)
  return () => {
    window.removeEventListener('storage', onChange)
    window.removeEventListener(SEEN_EVENT, onChange)
  }
}

/** True when something happened after the person last opened /notifications. */
export function useNotificationsUnread(): boolean {
  const session = useSession()
  const userId = session.data?.user?.id

  const { data: latest } = useQuery({
    queryKey: ['notifications-latest', userId],
    queryFn: async () => {
      const res = await fetch('/api/notifications/latest', { credentials: 'same-origin' })
      if (!res.ok) return null
      const body = (await res.json()) as { latest: string | null }
      return body.latest
    },
    enabled: !!userId,
    staleTime: 60_000,
    // A quiet check every few minutes, and on focus once the minute is up.
    refetchInterval: 5 * 60_000,
    refetchIntervalInBackground: false,
    refetchOnWindowFocus: true,
  })

  const seen = useSyncExternalStore(
    subscribe,
    () => (userId ? readSeen(userId) : null),
    () => null,
  )

  if (!userId || !latest) return false
  if (!seen) return true
  return new Date(latest) > new Date(seen)
}
