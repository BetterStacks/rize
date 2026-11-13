import { NextRequest, NextResponse } from 'next/server'
import { and, eq, inArray, or } from 'drizzle-orm'
import db from '@/lib/db'
import {
  bookmarks,
  comments,
  posts,
  profile,
  profileSections,
  users,
} from '@/db/schema'
import { checkRateLimit } from '@/lib/rate-limit'

class NotFoundError extends Error {}

/**
 * "This isn't me": deletes a seeded profile that was never claimed.
 *
 * Only works with a valid claim token for an account that is still unclaimed
 * (users.isClaimed = false). Claimed accounts can never be removed this way.
 */
export async function POST(request: NextRequest) {
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'anonymous'
  const { success, response } = await checkRateLimit('auth', `claim-remove:${ip}`)
  if (!success) return response!

  const body: unknown = await request.json().catch(() => null)
  const token =
    body && typeof body === 'object' && 'token' in body ? (body as { token: unknown }).token : null

  if (typeof token !== 'string' || token.length === 0 || token.length > 200) {
    return NextResponse.json({ message: 'Claim token is required' }, { status: 400 })
  }

  try {
    await db.transaction(async (tx) => {
      const [user] = await tx
        .select({ id: users.id })
        .from(users)
        .where(and(eq(users.claimToken, token), eq(users.isClaimed, false)))
        .limit(1)

      if (!user) throw new NotFoundError()

      // Deleting the user cascades to the profile and almost everything under
      // it. comments, bookmarks and profile_sections don't cascade, so remove
      // those rows first or the delete fails.
      const profileIds = (
        await tx.select({ id: profile.id }).from(profile).where(eq(profile.userId, user.id))
      ).map((p) => p.id)

      if (profileIds.length > 0) {
        const postIds = (
          await tx
            .select({ id: posts.id })
            .from(posts)
            .where(inArray(posts.profileId, profileIds))
        ).map((p) => p.id)

        await tx
          .delete(comments)
          .where(
            postIds.length > 0
              ? or(inArray(comments.profileId, profileIds), inArray(comments.postId, postIds))
              : inArray(comments.profileId, profileIds)
          )
        await tx
          .delete(bookmarks)
          .where(
            postIds.length > 0
              ? or(inArray(bookmarks.profileId, profileIds), inArray(bookmarks.postId, postIds))
              : inArray(bookmarks.profileId, profileIds)
          )
        await tx.delete(profileSections).where(inArray(profileSections.profileId, profileIds))
      }

      // Re-check the token and unclaimed state in the delete itself, so a
      // claim that lands at the same moment can't be deleted.
      const deleted = await tx
        .delete(users)
        .where(
          and(eq(users.id, user.id), eq(users.claimToken, token), eq(users.isClaimed, false))
        )
        .returning({ id: users.id })

      if (deleted.length === 0) throw new NotFoundError()
    })
  } catch (error) {
    if (error instanceof NotFoundError) {
      return NextResponse.json(
        { message: 'This link is invalid, or the profile was already claimed or removed.' },
        { status: 404 }
      )
    }
    console.error('Error removing unclaimed profile:', error)
    return NextResponse.json({ message: 'Could not remove the profile. Please try again.' }, { status: 500 })
  }

  return NextResponse.json({ message: 'Profile removed' })
}
