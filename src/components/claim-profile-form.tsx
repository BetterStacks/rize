'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation } from '@tanstack/react-query'
import { Loader, CheckCircle, AlertCircle, User, FileText, Eye, EyeOff } from 'lucide-react'
import { useSearchParams } from 'next/navigation'
import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import { z } from 'zod'
import { motion } from 'framer-motion'
import Logo from './logo'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Label } from './ui/label'
import { useRouter } from 'next/navigation'
import { signInWithCredentials } from '@/lib/auth-client'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from './ui/alert-dialog'

const ClaimProfileSchema = z.object({
  password: z
    .string()
    .min(8, { message: 'Password must be at least 8 characters.' })
    .regex(/[A-Z]/, { message: 'Password must contain at least one uppercase letter.' })
    .regex(/[a-z]/, { message: 'Password must contain at least one lowercase letter.' })
    .regex(/[0-9]/, { message: 'Password must contain at least one number.' }),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
})

type ClaimProfileValues = z.infer<typeof ClaimProfileSchema>

interface UserData {
  name: string
  email: string
  resumeFileId: string
}

async function validateTokenAndGetUser(token: string): Promise<UserData> {
  const response = await fetch('/api/claim-profile/validate', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ token }),
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.message || 'Invalid or expired claim token')
  }

  return response.json()
}

async function claimProfile(token: string, password: string): Promise<{ email: string; resumeFileId: string | null }> {
  const response = await fetch('/api/claim-profile/claim', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ token, password }),
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.message || 'Failed to claim profile')
  }

  return response.json()
}

async function removeProfile(token: string): Promise<void> {
  const response = await fetch('/api/claim-profile/remove', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ token }),
  })

  if (!response.ok) {
    const error = await response.json().catch(() => ({}))
    throw new Error(error.message || error.error || 'Could not remove the profile. Please try again.')
  }
}

