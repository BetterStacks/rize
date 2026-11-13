'use client'

import { Home, Compass, Plus, Bell, User, type LucideIcon } from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useSession } from '@/hooks/useAuth'
import { useNotificationsUnread } from '@/hooks/useNotificationsUnread'
import { useAuthDialog, usePostsDialog } from '../dialog-provider'
import { cn } from '@/lib/utils'

interface NavItem {
  id: string
  icon: LucideIcon
  label: string
  href?: string
  action?: () => void
  /** The create button: a yellow disc instead of a plain icon. */
  special?: boolean
  /** A small dot for new activity. */
  dot?: boolean
}

// Each item is 72px tall plus py-2 on the row: 88px, which the Toaster and
// the pages' bottom padding (pb-28) are sized around.
const itemClass =
  'relative flex min-h-[72px] flex-1 flex-col items-center justify-center gap-1 rounded-xl px-1 text-[11px] font-medium transition-colors duration-fast ease-calm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ink'

export function BottomNav() {
  const pathname = usePathname()
  const session = useSession()
  const setCreateOpen = usePostsDialog()[1]
  const setAuthOpen = useAuthDialog()[1]
  const hasUnread = useNotificationsUnread()

  const navItems: NavItem[] = [
    { id: 'home', icon: Home, label: 'Home', href: '/' },
    { id: 'explore', icon: Compass, label: 'Explore', href: '/explore' },
    {
      id: 'create',
      icon: Plus,
      label: 'Create',
      special: true,
      action: () => (session?.data ? setCreateOpen(true) : setAuthOpen(true)),
    },
    { id: 'notifications', icon: Bell, label: 'Notifications', href: '/notifications', dot: hasUnread },
    {
      id: 'profile',
      icon: User,
      label: 'Profile',
      href: session.data?.user?.username ? `/${session.data.user.username}` : '/login',
    },
  ]

  const isActive = (item: NavItem) => {
    if (!item.href) return false
    return pathname === item.href || (item.href !== '/' && pathname.startsWith(`${item.href}/`))
  }

  return (
    <nav
      aria-label="Main"
      className="fixed inset-x-0 bottom-0 z-50 border-t border-hairline bg-ground/95 pb-[env(safe-area-inset-bottom)] backdrop-blur lg:hidden"
    >
      <div className="mx-auto flex max-w-md items-stretch justify-between px-2 py-2">
        {navItems.map((item) => {
          const active = isActive(item)
          const Icon = item.icon

          const content = (
            <>
              {/* Active indicator: a short yellow bar at the top edge. */}
              {active && (
                <span aria-hidden className="absolute left-1/2 top-0 h-[3px] w-5 -translate-x-1/2 rounded-full bg-brand" />
              )}
              {item.special ? (
                <span
                  aria-hidden
                  className="flex size-10 items-center justify-center rounded-full bg-brand text-brand-ink"
                >
                  <Icon className="size-5" strokeWidth={2.25} />
                </span>
              ) : (
                <span aria-hidden className="relative flex size-10 items-center justify-center">
                  <Icon className="size-[22px]" strokeWidth={active ? 2.25 : 1.75} />
                  {item.dot && (
                    <span className="absolute right-1.5 top-1.5 size-2 rounded-full bg-brand ring-2 ring-ground" />
                  )}
                </span>
              )}
              <span className="leading-4">{item.label}</span>
            </>
          )

          const toneClass = active || item.special ? 'text-ink' : 'text-ink-secondary hover:text-ink'

          if (item.href) {
            return (
              <Link
                key={item.id}
                href={item.href}
                aria-label={item.dot ? `${item.label}, new activity` : undefined}
                aria-current={active ? 'page' : undefined}
                className={cn(itemClass, toneClass)}
              >
                {content}
              </Link>
            )
          }

          return (
            <button
              key={item.id}
              type="button"
              onClick={item.action}
              aria-label={item.special ? 'Create a post' : undefined}
              className={cn(itemClass, toneClass)}
            >
              {content}
            </button>
          )
        })}
      </div>
    </nav>
  )
}

// Hook to manage bottom nav visibility
export function useBottomNavVisibility() {
  // Hide on certain pages like onboarding, auth, etc.
  const pathname = usePathname()

  const hiddenPaths = ['/login', '/signup', '/onboarding', '/welcome']

  return !hiddenPaths.some((path) => pathname.startsWith(path))
}
