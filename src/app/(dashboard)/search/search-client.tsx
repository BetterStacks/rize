'use client'

import { useDebouncedCallback } from '@mantine/hooks'
import { useRouter, useSearchParams } from 'next/navigation'
import { useEffect, useState, useMemo, useRef, useCallback, type ReactNode } from 'react'
import axios from 'axios'
import Link from 'next/link'
import {
    Briefcase,
    Check,
    ChevronDown,
    FileText,
    FolderOpen,
    GraduationCap,
    Search,
    X,
} from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import PersonAvatar from '@/components/profile/person-avatar'
import { Input } from '@/components/ui/input'
import { badgeVariants } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from '@/components/ui/command'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { cn } from '@/lib/utils'
import { getTopics } from '@/actions/post-actions'
import { getAllSkills } from '@/actions/project-actions'
import { getRecentlyJoinedProfiles } from '@/actions/profile-actions'

const TABS = [
    { key: 'all', label: 'All' },
    { key: 'people', label: 'People' },
    { key: 'projects', label: 'Projects' },
    { key: 'posts', label: 'Posts' },
    { key: 'pages', label: 'Pages' },
    { key: 'education', label: 'Education' },
    { key: 'experience', label: 'Experience' },
] as const

type TabKey = (typeof TABS)[number]['key']
type SectionKey = Exclude<TabKey, 'all'>

const SECTION_ORDER: SectionKey[] = ['people', 'projects', 'posts', 'pages', 'education', 'experience']

const SECTION_LABEL: Record<SectionKey, string> = {
    people: 'People',
    projects: 'Projects',
    posts: 'Posts',
    pages: 'Pages',
    education: 'Education',
    experience: 'Experience',
}

/** How many rows a group shows in "All" before offering the full list. */
const ALL_PREVIEW = 5

type SearchResults = {
    people: any[]
    posts: any[]
    projects: any[]
    pages: any[]
    education: any[]
    experience: any[]
    total: number
}

const emptyResults: SearchResults = {
    people: [],
    posts: [],
    projects: [],
    pages: [],
    education: [],
    experience: [],
    total: 0,
}

const isTabKey = (value: string | null): value is TabKey =>
    !!value && TABS.some((tab) => tab.key === value)

