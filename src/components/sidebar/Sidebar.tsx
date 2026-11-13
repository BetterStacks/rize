'use client'
import { useSession } from '@/hooks/useAuth'
import { useNotificationsUnread } from '@/hooks/useNotificationsUnread'
import { cn } from '@/lib/utils'
import { Bell, Compass, Plus, Search, Settings, type LucideIcon } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useAuthDialog, usePostsDialog } from '../dialog-provider'
import Menu from '../menu'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../ui/tooltip'

type RailItem = {
  name: string
  icon: LucideIcon
  href?: string
  onClick?: () => void
  needAuth: boolean
}

const itemClass =
  'relative flex size-10 items-center justify-center rounded-xl touch-target transition-colors duration-fast ease-calm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink focus-visible:ring-offset-2 focus-visible:ring-offset-ground'

const RailTooltip = ({ label, children }: { label: string; children: React.ReactNode }) => (
  <Tooltip>
    <TooltipTrigger asChild>{children}</TooltipTrigger>
    <TooltipContent side="right" sideOffset={10} className="rounded-lg bg-ink text-on-ink">
      {label}
    </TooltipContent>
  </Tooltip>
)

/** The left rail on every app page from lg up. Labels show as tooltips. */
const Sidebar = ({ className }: { className?: string }) => {
  const session = useSession()
  const pathname = usePathname()
  const setIsPostDialogOpen = usePostsDialog()[1]
  const setIsAuthDialogOpen = useAuthDialog()[1]
  const hasUnread = useNotificationsUnread()

  const options: RailItem[] = [
    { name: 'Explore', icon: Compass, href: '/explore', needAuth: false },
    { name: 'Search', icon: Search, href: '/search', needAuth: false },
    { name: 'Notifications', icon: Bell, href: '/notifications', needAuth: true },
    {
      name: 'Create a post',
      icon: Plus,
      onClick: () => {
        if (!session?.data) {
          setIsAuthDialogOpen(true)
          return
        }
        setIsPostDialogOpen(true)
      },
      needAuth: true,
    },
    { name: 'Settings', icon: Settings, href: '/settings', needAuth: true },
  ]

  const visible = session?.data ? options : options.filter((option) => !option.needAuth)
  const isActive = (href?: string) => !!href && (pathname === href || pathname.startsWith(`${href}/`))

  return (
    <TooltipProvider delayDuration={200}>
      <nav
        aria-label="Main"
        className={cn(
          className,
          'z-40 hidden h-screen w-full flex-col items-center justify-between bg-ground px-2 py-4 md:flex'
        )}
      >
        <div className="mt-4 flex w-full flex-col items-center">
          <Link
            href={session?.data?.user?.username ? `/${session?.data?.user?.username}` : '/'}
            aria-label={session?.data?.user?.username ? 'Your profile' : 'Rize home'}
            className="rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink focus-visible:ring-offset-2 focus-visible:ring-offset-ground"
          >
            <Image width={40} height={40} className="size-10 rounded-xl" alt="" src="/logo-dark.png" />
          </Link>
        </div>

        <div className="mb-8 flex flex-col items-center gap-y-3">
          {visible.map((option) => {
            const Icon = option.icon
            const active = isActive(option.href)
            const unread = option.href === '/notifications' && hasUnread
            const stateClass = active
              ? 'bg-subtle text-ink'
              : 'text-ink-secondary hover:bg-subtle hover:text-ink'

            const inner = (
              <>
                {active && (
                  <span
                    aria-hidden
                    className="absolute bottom-1 left-1/2 h-[3px] w-4 -translate-x-1/2 rounded-full bg-brand"
                  />
                )}
                <Icon className="size-5" strokeWidth={active ? 2 : 1.75} aria-hidden />
                {unread && (
                  <span aria-hidden className="absolute right-2 top-2 size-2 rounded-full bg-brand ring-2 ring-ground" />
                )}
              </>
            )

            return (
              <RailTooltip key={option.name} label={option.name}>
                {option.href ? (
                  <Link
                    href={option.href}
                    aria-label={unread ? `${option.name}, new activity` : option.name}
                    aria-current={active ? 'page' : undefined}
                    className={cn(itemClass, stateClass)}
                  >
                    {inner}
                  </Link>
                ) : (
                  <button
                    type="button"
                    aria-label={option.name}
                    onClick={option.onClick}
                    className={cn(itemClass, stateClass)}
                  >
                    {inner}
                  </button>
                )}
              </RailTooltip>
            )
          })}
          <span aria-hidden className="my-1 h-px w-6 bg-hairline" />
          <Menu />
        </div>
      </nav>
    </TooltipProvider>
  )
}

export default Sidebar
