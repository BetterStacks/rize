'use client'
import { zodResolver } from '@hookform/resolvers/zod'
import { Loader, Phone, Mail } from 'lucide-react'
import {
  signInWithGoogle,
  signInWithLinkedIn,
  signInWithCredentials,
  signInWithPhoneNumber
} from '@/lib/auth-client'
import Image from 'next/image'
import Link from 'next/link'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import { z } from 'zod'
import Logo from '../logo'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { Label } from '../ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs'

const LoginSchema = z.object({
  email: z.string().email({ message: 'Invalid email address.' }),
  password: z
    .string()
    .min(6, { message: 'Password must be at least 6 characters.' }),
})

type TLoginValues = z.infer<typeof LoginSchema>;

const Login = () => {
  const [isLoading, setIsLoading] = useState(false)
  const [isSocialLoading, setIsSocialLoading] = useState<
    'google' | 'github' | 'linkedin' | null
  >(null)

  // Phone login state
  const [phoneNumber, setPhoneNumber] = useState('')
  const [otp, setOtp] = useState('')
  const [otpSent, setOtpSent] = useState(false)
  const [isPhoneLoading, setIsPhoneLoading] = useState(false)

  const form = useForm<TLoginValues>({
    resolver: zodResolver(LoginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  })

  const handleSocialSignIn = async (provider: 'google' | 'github' | 'linkedin') => {
    try {
      setIsSocialLoading(provider)
      // Social sign-in will redirect to provider, then back to app
      // better-auth handles the redirect flow automatically  
      switch (provider) {
        case 'google':
          await signInWithGoogle()
          break
        case 'linkedin':
          await signInWithLinkedIn()
          break
        default:
          throw new Error('Unsupported provider')
      }
      // No manual redirect needed - better-auth handles the OAuth flow
    } catch (error: any) {
      console.error('Social sign-in error:', error)
      toast.error(error.message || 'Sign in failed')
      setIsSocialLoading(null)
    }
  }

  const handlePhoneLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!phoneNumber) {
      toast.error('Please enter a phone number')
      return
    }

    try {
      setIsPhoneLoading(true)

      if (!otpSent) {
        // Send OTP
        const result = await signInWithPhoneNumber(phoneNumber)
        if (result?.error) {
          toast.error(result.error.message || "Failed to send OTP")
          return
        }
        setOtpSent(true)
        toast.success("OTP sent to your phone")
      } else {
        // Verify OTP
        if (!otp) {
          toast.error('Please enter the OTP code')
          setIsPhoneLoading(false)
          return
        }

        const result = await signInWithPhoneNumber(phoneNumber, otp)
        if (result?.error) {
          toast.error(result.error.message || "Invalid OTP")
          return
        }
        toast.success("Logged in successfully")
        // Redirect handled by auth client/state change
      }
    } catch (error: any) {
      console.error('Phone login error:', error)
      toast.error(error?.message || 'Login failed')
    } finally {
      setIsPhoneLoading(false)
    }
  }

  return (
    <div className=" w-full shadow-2xl bg-white dark:bg-dark-bg border border-neutral-300/60 dark:border-dark-border/80 space-y-4 rounded-3xl p-6">
      <div className="flex flex-col items-center justify-center">
        <Logo className="mx-auto mb-4 size-12" />
        <h2 className="text-2xl font-medium tracking-tight leading-tight md:font-semibold">
          Welcome back
        </h2>
        <span className="opacity-80 mt-2 text-sm">
          Please enter your details to login
        </span>
      </div>
      <div className="flex flex-col space-y-2">
        <Button
          variant={'outline'}
          disabled={!!isSocialLoading}
          onClick={() => handleSocialSignIn('google')}
          className="rounded-lg px-6"
        >
          {isSocialLoading === 'google' ? (
            <Loader className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Image
              width={25}
              height={25}
              src="/google.svg"
              alt="Google Logo"
              className="size-6 mr-2"
            />
          )}
          Sign in with Google
        </Button>
        <Button
          variant={'outline'}
          disabled={!!isSocialLoading}
          onClick={() => handleSocialSignIn('linkedin')}
          className="rounded-lg px-6"
        >
          {isSocialLoading === 'linkedin' ? (
            <Loader className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Image
              width={25}
              height={25}
              src="/linkedin.svg"
              alt="LinkedIn Logo"
              className="size-6 mr-2"
            />
          )}
          Sign in with LinkedIn
        </Button>
      </div>
      <div className="flex items-center justify-center max-w-xs w-full gap-x-2 mt-4 mb-2">
        <div className="w-full bg-neutral-200 dark:bg-dark-border/80 h-[0.5px]" />
        <span className="text-xs opacity-60">OR</span>
        <div className="w-full bg-neutral-200 dark:bg-dark-border/80 h-[0.5px]" />
      </div>

      <Tabs defaultValue="email" className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-4">
          <TabsTrigger value="email">
            <Mail className="h-4 w-4 mr-2" />
            Email
          </TabsTrigger>
          <TabsTrigger value="phone">
            <Phone className="h-4 w-4 mr-2" />
            Phone
          </TabsTrigger>
        </TabsList>

        <TabsContent value="email">
          <form
            onSubmit={form.handleSubmit(async (values) => {
              try {
                setIsLoading(true)
                const result = await signInWithCredentials(values.email, values.password)
                if (result?.error) {
                  toast.error(result.error.message || 'Login failed')
                  return
                }
                toast.success('Logged in successfully')
              } catch (error: any) {
                toast.error(error.message || 'Login failed')
              } finally {
                setIsLoading(false)
              }
            })}
            className="flex gap-y-2 flex-col "
          >
            <div>
              <Label className="text-sm font-medium ">Email</Label>
              <Input
                className="border-neutral-300/80"
                type="email"
                {...form.register('email')}
                placeholder="example@gmail.com"
              />
            </div>
            <div>
              <Label className="text-sm font-medium mt-2">Password</Label>
              <Input
                className="border-neutral-300/80"
                type="password"
                placeholder="password"
                {...form.register('password')}
              />
            </div>
            <Button
              variant={'secondary'}
              disabled={
                Object.entries(form.formState.errors)?.length > 0 || isLoading
              }
              className="w-full mt-4"
            >
              {isLoading ? <Loader className="mr-2 h-4 w-4 animate-spin" /> : null}
              Sign in with Email
            </Button>
          </form>
        </TabsContent>

        <TabsContent value="phone">
          <form onSubmit={handlePhoneLogin} className="flex gap-y-2 flex-col">
            <div>
              <Label className="text-sm font-medium">Phone Number</Label>
              <Input
                className="border-neutral-300/80"
                type="tel"
                placeholder="+1234567890"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                disabled={otpSent || isPhoneLoading}
              />
            </div>

            {otpSent && (
              <div className="animate-in fade-in slide-in-from-top-2 duration-300">
                <Label className="text-sm font-medium mt-2">OTP Code</Label>
                <Input
                  className="border-neutral-300/80"
                  type="text"
                  placeholder="123456"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  disabled={isPhoneLoading}
                />
              </div>
            )}

            <Button
              variant={'secondary'}
              type="submit"
              disabled={!phoneNumber || isPhoneLoading}
              className="w-full mt-4"
            >
              {isPhoneLoading ? (
                <Loader className="mr-2 h-4 w-4 animate-spin" />
              ) : null}
              {otpSent ? 'Verify & Login' : 'Send OTP'}
            </Button>

            {otpSent && (
              <Button
                variant="ghost"
                type="button"
                className="w-full mt-2 text-xs"
                onClick={() => {
                  setOtpSent(false)
                  setOtp('')
                }}
              >
                Change Phone Number
              </Button>
            )}
          </form>
        </TabsContent>
      </Tabs>

      <div className="w-full mt-6 mb-10 flex items-center justify-center">
        <span className="text-sm w-full text-center font-medium opacity-80">
          {' '}
          Dont have a account yet?{' '}
          <Link href={'/signup'} className="text-amber-500">
            Register
          </Link>
        </span>
      </div>
    </div>
  )
}

export default Login
