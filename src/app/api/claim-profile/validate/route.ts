import { NextRequest, NextResponse } from 'next/server'
import { drizzle } from 'drizzle-orm/node-postgres'
import { Pool } from 'pg'
import { users } from '@/db/schema'
import { eq, and } from 'drizzle-orm'

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
})

const db = drizzle({ client: pool, schema: { users } })

export async function POST(request: NextRequest) {
  try {
    const { token } = await request.json()

    if (!token) {
      return NextResponse.json(
        { message: 'Claim token is required' },
        { status: 400 }
      )
    }

    // Find user with this claim token
    const user = await db.select({
      id: users.id,
      name: users.name,
      email: users.email,
      resumeFileId: users.resumeFileId,
      isClaimed: users.isClaimed,
    })
    .from(users)
    .where(
      and(
        eq(users.claimToken, token),
        eq(users.isClaimed, false) // Only unclaimed accounts
      )
    )
    .limit(1)

    if (user.length === 0) {
      return NextResponse.json(
        { message: 'Invalid or expired claim token' },
        { status: 404 }
      )
    }

    const userData = user[0]

    // Return user data (without sensitive info)
    return NextResponse.json({
      name: userData.name,
      email: userData.email,
      resumeFileId: userData.resumeFileId,
    })

  } catch (error) {
    console.error('Error validating claim token:', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}