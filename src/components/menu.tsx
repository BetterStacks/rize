import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu"
import { useSession } from '@/hooks/useAuth'
import {
  ArrowUpRight,
  Compass,
  LogIn,
  LogOut,
  MenuIcon,
  Moon,
  Search,
  Settings,
  Sun,
  X
} from 'lucide-react'
import { useTheme } from 'next-themes'
import PersonAvatar from './profile/person-avatar'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { useSearchDialog } from './dialog-provider'
import { cn } from "@/lib/utils"
import { signOut } from "@/lib/auth-client"

type MenuOption = {
  id: string
  name: string
  icon: typeof Compass
  href?: string
  onClick?: () => void
}

/** The account menu at the foot of the left rail (and in the old navbar). */
const Menu = () => {
  const [open, setOpen] = useState(false)
  const session = useSession()
  const setSearchOpen = useSearchDialog()[1]
  const { resolvedTheme, setTheme } = useTheme()
  const router = useRouter()
  const isDark = resolvedTheme === 'dark'
  const username = session?.data?.user?.username

  const guestOptions: MenuOption[] = [
    { id: 'explore', name: 'Explore', href: '/explore', icon: Compass },
    { id: 'login', name: 'Log in', href: '/login', icon: LogIn },
  ]

  const options: MenuOption[] = [
    { id: 'explore', name: 'Explore', href: '/explore', icon: Compass },
    { id: 'search', name: 'Search', onClick: () => setSearchOpen(true), icon: Search },
    ...(username ? [{ id: 'page', name: 'Your page', href: `/${username}`, icon: ArrowUpRight }] : []),
    { id: 'settings', name: 'Settings', href: '/settings', icon: Settings },
  ]

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          aria-label={session?.data ? 'Your account menu' : 'Menu'}
          className={cn(
            'touch-target relative flex size-10 items-center justify-center overflow-hidden rounded-full border border-hairline text-ink-secondary transition-colors duration-fast ease-calm hover:text-ink',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink focus-visible:ring-offset-2 focus-visible:ring-offset-ground',
            session?.isLoading && 'bg-subtle'
          )}
        >
          {session?.isLoading ? null : session?.data ? (
            <PersonAvatar
              src={session?.data?.user?.profileImage || session?.data?.user?.image}
              name={session?.data?.user?.displayName || session?.data?.user?.name}
              size={40}
            />
          ) : open ? (
            <X strokeWidth={1.75} className="size-5" aria-hidden />
          ) : (
            <MenuIcon strokeWidth={1.75} className="size-5" aria-hidden />
          )}
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-64" align="end" collisionPadding={16}>
        <DropdownMenuLabel className="px-2.5 py-2 font-normal">
          {session?.data ? (
            <div className="flex min-w-0 flex-col">
              <span className="truncate font-instrument text-lg leading-tight text-ink">
                {session?.data?.user?.displayName || session?.data?.user?.name}
              </span>
              {username && (
                <span className="truncate text-sm text-ink-secondary">@{username}</span>
              )}
            </div>
          ) : (
            <div className="flex flex-col">
              <span className="font-instrument text-lg leading-tight text-ink">Make your page</span>
              <span className="mt-0.5 text-sm text-ink-secondary">Log in to post and share your work.</span>
            </div>
          )}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          {(session?.data ? options : guestOptions).map((option) => (
            <DropdownMenuItem
              key={option.id}
              onSelect={() => {
                if (option.href) router.push(option.href)
                option.onClick?.()
              }}
            >
              <option.icon aria-hidden /> {option.name}
            </DropdownMenuItem>
          ))}
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem onSelect={() => setTheme(isDark ? 'light' : 'dark')}>
            {isDark ? <Sun aria-hidden /> : <Moon aria-hidden />} Switch to {isDark ? 'light' : 'dark'}
          </DropdownMenuItem>
          {session?.data && (
            <DropdownMenuItem
              onSelect={() => {
                signOut()
                router.refresh()
              }}
              className="text-danger focus:text-danger"
            >
              <LogOut aria-hidden /> Log out
            </DropdownMenuItem>
          )}
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export default Menu