const ClaimProfileForm = () => {
  const searchParams = useSearchParams()
  const router = useRouter()
  const token = searchParams.get('token')
  const resumeId = searchParams.get('resumeId')
  
  const [userData, setUserData] = useState<UserData | null>(null)
  const [isValidating, setIsValidating] = useState(true)
  const [validationError, setValidationError] = useState<string | null>(null)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [removed, setRemoved] = useState(false)

  const form = useForm<ClaimProfileValues>({
    resolver: zodResolver(ClaimProfileSchema),
    defaultValues: {
      password: '',
      confirmPassword: '',
    },
  })

  // Validate token on mount
  useEffect(() => {
    if (!token) {
      setValidationError('No claim token provided')
      setIsValidating(false)
      return
    }

    validateTokenAndGetUser(token)
      .then((data) => {
        setUserData(data)
        setIsValidating(false)
      })
      .catch((error) => {
        setValidationError(error.message)
        setIsValidating(false)
      })
  }, [token])

  const { mutate: claimProfileMutation, isPending } = useMutation({
    mutationFn: (values: ClaimProfileValues) => claimProfile(token!, values.password),
    onSuccess: async (data, variables) => {
      toast.success('Profile claimed successfully! Signing you in...')
      
      try {
        // Auto-login the user with their credentials
        await signInWithCredentials(data.email, variables.password)
        
        // Redirect to onboarding with resume information
        const resumeParam = data.resumeFileId ? `?resumeId=${data.resumeFileId}` : ''
        router.push(`/onboarding${resumeParam}`)
      } catch (error) {
        console.error('Auto-login failed:', error)
        toast.error('Profile claimed but auto-login failed. Please sign in manually.')
        // Fallback to login page if auto-login fails
        setTimeout(() => {
          router.push('/login?email=' + encodeURIComponent(data.email))
        }, 1500)
      }
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to claim profile')
    },
  })

  const { mutate: removeProfileMutation, isPending: isRemoving } = useMutation({
    mutationFn: () => removeProfile(token!),
    onSuccess: () => setRemoved(true),
    onError: (error) => {
      toast.error(error.message || 'Could not remove the profile. Please try again.')
    },
  })

  const onSubmit = (values: ClaimProfileValues) => {
    claimProfileMutation(values)
  }

  // Shown after "This isn't me". Kept in local state: the token no longer
  // exists, so validating it again would show "Invalid Claim Link".
  if (removed) {
    return (
      <div className="w-full shadow-2xl bg-white dark:bg-dark-bg border border-neutral-300/60 dark:border-dark-border/80 space-y-4 rounded-3xl p-6">
        <div className="flex flex-col items-center justify-center py-8">
          <CheckCircle className="h-12 w-12 text-green-500 mb-4" />
          <h2 className="text-xl font-medium text-center">
            Profile removed
          </h2>
          <p className="text-sm text-neutral-600 dark:text-neutral-400 text-center mt-2 max-w-sm">
            We deleted this profile, including the name, email, work history and education on it. This link no longer works.
          </p>
          <Button
            variant="outline"
            className="mt-6"
            onClick={() => window.location.href = '/'}
          >
            Go to Homepage
          </Button>
        </div>
      </div>
    )
  }

  // Loading state while validating token
  if (isValidating) {
    return (
      <div className="w-full shadow-2xl bg-white dark:bg-dark-bg border border-neutral-300/60 dark:border-dark-border/80 space-y-4 rounded-3xl p-6">
        <div className="flex flex-col items-center justify-center py-8">
          <Loader className="h-8 w-8 animate-spin text-amber-500 mb-4" />
          <h2 className="text-xl font-medium text-center">
            Validating claim token...
          </h2>
          <p className="text-sm text-neutral-600 dark:text-neutral-400 text-center mt-2">
            Please wait while we verify your claim request
          </p>
        </div>
      </div>
    )
  }

  // Error state for invalid token
  if (validationError || !userData) {
    return (
      <div className="w-full shadow-2xl bg-white dark:bg-dark-bg border border-red-200 dark:border-red-800 space-y-4 rounded-3xl p-6">
        <div className="flex flex-col items-center justify-center py-8">
          <AlertCircle className="h-12 w-12 text-red-500 mb-4" />
          <h2 className="text-xl font-medium text-center text-red-600 dark:text-red-400">
            Invalid Claim Link
          </h2>
          <p className="text-sm text-neutral-600 dark:text-neutral-400 text-center mt-2 max-w-sm">
            {validationError || 'This claim link is invalid or has expired. Please check your email for the correct link.'}
          </p>
          <Button 
            variant="outline" 
            className="mt-6"
            onClick={() => window.location.href = '/'}
          >
            Go to Homepage
          </Button>
        </div>
      </div>
    )
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="w-full shadow-2xl bg-white dark:bg-dark-bg border border-neutral-300/60 dark:border-dark-border/80 space-y-6 rounded-3xl p-6"
    >
      {/* Header */}
      <div className="flex flex-col items-center justify-center">
        <Logo className="mx-auto mb-4 size-12" />
        <h2 className="text-2xl font-medium tracking-tight leading-tight md:font-semibold text-center">
          Claim Your Profile
        </h2>
        <p className="mt-2 text-sm opacity-80 text-center">
          Complete your account setup to get started
        </p>
      </div>

      {/* User Info Card */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3, delay: 0.1 }}
        className="bg-neutral-50 dark:bg-neutral-800/50 rounded-xl p-4 border border-neutral-200 dark:border-neutral-700"
      >
        <div className="flex items-center space-x-3">
          <div className="flex-shrink-0">
            <div className="w-10 h-10 bg-amber-100 dark:bg-amber-900/30 rounded-full flex items-center justify-center">
              <User className="w-5 h-5 text-amber-600 dark:text-amber-400" />
            </div>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-neutral-900 dark:text-white truncate">
              {userData.name}
            </p>
            <p className="text-sm text-neutral-500 dark:text-neutral-400 truncate">
              {userData.email}
            </p>
          </div>
          {resumeId && (
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
                <FileText className="w-4 h-4 text-green-600 dark:text-green-400" />
              </div>
            </div>
          )}
        </div>
        {resumeId && (
          <div className="mt-3 pt-3 border-t border-neutral-200 dark:border-neutral-600">
            <p className="text-xs text-neutral-600 dark:text-neutral-400 flex items-center">
              <CheckCircle className="w-3 h-3 mr-1 text-green-500" />
              Resume uploaded and ready for parsing
            </p>
          </div>
        )}
      </motion.div>

      {/* Password Form */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.2 }}
      >
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <Label className="text-sm font-medium">Password</Label>
            <div className="relative mt-1">
              <Input
                className="border-neutral-300/80 pr-10"
                type={showPassword ? "text" : "password"}
                placeholder="Enter a secure password"
                {...form.register('password')}
              />
              <button
                type="button"
                className="absolute inset-y-0 right-0 flex items-center pr-3"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4 text-neutral-400 hover:text-neutral-600" />
                ) : (
                  <Eye className="h-4 w-4 text-neutral-400 hover:text-neutral-600" />
                )}
              </button>
            </div>
            {form.formState.errors.password && (
              <p className="text-red-500 text-xs mt-1">
                {form.formState.errors.password.message}
              </p>
            )}
          </div>

          <div>
            <Label className="text-sm font-medium">Confirm Password</Label>
            <div className="relative mt-1">
              <Input
                className="border-neutral-300/80 pr-10"
                type={showConfirmPassword ? "text" : "password"}
                placeholder="Confirm your password"
                {...form.register('confirmPassword')}
              />
              <button
                type="button"
                className="absolute inset-y-0 right-0 flex items-center pr-3"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                {showConfirmPassword ? (
                  <EyeOff className="h-4 w-4 text-neutral-400 hover:text-neutral-600" />
                ) : (
                  <Eye className="h-4 w-4 text-neutral-400 hover:text-neutral-600" />
                )}
              </button>
            </div>
            {form.formState.errors.confirmPassword && (
              <p className="text-red-500 text-xs mt-1">
                {form.formState.errors.confirmPassword.message}
              </p>
            )}
          </div>

          {/* Password Requirements */}
          <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3 border border-blue-200 dark:border-blue-800">
            <p className="text-xs text-blue-800 dark:text-blue-200 font-medium mb-2">
              Password Requirements:
            </p>
            <ul className="text-xs text-blue-700 dark:text-blue-300 space-y-1">
              <li>• At least 8 characters long</li>
              <li>• One uppercase letter</li>
              <li>• One lowercase letter</li>
              <li>• One number</li>
            </ul>
          </div>

          <Button
            type="submit"
            disabled={isPending || Object.keys(form.formState.errors).length > 0}
            className="w-full mt-6"
            variant="secondary"
          >
            {isPending ? (
              <>
                <Loader className="mr-2 h-4 w-4 animate-spin" />
                Claiming Profile...
              </>
            ) : (
              'Claim Profile & Continue'
            )}
          </Button>
        </form>
      </motion.div>

      {/* Footer */}
      <div className="pt-4 border-t border-neutral-200 dark:border-neutral-700 space-y-3">
        <p className="text-xs text-neutral-500 dark:text-neutral-400 text-center">
          By claiming this profile, you agree to our terms of service and privacy policy.
          {resumeId && ' Your resume will be processed during onboarding.'}
        </p>
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <button
              type="button"
              disabled={isPending || isRemoving}
              className="block mx-auto text-xs text-neutral-500 dark:text-neutral-400 underline underline-offset-2 hover:text-neutral-700 dark:hover:text-neutral-200 disabled:opacity-50"
            >
              {isRemoving ? 'Removing…' : 'This isn’t me — remove this profile'}
            </button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Remove this profile?</AlertDialogTitle>
              <AlertDialogDescription>
                This deletes the profile made for {userData.name || 'this person'} ({userData.email}) and everything on it,
                including the work history and education taken from the resume. It can&apos;t be undone, and this link will stop working.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={() => removeProfileMutation()}>
                Remove profile
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </motion.div>
  )
}

export default ClaimProfileForm