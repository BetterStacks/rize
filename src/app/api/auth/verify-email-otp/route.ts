import { getServerSession } from '@/lib/auth'
import db from '@/lib/db'
import { users, verification } from '@/db/schema'
import { and, eq, gt } from 'drizzle-orm'
import { NextResponse } from 'next/server'

export async function POST(req: Request) {
    try {
        const session = await getServerSession()
        if (!session?.user) {
            return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
        }

        const { otp } = await req.json()

        // Check if OTP is valid
        const verificationRecord = await db.query.verification.findFirst({
            where: and(
                eq(verification.identifier, session.user.email),
                eq(verification.value, otp),
                gt(verification.expiresAt, new Date())
            )
        })

        if (!verificationRecord) {
            return NextResponse.json({ message: 'Invalid or expired OTP' }, { status: 400 })
        }

        // Update user's emailVerified status
        await db
        .update(users)
        .set({ emailVerified: true })
        .where(eq(users.id, session.user.id))

        // Delete used OTP
        await db
        .delete(verification)
        .where(eq(verification.id, verificationRecord.id))

        return NextResponse.json({ message: 'Email verified successfully' })
    } catch (error) {
        console.error('Verify OTP error:', error)
        return NextResponse.json({ message: 'Verification failed' }, { status: 500 })
    }
}
