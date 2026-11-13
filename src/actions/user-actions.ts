'use server'

import { users, accounts } from '@/db/schema'
import db from '@/lib/db'
import { TUser } from '@/lib/types'
import { hashSync } from 'bcryptjs'
import { eq } from 'drizzle-orm'
import { z } from 'zod'
import { checkRateLimit } from '@/lib/rate-limit'

// Same rules as the sign-up form. Only these fields are ever written.
const RegisterPayload = z.object({
  name: z.string().trim().min(3).max(80),
  email: z.string().trim().email().max(254),
  password: z.string().min(6).max(128),
})

const emailTaken = async (email: string) => {
  const [user] = await db
    .select({ id: users.id })
    .from(users)
    .where(eq(users.email, email))
    .limit(1)
  return !!user
}

export const register = async (
  payload: Pick<typeof TUser, 'email' | 'password' | 'name'>
) => {
  const parsed = RegisterPayload.safeParse(payload)
  if (!parsed.success) {
    throw new Error('Please check your name, email and password')
  }
  const { name, email, password } = parsed.data

  const { success } = await checkRateLimit('auth', `register:${email}`)
  if (!success) {
    throw new Error('Too many attempts. Please try again later.')
  }

  if (await emailTaken(email)) {
    throw new Error('User already exists')
  }
  const hashedPassword = hashSync(password, 10)
  const image = `https://api.dicebear.com/9.x/initials/svg?seed=${encodeURIComponent(name)}`
  const [user] = await db
    .insert(users)
    .values({
      name,
      email,
      password: hashedPassword,
      image,
    })
    .returning({ id: users.id, email: users.email })

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

  return { id: user.id }
}
