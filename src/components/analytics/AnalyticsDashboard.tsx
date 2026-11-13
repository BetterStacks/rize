'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { SettingsHeader, SettingsSection } from '@/components/settings/settings-section'
import { getProfileAnalytics } from '@/actions/analytics-actions'

type Timeframe = '7d' | '30d' | '90d'

type AnalyticsData = {
  overview: {
    totalViews: number
    uniqueViews: number
    totalLikes: number
    totalComments: number
    totalBookmarks: number
  }
  clicksByType: Record<string, number>
  dailyViews: Array<{
    date: string
    views: number
    uniqueViews: number
  }>
  topReferrers: Array<{
    referrer: string | null
    count: number
  }>
  timeframe: Timeframe
}

interface AnalyticsDashboardProps {
  username: string
}

const DAYS: Record<Timeframe, number> = { '7d': 7, '30d': 30, '90d': 90 }

const timeframeLabels: Record<Timeframe, string> = {
  '7d': 'Last 7 days',
  '30d': 'Last 30 days',
  '90d': 'Last 90 days'
}

const elementTypeLabels: Record<string, string> = {
  social_link: 'Social links',
  project: 'Projects',
  writing: 'Writing',
  email: 'Email',
  resume: 'Resume downloads'
}

// Dates come back as YYYY-MM-DD (sometimes as a Date); keep them in UTC so a
// day never shifts by one in the viewer's timezone.
const dayKey = (value: string | Date) =>
  typeof value === 'string' ? value.slice(0, 10) : new Date(value).toISOString().slice(0, 10)

const formatDay = (key: string, withYear = false) =>
  new Date(`${key}T00:00:00Z`).toLocaleDateString('en', {
    month: 'short',
    day: 'numeric',
    timeZone: 'UTC',
    ...(withYear ? { year: 'numeric' } : {}),
  })

/** Every day in the window, including the quiet ones, oldest first. */
const fillDays = (rows: AnalyticsData['dailyViews'], days: number) => {
  const byDay = new Map(rows.map((r) => [dayKey(r.date), r]))
  const today = new Date()
  const out: { key: string; views: number; uniqueViews: number }[] = []
  for (let i = days; i >= 0; i--) {
    const d = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate() - i))
    const key = d.toISOString().slice(0, 10)
    const row = byDay.get(key)
    out.push({ key, views: row?.views ?? 0, uniqueViews: row?.uniqueViews ?? 0 })
  }
  return out
}

const plural = (n: number, one: string, many: string) => `${n.toLocaleString()} ${n === 1 ? one : many}`

const Stat = ({ label, value, note }: { label: string; value: number; note?: string }) => (
  <div className="min-w-0">
    <dt className="text-sm text-ink-secondary">{label}</dt>
    <dd className="mt-1 font-instrument text-4xl leading-none sm:text-5xl tabular-nums text-ink">{value.toLocaleString()}</dd>
    {note && <dd className="mt-2 text-xs text-ink-secondary">{note}</dd>}
  </div>
)

const CountList = ({ rows, empty }: { rows: { label: string; count: number; key: string }[]; empty: string }) =>
  rows.length > 0 ? (
    <ul className="divide-y divide-hairline border-y border-hairline">
      {rows.map((row) => (
        <li key={row.key} className="flex min-h-11 items-center justify-between gap-4 py-2.5 text-sm">
          <span className="min-w-0 truncate text-ink">{row.label}</span>
          <span className="shrink-0 tabular-nums text-ink-secondary">{row.count.toLocaleString()}</span>
        </li>
      ))}
    </ul>
  ) : (
    <p className="text-sm text-ink-secondary">{empty}</p>
  )

