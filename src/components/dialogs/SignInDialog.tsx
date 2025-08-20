'use client'
import { signInWithGoogle, signInWithLinkedIn } from '@/lib/auth-client'
import Link from 'next/link'
import { useState } from 'react'
import toast from 'react-hot-toast'
import AuthProviderButton from '../auth-provider-button'
import { useAuthDialog } from '../dialog-provider'
import { Button } from '../ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog'

const AuthDialog = () => {
  const [open, setOpen] = useAuthDialog()
  const [isLoading, setIsLoading] = useState(false)

  const handleSocialSignIn = async (provider: 'google' | 'linkedin') => {
    try {
      setIsLoading(true)
      let result
      switch (provider) {
        case 'google':
          result = await signInWithGoogle()
          break
        case 'linkedin':
          result = await signInWithLinkedIn()
          break
        default:
          throw new Error('Unsupported provider')
      }
      
      if (result?.error) {
        toast.error(result.error.message || 'Sign in failed')
        return
      }
      
      setOpen(false)
      toast.success('Signed in successfully')
    } catch (error: any) {
      toast.error(error.message || 'Sign in failed')
    } finally {
      setIsLoading(false)
    }
  }
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="rounded-3xl sm:rounded-3xl h-fit bg-white dark:bg-dark-bg dark:border-dark-border border-neutral-300  p-6 md:p-8 sm:max-w-xs md:max-w-sm lg:max-w-md ">
        <DialogHeader className="flex flex-col items-start justify-start">
          <DialogTitle className="text-lg font-medium md:text-xl md:font-semibold tracking-tight ">
            Get Started with Rize
          </DialogTitle>
          <DialogDescription className="text-neutral-500 text-left">
            Start exploring the world of Rize. Join our community and connect
            with like-minded individuals.
          </DialogDescription>
        </DialogHeader>
        <div className="flex w-full justify-self-start  h-fit mt-4 mb-6 flex-col gap-y-4  items-center justify-start ">
          <AuthProviderButton
            isLoading={isLoading}
            handleClick={() => handleSocialSignIn('google')}
            icon="/google.svg"
            provider="google"
            className="w-full"
          >
            SignIn with Google
          </AuthProviderButton>
          <Link
            href={'/login'}
            className="w-full"
            onClick={() => setOpen(false)}
          >
            <Button variant={'outline'} className="rounded-lg w-full">
              SignIn with Email
            </Button>
          </Link>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default AuthDialog