/** Post content is stored as HTML; show it as one plain-text excerpt. */
const plainText = (html?: string | null) =>
    (html ?? '')
        .replace(/<[^>]*>/g, ' ')
        .replace(/&nbsp;/g, ' ')
        .replace(/&amp;/g, '&')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&quot;/g, '"')
        .replace(/&#39;/g, "'")
        .replace(/\s+/g, ' ')
        .trim()

const STATUS_LABEL: Record<string, string> = {
    wip: 'In progress',
    completed: 'Completed',
    archived: 'Archived',
}

export default function SearchPageClient() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const initialQuery = searchParams.get('q') || ''
    const tabParam = searchParams.get('tab')
    const initialTab: TabKey = isTabKey(tabParam) ? tabParam : 'all'
    const initialTopicIds = (searchParams.get('topicIds') || '').split(',').map((id) => id.trim()).filter(Boolean)
    const initialSkillIds = (searchParams.get('skillIds') || '').split(',').map((id) => id.trim()).filter(Boolean)

    const [query, setQuery] = useState(initialQuery)
    const [activeTab, setActiveTab] = useState<TabKey>(initialTab)
    const [selectedTopicIds, setSelectedTopicIds] = useState<string[]>(initialTopicIds)
    const [selectedSkillIds, setSelectedSkillIds] = useState<string[]>(initialSkillIds)
    const [results, setResults] = useState<SearchResults>(emptyResults)
    const [loading, setLoading] = useState(!!initialQuery)
    const [hasSearched, setHasSearched] = useState(!!initialQuery)
    const [failed, setFailed] = useState(false)
    const inputRef = useRef<HTMLInputElement>(null)

    const { data: topicsData } = useQuery({
        queryKey: ['topics'],
        queryFn: getTopics,
        staleTime: Infinity,
    })

    const { data: skillsData } = useQuery({
        queryKey: ['get-all-skills'],
        queryFn: () => getAllSkills(),
        staleTime: Infinity,
    })

    // Shares its cache with the search dialog.
    const { data: recentProfiles, isLoading: recentLoading } = useQuery({
        queryKey: ['recently-joined-profiles'],
        queryFn: () => getRecentlyJoinedProfiles(),
        staleTime: 60_000,
    })

    const topics = useMemo(() => topicsData ?? [], [topicsData])
    const skills = useMemo(() => skillsData ?? [], [skillsData])

    const updateUrl = useCallback(
        (q: string, tab: TabKey, topicIds: string[], skillIds: string[]) => {
            const params = new URLSearchParams()
            if (q) params.set('q', q)
            if (tab !== 'all') params.set('tab', tab)
            if (topicIds.length > 0) params.set('topicIds', topicIds.join(','))
            if (skillIds.length > 0) params.set('skillIds', skillIds.join(','))
            const qs = params.toString()
            router.replace(`/search${qs ? `?${qs}` : ''}`, { scroll: false })
        },
        [router]
    )

    const latestSearch = useRef(0)
    const doSearch = useDebouncedCallback(async (q: string, tab: TabKey, topicIds: string[], skillIds: string[]) => {
        if (!q.trim()) {
            latestSearch.current++
            setResults(emptyResults)
            setLoading(false)
            setHasSearched(false)
            setFailed(false)
            return
        }
        setLoading(true)
        setHasSearched(true)
        const requestId = ++latestSearch.current
        try {
            const res = await axios.get('/api/search', {
                params: {
                    query: q,
                    type: tab === 'all' ? 'all' : tab,
                    topicIds: topicIds.length > 0 ? topicIds.join(',') : undefined,
                    skillIds: skillIds.length > 0 ? skillIds.join(',') : undefined,
                },
            })
            // Ignore answers to older keystrokes that arrive late.
            if (requestId === latestSearch.current) {
                setResults(res.data)
                setFailed(false)
            }
        } catch {
            if (requestId === latestSearch.current) {
                setResults(emptyResults)
                setFailed(true)
            }
        } finally {
            if (requestId === latestSearch.current) setLoading(false)
        }
    }, 350)

    useEffect(() => {
        if (initialQuery) {
            doSearch(initialQuery, activeTab, initialTopicIds, initialSkillIds)
        }
        // Runs once with the URL the page was opened with.
    }, [])

    const rerun = (q: string, tab: TabKey, topicIds: string[], skillIds: string[]) => {
        updateUrl(q, tab, topicIds, skillIds)
        if (q.trim()) setLoading(true)
        doSearch(q, tab, topicIds, skillIds)
    }

    const handleQueryChange = (value: string) => {
        setQuery(value)
        updateUrl(value, activeTab, selectedTopicIds, selectedSkillIds)
        doSearch(value, activeTab, selectedTopicIds, selectedSkillIds)
    }

    const clearQuery = () => {
        handleQueryChange('')
        inputRef.current?.focus()
    }

    const handleTabChange = (tab: TabKey) => {
        setActiveTab(tab)
        rerun(query, tab, selectedTopicIds, selectedSkillIds)
    }

    const toggleTopic = (id: string) => {
        const next = selectedTopicIds.includes(id)
            ? selectedTopicIds.filter((topicId) => topicId !== id)
            : [...selectedTopicIds, id]
        setSelectedTopicIds(next)
        rerun(query, activeTab, next, selectedSkillIds)
    }

    const toggleSkill = (id: string) => {
        const next = selectedSkillIds.includes(id)
            ? selectedSkillIds.filter((skillId) => skillId !== id)
            : [...selectedSkillIds, id]
        setSelectedSkillIds(next)
        rerun(query, activeTab, selectedTopicIds, next)
    }

    const clearFilters = () => {
        setSelectedTopicIds([])
        setSelectedSkillIds([])
        rerun(query, activeTab, [], [])
    }

    const hasFilters = selectedTopicIds.length > 0 || selectedSkillIds.length > 0
    const visibleSections: SectionKey[] = activeTab === 'all' ? SECTION_ORDER : [activeTab]
    const totalVisible = visibleSections.reduce((sum, key) => sum + (results[key]?.length || 0), 0)
    const recent = (recentProfiles ?? []).filter((p: any) => p?.username).slice(0, 6)

    let body: ReactNode
    if (loading) {
        body = <ResultsSkeleton />
    } else if (hasSearched && failed) {
        body = (
            <StateMessage title="Search didn't load">
                Check your connection and try again.
                <div className="mt-4">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => rerun(query, activeTab, selectedTopicIds, selectedSkillIds)}
                    >
                        Try again
                    </Button>
                </div>
            </StateMessage>
        )
    } else if (hasSearched && totalVisible === 0) {
        body = (
            <StateMessage title={<>Nothing matches &ldquo;{query.trim()}&rdquo;</>}>
                {activeTab !== 'all' || hasFilters
                    ? 'Try fewer words, or widen the search.'
                    : 'Try fewer words, a first name, or an @username.'}
                {(activeTab !== 'all' || hasFilters) && (
                    <div className="mt-4 flex flex-wrap gap-2">
                        {activeTab !== 'all' && (
                            <Button variant="outline" size="sm" onClick={() => handleTabChange('all')}>
                                Search everything
                            </Button>
                        )}
                        {hasFilters && (
                            <Button variant="outline" size="sm" onClick={clearFilters}>
                                Clear filters
                            </Button>
                        )}
                    </div>
                )}
            </StateMessage>
        )
    } else if (!hasSearched) {
        body = (
            <section aria-labelledby="search-recent" className="mt-10">
                <h2 id="search-recent" className="font-instrument text-2xl leading-tight text-ink">
                    New on Rize
                </h2>
                <p className="mt-1 text-sm text-ink-secondary">People who joined recently.</p>
                {recentLoading ? (
                    <ResultsSkeleton rows={4} className="mt-4" />
                ) : recent.length > 0 ? (
                    <ResultList className="mt-4">
                        {recent.map((profile: any) => (
                            <li key={profile.username}>
                                <PersonRow item={profile} />
                            </li>
                        ))}
                    </ResultList>
                ) : null}
            </section>
        )
    } else {
        body = (
            <div className="mt-8 flex flex-col gap-10">
                {visibleSections.map((section) => {
                    const items = results[section]
                    if (!items || items.length === 0) return null
                    const preview = activeTab === 'all' ? items.slice(0, ALL_PREVIEW) : items
                    return (
                        <ResultGroup
                            key={section}
                            type={section}
                            count={items.length}
                            items={preview}
                            onSeeAll={
                                activeTab === 'all' && items.length > ALL_PREVIEW
                                    ? () => handleTabChange(section)
                                    : undefined
                            }
                        />
                    )
                })}
            </div>
        )
    }

    return (
        <div className="w-full pt-10 pb-28 sm:pt-14 lg:pb-12">
            <h1 className="font-instrument text-4xl text-ink">Search</h1>
            <p className="mt-1 text-sm text-ink-secondary">
                Find people, projects, posts, schools and companies on Rize.
            </p>

            {/* Input and filters stay in reach while scrolling results. */}
            <div className="sticky top-0 z-10 -mx-4 mt-6 bg-ground/95 px-4 pb-3 pt-2 backdrop-blur sm:-mx-6 sm:px-6">
                <div className="relative">
                    <label htmlFor="search-query" className="sr-only">
                        Search Rize
                    </label>
                    <Search
                        aria-hidden
                        className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-ink-secondary"
                    />
                    <Input
                        id="search-query"
                        ref={inputRef}
                        type="search"
                        autoFocus
                        autoComplete="off"
                        enterKeyHint="search"
                        value={query}
                        onChange={(e) => handleQueryChange(e.target.value)}
                        placeholder="Name, @username, project, school…"
                        className="h-12 pl-11 pr-12 text-base md:text-base [&::-webkit-search-cancel-button]:hidden"
                    />
                    {query && (
                        <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={clearQuery}
                            aria-label="Clear search"
                            className="absolute right-1 top-1/2 size-10 -translate-y-1/2 text-ink-secondary hover:text-ink"
                        >
                            <X className="size-4" aria-hidden />
                        </Button>
                    )}
                </div>

                <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                    <Tabs value={activeTab} onValueChange={(value) => handleTabChange(value as TabKey)}>
                        <div className="-mx-4 overflow-x-auto px-4 scrollbar-hide sm:mx-0 sm:px-0">
                            <TabsList aria-label="What to search" className="h-10">
                                {TABS.map((tab) => {
                                    const count =
                                        tab.key === 'all' ? results.total : results[tab.key]?.length || 0
                                    return (
                                        <TabsTrigger key={tab.key} value={tab.key} className="h-8 gap-1.5 px-3">
                                            {tab.label}
                                            {hasSearched && !loading && count > 0 && (
                                                <span className="text-xs font-normal tabular-nums text-ink-secondary">
                                                    {count}
                                                </span>
                                            )}
                                        </TabsTrigger>
                                    )
                                })}
                            </TabsList>
                        </div>
                    </Tabs>

                    <div className="flex shrink-0 items-center gap-1">
                        <FilterPicker
                            label="Topics"
                            searchLabel="Find a topic"
                            emptyLabel="No topic by that name."
                            options={topics.map((t: any) => ({
                                id: t.id,
                                name: t.name,
                                prefix: t.emoji,
                            }))}
                            selected={selectedTopicIds}
                            onToggle={toggleTopic}
                        />
                        <FilterPicker
                            label="Skills"
                            searchLabel="Find a skill"
                            emptyLabel="No skill by that name."
                            options={skills.map((s: any) => ({ id: s.id, name: s.name }))}
                            selected={selectedSkillIds}
                            onToggle={toggleSkill}
                        />
                        {hasFilters && (
                            <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={clearFilters}
                                className="text-ink-secondary hover:text-ink"
                            >
                                Clear
                            </Button>
                        )}
                    </div>
                </div>
            </div>

            <div aria-live="polite" aria-busy={loading}>
                {body}
            </div>
        </div>
    )
}

