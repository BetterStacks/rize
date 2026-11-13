'use client'
import { getRecentlyJoinedProfiles } from '@/actions/profile-actions'
import { TProfile } from '@/lib/types'
import { useDebouncedCallback } from '@mantine/hooks'
import { useQuery } from '@tanstack/react-query'
import { signOut, useSession } from '@/lib/auth-client'
import { useRouter } from 'next/navigation'
import { useSearchDialog } from '../dialog-provider'
import PersonAvatar from '../profile/person-avatar'

import axios from 'axios'
import { ArrowRight, Compass, FolderOpen, LogOut, Moon, Search, Sun, User } from 'lucide-react'
import { useTheme } from 'next-themes'
import { useEffect, useRef, useState } from 'react'
import {
  CommandDialog,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from '../ui/command'
import { DialogDescription, DialogTitle } from '../ui/dialog'
import { cn } from '@/lib/utils'

type ProfileItemProps = Pick<
  TProfile,
  'username' | 'displayName' | 'profileImage'
> & { image?: string; name?: string };

// The ui/command defaults are neutral greys; these keep the palette on tokens.
const groupClass =
  'px-2 text-ink [&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:pb-1 [&_[cmdk-group-heading]]:pt-3 [&_[cmdk-group-heading]]:text-xs [&_[cmdk-group-heading]]:font-medium [&_[cmdk-group-heading]]:text-ink-secondary'
const itemClass =
  'min-h-11 gap-3 rounded-lg px-2 py-2 text-ink data-[selected=true]:bg-subtle data-[selected=true]:text-ink dark:data-[selected=true]:bg-subtle dark:data-[selected=true]:text-ink'
const separatorClass = 'mx-0 my-1 h-px bg-hairline dark:bg-hairline'

const STATUS_LABEL: Record<string, string> = {
  wip: 'In progress',
  completed: 'Completed',
  archived: 'Archived',
}

/** Post content is stored as HTML; show it as one plain-text line. */
const plainText = (html?: string | null) =>
  (html ?? '')
    .replace(/<[^>]*>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/\s+/g, ' ')
    .trim()

const Kbd = ({ children }: { children: React.ReactNode }) => (
  <kbd className="rounded-md border border-hairline bg-ground px-1.5 py-0.5 font-inter text-[11px] text-ink-secondary">
    {children}
  </kbd>
)

const SearchDialog = () => {
  const [open, setOpen] = useSearchDialog()

  // Cmd/Ctrl+K opens the palette from anywhere.
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        setOpen(true)
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [setOpen])
  const session = useSession()
  const router = useRouter()
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<{
    people: ProfileItemProps[];
    posts: any[];
    projects: any[];
    total: number;
  }>({ people: [], posts: [], projects: [], total: 0 })
  const [hasSearched, setHasSearched] = useState(false)
  const [loading, setLoading] = useState(false)
  const latestSearch = useRef(0)
  const { data } = useQuery({
    queryKey: ['recently-joined-profiles'],
    queryFn: () => getRecentlyJoinedProfiles(),
    staleTime: 60_000,
    // Only needed once the dialog is open; it is mounted on every page.
    enabled: !!open,
  })
  const { resolvedTheme, setTheme } = useTheme()
  const isDark = resolvedTheme === 'dark'
  const username = (session?.data?.user as any)?.username as string | undefined

  const go = (href: string) => {
    router.push(href)
    setOpen(false)
  }

  const handleSearch = useDebouncedCallback(async (query: string) => {
    if (query.trim() === '') {
      latestSearch.current++
      setLoading(false)
      setHasSearched(false)
      return
    }
    setLoading(true)
    setHasSearched(true)
    const requestId = ++latestSearch.current
    try {
      // The dialog only shows people, posts and projects.
      const res = await axios.get('/api/search', {
        params: { query, type: 'people,posts,projects' },
      })
      // Ignore answers to older keystrokes that arrive late.
      if (requestId === latestSearch.current) setResults(res?.data)
    } catch {
      if (requestId === latestSearch.current) {
        setResults({ people: [], posts: [], projects: [], total: 0 })
      }
    } finally {
      if (requestId === latestSearch.current) setLoading(false)
    }
  }, 300)

  const trimmed = query.trim()
  const seeAllHref = `/search?q=${encodeURIComponent(trimmed)}`

  return (
    <CommandDialog open={open} onOpenChange={setOpen}>
      <DialogTitle className="sr-only">Search Rize</DialogTitle>
      <DialogDescription className="sr-only">
        Search people, posts and projects, or jump to a page.
      </DialogDescription>
      <CommandInput
        value={query}
        onValueChange={(value) => {
          setQuery(value)
          handleSearch(value)
        }}
        aria-label="Search Rize"
        placeholder="Search people, posts and projects…"
        className="text-base text-ink placeholder:text-ink-secondary sm:text-sm dark:placeholder:text-ink-secondary"
      />
      <CommandList className="max-h-[min(60vh,440px)] pb-2">
        {loading ? (
          <p role="status" className="px-4 py-6 text-sm text-ink-secondary">
            Searching…
          </p>
        ) : results?.total > 0 && hasSearched ? (
          <>
            {results?.people?.length > 0 && (
              <CommandGroup heading="People" className={groupClass}>
                {results.people.slice(0, 5).map((profile) => (
                  <CommandItem
                    className={itemClass}
                    onSelect={() => go(`/${profile?.username}`)}
                    value={`${profile?.username} ${profile?.displayName} `}
                    key={`person-${profile?.username}`}
                  >
                    <ProfileItem payload={{ ...profile } as any} />
                  </CommandItem>
                ))}
              </CommandGroup>
            )}

            {results?.posts?.length > 0 && (
              <CommandGroup heading="Posts" className={groupClass}>
                {results.posts.slice(0, 3).map((post) => {
                  const text = plainText(post?.content)
                  return (
                    <CommandItem
                      className={cn(itemClass, 'items-start')}
                      onSelect={() => go(`/post/${post?.id}`)}
                      value={`${post?.id} ${text} ${post?.displayName}`}
                      key={`post-${post?.id}`}
                    >
                      <PersonAvatar
                        src={post?.profileImage}
                        name={post?.displayName || post?.username}
                        size={32}
                      />
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-xs text-ink-secondary">
                          {post?.displayName || `@${post?.username}`}
                        </p>
                        <p className="line-clamp-2 text-sm text-ink">{text}</p>
                      </div>
                    </CommandItem>
                  )
                })}
              </CommandGroup>
            )}

            {results?.projects?.length > 0 && (
              <CommandGroup heading="Projects" className={groupClass}>
                {results.projects.slice(0, 3).map((project) => (
                  <CommandItem
                    className={cn(itemClass, 'items-start')}
                    onSelect={() => go(`/project/${project?.id}`)}
                    value={`${project?.id} ${project?.name} ${project?.description} ${project?.displayName}`}
                    key={`project-${project?.id}`}
                  >
                    <span
                      aria-hidden
                      className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-subtle text-ink-secondary"
                    >
                      <FolderOpen className="size-4" strokeWidth={1.75} />
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="flex min-w-0 items-center gap-2">
                        <span className="truncate text-sm font-medium">{project?.name}</span>
                        {STATUS_LABEL[project?.status] && (
                          <span className="shrink-0 rounded-full bg-subtle px-2 py-0.5 text-[11px] text-ink-secondary">
                            {STATUS_LABEL[project.status]}
                          </span>
                        )}
                      </div>
                      <p className="truncate text-xs text-ink-secondary">
                        {project?.tagline || project?.description}
                      </p>
                    </div>
                  </CommandItem>
                ))}
              </CommandGroup>
            )}

            <CommandSeparator className={separatorClass} />
            <CommandGroup className={groupClass}>
              <CommandItem
                className={itemClass}
                value={`see all results ${trimmed}`}
                onSelect={() => go(seeAllHref)}
              >
                <Search className="text-ink-secondary" aria-hidden />
                <span className="min-w-0 flex-1 truncate">
                  See all results for &ldquo;{trimmed}&rdquo;
                </span>
                <ArrowRight className="text-ink-secondary" aria-hidden />
              </CommandItem>
            </CommandGroup>
          </>
        ) : hasSearched ? (
          <div className="px-2 pb-1">
            <p className="px-2 pb-2 pt-5 text-sm text-ink-secondary">
              No people, posts or projects match &ldquo;{trimmed}&rdquo;.
            </p>
            <CommandGroup className={cn(groupClass, 'px-0')}>
              <CommandItem
                className={itemClass}
                value={`search everywhere ${trimmed}`}
                onSelect={() => go(seeAllHref)}
              >
                <Search className="text-ink-secondary" aria-hidden />
                <span className="min-w-0 flex-1 truncate">
                  Search schools, companies and pages too
                </span>
                <ArrowRight className="text-ink-secondary" aria-hidden />
              </CommandItem>
            </CommandGroup>
          </div>
        ) : null}

        {!hasSearched && (
          <>
            {session?.data && (
              <CommandGroup heading="Go to" className={groupClass}>
                {username && (
                  <CommandItem className={itemClass} onSelect={() => go(`/${username}`)}>
                    <User className="text-ink-secondary" aria-hidden />
                    <span>Your profile</span>
                  </CommandItem>
                )}
                <CommandItem className={itemClass} onSelect={() => go('/explore')}>
                  <Compass className="text-ink-secondary" aria-hidden />
                  <span>Explore</span>
                </CommandItem>
                <CommandItem className={itemClass} value="Search page" onSelect={() => go('/search')}>
                  <Search className="text-ink-secondary" aria-hidden />
                  <span>Search page</span>
                </CommandItem>
              </CommandGroup>
            )}

            <CommandGroup heading="Actions" className={groupClass}>
              <CommandItem
                className={itemClass}
                value={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
                onSelect={() => setTheme(isDark ? 'light' : 'dark')}
              >
                {isDark ? (
                  <Sun className="text-ink-secondary" aria-hidden />
                ) : (
                  <Moon className="text-ink-secondary" aria-hidden />
                )}
                <span>{isDark ? 'Switch to light mode' : 'Switch to dark mode'}</span>
              </CommandItem>
              {session?.data && (
                <CommandItem
                  className={itemClass}
                  value="Log out"
                  onSelect={async () => {
                    try {
                      await signOut()
                    } finally {
                      // Back to the home page either way.
                      window.location.href = '/'
                    }
                  }}
                >
                  <LogOut className="text-ink-secondary" aria-hidden />
                  <span>Log out</span>
                </CommandItem>
              )}
            </CommandGroup>

            {data && data.length > 0 && (
              <CommandGroup heading="Recently joined" className={groupClass}>
                {data
                  .filter((p) => p?.username && p.username !== username)
                  .slice(0, 4)
                  .map((profile) => (
                    <CommandItem
                      className={itemClass}
                      onSelect={() => go(`/${profile?.username}`)}
                      value={`recent ${profile?.username} ${profile?.displayName ?? ''}`}
                      key={profile?.username}
                    >
                      <ProfileItem payload={{ ...profile } as any} />
                    </CommandItem>
                  ))}
              </CommandGroup>
            )}
          </>
        )}
      </CommandList>
      <div className="hidden items-center justify-between border-t border-hairline px-4 py-2.5 text-xs text-ink-secondary sm:flex">
        <span className="flex items-center gap-1.5">
          <Kbd>⌘K</Kbd> to open
        </span>
        <span className="flex items-center gap-4">
          <span className="flex items-center gap-1.5">
            <Kbd>↑↓</Kbd> to move
          </span>
          <span className="flex items-center gap-1.5">
            <Kbd>↵</Kbd> to open
          </span>
        </span>
      </div>
    </CommandDialog>
  )
}

const ProfileItem = ({ payload }: { payload: ProfileItemProps }) => {
  const name = payload?.displayName || payload?.name || payload?.username
  return (
    <>
      <PersonAvatar src={payload?.profileImage || payload?.image} name={name} size={36} />
      <div className="flex min-w-0 flex-1 flex-col">
        <span className="truncate font-instrument text-lg leading-tight text-ink">{name}</span>
        <span className="truncate text-xs text-ink-secondary">@{payload?.username}</span>
      </div>
    </>
  )
}

export default SearchDialog
