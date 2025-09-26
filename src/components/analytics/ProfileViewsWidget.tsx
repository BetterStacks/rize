'use client'

import { useMemo, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useSession } from '@/hooks/useAuth'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { cn } from '@/lib/utils'
import { Skeleton } from '@/components/ui/skeleton'

// Use a light-weight SVG chart to avoid new deps
type Period = '7d' | '30d' | '90d'

type ApiResponse = {
	success: boolean
	total: number
	series: { data: number[]; dates: string[] }
	period: Period
	topCountries?: { name: string; value: number }[]
	topCities?: { name: string; value: number }[]
}

function MiniAreaChart({ values, className }: { values: number[]; className?: string }) {
	const width = 260
	const height = 64
	const paddingX = 6
	const paddingY = 6

	const { path, min, max } = useMemo(() => {
		if (!values || values.length === 0) {
			return { path: '', min: 0, max: 0 }
		}
		const minVal = Math.min(...values)
		const maxVal = Math.max(...values)
		const span = Math.max(1, maxVal - minVal)

		const innerW = width - paddingX * 2
		const innerH = height - paddingY * 2
		const stepX = values.length > 1 ? innerW / (values.length - 1) : innerW

		const points = values.map((v, i) => {
			const x = paddingX + i * stepX
			const y = paddingY + innerH - ((v - minVal) / span) * innerH
			return [x, y]
		})

		const d = points
			.map((p, i) => (i === 0 ? `M ${p[0]} ${p[1]}` : `L ${p[0]} ${p[1]}`))
			.join(' ')

		return { path: d, min: minVal, max: maxVal }
	}, [values])

	return (
		<svg width={width} height={height} className={cn('overflow-visible text-main-yellow', className)}>
			<defs>
				<linearGradient id="pvGradient" x1="0" x2="0" y1="0" y2="1">
					<stop offset="0%" stopColor="currentColor" stopOpacity="0.28" />
					<stop offset="100%" stopColor="currentColor" stopOpacity="0.02" />
				</linearGradient>
			</defs>
			{/* Area fill */}
			{path && (
				<path
					d={`${path} L ${width - 6} ${height - 6} L 6 ${height - 6} Z`}
					fill="url(#pvGradient)"
				/>
			)}
			{/* Stroke */}
			{path && (
				<path d={path} fill="none" stroke="currentColor" strokeWidth="2" />
			)}
		</svg>
	)
}

export default function ProfileViewsWidget({ className }: { className?: string }) {
	const { data: session, isLoading: authLoading } = useSession()
	const username = session?.user?.username
	const [period, setPeriod] = useState<Period>('30d')

	const { data, isLoading: queryLoading } = useQuery<ApiResponse>({
		queryKey: ['profile-views', username, period],
		enabled: !!username,
		queryFn: async () => {
			const res = await fetch(`/api/analytics/profile-views?username=${encodeURIComponent(username!)}&period=${period}`, { cache: 'no-store' })
			if (!res.ok) throw new Error('Failed to load views')
			return res.json()
		},
		staleTime: 60_000,
	})

	const total = data?.total ?? 0
	const values = data?.series?.data ?? []
  const countries = data?.topCountries ?? []
  const cities = data?.topCities ?? []
	const loading = authLoading || !username || queryLoading

	return (
		<div className={cn('w-full max-w-sm rounded-3xl border border-neutral-300/60 dark:border-dark-border/80', className)}>
			<CardHeader className="pb-2">
				<div className="flex items-center justify-between">
					<CardTitle className="text-base">Profile views</CardTitle>
					{loading ? (
						<div className="flex gap-2">
							<Skeleton className="h-8 w-8" />
							<Skeleton className="h-8 w-8" />
							<Skeleton className="h-8 w-8" />
						</div>
					) : (
						<Tabs value={period} onValueChange={(v) => setPeriod(v as Period)}>
							<TabsList>
								<TabsTrigger value="7d">7D</TabsTrigger>
								<TabsTrigger value="30d">30D</TabsTrigger>
								<TabsTrigger value="90d">90D</TabsTrigger>
							</TabsList>
							<TabsContent value="7d" />
							<TabsContent value="30d" />
							<TabsContent value="90d" />
						</Tabs>
					)}
				</div>
			</CardHeader>
			<CardContent className="pt-0">
				<div className="flex items-end justify-between">
					<div>
						{loading ? (
							<>
								<Skeleton className="h-8 w-24" />
								<div className="mt-2">
									<Skeleton className="h-3 w-16" />
								</div>
							</>
						) : (
							<>
								<div className="text-3xl font-semibold tracking-tight">{total}</div>
								<div className="text-xs opacity-60 mt-1">Pageviews</div>
							</>
						)}
					</div>
				</div>
				<div className="mt-3">
					{loading ? (
						<Skeleton className="h-16 w-full" />
					) : (
						<MiniAreaChart values={values} />
					)}
				</div>
				<div className="mt-6 grid grid-cols-2 gap-6">
					<div>
						<div className="text-xs uppercase tracking-wide opacity-60 mb-2">Top countries</div>
						<div className="space-y-2">
							{loading ? (
								<>
									<Skeleton className="h-4 w-full" />
									<Skeleton className="h-4 w-3/4" />
									<Skeleton className="h-4 w-2/3" />
								</>
							) : (
								countries.slice(0, 3).map((c) => (
									<div key={c.name} className="flex items-center justify-between text-sm">
										<span className="truncate pr-2">{c.name || 'Unknown'}</span>
										<span className="tabular-nums opacity-70">{c.value}</span>
									</div>
								))
							)}
							{!loading && countries.length === 0 && (
								<div className="text-xs opacity-60">No data</div>
							)}
						</div>
					</div>
					<div>
						<div className="text-xs uppercase tracking-wide opacity-60 mb-2">Top cities</div>
						<div className="space-y-2">
							{loading ? (
								<>
									<Skeleton className="h-4 w-full" />
									<Skeleton className="h-4 w-3/4" />
									<Skeleton className="h-4 w-2/3" />
								</>
							) : (
								cities.slice(0, 3).map((c) => (
									<div key={c.name} className="flex items-center justify-between text-sm">
										<span className="truncate pr-2">{c.name || 'Unknown'}</span>
										<span className="tabular-nums opacity-70">{c.value}</span>
									</div>
								))
							)}
							{!loading && cities.length === 0 && (
								<div className="text-xs opacity-60">No data</div>
							)}
						</div>
					</div>
				</div>
			</CardContent>
		</div>
	)
}


