import { NextRequest, NextResponse } from 'next/server'
import urlMetadata from 'url-metadata'
import { getServerSession } from '@/lib/auth'
import { checkRateLimit } from '@/lib/rate-limit'
import { safeFetch } from '@/lib/safe-url'

export async function GET(req: NextRequest) {
  const session = await getServerSession().catch(() => null)
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const limited = await checkRateLimit('api', session.user.id)
  if (!limited.success) return limited.response!

  try {
    const url = req.nextUrl.searchParams.get('url')
    if (url == null) {
      return NextResponse.json({ error: 'No URL found' }, { status: 404 })
    }

    // Fetch through safeFetch so only public hosts are reached, then parse.
    const response = await safeFetch(url)
    const metadata = await urlMetadata(null, { parseResponseObject: response })
    return NextResponse.json({ metadata }, { status: 200 })
  } catch (error) {
    return NextResponse.json(
      { error: (error as Error)?.message },
      { status: 500 }
    )
  }
}
