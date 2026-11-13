'use client'

import { isUsernameAvailable } from '@/actions/profile-actions'
import { usernameSchema } from '@/lib/types'
import { useDebouncedCallback, useMediaQuery } from '@mantine/hooks'
import { Loader } from 'lucide-react'
import { FC, useState } from 'react'
import toast from 'react-hot-toast'
import { Button } from './ui/button'
import { cn } from '@/lib/utils'

type ClaimUsernameFormProps = {
  onSubmit: (data: string) => void;
  className?: string;
  badgeClassName?: string;
  buttonClassName?: string;
};

const ClaimUsernameForm: FC<ClaimUsernameFormProps> = ({
  onSubmit,
  className,
  badgeClassName,
  buttonClassName,
}) => {
  const [username, setUsername] = useState('')
  const [isAvailable, setIsAvailable] = useState<boolean | null>(null)
  const [isSearching, setIsSearching] = useState<boolean | null>(null)
  const [error, setError] = useState<string | null>(null)
  const isDesktop = useMediaQuery('(min-width: 768px)')
  const handleCheck = useDebouncedCallback(async (username: string) => {
    if (username.length < 3) {
      setIsAvailable(null)
      setIsSearching(false)
      setError(null)
      return
    }
    const result = usernameSchema.safeParse({ username })
    if (!result.success) {
      toast.dismiss()
      toast.error(
        result.error?.flatten()?.fieldErrors?.username?.[0] as string
      )
      setError(result.error?.flatten()?.fieldErrors?.username?.[0] as string)
      setIsSearching(false)
      setIsAvailable(false)
      return
    }
    setIsSearching(true)
    const check = await isUsernameAvailable(username)
    if (!check.available) {
      toast.dismiss()
      const errorMessage = check.reason === 'reserved'
        ? 'That name is reserved. Try another one.'
        : 'That name is taken. Try another one.'
      toast.error(errorMessage)
      setError(errorMessage)
      setIsSearching(false)
      setIsAvailable(false)
    } else {
      toast.dismiss()
      toast.success('That name is free')
      setError(null)
      setIsSearching(false)
      setIsAvailable(true)
    }
    setIsSearching(false)
  }, 500)

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault()
        onSubmit(username)
      }}
      className={cn('w-full font-inter')}
    >
      <div
        className={cn(
          'w-full border mt-2 border-hairline overflow-hidden rounded-3xl text-lg md:text-xl p-1 flex items-center justify-center bg-surface text-ink focus-within:border-ink',
          className
        )}
      >
        <div
          className={cn(
            'px-3 ml-0.5 border border-hairline py-1 bg-subtle rounded-3xl',
            badgeClassName
          )}
        >
          <span className="tracking-tight text-ink-secondary">
            rize.so
          </span>
        </div>
        <div className="w-full flex items-center justify-center mx-1">
          <span aria-hidden="true" className="text-ink-secondary pr-0.5">/</span>
          <input
            type="text"
            aria-label="Username"
            autoCapitalize="none"
            autoCorrect="off"
            spellCheck={false}
            placeholder="your-name"
            value={username}
            onChange={(e) => {
              setUsername(e.target.value?.trim())
              handleCheck(e.target.value?.trim())
            }}
            className="text-lg w-full bg-transparent text-ink placeholder:text-ink-secondary/70 focus-visible:outline-none"
          />
        </div>
        {isSearching ? (
          <Loader aria-label="Checking" className="animate-spin size-6 mr-4 text-ink-secondary" />
        ) : (
          <Button
            type="submit"
            disabled={!isAvailable || isSearching!}
            variant="brand"
            size={isDesktop ? 'default' : 'sm'}
            className={cn('rounded-3xl', buttonClassName)}
          >
            Claim
          </Button>
        )}
      </div>
      {error && (
        <p role="alert" className="text-sm text-danger leading-tight px-3 mt-2">{error}</p>
      )}
    </form>
  )
}
export default ClaimUsernameForm
