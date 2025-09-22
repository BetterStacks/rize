'use server'

import { users, accounts } from '@/db/schema'
import db from '@/lib/db'
import { TUser } from '@/lib/types'
import { hashSync } from 'bcryptjs'
import { eq } from 'drizzle-orm'

export const userExists = async (email: string) => {
  try {
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1)

    return user
  } catch (error) {
    throw new Error((error as Error)?.message)
  }
}

export const register = async (
  payload: Pick<typeof TUser, 'email' | 'password' | 'name'>
) => {
  const alreadyExists = await userExists(payload.email as string)
  if (alreadyExists) {
    throw new Error('User already exists')
  }
  const hashedPassword = hashSync(payload.password as string, 10)
  const image = `https://api.dicebear.com/9.x/initials/svg?seed=${payload.name}`
  const [user] = await db
    .insert(users)
    .values({
      ...payload,
      password: hashedPassword,
      image,
    })
    .returning()

  if (!user) {
    throw new Error('Error creating user')
  }

  // Create the credential account record that Better Auth expects
  // Store password in accounts table where Better Auth looks for it
  await db.insert(accounts).values({
    accountId: user.email!,
    providerId: 'credential',
    userId: user.id,
    password: hashedPassword, // Store password in accounts table
  })

  return user
}
