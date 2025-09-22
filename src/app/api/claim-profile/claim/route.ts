import { NextRequest, NextResponse } from 'next/server'
import { drizzle } from 'drizzle-orm/node-postgres'
import { Pool } from 'pg'
import { users, accounts, profile } from '@/db/schema'
import { eq, and } from 'drizzle-orm'
import bcrypt from 'bcryptjs'

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
})

const db = drizzle({ client: pool, schema: { users, accounts, profile } })

export async function POST(request: NextRequest) {
  try {
    const { token, password } = await request.json()

    if (!token || !password) {
      return NextResponse.json(
        { message: 'Token and password are required' },
        { status: 400 }
      )
    }

    // Validate password strength
    if (password.length < 8) {
      return NextResponse.json(
        { message: 'Password must be at least 8 characters long' },
        { status: 400 }
      )
    }

    if (!/[A-Z]/.test(password)) {
      return NextResponse.json(
        { message: 'Password must contain at least one uppercase letter' },
        { status: 400 }
      )
    }

    if (!/[a-z]/.test(password)) {
      return NextResponse.json(
        { message: 'Password must contain at least one lowercase letter' },
        { status: 400 }
      )
    }

    if (!/[0-9]/.test(password)) {
      return NextResponse.json(
        { message: 'Password must contain at least one number' },
        { status: 400 }
      )
    }

    // Find user with this claim token (unclaimed accounts only)
    const user = await db.select()
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

    // Hash password (same method as signup form)
    const saltRounds = 10
    const hashedPassword = await bcrypt.hash(password, saltRounds)
    
    // Update user table: set password, mark as claimed, clear claim token
    await db.update(users)
      .set({
        password: hashedPassword,
        isClaimed: true,
        claimToken: null,
        emailVerified: true,
        updatedAt: new Date(),
      })
      .where(eq(users.id, userData.id))

    // Create the credential account record that Better Auth expects for email/password login
    // Store password in accounts table where Better Auth looks for it
    if (userData.email) {
      await db.insert(accounts).values({
        accountId: userData.email,
        providerId: 'credential',
        userId: userData.id,
        password: hashedPassword, // Store password in accounts table
      })
    }

    return NextResponse.json({
      message: 'Profile claimed successfully',
      userId: userData.id,
      email: userData.email,
      resumeFileId: userData.resumeFileId,
    })

  } catch (error) {
    console.error('Error claiming profile:', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}