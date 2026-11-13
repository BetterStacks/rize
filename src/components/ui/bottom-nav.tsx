'use client'

import { motion } from 'framer-motion'
import { Home, Compass, Plus, Bell, User } from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useSession } from '@/hooks/useAuth'
import { useNotificationsUnread } from '@/hooks/useNotificationsUnread'
import { usePostsDialog } from '../dialog-provider'
import { cn } from '@/lib/utils'

interface NavItem {
  id: string
  icon: React.ComponentType<{ className?: string }>
  label: string
  href?: string
  action?: () => void
  special?: boolean
  /** A small dot for new activity. */
  dot?: boolean
}

export function BottomNav() {
  const pathname = usePathname()
  const session = useSession()
  const setCreateOpen = usePostsDialog()[1]
  const hasUnread = useNotificationsUnread()
  
  const navItems: NavItem[] = [
    {
      id: 'home',
      icon: Home,
      label: 'Home',
      href: '/',
    },
    {
      id: 'explore',
      icon: Compass,
      label: 'Explore',
      href: '/explore',
    },
    {
      id: 'create',
      icon: Plus,
      label: 'Create',
      special: true,
      action: () => setCreateOpen(true),
    },
    {
      id: 'notifications',
      icon: Bell,
      label: 'Notifications',
      href: '/notifications',
      dot: hasUnread,
    },
    {
      id: 'profile',
      icon: User,
      label: 'Profile',
      href: session.data?.user?.username ? `/${session.data.user.username}` : '/login',
    },
  ]

  const isActive = (item: NavItem) => {
    if (!item.href) return false
    return pathname === item.href || 
           (item.href !== '/' && pathname.startsWith(item.href))
  }

  return (
    <motion.nav
      initial={{ y: 100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="fixed bottom-0 left-0 right-0 z-50 lg:hidden"
    >
      {/* Background blur effect */}
      <div className="absolute inset-0 bg-white/80 dark:bg-dark-bg/80 backdrop-blur border-t border-neutral-200 dark:border-dark-border" />
      
      {/* Navigation items */}
      <div className="relative px-4 py-2">
        <div className="flex items-center justify-around">
          {navItems.map((item) => {
            const active = isActive(item)
            const Icon = item.icon
            
            const NavButton = (
              <motion.button
                key={item.id}
                aria-label={item.dot ? `${item.label}, new activity` : item.label}
                className={cn(
                  'relative flex flex-col items-center justify-center p-2 rounded-2xl transition-all',
                  active ? 'text-purple-600 dark:text-main-yellow' : 'text-neutral-600 dark:text-neutral-100'
                )}
                onClick={item.action}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                transition={{ duration: 0.2 }}
              >
                {/* Icon with background for special items */}
                <div className={cn(
                  'relative p-2 rounded-full',
                  item.special && 'bg-[#FFDA37] backdrop-blur-sm'
                )}>
                  <Icon className={cn(
                    'w-5 h-5',
                    item.special ? 'text-black w-7 h-7' : ''
                  )} />
                  
                  {/* New activity dot */}
                  {item.dot && (
                    <span
                      aria-hidden
                      className="absolute right-1.5 top-1.5 size-2 rounded-full bg-brand ring-2 ring-ground"
                    />
                  )}
                </div>
                
                {/* Label */}
                {!item.special && (
                <span className={cn(
                  'text-xs font-medium mt-1',
                  item.special ? 'text-white' : active ? 'text-purple-600 dark:text-main-yellow' : 'text-neutral-600 dark:text-neutral-400'
                )}>
                  {item.label}
                </span>
                )}
                
                {/* Active indicator */}
                {active && !item.special && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute bg-gradient-to-br from-yellow-100 to-amber-100 dark:from-yellow-900/20 dark:to-amber-900/20 rounded-xl p-8 -z-10"
                    transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                  />
                )}
              </motion.button>
            )

            // Wrap with Link if href is provided
            if (item.href && !item.action) {
              return (
                <Link key={item.id} href={item.href}>
                  {NavButton}
                </Link>
              )
            }

            return <div key={item.id}>{NavButton}</div>
          })}
        </div>
      </div>
      
      {/* Safe area padding for iOS */}
      <div className="h-safe-area-inset-bottom bg-transparent" />
    </motion.nav>
  )
}

// Hook to manage bottom nav visibility
export function useBottomNavVisibility() {
  // Hide on certain pages like onboarding, auth, etc.
  const pathname = usePathname()
  
  const hiddenPaths = [
    '/login',
    '/signup', 
    '/onboarding',
    '/welcome'
  ]
  
  const shouldShow = !hiddenPaths.some(path => pathname.startsWith(path))
  
  return shouldShow
}