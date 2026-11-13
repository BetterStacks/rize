'use client'

import { cn } from '@/lib/utils'
import { Edit2, Loader, MoreHorizontal, Trash2 } from 'lucide-react'
import { ReactNode } from 'react'
import { Button } from '../ui/button'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '../ui/dropdown-menu'
import { hairline, ink, inkSecondary } from './profile-section'

type TimelineItemProps = {
  title: ReactNode;
  subtitle?: ReactNode;
  meta?: ReactNode;
  dates: ReactNode;
  children?: ReactNode;
  /** Owner-only edit/delete menu. */
  menu?: ReactNode;
}

/**
 * One row of an experience or education list: what and where on the left,
 * dates in a muted column on the right (under the title on small screens).
 */
export const TimelineItem = ({ title, subtitle, meta, dates, children, menu }: TimelineItemProps) => (
  <li className={cn('grid grid-cols-[1fr_auto] gap-x-4 border-b py-4 first:pt-0 last:border-b-0 last:pb-0', hairline)}>
    <div className="min-w-0">
      <h3 className={cn('text-[15px] font-medium leading-snug', ink)}>{title}</h3>
      {subtitle && <p className={cn('text-[15px] leading-snug', inkSecondary)}>{subtitle}</p>}
      <p className={cn('mt-1 text-sm tabular-nums sm:hidden', inkSecondary)}>{dates}</p>
      {meta && <p className={cn('mt-1 text-sm', inkSecondary)}>{meta}</p>}
      {children}
    </div>
    <div className="flex items-start gap-1">
      <p className={cn('hidden pt-0.5 text-right text-sm tabular-nums sm:block', inkSecondary)}>{dates}</p>
      {menu}
    </div>
  </li>
)

type OwnerMenuProps = {
  label: string;
  onEdit: () => void;
  onDelete: () => void;
  isDeleting?: boolean;
}

export const OwnerItemMenu = ({ label, onEdit, onDelete, isDeleting }: OwnerMenuProps) => (
  <DropdownMenu>
    <DropdownMenuTrigger asChild>
      <Button
        variant="ghost"
        size="icon"
        aria-label={`Options for ${label}`}
        className={cn('-mt-2 size-11 shrink-0 rounded-lg sm:size-9', inkSecondary)}
      >
        <MoreHorizontal className="size-4" />
      </Button>
    </DropdownMenuTrigger>
    <DropdownMenuContent align="end" className="rounded-xl">
      <DropdownMenuItem onClick={onEdit}>
        <Edit2 className="size-4" />
        <span>Edit</span>
      </DropdownMenuItem>
      <DropdownMenuItem
        className="text-red-600 dark:text-red-400"
        disabled={isDeleting}
        onClick={(e) => {
          e.stopPropagation()
          onDelete()
        }}
      >
        {isDeleting ? <Loader className="size-4 animate-spin" /> : <Trash2 className="size-4" />}
        <span>Delete</span>
      </DropdownMenuItem>
    </DropdownMenuContent>
  </DropdownMenu>
)