// --- Filters ---

type FilterOption = { id: string; name: string; prefix?: string | null }

function FilterPicker({
    label,
    searchLabel,
    emptyLabel,
    options,
    selected,
    onToggle,
}: {
    label: string
    searchLabel: string
    emptyLabel: string
    options: FilterOption[]
    selected: string[]
    onToggle: (id: string) => void
}) {
    const count = selected.length
    return (
        <Popover>
            <PopoverTrigger asChild>
                <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    aria-label={count > 0 ? `${label}, ${count} selected` : label}
                    className={cn('gap-1 text-ink-secondary hover:text-ink', count > 0 && 'text-ink')}
                >
                    {label}
                    {count > 0 && (
                        <span className="tabular-nums text-ink-secondary">{count}</span>
                    )}
                    <ChevronDown className="size-3.5" aria-hidden />
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[280px] p-0" align="end">
                <Command>
                    <CommandInput placeholder={searchLabel} aria-label={searchLabel} />
                    <CommandList className="max-h-[240px] overflow-y-auto">
                        <CommandEmpty className="py-6 text-center text-sm text-ink-secondary">
                            {emptyLabel}
                        </CommandEmpty>
                        <CommandGroup>
                            {options.map((option) => {
                                const isSelected = selected.includes(option.id)
                                return (
                                    <CommandItem
                                        key={option.id}
                                        value={option.name}
                                        onSelect={() => onToggle(option.id)}
                                        aria-selected={isSelected}
                                        className="rounded-lg"
                                    >
                                        <Check
                                            aria-hidden
                                            className={cn('mr-2 size-4', isSelected ? 'opacity-100' : 'opacity-0')}
                                        />
                                        {option.prefix ? `${option.prefix} ` : ''}
                                        {option.name}
                                    </CommandItem>
                                )
                            })}
                        </CommandGroup>
                    </CommandList>
                </Command>
            </PopoverContent>
        </Popover>
    )
}

