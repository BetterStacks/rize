'use client'

import { useDebouncedCallback } from '@mantine/hooks'
import { useRouter, useSearchParams } from 'next/navigation'
import { useEffect, useState, useCallback } from 'react'
import axios from 'axios'
import Image from 'next/image'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import {
    Search,
    Users,
    MessageCircle,
    FolderOpen,
    FileText,
    GraduationCap,
    Briefcase,
    Loader2,
    ArrowRight,
    ExternalLink,
} from 'lucide-react'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'

const TABS = [
    { key: 'all', label: 'All', icon: Search },
    { key: 'people', label: 'Profiles', icon: Users },
    { key: 'projects', label: 'Projects', icon: FolderOpen },
    { key: 'posts', label: 'Posts', icon: MessageCircle },
    { key: 'pages', label: 'Pages', icon: FileText },
    { key: 'education', label: 'Education', icon: GraduationCap },
    { key: 'experience', label: 'Experience', icon: Briefcase },
] as const

type TabKey = (typeof TABS)[number]['key']

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

export default function SearchPageClient() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const initialQuery = searchParams.get('q') || ''
    const initialTab = (searchParams.get('tab') as TabKey) || 'all'

    const [query, setQuery] = useState(initialQuery)
    const [activeTab, setActiveTab] = useState<TabKey>(initialTab)
    const [results, setResults] = useState<SearchResults>(emptyResults)
    const [loading, setLoading] = useState(false)
    const [hasSearched, setHasSearched] = useState(false)

    const updateUrl = useCallback(
        (q: string, tab: TabKey) => {
            const params = new URLSearchParams()
            if (q) params.set('q', q)
            if (tab !== 'all') params.set('tab', tab)
            const qs = params.toString()
            router.replace(`/search${qs ? `?${qs}` : ''}`, { scroll: false })
        },
        [router]
    )

    const doSearch = useDebouncedCallback(async (q: string, tab: TabKey) => {
        if (!q.trim()) {
            setResults(emptyResults)
            setLoading(false)
            setHasSearched(false)
            return
        }
        setLoading(true)
        setHasSearched(true)
        try {
            const res = await axios.get('/api/search', {
                params: { query: q, type: tab === 'all' ? 'all' : tab },
            })
            setResults(res.data)
        } catch {
            setResults(emptyResults)
        } finally {
            setLoading(false)
        }
    }, 350)

    useEffect(() => {
        if (initialQuery) {
            doSearch(initialQuery, activeTab)
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    const handleQueryChange = (value: string) => {
        setQuery(value)
        updateUrl(value, activeTab)
        doSearch(value, activeTab)
    }

    const handleTabChange = (tab: TabKey) => {
        setActiveTab(tab)
        updateUrl(query, tab)
        if (query.trim()) {
            setLoading(true)
            doSearch(query, tab)
        }
    }

    // Filter results for the active tab
    const visibleSections =
        activeTab === 'all'
            ? (['people', 'projects', 'posts', 'pages', 'education', 'experience'] as const)
            : ([activeTab] as const)

    const totalVisible = visibleSections.reduce(
        (sum, key) => sum + (results[key as keyof SearchResults] as any[])?.length || 0,
        0
    )

    return (
        <div className="w-full pb-20">
            {/* Search input */}
            <div className="sticky top-0 z-10 bg-light-bg/80 dark:bg-dark-bg/80 backdrop-blur-xl pt-6 pb-4">
                <div className="relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 size-5 text-neutral-400" />
                    <Input
                        autoFocus
                        value={query}
                        onChange={(e) => handleQueryChange(e.target.value)}
                        placeholder="Search profiles, projects, posts, pages..."
                        className="pl-12 pr-4 h-12 text-base rounded-2xl border-neutral-200 dark:border-dark-border bg-white dark:bg-neutral-900 focus-visible:ring-1 focus-visible:ring-neutral-300 dark:focus-visible:ring-neutral-700"
                    />
                </div>

                {/* Tabs */}
                <div className="flex items-center gap-1.5 mt-4 overflow-x-auto scrollbar-hide pb-1">
                    {TABS.map((tab) => {
                        const isActive = activeTab === tab.key
                        const Icon = tab.icon
                        const count =
                            tab.key === 'all'
                                ? results.total
                                : (results[tab.key as keyof SearchResults] as any[])?.length || 0

                        return (
                            <button
                                key={tab.key}
                                onClick={() => handleTabChange(tab.key)}
                                className={cn(
                                    'relative flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all duration-200',
                                    isActive
                                        ? 'text-neutral-900 dark:text-white'
                                        : 'text-neutral-500 dark:text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800/60'
                                )}
                            >
                                {isActive && (
                                    <motion.div
                                        layoutId="search-tab-bg"
                                        className="absolute inset-0 bg-neutral-100 dark:bg-neutral-800 rounded-xl"
                                        transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                                    />
                                )}
                                <span className="relative z-10 flex items-center gap-1.5">
                                    <Icon className="size-4" strokeWidth={1.8} />
                                    {tab.label}
                                    {hasSearched && count > 0 && (
                                        <span className="text-[11px] font-normal text-neutral-400 dark:text-neutral-500">
                                            {count}
                                        </span>
                                    )}
                                </span>
                            </button>
                        )
                    })}
                </div>
            </div>

            {/* Results */}
            <div className="mt-2">
                {loading ? (
                    <div className="flex items-center justify-center py-20">
                        <Loader2 className="size-5 animate-spin text-neutral-400" />
                    </div>
                ) : hasSearched && totalVisible === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 text-center">
                        <div className="flex items-center gap-3 mb-4">
                            <Users className="size-6 opacity-30" />
                            <FolderOpen className="size-6 opacity-30" />
                            <MessageCircle className="size-6 opacity-30" />
                        </div>
                        <p className="text-sm font-medium text-neutral-600 dark:text-neutral-400">
                            No results found for &ldquo;{query}&rdquo;
                        </p>
                        <p className="text-xs text-neutral-400 dark:text-neutral-500 mt-1">
                            Try different keywords or check another tab
                        </p>
                    </div>
                ) : !hasSearched ? (
                    <div className="flex flex-col items-center justify-center py-20 text-center">
                        <Search className="size-10 text-neutral-300 dark:text-neutral-600 mb-4" />
                        <p className="text-sm text-neutral-500 dark:text-neutral-400">
                            Start typing to search across Rize
                        </p>
                    </div>
                ) : (
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={activeTab}
                            initial={{ opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -8 }}
                            transition={{ duration: 0.2 }}
                            className="space-y-6"
                        >
                            {visibleSections.map((section) => {
                                const items = results[section as keyof SearchResults] as any[]
                                if (!items || items.length === 0) return null
                                return (
                                    <ResultSection
                                        key={section}
                                        type={section}
                                        items={items}
                                    />
                                )
                            })}
                        </motion.div>
                    </AnimatePresence>
                )}
            </div>
        </div>
    )
}

// --- Result section per entity type ---

function ResultSection({ type, items }: { type: string; items: any[] }) {
    const config: Record<string, { label: string; icon: any }> = {
        people: { label: 'Profiles', icon: Users },
        projects: { label: 'Projects', icon: FolderOpen },
        posts: { label: 'Posts', icon: MessageCircle },
        pages: { label: 'Pages', icon: FileText },
        education: { label: 'Education', icon: GraduationCap },
        experience: { label: 'Work Experience', icon: Briefcase },
    }
    const { label, icon: Icon } = config[type] || { label: type, icon: Search }

    return (
        <div>
            <div className="flex items-center gap-2 mb-3 px-1">
                <Icon className="size-4 text-neutral-400" strokeWidth={1.6} />
                <h3 className="text-xs font-semibold uppercase tracking-wider text-neutral-400 dark:text-neutral-500">
                    {label}
                </h3>
                <span className="text-xs text-neutral-400 dark:text-neutral-500">
                    ({items.length})
                </span>
            </div>
            <div className="space-y-1">
                {items.map((item, i) => (
                    <ResultCard key={item.id || i} type={type} item={item} />
                ))}
            </div>
        </div>
    )
}

function ResultCard({ type, item }: { type: string; item: any }) {
    switch (type) {
        case 'people':
            return <ProfileCard item={item} />
        case 'projects':
            return <ProjectCard item={item} />
        case 'posts':
            return <PostCard item={item} />
        case 'pages':
            return <PageCard item={item} />
        case 'education':
            return <EducationCard item={item} />
        case 'experience':
            return <ExperienceCard item={item} />
        default:
            return null
    }
}

function ProfileCard({ item }: { item: any }) {
    return (
        <Link
            href={`/${item.username}`}
            className="flex items-center gap-3 p-3 rounded-xl hover:bg-neutral-50 dark:hover:bg-neutral-800/50 transition-colors group"
        >
            <Image
                src={item.profileImage || item.image || '/placeholder.png'}
                alt={item.displayName || item.name || ''}
                width={40}
                height={40}
                className="rounded-full size-10 border border-neutral-200 dark:border-neutral-700 object-cover"
            />
            <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{item.displayName || item.name}</p>
                <p className="text-xs text-neutral-500 dark:text-neutral-400 truncate">
                    @{item.username}
                </p>
            </div>
            <ArrowRight className="size-4 opacity-0 group-hover:opacity-50 transition-opacity" />
        </Link>
    )
}

function ProjectCard({ item }: { item: any }) {
    const href = item.url || `/${item.username}`
    return (
        <Link
            href={`/project/${item.id}`}
            className="flex items-center gap-3 p-3 rounded-xl hover:bg-neutral-50 dark:hover:bg-neutral-800/50 transition-colors group"
        >
            <div className="size-10 rounded-lg bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center shrink-0">
                <FolderOpen className="size-5 text-neutral-400" strokeWidth={1.4} />
            </div>
            <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                    <p className="text-sm font-medium truncate">{item.name}</p>
                    {item.status && (
                        <span
                            className={cn(
                                'text-[10px] px-1.5 py-0.5 rounded-full font-medium shrink-0',
                                item.status === 'completed'
                                    ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400'
                                    : item.status === 'wip'
                                        ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400'
                                        : 'bg-neutral-100 text-neutral-500 dark:bg-neutral-800 dark:text-neutral-400'
                            )}
                        >
                            {item.status}
                        </span>
                    )}
                </div>
                <p className="text-xs text-neutral-500 dark:text-neutral-400 truncate">
                    {item.tagline || item.description?.substring(0, 80)}
                </p>
                <p className="text-[11px] text-neutral-400 dark:text-neutral-500 mt-0.5">
                    by @{item.username}
                </p>
            </div>
            <ArrowRight className="size-4 opacity-0 group-hover:opacity-50 transition-opacity shrink-0" />
        </Link>
    )
}

function PostCard({ item }: { item: any }) {
    return (
        <Link
            href={`/post/${item.id}`}
            className="flex items-start gap-3 p-3 rounded-xl hover:bg-neutral-50 dark:hover:bg-neutral-800/50 transition-colors group"
        >
            <Image
                src={item.profileImage || '/placeholder.png'}
                alt={item.displayName || ''}
                width={32}
                height={32}
                className="size-8 rounded-full border border-neutral-200 dark:border-neutral-700 object-cover shrink-0"
            />
            <div className="flex-1 min-w-0">
                <p className="text-sm text-neutral-800 dark:text-neutral-200 mb-0.5">
                    {item.displayName}
                </p>
                <p className="text-xs text-neutral-400 dark:text-neutral-500 mb-0.5">
                    @{item.username}
                </p>
                <div
                    className={cn(
                        "prose-gray-800 mt-2 leading-snug line-clamp-[10] font-medium text-sm",
                        "dark:prose-gray-300",
                        "prose prose-sm dark:prose-invert max-w-none break-words overflow-hidden"
                    )}
                    dangerouslySetInnerHTML={{ __html: item.content.substring(0, 100) }}
                />
            </div>
            <ArrowRight className="size-4 opacity-0 group-hover:opacity-50 transition-opacity shrink-0" />
        </Link>
    )
}

function PageCard({ item }: { item: any }) {
    return (
        <Link
            href={`/page/${item.id}`}
            className="flex items-center gap-3 p-3 rounded-xl hover:bg-neutral-50 dark:hover:bg-neutral-800/50 transition-colors group"
        >
            <div className="size-10 rounded-lg bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center shrink-0">
                <FileText className="size-5 text-neutral-400" strokeWidth={1.4} />
            </div>
            <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{item.title}</p>
                <p className="text-[11px] text-neutral-400 dark:text-neutral-500 mt-0.5">
                    by @{item.username}
                </p>
            </div>
            <ArrowRight className="size-4 opacity-0 group-hover:opacity-50 transition-opacity shrink-0" />
        </Link>
    )
}

function EducationCard({ item }: { item: any }) {
    return (
        <Link
            href={`/${item.username}`}
            className="flex items-center gap-3 p-3 rounded-xl hover:bg-neutral-50 dark:hover:bg-neutral-800/50 transition-colors group"
        >
            <div className="size-10 rounded-lg bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center shrink-0">
                <GraduationCap className="size-5 text-neutral-400" strokeWidth={1.4} />
            </div>
            <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{item.school}</p>
                <p className="text-xs text-neutral-500 dark:text-neutral-400 truncate">
                    {[item.degree, item.fieldOfStudy].filter(Boolean).join(' · ')}
                </p>
                <p className="text-[11px] text-neutral-400 dark:text-neutral-500 mt-0.5">
                    @{item.username}
                </p>
            </div>
            <ArrowRight className="size-4 opacity-0 group-hover:opacity-50 transition-opacity shrink-0" />
        </Link>
    )
}

function ExperienceCard({ item }: { item: any }) {
    return (
        <Link
            href={`/${item.username}`}
            className="flex items-center gap-3 p-3 rounded-xl hover:bg-neutral-50 dark:hover:bg-neutral-800/50 transition-colors group"
        >
            <div className="size-10 rounded-lg bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center shrink-0">
                <Briefcase className="size-5 text-neutral-400" strokeWidth={1.4} />
            </div>
            <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{item.title}</p>
                <p className="text-xs text-neutral-500 dark:text-neutral-400 truncate">
                    {item.company}
                    {item.location ? ` · ${item.location}` : ''}
                    {item.employmentType ? ` · ${item.employmentType}` : ''}
                </p>
                <p className="text-[11px] text-neutral-400 dark:text-neutral-500 mt-0.5">
                    {item.currentlyWorking ? 'Currently working' : ''} · @{item.username}
                </p>
            </div>
            <ArrowRight className="size-4 opacity-0 group-hover:opacity-50 transition-opacity shrink-0" />
        </Link>
    )
}
