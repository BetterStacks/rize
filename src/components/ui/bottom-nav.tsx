'use client'

import { motion } from 'framer-motion'
import { Home, Compass, Plus, Bell, User } from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { usePostsDialog } from '../dialog-provider'
import { cn } from '@/lib/utils'

interface NavItem {
  id: string
  icon: React.ComponentType<{ className?: string }>
  label: string
  href?: string
  action?: () => void
  special?: boolean
  badge?: number
}

export function BottomNav() {
  const pathname = usePathname()
  const session = useSession()
  const setCreateOpen = usePostsDialog()[1]
  
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
      badge: 3, // Example badge count
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
      <div className="absolute inset-0 bg-white/80 dark:bg-dark-bg/80 backdrop-blur-xl border-t border-neutral-200 dark:border-dark-border" />
      
      {/* Navigation items */}
      <div className="relative px-4 py-2">
        <div className="flex items-center justify-around">
          {navItems.map((item) => {
            const active = isActive(item)
            const Icon = item.icon
            
            const NavButton = (
              <motion.button
                key={item.id}
                className={cn(
                  'relative flex flex-col items-center justify-center p-2 rounded-2xl transition-all',
                  active ? 'text-purple-600 dark:text-purple-400' : 'text-neutral-600 dark:text-neutral-400',
                  item.special && 'bg-gradient-to-r from-purple-500 to-blue-500 text-white shadow-lg'
                )}
                onClick={item.action}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {/* Icon with background for special items */}
                <div className={cn(
                  'relative p-2 rounded-xl',
                  item.special && 'bg-white/20 backdrop-blur-sm'
                )}>
                  <Icon className={cn(
                    'w-5 h-5',
                    item.special ? 'text-white' : ''
                  )} />
                  
                  {/* Badge */}
                  {item.badge && item.badge > 0 && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-medium"
                    >
                      {item.badge > 99 ? '99+' : item.badge}
                    </motion.div>
                  )}
                </div>
                
                {/* Label */}
                <span className={cn(
                  'text-xs font-medium mt-1',
                  item.special ? 'text-white' : active ? 'text-purple-600 dark:text-purple-400' : 'text-neutral-600 dark:text-neutral-400'
                )}>
                  {item.label}
                </span>
                
                {/* Active indicator */}
                {active && !item.special && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute inset-0 bg-purple-100 dark:bg-purple-900/30 rounded-2xl -z-10"
                    transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                  />
                )}
              </motion.button>
            )

            // Wrap with Link if href is provided
            if (item.href && !item.action) {
              return (
                <Link key={item.id} href={item.href} className="flex-1">
                  {NavButton}
                </Link>
              )
            }

            return <div key={item.id} className="flex-1">{NavButton}</div>
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