// --- States ---

function StateMessage({ title, children }: { title: ReactNode; children: ReactNode }) {
    return (
        <div className="mt-8 border-t border-hairline pt-10">
            <p className="font-instrument text-2xl leading-tight text-ink">{title}</p>
            <div className="mt-2 text-sm leading-relaxed text-ink-secondary">{children}</div>
        </div>
    )
}

function ResultsSkeleton({ rows = 5, className }: { rows?: number; className?: string }) {
    return (
        <div className={cn('mt-8', className)} role="status" aria-label="Searching">
            <ul className="divide-y divide-hairline border-t border-hairline" aria-hidden>
                {Array.from({ length: rows }).map((_, i) => (
                    <li key={i} className="flex items-center gap-3 py-4">
                        <span className="size-10 shrink-0 rounded-full bg-subtle motion-safe:animate-pulse" />
                        <span className="flex flex-1 flex-col gap-2">
                            <span className="h-3.5 w-40 max-w-[60%] rounded bg-subtle motion-safe:animate-pulse" />
                            <span className="h-3 w-56 max-w-[80%] rounded bg-subtle motion-safe:animate-pulse" />
                        </span>
                    </li>
                ))}
            </ul>
        </div>
    )
}

// --- Results ---

function ResultList({ children, className }: { children: ReactNode; className?: string }) {
    return <ul className={cn('divide-y divide-hairline border-t border-hairline', className)}>{children}</ul>
}

