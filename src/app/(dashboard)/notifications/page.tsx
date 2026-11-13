import DashboardLayout from '@/components/layout/DashboardLayout'
import { appSidebarSlot } from '@/components/layout/app-sidebar-slot'
import PersonAvatar from '@/components/profile/person-avatar'
import { getServerSession } from '@/lib/auth'
import { loadNotifications, type NotificationItem } from '@/lib/notifications'
import { ArrowBigUp, Bookmark, PhoneCall, type LucideIcon } from 'lucide-react'
import type { Metadata } from 'next'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import type { ReactNode } from 'react'
import MarkSeen from './mark-seen'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Notifications | Rize',
}

const shortTime = (at: Date, now: Date) => {
  const minutes = Math.floor((now.getTime() - at.getTime()) / 60_000)
  if (minutes < 1) return 'just now'
  if (minutes < 60) return `${minutes}m`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h`
  const days = Math.floor(hours / 24)
  if (days < 7) return `${days}d`
  return at.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    timeZone: 'UTC',
    ...(at.getUTCFullYear() !== now.getUTCFullYear() ? { year: 'numeric' } : {}),
  })
}

const times = (n: number) => (n === 1 ? 'once' : n === 2 ? 'twice' : `${n} times`)
const upvotes = (n: number) => (n === 1 ? '1 upvote' : `${n} upvotes`)

const Quoted = ({ text }: { text: string }) => (
  <span className="text-ink">&ldquo;{text}&rdquo;</span>
)

const yourPost = (target: string) =>
  target ? (
    <>
      your post <Quoted text={target} />
    </>
  ) : (
    'your post'
  )

const describe = (item: NotificationItem): { lead: ReactNode; detail?: string } => {
  switch (item.kind) {
    case 'comment':
      return {
        lead: (
          <>
            <span className="font-medium text-ink">{item.actor.name}</span> commented on{' '}
            {yourPost(item.target)}
          </>
        ),
        detail: item.comment,
      }
    case 'post-upvotes':
      return {
        lead: (
          <>
            <span className="font-medium text-ink">{upvotes(item.count)}</span> on {yourPost(item.target)}
          </>
        ),
      }
    case 'project-upvotes':
      return {
        lead: (
          <>
            <span className="font-medium text-ink">{upvotes(item.count)}</span> on your project{' '}
            <span className="text-ink">{item.target || 'Untitled'}</span>
          </>
        ),
      }
    case 'post-saves':
      return {
        lead: (
          <>
            {item.target ? (
              <>
                Your post <Quoted text={item.target} />
              </>
            ) : (
              'Your post'
            )}{' '}
            was <span className="font-medium text-ink">saved {times(item.count)}</span>
          </>
        ),
      }
    case 'project-saves':
      return {
        lead: (
          <>
            Your project <span className="text-ink">{item.target || 'Untitled'}</span> was{' '}
            <span className="font-medium text-ink">saved {times(item.count)}</span>
          </>
        ),
      }
    case 'voice-drafts':
      return {
        lead: (
          <>
            <span className="font-medium text-ink">
              {item.count === 1 ? 'A draft' : `${item.count} drafts`}
            </span>{' '}
            from your calls {item.count === 1 ? 'is' : 'are'} ready to review
          </>
        ),
      }
    case 'voice-suggestions':
      return {
        lead: (
          <>
            <span className="font-medium text-ink">Profile suggestions</span> from your call are ready
            to review
          </>
        ),
      }
  }
}

const ICONS: Record<Exclude<NotificationItem['kind'], 'comment'>, LucideIcon> = {
  'post-upvotes': ArrowBigUp,
  'project-upvotes': ArrowBigUp,
  'post-saves': Bookmark,
  'project-saves': Bookmark,
  'voice-drafts': PhoneCall,
  'voice-suggestions': PhoneCall,
}

const Leading = ({ item }: { item: NotificationItem }) => {
  if (item.kind === 'comment') {
    return <PersonAvatar src={item.actor.image} name={item.actor.name} size={36} />
  }
  const Icon = ICONS[item.kind]
  return (
    <span
      aria-hidden
      className="flex size-9 shrink-0 items-center justify-center rounded-full bg-subtle text-ink-secondary"
    >
      <Icon className="size-[18px]" strokeWidth={1.75} />
    </span>
  )
}

const NotificationsPage = async () => {
  const session = await getServerSession()
  if (!session?.user) redirect('/login')

  const profileId = session.user.profileId
  const userId = session.user.id
  const now = new Date()
  const items = profileId ? await loadNotifications({ profileId, userId }) : []

  return (
    <DashboardLayout
      variant="full"
      contentMaxWidth="max-w-2xl"
      contentPadding="px-4 sm:px-6"
      leftSidebarSlot={appSidebarSlot}
    >
      <MarkSeen userId={userId} seenAt={now.toISOString()} />
      <div className="w-full pt-10 pb-28 sm:pt-14 lg:pb-12">
        <h1 className="font-instrument text-4xl text-ink">Notifications</h1>
        <p className="mt-1 text-sm text-ink-secondary">
          Comments, upvotes and saves on your posts and projects.
        </p>

        {items.length === 0 ? (
          <p className="mt-10 border-t border-hairline pt-10 text-sm leading-relaxed text-ink-secondary">
            Nothing new yet. When people comment on or save your posts, it shows up here.
          </p>
        ) : (
          <ul className="mt-8 divide-y divide-hairline border-t border-hairline">
            {items.map((item) => {
              const { lead, detail } = describe(item)
              return (
                <li key={item.id}>
                  <Link
                    href={item.href}
                    className="-mx-3 flex min-h-[44px] items-start gap-3 rounded-xl px-3 py-4 transition-colors duration-fast ease-calm hover:bg-subtle focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink"
                  >
                    <Leading item={item} />
                    <div className="min-w-0 flex-1">
                      <p className="text-sm leading-snug text-ink-secondary break-words">{lead}</p>
                      {detail && (
                        <p className="mt-1 line-clamp-2 text-sm leading-snug text-ink break-words">
                          {detail}
                        </p>
                      )}
                    </div>
                    <time
                      dateTime={item.at.toISOString()}
                      className="shrink-0 pt-0.5 text-xs tabular-nums text-ink-secondary"
                    >
                      {shortTime(item.at, now)}
                    </time>
                  </Link>
                </li>
              )
            })}
          </ul>
        )}
      </div>
    </DashboardLayout>
  )
}

export default NotificationsPage
