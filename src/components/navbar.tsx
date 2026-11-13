import { useActiveSidebarTab, useRightSidebar } from '@/lib/context'
import { cn } from '@/lib/utils'
import { useMediaQuery } from '@mantine/hooks'
import { Compass, Edit3, Home, PanelRight, Plus, Search } from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { FC } from 'react'
import { usePostsDialog, useSearchDialog } from './dialog-provider'
import Logo from './logo'
import Menu from './menu'
import { Button } from './ui/button'
import { ShareCard } from './profile/ShareCard'

type LayoutVariant = 'profile' | 'explore' | 'post' | 'writing' | 'full' | 'default'

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

const linkClass =
  'relative inline-flex h-9 items-center gap-2 rounded-lg px-3 text-sm font-medium transition-colors duration-fast ease-calm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink'

/**
 * Top bar. Only UserProfileLayout renders it, and nothing renders that layout
 * today; app pages use the left rail (Sidebar) and the BottomNav instead.
 */
const Navbar: FC<NavbarProps> = ({ isMine, profile }) => {
  const setSidebarOpen = useRightSidebar()[1]
  const setSearchOpen = useSearchDialog()[1]
  const setCreateOpen = usePostsDialog()[1]
  const pathname = usePathname()
  const isDesktop = useMediaQuery('(min-width: 1024px)')
  const setActiveSidebarTab = useActiveSidebarTab()[1]

  const navLinks = [
    { id: 'home', icon: Home, label: 'Home', href: '/' },
    { id: 'explore', icon: Compass, label: 'Explore', href: '/explore' },
  ]

  return (
    <nav
      aria-label="Top"
      className="sticky top-0 z-50 flex w-full items-center justify-center border-b border-hairline bg-ground/95 backdrop-blur"
    >
      <div className="flex w-full max-w-7xl items-center justify-between px-4 py-3">
        <div className="flex items-center gap-6">
          <Link
            href="/"
            aria-label="Rize home"
            className="flex items-center rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink"
          >
            <Logo className="size-8" />
          </Link>

          {isDesktop && (
            <div className="flex items-center gap-1">
              {navLinks.map((item) => {
                const active = pathname === item.href
                return (
                  <Link
                    key={item.id}
                    href={item.href}
                    aria-current={active ? 'page' : undefined}
                    className={cn(
                      linkClass,
                      active ? 'bg-subtle text-ink' : 'text-ink-secondary hover:bg-subtle hover:text-ink'
                    )}
                  >
                    <item.icon className="size-4" aria-hidden />
                    {item.label}
                  </Link>
                )
              })}
              <Button variant="ghost" size="sm" onClick={() => setCreateOpen(true)} className="gap-2">
                <Plus className="size-4" aria-hidden />
                Create
              </Button>
            </div>
          )}
        </div>

        {isDesktop && (
          <div className="mx-8 max-w-md flex-1">
            <Button
              variant="outline"
              className="w-full justify-start gap-3 rounded-xl font-normal text-ink-secondary"
              onClick={() => setSearchOpen(true)}
            >
              <Search className="size-4" aria-hidden />
              Search people and projects
            </Button>
          </div>
        )}

        <div className="flex items-center gap-2">
          {!isDesktop && (
            <Button variant="ghost" size="icon" aria-label="Search" onClick={() => setSearchOpen(true)}>
              <Search className="size-5" aria-hidden />
            </Button>
          )}

          {profile && <ShareCard profile={profile} />}

          {isMine && (
            <Button
              variant="outline"
              size="icon"
              aria-label="Edit profile"
              onClick={() => setActiveSidebarTab({ id: null, tab: 'edit-profile' })}
            >
              <Edit3 className="size-4" aria-hidden />
            </Button>
          )}

          {isMine && !isDesktop && (
            <Button variant="outline" size="icon" aria-label="Open side panel" onClick={() => setSidebarOpen(true)}>
              <PanelRight className="size-4" aria-hidden />
            </Button>
          )}

          <Menu />
        </div>
      </div>
    </nav>
  )
}

export default Navbar
