'use client'
import { createProfile, updateProfile } from '@/actions/profile-actions'
import { createProfileAfterOAuth } from '@/actions/auth-actions'
import { cn } from '@/lib/utils'
import { useLocalStorage } from '@mantine/hooks'
import { useMutation } from '@tanstack/react-query'
import { deleteCookie, hasCookie, getCookie } from 'cookies-next'
import { AnimatePresence, motion } from 'framer-motion'
import { useSession } from '@/hooks/useAuth'
import { useRouter } from 'next/navigation'
import { useState, useEffect, useMemo } from 'react'
import toast from 'react-hot-toast'
import { FinishStep } from './steps/FinishStep'
import { InterestsStep } from './steps/Interests'
import { ImportStep } from './steps/ImportStep'
import ProfileStep from './steps/ProfileStep'
import { ResumeStep } from './steps/ResumeStep'
import { UsernameStep } from './steps/UsernameStep'
import { WelcomeStep } from './steps/WelcomeStep'
import { bulkInsertSections } from '@/actions/general-actions'
import { processResumeData } from '@/actions/resume-actions'

interface OnboardingFlowProps {
  resumeId?: string
}

export default function OnboardingFlow({ resumeId }: OnboardingFlowProps) {
  const router = useRouter()
  const session = useSession()
  const [isCreatingProfile, setIsCreatingProfile] = useState(false)
  const [profileCreated, setProfileCreated] = useState(false)
  const isPhoneAuthUser = useMemo(() => session?.data?.user?.email?.endsWith("@phone.rize"), [session]);
  const [formData, setFormData] = useLocalStorage({
    key: 'onboarding-data',
    defaultValue: {
      username: '',
      displayName: session?.data?.user?.name && !isPhoneAuthUser ? session?.data?.user?.name : "",
      profileImage: session?.data?.user?.image || "",
      interests: [],
      resumeData: null,
      resumeId: resumeId || null,
    },
  })

  // Update resumeId in formData if provided
  useEffect(() => {
    if (resumeId && formData.resumeId !== resumeId) {
      setFormData((prev) => ({ ...prev, resumeId }))
    }
  }, [resumeId, formData.resumeId, setFormData])

  // Auto-create profile for OAuth users who don't have one yet
  useEffect(() => {
    const autoCreateProfile = async () => {
      // Only run if user exists, has no profile, not already creating, and haven't created yet
      if (session?.data?.user && !session?.data?.user?.profileId && !isCreatingProfile && !profileCreated) {
        console.log('🔧 Auto-creating profile for OAuth user...')
        setIsCreatingProfile(true)

        try {
          // Get claimed username from client-side cookie
          const claimedUsername = getCookie('username') as string | undefined
          console.log('🔍 Claimed username from client cookie:', claimedUsername)

          const result = await createProfileAfterOAuth(
            session.data.user.id,
            {
              name: session.data.user.name,
              email: session.data.user.email,
              image: session.data.user.image,
            },
            claimedUsername
          )

          if (result.success) {
            console.log('✅ Profile auto-created:', result.username)
            toast.success(`Welcome! Your username is ${result.username}`)

            // Clear the username cookie after successful profile creation
            if (claimedUsername) {
              deleteCookie('username')
              console.log('🔧 Cleared username cookie')
            }

            // Update form data with created username
            setFormData(prev => ({
              ...prev,
              username: result.username || ''
            }))

            // Mark as profile created to prevent re-runs
            setProfileCreated(true)

            // Refresh session to get new profile data (but don't depend on it)
            setTimeout(() => {
              session.refetch()
              // Skip to profile details step since username is already set
              setCurrentStep(2)
            }, 200)

          } else {
            console.error('❌ Failed to auto-create profile:', result.error)
            toast.error('Failed to create profile. Please try again.')
          }
        } catch (error) {
          console.error('❌ Error auto-creating profile:', error)
          toast.error('Failed to create profile. Please try again.')
        } finally {
          setIsCreatingProfile(false)
        }
      }
    }
    if (!isPhoneAuthUser) {

      autoCreateProfile()
    }
  }, [session?.data?.user?.id, session?.data?.user?.profileId, isCreatingProfile, profileCreated, isPhoneAuthUser])

  const { mutate, isPending } = useMutation({
    mutationFn: createProfile,
    onSuccess: async (data) => {
      const res = await updateProfile({
        username: data?.username as string,
      })
      if (res.error) {
        toast.error(res.error as string)
        return
      }
      const usernameCookie = hasCookie('username')
      if (usernameCookie) {
        deleteCookie('username')
      }
      toast.success('Profile created successfully!')
      setCurrentStep(2)
    },
    onError: (error) => {
      toast.error('Failed to create profile: ' + error.message)
    },
  })

  const { mutate: addProfileDetails, isPending: isProfileUpdatePending } =
    useMutation({
      mutationFn: async (data: {
        profileImage: string;
        displayName: string;
      }) => {
        const formData = new FormData()
        formData.append('file', data?.profileImage as string)
        formData.append('type', 'avatar')
        const res = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        })

        return res.json()
      },
      onError: (error) => {
        toast.error(error?.message)
      },
      onSuccess: async (data, params) => {
        const resp = await updateProfile({
          profileImage: data.url,
          displayName: params?.displayName,
        })
        if (!resp?.success && resp.error) {
          toast.error(resp?.error as string)
          return
        }
        toast.success('Profile picture updated successfully')
        // Session will update automatically with better-auth
        setCurrentStep(3)
      },
    })

  const onComplete = async (redirectToAi = false) => {
    try {
      await bulkInsertSections()

      // Process resume data if available (either uploaded during onboarding or from claim)
      if (formData?.resumeData) {
        const result = await processResumeData(formData.resumeData)
        if (result.success) {
          toast.success(`Resume data imported: ${result.stats?.experience || 0} experiences, ${result.stats?.education || 0} education entries`)
        } else {
          toast.error('Failed to import resume data, but profile was created successfully')
        }
      } else if (formData?.resumeId) {
        // Process resume from claim link using Cloudinary file ID
        try {
          // You'll need to implement this function to fetch and parse resume from Cloudinary
          const result = await fetch('/api/resume/parse-from-cloudinary', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ resumeFileId: formData.resumeId }),
          })

          if (result.ok) {
            const parseResult = await result.json()
            if (parseResult.success) {
              toast.success(`Resume parsed: ${parseResult.stats?.experience || 0} experiences, ${parseResult.stats?.education || 0} education entries`)
            }
          } else {
            console.warn('Failed to parse pre-uploaded resume')
          }
        } catch (error) {
          console.warn('Error parsing pre-uploaded resume:', error)
        }
      }

      // Mark onboarding as completed
      await updateProfile({
        isOnboarded: true,
      })
      // Session will update automatically with better-auth

      if (redirectToAi) {
        router.push('/ai-profile-builder')
      } else {
        router.push(`/${formData?.username}`)
      }
      localStorage.removeItem('onboarding-data')
    } catch (error) {
      console.error('Failed to save profile:', error)
      toast.error('Failed to complete onboarding')
    }
  }

  const [currentStep, setCurrentStep] = useState(0)

  const steps = [
    {
      id: 'welcome',
      component: <WelcomeStep onNext={() => setCurrentStep(1)} />,
    },
    {
      id: 'username',
      component: (
        <UsernameStep
          isPending={isPending}
          formData={formData}
          onNext={async (username) => {
            setFormData((prev) => ({ ...prev, username }))
            mutate(username)
          }}
        />
      ),
    },
    {
      id: 'profile-details',
      component: (
        <ProfileStep
          isPhoneAuthUser={!!isPhoneAuthUser}
          isPending={isProfileUpdatePending}
          formData={formData}
          onNext={async ({ displayName, profileImage }) => {
            setFormData((prev) => ({ ...prev, displayName, profileImage }))
            addProfileDetails({ profileImage, displayName })
          }}
        />
      ),
    },

    {
      id: 'import',
      component: (
        <ImportStep
          onNext={(importedData?: any) => {
            if (importedData) {
              setFormData((prev) => ({ ...(prev as any), importedData }))
            }
            setCurrentStep(4)
          }}
        />
      ),
    },
    {
      id: 'interests',
      component: (
        <InterestsStep
          formData={formData}
          onNext={(interests: string[]) => {
            setFormData((prev) => ({ ...(prev as any), interests }))
            setCurrentStep(5)
          }}
        />
      ),
    },
    {
      id: 'resume',
      component: (
        <ResumeStep
          formData={formData}
          onNext={(resumeData?: any) => {
            if (resumeData) {
              setFormData((prev) => ({ ...(prev as any), resumeData }))
            }
            setCurrentStep(6)
          }}
        />
      ),
    },
    {
      id: 'finish',
      component: (
        <FinishStep
          formData={formData}
          onComplete={(redirectToAi?: boolean) => onComplete(redirectToAi)}
        />
      ),
    },
  ]

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4">
      <AnimatePresence mode="wait">
        <div className="w-full max-w-md  border border-neutral-200 dark:border-dark-border/60 rounded-3xl shadow-xl dark:shadow-black/10 overflow-hidden">
          <motion.div
            style={{ height: 'auto', minHeight: '250px' }}
            key={currentStep}
            className="bg-white dark:bg-neutral-800"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0, height: 'auto' }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3, type: 'spring' }}
          >
            {steps[currentStep].component}
          </motion.div>
        </div>
      </AnimatePresence>
      <div className="flex justify-center gap-2 mt-10">
        {steps.map((_, index) => (
          <div
            key={index}
            // onClick={() => setCurrentStep(index)}
            className={cn(
              'w-2 h-2 rounded-full transition-all duration-300',
              currentStep === index
                ? 'w-8 bg-neutral-400 dark:bg-dark-border'
                : currentStep > index
                  ? 'bg-neutral-300 dark:bg-neutral-800'
                  : 'bg-neutral-300 dark:bg-neutral-800'
            )}
          />
        ))}
      </div>
    </div>
  )
}