const ViewsChart = ({ days }: { days: ReturnType<typeof fillDays> }) => {
  const max = Math.max(1, ...days.map((d) => d.views))
  const total = days.reduce((sum, d) => sum + d.views, 0)
  const busiest = days.reduce((a, b) => (b.views > a.views ? b : a), days[0])
  const withViews = days.filter((d) => d.views > 0)

  return (
    <div>
      <div
        role="img"
        aria-label={
          total === 0
            ? 'No views in this period.'
            : `${plural(total, 'view', 'views')} in this period. Busiest day ${formatDay(busiest.key)} with ${plural(busiest.views, 'view', 'views')}.`
        }
        className="flex h-28 items-end gap-px border-b border-hairline"
      >
        {days.map((d) => (
          <div
            key={d.key}
            title={`${formatDay(d.key)}: ${plural(d.views, 'view', 'views')}`}
            className="flex-1 rounded-t-[2px] bg-ink/70 dark:bg-ink/60"
            style={{ height: d.views ? `${Math.max(4, (d.views / max) * 100)}%` : 0 }}
          />
        ))}
      </div>
      <div className="mt-2 flex justify-between text-xs tabular-nums text-ink-secondary" aria-hidden>
        <span>{formatDay(days[0].key)}</span>
        <span>Today</span>
      </div>

      {withViews.length > 0 && (
        <details className="group mt-4">
          <summary className="inline-flex min-h-11 cursor-pointer list-none items-center text-sm font-medium text-ink-secondary hover:text-ink [&::-webkit-details-marker]:hidden">
            <span className="group-open:hidden">Show each day</span>
            <span className="hidden group-open:inline">Hide days</span>
          </summary>
          <table className="mt-2 w-full text-sm">
            <thead>
              <tr className="border-b border-hairline text-left text-xs text-ink-secondary">
                <th scope="col" className="py-2 font-normal">Day</th>
                <th scope="col" className="py-2 text-right font-normal">Views</th>
                <th scope="col" className="py-2 text-right font-normal">Unique</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-hairline">
              {[...withViews].reverse().map((d) => (
                <tr key={d.key}>
                  <td className="py-2 text-ink">{formatDay(d.key, true)}</td>
                  <td className="py-2 text-right tabular-nums text-ink">{d.views}</td>
                  <td className="py-2 text-right tabular-nums text-ink-secondary">{d.uniqueViews}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </details>
      )}
    </div>
  )
}

const LoadingState = () => (
  <div aria-busy="true" aria-label="Loading stats" className="border-t border-hairline py-10 motion-safe:animate-pulse">
    <div className="h-7 w-40 rounded-lg bg-subtle" />
    <div className="mt-8 grid grid-cols-2 gap-6">
      <div className="h-16 rounded-lg bg-subtle" />
      <div className="h-16 rounded-lg bg-subtle" />
    </div>
    <div className="mt-8 h-28 rounded-lg bg-subtle" />
  </div>
)

export default function AnalyticsDashboard({ username }: AnalyticsDashboardProps) {
  const [data, setData] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [timeframe, setTimeframe] = useState<Timeframe>('30d')

  const fetchAnalytics = useCallback(async (selectedTimeframe: Timeframe) => {
    setLoading(true)
    setError(null)

    try {
      const result = await getProfileAnalytics(username, selectedTimeframe)
      if (result.success && result.data) {
        setData(result.data)
      } else {
        setError("Couldn't load your stats.")
      }
    } catch {
      setError("Couldn't load your stats.")
    } finally {
      setLoading(false)
    }
  }, [username])

  useEffect(() => {
    fetchAnalytics(timeframe)
  }, [fetchAnalytics, timeframe])

  const days = useMemo(
    () => (data ? fillDays(data.dailyViews, DAYS[timeframe]) : []),
    [data, timeframe]
  )

  const header = (
    <SettingsHeader
      title="Stats"
      description="How often your profile was opened, and how people responded to your posts."
      back={{ href: '/settings', label: 'Back to settings' }}
      actions={
        <Tabs value={timeframe} onValueChange={(value) => setTimeframe(value as Timeframe)}>
          <TabsList aria-label="Time period">
            <TabsTrigger value="7d">7 days</TabsTrigger>
            <TabsTrigger value="30d">30 days</TabsTrigger>
            <TabsTrigger value="90d">90 days</TabsTrigger>
          </TabsList>
        </Tabs>
      }
    />
  )

  if (loading) {
    return (
      <>
        {header}
        <LoadingState />
      </>
    )
  }

  if (error || !data) {
    return (
      <>
        {header}
        <div role="alert" className="flex flex-wrap items-center gap-x-3 gap-y-2 border-t border-hairline py-10 text-sm">
          <p className="text-ink-secondary">{error ?? "Couldn't load your stats."}</p>
          <Button variant="outline" size="sm" className="touch-target" onClick={() => fetchAnalytics(timeframe)}>
            Try again
          </Button>
        </div>
      </>
    )
  }

  const { overview, clicksByType, topReferrers } = data

  return (
    <>
      {header}

      <SettingsSection id="views" title="Profile views" description={timeframeLabels[timeframe]}>
        <dl className="mb-8 grid grid-cols-2 gap-6">
          <Stat label="Views" value={overview.totalViews} />
          <Stat label="Unique views" value={overview.uniqueViews} note="Repeat views counted once" />
        </dl>
        {days.length > 0 && <ViewsChart days={days} />}
      </SettingsSection>

      <SettingsSection id="posts" title="On your posts" description="All time, across every post.">
        <dl className="grid grid-cols-3 gap-6">
          <Stat label="Likes" value={overview.totalLikes} />
          <Stat label="Comments" value={overview.totalComments} />
          <Stat label="Saves" value={overview.totalBookmarks} />
        </dl>
      </SettingsSection>

      <SettingsSection id="clicks" title="Clicks" description="Taps on links, projects and writing on your profile.">
        <CountList
          rows={Object.entries(clicksByType)
            .sort(([, a], [, b]) => b - a)
            .map(([type, count]) => ({ key: type, label: elementTypeLabels[type] || type, count }))}
          empty="No clicks in this period."
        />
      </SettingsSection>

      <SettingsSection id="sources" title="Sources" description="Sites and links that sent people to your profile.">
        <CountList
          rows={topReferrers.map((r, i) => ({ key: `${r.referrer ?? 'direct'}-${i}`, label: r.referrer || 'Direct', count: r.count }))}
          empty="No sources in this period."
        />
      </SettingsSection>
    </>
  )
}