function ResultGroup({
    type,
    count,
    items,
    onSeeAll,
}: {
    type: SectionKey
    count: number
    items: any[]
    onSeeAll?: () => void
}) {
    const headingId = `search-group-${type}`
    return (
        <section aria-labelledby={headingId}>
            <div className="mb-3 flex items-baseline justify-between gap-3">
                <h2 id={headingId} className="font-instrument text-2xl leading-tight text-ink">
                    {SECTION_LABEL[type]}
                    <span className="ml-2 font-inter text-sm tabular-nums text-ink-secondary">{count}</span>
                </h2>
                {onSeeAll && (
                    <Button
                        type="button"
                        variant="link"
                        size="sm"
                        onClick={onSeeAll}
                        className="h-auto px-0 text-ink-secondary hover:text-ink"
                    >
                        See all {SECTION_LABEL[type].toLowerCase()}
                    </Button>
                )}
            </div>
            <ResultList>
                {items.map((item, i) => (
                    <li key={item.id || i}>
                        <ResultRow type={type} item={item} />
                    </li>
                ))}
            </ResultList>
        </section>
    )
}

function ResultRow({ type, item }: { type: SectionKey; item: any }) {
    switch (type) {
        case 'people':
            return <PersonRow item={item} />
        case 'projects':
            return <ProjectRow item={item} />
        case 'posts':
            return <PostRow item={item} />
        case 'pages':
            return <PageRow item={item} />
        case 'education':
            return <EducationRow item={item} />
        case 'experience':
            return <ExperienceRow item={item} />
        default:
            return null
    }
}

const rowClass =
    '-mx-3 flex min-h-[44px] items-start gap-3 rounded-xl px-3 py-4 transition-colors duration-fast ease-calm hover:bg-subtle focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink'

const nameOf = (item: any) => item.displayName || item.name || item.username

/** A small icon well for rows that aren't a person. */
function KindIcon({ icon: Icon }: { icon: typeof FolderOpen }) {
    return (
        <span
            aria-hidden
            className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-subtle text-ink-secondary"
        >
            <Icon className="size-[18px]" strokeWidth={1.75} />
        </span>
    )
}

