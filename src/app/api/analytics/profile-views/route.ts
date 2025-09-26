import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from '@/lib/auth'

const POSTHOG_API_HOST = process.env.POSTHOG_API_HOST || 'https://us.posthog.com'
const POSTHOG_PROJECT_ID = process.env.POSTHOG_PROJECT_ID
const POSTHOG_PERSONAL_API_KEY = process.env.POSTHOG_PERSONAL_API_KEY

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession()
    const search = req.nextUrl.searchParams
    const username = search.get('username') || ''
    const period = (search.get('period') as '7d' | '30d' | '90d') || '30d'

    if (!session?.user?.username || session.user.username !== username) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (!POSTHOG_PROJECT_ID || !POSTHOG_PERSONAL_API_KEY) {
      return NextResponse.json({ error: 'PostHog not configured' }, { status: 500 })
    }

    const dateFrom = period === '7d' ? '-7d' : period === '90d' ? '-90d' : '-30d'

    const body = {
      insight: 'TRENDS',
      date_from: dateFrom,
      interval: 'day',
      filter_test_accounts: true,
      events: [
        { id: '$pageview', name: '$pageview', type: 'events', math: 'total' },
      ],
      properties: [
        {
          key: '$pathname',
          value: `/${username}`,
          operator: 'exact',
          type: 'event',
        },
      ],
      display: 'ActionsLineGraph',
      refresh: false,
    }

    const resp = await fetch(
      `${POSTHOG_API_HOST}/api/projects/${POSTHOG_PROJECT_ID}/insights/trend/`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${POSTHOG_PERSONAL_API_KEY}`,
        },
        body: JSON.stringify(body),
        // cache a minute for stability
        next: { revalidate: 60 },
      }
    )

    if (!resp.ok) {
      const text = await resp.text()
      return NextResponse.json({ error: text || 'PostHog error' }, { status: 502 })
    }

    const json = await resp.json()
    const series = Array.isArray(json.result) ? json.result[0] : null
    const data: number[] = Array.isArray(series?.data) ? series.data : []
    const dates: string[] = Array.isArray(series?.days)
      ? series.days
      : Array.isArray(series?.dates)
        ? series.dates
        : []

    const total = data.reduce((acc, v) => acc + (typeof v === 'number' ? v : 0), 0)

    // Country breakdown
    const breakdownCountryBody = {
      ...body,
      interval: undefined,
      date_from: dateFrom,
      breakdown_type: 'event',
      breakdown: '$geoip_country_name',
      display: 'ActionsTable',
    }
    const breakdownCityBody = {
      ...body,
      interval: undefined,
      date_from: dateFrom,
      breakdown_type: 'event',
      breakdown: '$geoip_city_name',
      display: 'ActionsTable',
    }

    const [countryResp, cityResp] = await Promise.all([
      fetch(`${POSTHOG_API_HOST}/api/projects/${POSTHOG_PROJECT_ID}/insights/trend/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${POSTHOG_PERSONAL_API_KEY}`,
        },
        body: JSON.stringify(breakdownCountryBody),
        next: { revalidate: 60 },
      }),
      fetch(`${POSTHOG_API_HOST}/api/projects/${POSTHOG_PROJECT_ID}/insights/trend/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${POSTHOG_PERSONAL_API_KEY}`,
        },
        body: JSON.stringify(breakdownCityBody),
        next: { revalidate: 60 },
      }),
    ])

    const [countryJson, cityJson] = await Promise.all([
      countryResp.ok ? countryResp.json() : Promise.resolve(null),
      cityResp.ok ? cityResp.json() : Promise.resolve(null),
    ])

    const seriesToTop = (arr: any[] | null | undefined) => {
      if (!Array.isArray(arr)) return []
      return arr
        .map((r: any) => {
          const nameRaw = r.breakdown_value ?? r.label ?? null
          const name = nameRaw && nameRaw !== '$$_posthog_breakdown_null_$$' ? nameRaw : 'Unknown'
          const valueSeries: number[] = Array.isArray(r.data) ? r.data : []
          const sum = valueSeries.reduce((acc, v) => acc + (typeof v === 'number' ? v : 0), 0)
          const value = (typeof r.aggregated_value === 'number' ? r.aggregated_value : undefined) ?? (typeof r.count === 'number' ? r.count : undefined) ?? sum
          return { name, value }
        })
        .filter((x: any) => (typeof x.value === 'number' ? x.value : 0) > 0)
        .sort((a: any, b: any) => b.value - a.value)
        .slice(0, 3)
    }

    const topCountries = seriesToTop(countryJson?.result)
    const topCities = seriesToTop(cityJson?.result)

    return NextResponse.json({
      success: true,
      total,
      series: { data, dates },
      period,
      topCountries,
      topCities,
    })
  } catch (e) {
    return NextResponse.json({ error: 'Failed to fetch analytics' }, { status: 500 })
  }
}


