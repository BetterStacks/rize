import { authHandler } from '@/lib/auth'
import { NextRequest, NextResponse } from 'next/server'

const isTransientSocketError = (error: unknown) => {
  if (!(error instanceof Error)) return false
  const message = error.message.toLowerCase()
  return (
    message.includes('econnreset') ||
    message.includes('socket hang up') ||
    message.includes('connection terminated') ||
    message.includes('timeout')
  )
}

const handler = async (request: NextRequest) => {
  try {
    return await authHandler(request)
  } catch (error) {
    const pathname = request.nextUrl.pathname
    const isGetSessionEndpoint = pathname.endsWith('/get-session')

    console.error('[auth] Handler failed:', {
      path: pathname,
      method: request.method,
      error,
    })

    if (isGetSessionEndpoint && isTransientSocketError(error)) {
      // Better Auth clients treat `null` as "not logged in", which is safer than a hard 500
      // during transient DB/network blips.
      return NextResponse.json(null, {
        status: 200,
        headers: { 'cache-control': 'no-store' },
      })
    }

    return NextResponse.json(
      { error: 'Auth temporarily unavailable' },
      { status: 503 }
    )
  }
}

export const GET = handler
export const POST = handler
