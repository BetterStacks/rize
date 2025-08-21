import { getServerSession } from '@/lib/auth'
import { NextRequest, NextResponse } from 'next/server'
import { importFromGitHub, importFromLinkedIn } from '@/lib/profile-import'
import { processImportedProfile } from '@/actions/import-actions'
import db from '@/lib/db'
import { accounts } from '@/db/schema'
import { eq, and } from 'drizzle-orm'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession()
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { provider } = await request.json()

    if (!provider || !['github', 'linkedin'].includes(provider)) {
      return NextResponse.json({ error: 'Invalid provider' }, { status: 400 })
    }

    // Get the user's access token for the specified provider
    const accountData = await db
      .select()
      .from(accounts)
      .where(
        and(
          eq(accounts.userId, session.user.id),
          eq(accounts.providerId, provider) // Use correct column name
        )
      )
      .limit(1)

    if (!accountData.length || !accountData[0].accessToken) {
      return NextResponse.json(
        { error: `No ${provider} account connected or access token missing` }, 
        { status: 400 }
      )
    }

    const accessToken = accountData[0].accessToken // Use correct column name
    let importedData

    // Import data based on provider
    if (provider === 'github') {
      importedData = await importFromGitHub(accessToken)
    } else if (provider === 'linkedin') {
      importedData = await importFromLinkedIn(accessToken)
    } else {
      return NextResponse.json({ error: 'Unsupported provider' }, { status: 400 })
    }

    // Process and save the imported data
    const result = await processImportedProfile(importedData)

    if (!result.success) {
      return NextResponse.json(
        { error: result.error }, 
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: `Profile imported from ${provider} successfully`,
      stats: result.stats,
      importedData: {
        displayName: importedData.displayName,
        bio: importedData.bio,
        projectsCount: importedData.projects?.length || 0,
        experienceCount: importedData.experience?.length || 0,
        skillsCount: importedData.skills?.length || 0,
      }
    })

  } catch (error) {
    console.error('Profile import error:', error)
    return NextResponse.json(
      { error: 'Failed to import profile data' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    console.log('🔍 Getting import sources...')
    const session = await getServerSession()
    
    if (!session?.user?.id) {
      console.log('❌ No session or user ID')
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    console.log('✅ Session found:', { userId: session.user.id })

    // Get available import sources - handle case where no accounts exist
    let userAccounts = []
    try {
      userAccounts = await db
        .select({
          providerId: accounts.providerId, // Use correct column name
          accessToken: accounts.accessToken,
        })
        .from(accounts)
        .where(eq(accounts.userId, session.user.id))
        
      console.log('✅ User accounts query result:', userAccounts)
    } catch (dbError) {
      console.error('Database query error:', dbError)
      // Continue with empty accounts array
    }

    const availableSources = {
      github: userAccounts.some(acc => acc.providerId === 'github' && acc.accessToken),
      linkedin: userAccounts.some(acc => acc.providerId === 'linkedin' && acc.accessToken),
    }

    console.log('✅ Available sources:', availableSources)

    return NextResponse.json({
      success: true,
      availableSources
    })

  } catch (error) {
    console.error('Error getting import sources:', error)
    return NextResponse.json(
      { error: 'Failed to get import sources' },
      { status: 500 }
    )
  }
}