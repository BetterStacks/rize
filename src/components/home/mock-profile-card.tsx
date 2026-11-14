import { cn } from '@/lib/utils'
import { FC } from 'react'

/**
 * Illustrative profile mock-ups for the landing page. Drawn in code (not
 * screenshots) so they follow the theme and only ever show made-up people:
 * initials instead of photos, quiet blocks instead of real images.
 */

export const Initials: FC<{ name: string; className?: string }> = ({
  name,
  className,
}) => (
  <div
    aria-hidden="true"
    className={cn(
      'rounded-full landing-wash flex items-center justify-center font-instrument',
      className
    )}
  >
    {name.charAt(0)}
  </div>
)

type MockProfileWindowProps = {
  name: string;
  bio: string;
  className?: string;
};

/** A wide "browser window" profile: initials, name, bio and a gallery of blocks. */
export const MockProfileWindow: FC<MockProfileWindowProps> = ({
  name,
  bio,
  className,
}) => (
  <div
    aria-hidden="true"
    className={cn(
      'w-full h-full bg-surface text-ink flex flex-col px-8 py-8 overflow-hidden',
      className
    )}
  >
    <Initials name={name} className="size-16 text-3xl" />
    <span className="font-instrument text-2xl mt-3 leading-none">{name}</span>
    <span className="text-sm text-ink-secondary mt-2 leading-snug">{bio}</span>
    <div className="grid grid-cols-3 gap-2 mt-5 flex-1">
      <div className="rounded-xl bg-subtle col-span-2" />
      <div className="rounded-xl bg-highlight" />
      <div className="rounded-xl bg-subtle" />
      <div className="rounded-xl bg-subtle col-span-2" />
    </div>
  </div>
)

type MockProfileCardProps = {
  name: string;
  username: string;
  line: string;
  className?: string;
};

/** A tall profile card: handle pill, initials, name, one line and two blocks. */
export const MockProfileCard: FC<MockProfileCardProps> = ({
  name,
  username,
  line,
  className,
}) => (
  <div
    aria-hidden="true"
    className={cn(
      'w-full h-full bg-surface text-ink flex flex-col items-center px-5 py-5 overflow-hidden',
      className
    )}
  >
    <span className="text-sm text-ink-secondary bg-subtle border border-hairline rounded-full px-3 py-1">
      @{username}
    </span>
    <Initials name={name} className="size-24 text-5xl mt-5" />
    <span className="font-instrument text-3xl mt-4 leading-none">{name}</span>
    <span className="text-sm text-ink-secondary mt-2 text-center leading-snug">
      {line}
    </span>
    <div className="grid grid-cols-2 gap-2 mt-5 w-full flex-1 min-h-[96px]">
      <div className="rounded-xl bg-subtle" />
      <div className="rounded-xl bg-highlight" />
    </div>
  </div>
)