/** "by Name" with a tiny avatar, for things a person made. */
function Byline({ item }: { item: any }) {
    if (!item.username) return null
    return (
        <span className="mt-1.5 flex min-w-0 items-center gap-1.5 text-xs text-ink-secondary">
            <PersonAvatar src={item.profileImage} name={nameOf(item)} size={18} />
            <span className="truncate">{nameOf(item)}</span>
        </span>
    )
}

function PersonRow({ item }: { item: any }) {
    const line = item.bio || item.location
    return (
        <Link href={`/${item.username}`} className={cn(rowClass, 'items-center')}>
            <PersonAvatar src={item.profileImage || item.image} name={nameOf(item)} size={40} />
            <span className="min-w-0 flex-1">
                <span className="block truncate font-instrument text-xl leading-tight text-ink">{nameOf(item)}</span>
                <span className="block truncate text-[13px] text-ink-secondary">
                    @{item.username}
                    {line ? ` · ${line}` : ''}
                </span>
            </span>
        </Link>
    )
}

function ProjectRow({ item }: { item: any }) {
    const line = item.tagline || item.description
    return (
        <Link href={`/project/${item.id}`} className={rowClass}>
            <KindIcon icon={FolderOpen} />
            <span className="min-w-0 flex-1">
                <span className="flex min-w-0 items-center gap-2">
                    <span className="truncate text-sm font-medium text-ink">{item.name}</span>
                    {item.status && STATUS_LABEL[item.status] && (
                        <span className={cn(badgeVariants({ variant: 'secondary' }), 'shrink-0 font-normal')}>
                            {STATUS_LABEL[item.status]}
                        </span>
                    )}
                </span>
                {line && <span className="mt-0.5 line-clamp-2 text-sm text-ink-secondary">{line}</span>}
                <Byline item={item} />
            </span>
        </Link>
    )
}

function PostRow({ item }: { item: any }) {
    const text = plainText(item.content)
    return (
        <Link href={`/post/${item.id}`} className={rowClass}>
            <PersonAvatar src={item.profileImage} name={nameOf(item)} size={40} />
            <span className="min-w-0 flex-1">
                <span className="block truncate text-sm text-ink-secondary">
                    <span className="font-medium text-ink">{nameOf(item)}</span> @{item.username}
                </span>
                {text && <span className="mt-1 line-clamp-3 text-sm leading-relaxed text-ink">{text}</span>}
            </span>
        </Link>
    )
}

function PageRow({ item }: { item: any }) {
    return (
        <Link href={`/page/${item.id}`} className={rowClass}>
            <KindIcon icon={FileText} />
            <span className="min-w-0 flex-1">
                <span className="block truncate text-sm font-medium text-ink">{item.title || 'Untitled'}</span>
                <Byline item={item} />
            </span>
        </Link>
    )
}

function EducationRow({ item }: { item: any }) {
    const detail = [item.degree, item.fieldOfStudy].filter(Boolean).join(' · ')
    return (
        <Link href={`/${item.username}`} className={rowClass}>
            <KindIcon icon={GraduationCap} />
            <span className="min-w-0 flex-1">
                <span className="block truncate text-sm font-medium text-ink">{item.school}</span>
                {detail && <span className="mt-0.5 block truncate text-sm text-ink-secondary">{detail}</span>}
                <Byline item={item} />
            </span>
        </Link>
    )
}

function ExperienceRow({ item }: { item: any }) {
    const detail = [item.company, item.location, item.employmentType].filter(Boolean).join(' · ')
    return (
        <Link href={`/${item.username}`} className={rowClass}>
            <KindIcon icon={Briefcase} />
            <span className="min-w-0 flex-1">
                <span className="flex min-w-0 items-center gap-2">
                    <span className="truncate text-sm font-medium text-ink">{item.title}</span>
                    {item.currentlyWorking && (
                        <span className={cn(badgeVariants({ variant: 'secondary' }), 'shrink-0 font-normal')}>
                            Current
                        </span>
                    )}
                </span>
                {detail && <span className="mt-0.5 block truncate text-sm text-ink-secondary">{detail}</span>}
                <Byline item={item} />
            </span>
        </Link>
    )
}
