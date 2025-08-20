import { createAuthClient } from 'better-auth/react'
import { inferAdditionalFields } from 'better-auth/client/plugins'
import type { auth } from './auth'

// Client-side auth configuration - types are handled by the useAuth hook

export const authClient = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000',
  plugins: [
    inferAdditionalFields<typeof auth>(),
  ],
})

export const { 
  signIn, 
  signOut, 
  signUp, 
  useSession,
  getSession,
  updateUser,
  changeEmail,
  changePassword,
} = authClient

// Helper functions for social sign-in with onboarding redirect
export const signInWithGoogle = () => signIn.social({ 
  provider: 'google', 
  callbackURL: '/onboarding' 
})
export const signInWithGithub = () => signIn.social({ 
  provider: 'github', 
  callbackURL: '/onboarding' 
})
export const signInWithLinkedIn = () => signIn.social({ 
  provider: 'linkedin', 
  callbackURL: '/onboarding' 
})

// Helper function for email/password sign-in
export const signInWithCredentials = async (email: string, password: string) => {
  return signIn.email({
    email,
    password,
  })
}

export type Session = typeof authClient.$Infer.Session;
