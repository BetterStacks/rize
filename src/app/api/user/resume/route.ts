import { requireAuth } from '@/lib/auth'
import { NextResponse } from 'next/server'
import db from '@/lib/db'
import { users } from '@/db/schema'
import { eq } from 'drizzle-orm'

export async function GET() {
  try {
    const session = await requireAuth()
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = await db.select({ resumeFileId: users.resumeFileId })
      .from(users)
      .where(eq(users.id, session.user.id))
      .limit(1)

    return NextResponse.json({ 
      resumeUrl: user[0]?.resumeFileId || null 
    })
  } catch (error) {
    console.error('Fetch resume error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch resume' },
      { status: 500 }
    )
  }
}