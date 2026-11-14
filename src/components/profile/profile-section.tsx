'use client'

import { cn } from '@/lib/utils'
import { Plus } from 'lucide-react'
import { ReactNode } from 'react'
import { Button } from '../ui/button'

/** Shared ink for the profile page (brief: ink, secondary, hairline). */
export const ink = 'text-[#1F1B16] dark:text-[#F4F4F5]'
export const inkSecondary = 'text-[#5A5248] dark:text-[#A9A9AE]'
export const hairline = 'border-[#E7E2D8] dark:border-[#2C2C31]'

type ProfileSectionProps = {
  id: string;
  title: string;
  /** Owner-only actions, shown at the right of the title. */
  actions?: ReactNode;
  children: ReactNode;
  className?: string;
}

/** A profile section: hairline on top, serif title, quiet owner actions. */
export const ProfileSection = ({ id, title, actions, children, className }: ProfileSectionProps) => (
  <section
    id={id}
    aria-labelledby={`${id}-title`}
    className={cn('w-full max-w-2xl mx-auto border-t py-8 scroll-mt-24', hairline, className)}
  >
    <div className="mb-4 flex min-h-11 items-center justify-between gap-3">
      <h2 id={`${id}-title`} className={cn('font-instrument text-[28px] leading-none tracking-normal', ink)}>
        {title}
      </h2>
      {actions && <div className="flex items-center gap-1">{actions}</div>}
    </div>
    {children}
  </section>
)

type NewButtonProps = {
  onClick: () => void;
  /** What gets created, for screen readers: "project", "post"... */
  what: string;
  label?: string;
  disabled?: boolean;
}

/** The "+ New" ghost button every section uses for the owner. */
export const SectionNewButton = ({ onClick, what, label = 'New', disabled }: NewButtonProps) => (
  <Button
    type="button"
    variant="ghost"
    size="sm"
    onClick={onClick}
    disabled={disabled}
    aria-label={label === 'New' ? `New ${what}` : undefined}
    className={cn('h-11 gap-1.5 rounded-lg px-3 text-sm font-medium', inkSecondary, 'hover:text-[#1F1B16] dark:hover:text-[#F4F4F5]')}
  >
    <Plus className="size-4" aria-hidden />
    {label}
  </Button>
)

type EmptyLineProps = {
  text: string;
  actionLabel: string;
  onAction: () => void;
  disabled?: boolean;
}

/** What the owner sees in an empty section: one line, one action. */
export const EmptyLine = ({ text, actionLabel, onAction, disabled }: EmptyLineProps) => (
  <p className={cn('flex flex-wrap items-center gap-x-2 text-[15px]', inkSecondary)}>
    <span>{text}</span>
    <span aria-hidden>·</span>
    <button
      type="button"
      onClick={onAction}
      disabled={disabled}
      className={cn(
        'min-h-11 rounded-md font-medium underline decoration-main-yellow decoration-2 underline-offset-4',
        'hover:decoration-[#1F1B16] dark:hover:decoration-[#F4F4F5] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-main-yellow',
        'disabled:opacity-60',
        ink,
      )}
    >
      {actionLabel}
    </button>
  </p>
)
