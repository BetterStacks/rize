import { NextResponse } from 'next/server'
import db from '@/lib/db'
import { sql } from 'drizzle-orm'

export async function GET() {
  try {
    const start = Date.now()
    await db.execute(sql`SELECT 1`)
    const dbLatency = Date.now() - start

    return NextResponse.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      db: { connected: true, latencyMs: dbLatency },
    })
  } catch (error) {
    return NextResponse.json(
      {
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
        db: { connected: false },
      },
      { status: 503 }
    )
  }
}
