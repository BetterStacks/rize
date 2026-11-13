'use client'

import { isUsernameAvailable } from '@/actions/profile-actions'
import { usernameSchema } from '@/lib/types'
import { cn } from '@/lib/utils'
import { useDebouncedCallback } from '@mantine/hooks'
import { FC, useId, useState } from 'react'
import { Button } from './ui/button'

type ClaimUsernameFormProps = {
  onSubmit: (data: string) => void;
  className?: string;
  badgeClassName?: string;
  buttonClassName?: string;
  submitLabel?: string;
};

// Pick a rize.so/<username>. Availability is checked as you type and shown
// inline under the field; the name can only be submitted once it's free.
const ClaimUsernameForm: FC<ClaimUsernameFormProps> = ({
  onSubmit,
  className,
  badgeClassName,
  buttonClassName,
  submitLabel = 'Claim',
}) => {
  const inputId = useId()
  const statusId = useId()
  const [username, setUsername] = useState('')
  const [isAvailable, setIsAvailable] = useState<boolean | null>(null)
  const [isSearching, setIsSearching] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleCheck = useDebouncedCallback(async (value: string) => {
    if (value.length < 3) {
      setIsAvailable(null)
      setIsSearching(false)
      setError(null)
      return
    }
    const result = usernameSchema.safeParse({ username: value })
    if (!result.success) {
      setError(result.error?.flatten()?.fieldErrors?.username?.[0] ?? 'That username isn’t allowed')
      setIsSearching(false)
      setIsAvailable(false)
      return
    }
    setIsSearching(true)
    try {
      const check = await isUsernameAvailable(value)
      if (!check.available) {
        setError(
          check.reason === 'reserved' ? 'That username is reserved' : 'That username is taken'
        )
        setIsAvailable(false)
      } else {
        setError(null)
        setIsAvailable(true)
      }
    } catch {
      setError('Couldn’t check that username. Try again.')
      setIsAvailable(false)
    } finally {
      setIsSearching(false)
    }
  }, 500)

  const status = error
    ? error
    : isSearching
      ? 'Checking…'
      : isAvailable
        ? `rize.so/${username} is yours if you want it`
        : null

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault()
        if (!isAvailable || isSearching) return
        onSubmit(username)
      }}
      className="w-full font-inter"
    >
      <label htmlFor={inputId} className="sr-only">
        Username
      </label>
      <div
        className={cn(
          'flex w-full items-center gap-1 rounded-xl border border-hairline bg-surface p-1 transition-[border-color,box-shadow] duration-fast ease-calm focus-within:border-ink focus-within:ring-4 focus-within:ring-brand/40',
          className
        )}
      >
        <span
          className={cn('shrink-0 select-none pl-3 text-base text-ink-secondary', badgeClassName)}
          aria-hidden="true"
        >
          rize.so/
        </span>
        <input
          id={inputId}
          type="text"
          inputMode="text"
          autoCapitalize="none"
          autoCorrect="off"
          spellCheck={false}
          autoComplete="off"
          placeholder="your-name"
          value={username}
          aria-describedby={statusId}
          aria-invalid={error ? true : undefined}
          onChange={(e) => {
            const value = e.target.value.trim()
            setUsername(value)
            setIsAvailable(null)
            handleCheck(value)
          }}
          className="h-10 min-w-0 flex-1 bg-transparent text-base text-ink placeholder:text-ink-secondary/70 focus-visible:outline-none"
        />
        <Button
          type="submit"
          variant="default"
          loading={isSearching}
          disabled={!isAvailable || isSearching}
          className={cn('shrink-0', buttonClassName)}
        >
          {submitLabel}
        </Button>
      </div>
      <p
        id={statusId}
        aria-live="polite"
        className={cn('mt-2 min-h-5 px-1 text-sm', error ? 'text-danger' : 'text-ink-secondary')}
      >
        {status}
      </p>
    </form>
  )
}
export default ClaimUsernameForm
