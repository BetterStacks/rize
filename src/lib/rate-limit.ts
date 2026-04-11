import { Ratelimit } from '@upstash/ratelimit'
import { Redis } from '@upstash/redis'
import { NextResponse } from 'next/server'

const redis = process.env.UPSTASH_REDIS_REST_URL
  ? new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL,
      token: process.env.UPSTASH_REDIS_REST_TOKEN!,
    })
  : null

// Rate limiters for different endpoints
export const rateLimiters = {
  // General API: 100 requests per 60 seconds
  api: redis
    ? new Ratelimit({ redis, limiter: Ratelimit.slidingWindow(100, '60 s') })
    : null,

  // Upload: 20 uploads per 60 seconds
  upload: redis
    ? new Ratelimit({ redis, limiter: Ratelimit.slidingWindow(20, '60 s') })
    : null,

  // Search: 30 requests per 60 seconds
  search: redis
    ? new Ratelimit({ redis, limiter: Ratelimit.slidingWindow(30, '60 s') })
    : null,

  // Auth: 10 attempts per 60 seconds
  auth: redis
    ? new Ratelimit({ redis, limiter: Ratelimit.slidingWindow(10, '60 s') })
    : null,

  // Webhook: 50 per 60 seconds
  webhook: redis
    ? new Ratelimit({ redis, limiter: Ratelimit.slidingWindow(50, '60 s') })
    : null,

  // Voice call initiation: 3 per day
  call: redis
    ? new Ratelimit({ redis, limiter: Ratelimit.slidingWindow(3, '86400 s') })
    : null,
}

export type RateLimiterKey = keyof typeof rateLimiters

export async function checkRateLimit(
  limiterKey: RateLimiterKey,
  identifier: string
): Promise<{ success: boolean; response?: NextResponse }> {
  const limiter = rateLimiters[limiterKey]

  // If Redis not configured, allow all (development mode)
  if (!limiter) {
    return { success: true }
  }

  const { success, limit, remaining, reset } = await limiter.limit(identifier)

  if (!success) {
    return {
      success: false,
      response: NextResponse.json(
        { error: 'Too many requests. Please try again later.' },
        {
          status: 429,
          headers: {
            'X-RateLimit-Limit': limit.toString(),
            'X-RateLimit-Remaining': remaining.toString(),
            'X-RateLimit-Reset': reset.toString(),
            'Retry-After': Math.ceil((reset - Date.now()) / 1000).toString(),
          },
        }
      ),
    }
  }

  return { success: true }
}
