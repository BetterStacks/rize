import { useRightSidebar } from '@/lib/context'
import { cn } from '@/lib/utils'
import { useMediaQuery } from '@mantine/hooks'
import { motion } from 'framer-motion'
import { 
  Edit3, 
  Sidebar, 
  Search, 
  Bell, 
  Compass,
  Home,
  Sparkles,
  Plus
} from 'lucide-react'
import { FC, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from '@/lib/auth-client'
import Link from 'next/link'
import { useProfileDialog, useSearchDialog, usePostsDialog } from './dialog-provider'
import Menu from './menu'
import Logo from './logo'
import { Button } from './ui/button'
import { ShareCard } from './profile/ShareCard'
import { Badge } from './ui/badge'

type LayoutVariant = 'profile' | 'explore' | 'post' | 'writing' | 'default'

type NavbarProps = {
  isMine: boolean;
  variant?: LayoutVariant;
  profile?: {
    displayName: string;
    username: string;
    bio: string;
    profileImage: string;
    location?: string;
    experience?: Array<{
      title: string;
      company: string;
      currentlyWorking: boolean;
    }>;
    projects?: Array<{
      name: string;
      description: string;
    }>;
  };
};

const Navbar: FC<NavbarProps> = ({ isMine, variant = 'default', profile }) => {
  const setOpen = useProfileDialog()[1]
  const setSidebarOpen = useRightSidebar()[1]
  const setSearchOpen = useSearchDialog()[1]
  const setCreateOpen = usePostsDialog()[1]
  const router = useRouter()
  const session = useSession()
  const isDesktop = useMediaQuery('(min-width: 1024px)')
  const [activeTab, setActiveTab] = useState<string>(variant)

  // Navigation items for Gen Z/Alpha users
  const navItems = [
    { 
      id: 'home', 
      icon: Home, 
      label: 'Home', 
      href: '/',
      active: variant === 'default' 
    },
    { 
      id: 'explore', 
      icon: Compass, 
      label: 'Explore', 
      href: '/explore',
      active: variant === 'explore',
      badge: 'new'
    },
    { 
      id: 'create', 
      icon: Plus, 
      label: 'Create', 
      action: () => setCreateOpen(true),
      special: true
    }
  ]

  return (
    <motion.nav 
      className='fixed top-0 w-full flex items-center justify-center z-50 backdrop-blur-xl bg-white/80 dark:bg-dark-bg/80 border-b border-neutral-200/50 dark:border-dark-border/50'
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
    >
      <div className="w-full max-w-7xl flex items-center justify-between px-4 py-3">
        
        {/* Left Section - Logo + Navigation */}
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center gap-2">
            <Logo className="size-8" />
            <span className="font-bold text-xl tracking-tight hidden sm:block">
              Rize
            </span>
          </Link>

          {/* Desktop Navigation */}
          {isDesktop && (
            <div className="flex items-center gap-1 bg-neutral-100 dark:bg-dark-border/60 rounded-2xl p-1">
              {navItems.map((item) => (
                <motion.div key={item.id} className="relative">
                  {item.href ? (
                    <Link href={item.href}>
                      <Button
                        variant="ghost"
                        size="sm"
                        className={cn(
                          'relative px-4 py-2 rounded-xl transition-all',
                          item.active 
                            ? 'bg-white dark:bg-dark-bg shadow-sm' 
                            : 'hover:bg-white/50 dark:hover:bg-dark-bg/50',
                          item.special && 'bg-gradient-to-r from-purple-500 to-blue-500 text-white hover:from-purple-600 hover:to-blue-600'
                        )}
                      >
                        <item.icon className="size-4 mr-2" />
                        {item.label}
                        {item.badge && (
                          <Badge variant="secondary" className="ml-2 text-xs">
                            {item.badge}
                          </Badge>
                        )}
                      </Button>
                    </Link>
                  ) : (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={item.action}
                      className={cn(
                        'relative px-4 py-2 rounded-xl transition-all',
                        item.special && 'bg-gradient-to-r from-purple-500 to-blue-500 text-white hover:from-purple-600 hover:to-blue-600'
                      )}
                    >
                      <item.icon className="size-4 mr-2" />
                      {item.label}
                    </Button>
                  )}
                </motion.div>
              ))}
            </div>
          )}
        </div>

        {/* Center Section - Search (Desktop) */}
        {isDesktop && (
          <div className="flex-1 max-w-md mx-8">
            <Button
              variant="outline"
              className="w-full justify-start text-neutral-500 dark:text-neutral-400 rounded-2xl border-neutral-300/60 dark:border-dark-border/60"
              onClick={() => setSearchOpen(true)}
            >
              <Search className="size-4 mr-3" />
              Search creators, projects...
            </Button>
          </div>
        )}

        {/* Right Section - Actions */}
        <div className="flex items-center gap-2">
          {/* Mobile Search */}
          {!isDesktop && (
            <Button
              variant="ghost"
              size="icon"
              className="rounded-2xl"
              onClick={() => setSearchOpen(true)}
            >
              <Search className="size-5" />
            </Button>
          )}

          {/* Notifications */}
          <Button
            variant="ghost"
            size="icon"
            className="rounded-2xl relative"
          >
            <Bell className="size-5" />
            {/* Notification dot */}
            <div className="absolute -top-1 -right-1 size-3 bg-red-500 rounded-full border-2 border-white dark:border-dark-bg" />
          </Button>

          {/* Profile Actions */}
          {profile && <ShareCard profile={profile} />}
          
          {isMine && (
            <Button
              variant="outline"
              size="icon"
              className="rounded-2xl"
              onClick={() => router.push('/settings')}
            >
              <Edit3 className="size-5" />
            </Button>
          )}

          {/* Mobile Sidebar Toggle */}
          {isMine && !isDesktop && (
            <Button
              variant="outline"
              size="icon"
              className="rounded-2xl"
              onClick={() => setSidebarOpen(true)}
            >
              <Sidebar className="size-5" />
            </Button>
          )}

          <Menu />
        </div>
      </div>
    </motion.nav>
  )
}

export default Navbar
