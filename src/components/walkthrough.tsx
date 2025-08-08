'use client'

import { updateProfile } from '@/actions/profile-actions'
import { useSession } from 'next-auth/react'
import Joyride, { EVENTS, STATUS, TooltipRenderProps } from 'react-joyride'
import { Button } from './ui/button'

const Walkthrough = () => {
  const { update } = useSession()
  return (
    <Joyride
      run={true}
      steps={[
        {
          target: '.user-avatar',
          title: 'Personalise your Avatar',
          content:
            'Upload a profile picture that best represents you. This will be visible across your Rize profile and helps others recognize you instantly.',
          placement: 'right-start',
          styles: {
            spotlight: {
              borderRadius: '6rem',
            },
          },
        },
        {
          target: '.profile-displayName',
          content:
            'Choose a display name for your profile. This can be your real name, a stage name, or anything that defines your online identity.',
          placement: 'right-start',
          title: 'Change your Profile Details',
        },
        {
          target: '.profile-Bio',
          title: 'Write Your Bio',
          content:
            'Tell the world who you are in a few words. Share your passions, what you do, or what you\'re looking to connect about.',
        },
        {
          target: '.social-links',
          title: 'Connect your Socials',
          content:
            'Add links to your social profiles like Twitter, LinkedIn, GitHub, and more. This helps others learn more about you and follow your work.',
          placement: 'right-start',
        },
        {
          target: '.social-links-manager',
          placement: 'left-start',
          title: 'Manage your Social Links',
          content:
            'Reorder, edit, or remove any of your connected social profiles. You’re always in control of how your profile looks.',
          spotlightPadding: 2,
          styles: {
            spotlight: {
              borderRadius: '1.4rem',
            },
          },
        },
        {
          target: '.gallery-editor',
          placement: 'left-center' as any,
          title: 'Add Images and Videos',
          spotlightPadding: 2,
          styles: {
            spotlight: {
              borderRadius: '1.4rem',
            },
          },

          content:
            'Showcase your work, ideas, or favorite moments. Add text, links, or images to build a visual grid that reflects your personality and achievements.',
        },
      ]}
      continuous
      styles={{
        spotlight: {
          borderRadius: '1rem',
        },
      }}
      floaterProps={{
        hideArrow: true,
        offset: 10,
      }}
      callback={async (data) => {
        if (
          data?.status === STATUS.FINISHED &&
          data?.type === EVENTS.TOUR_END
        ) {
          await updateProfile({ hasCompletedWalkthrough: true })
          await update()
        } else if (data?.type === EVENTS.STEP_AFTER) {
        }
      }}
      tooltipComponent={CustomTooltip}
      scrollToFirstStep
    />
  )
}

function CustomTooltip(props: TooltipRenderProps) {
  const {
    backProps,
    closeProps,
    continuous,
    index,
    primaryProps,
    skipProps,
    step,
    tooltipProps,
    isLastStep,
  } = props

  return (
    <div
      className="p-6 bg-white dark:bg-dark-bg shadow-2xl max-w-xs w-full rounded-xl"
      {...tooltipProps}
    >
      {step.title && (
        <h4 className="font-medium text-lg md:text-xl tracking-tight">
          {step.title}
        </h4>
      )}
      <div className="mt-2 text-neutral-400 text-sm">{step.content}</div>
      <div className="inline-flex w-full items-center justify-between mt-6 gap-4">
        <Button variant={'outline'} size={'sm'} {...skipProps}>
          {skipProps.title}
        </Button>
        <div className="flex items-center gap-2">
          {index > 0 && (
            <Button variant={'outline'} size={'sm'} {...backProps}>
              {backProps.title}
            </Button>
          )}
          {continuous && (
            <Button variant={'outline'} size={'sm'} {...primaryProps}>
              {primaryProps.title}
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}

export default Walkthrough
