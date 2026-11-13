import { cn } from '@/lib/utils'
import React, { FC, ReactNode } from 'react'
import { Button } from './ui/button'
import ClaimUsernameForm from './claim-username'
import { useRouter } from 'next/navigation'
import { setCookie } from 'cookies-next'

type BottomBannerProps = {
  text?: string;
  icon?: ReactNode;
  className?: string;
  description?: string;
};

const BottomBanner: FC<BottomBannerProps> = ({
  className,
  icon,
  text = 'Make your own Rize profile',
}) => {
  const router = useRouter()
  const handleSubmit = (data: string) => {
    setCookie('username', data)
    router.push('/signup')
  }
  return (
    <div
      className={cn(
        'w-full max-w-2xl mb-20 p-6 gap-x-4 mt-4 rounded-xl border border-neutral-300/80 dark:border-dark-border flex flex-col items-start bg-neutral-100 dark:bg-neutral-900',
        className
      )}
    >
      <div className="flex items-center w-full justify-start">
        <div>
          <h3 className="text-lg tracking-tight font-medium leading-snug">
            {text}
          </h3>
          <p
            className="dark:text-neutral-400 mt-2 leading-snug  text-neutral-700
           "
          >
            Pick a username. It takes a minute.
          </p>
        </div>
      </div>
      <div className="md:mt-4 mt-2 w-full">

        <ClaimUsernameForm
          onSubmit={handleSubmit}
          badgeClassName="rounded-xl 5"
          buttonClassName="rounded-xl"
          className={cn(
            ' dark:bg-neutral-800 w-full rounded-2xl border-neutral-300/60'
          )}
        />
      </div>
    </div>
  )
}

export default BottomBanner
