import { cn } from '@/lib/utils'

// Quiet placeholders for later pages only; the first screen of explore is
// rendered on the server with real cards.
const card =
  'rounded-xl border border-hairline bg-surface overflow-hidden break-inside-avoid'
const bar = 'rounded-md bg-subtle motion-safe:animate-pulse'

export const ProfileCardSkeleton = ({ className }: { className?: string }) => {
  return (
    <div className={cn(card, 'p-4', className)} aria-hidden="true">
      <div className="flex items-center gap-3">
        <div className={cn(bar, 'size-11 rounded-full')} />
        <div className="flex-1 space-y-2">
          <div className={cn(bar, 'h-4 w-3/5')} />
          <div className={cn(bar, 'h-3 w-2/5')} />
        </div>
      </div>
      <div className={cn(bar, 'mt-4 h-3 w-4/5')} />
      <div className="mt-6 flex justify-end">
        <div className={cn(bar, 'h-7 w-24 rounded-full')} />
      </div>
    </div>
  )
}

export const PostCardSkeleton = ({ className }: { className?: string }) => {
  return (
    <div className={cn(card, className)} aria-hidden="true">
      <div className="p-4">
        <div className="mb-4 flex items-center gap-3">
          <div className={cn(bar, 'size-9 rounded-full')} />
          <div className="flex-1 space-y-1.5">
            <div className={cn(bar, 'h-3.5 w-2/5')} />
            <div className={cn(bar, 'h-3 w-1/4')} />
          </div>
        </div>
        <div className="mb-4 space-y-2">
          <div className={cn(bar, 'h-3.5 w-11/12')} />
          <div className={cn(bar, 'h-3.5 w-3/4')} />
          <div className={cn(bar, 'h-3.5 w-3/5')} />
        </div>
        <div className="flex gap-2">
          <div className={cn(bar, 'h-7 w-14 rounded-full')} />
          <div className={cn(bar, 'h-7 w-14 rounded-full')} />
        </div>
      </div>
    </div>
  )
}

export const PostCardSkeletonWithImage = ({ className }: { className?: string }) => {
  return (
    <div className={cn(card, className)} aria-hidden="true">
      <div className={cn(bar, 'h-48 rounded-none')} />
      <div className="p-4">
        <div className="mb-4 flex items-center gap-3">
          <div className={cn(bar, 'size-9 rounded-full')} />
          <div className="flex-1 space-y-1.5">
            <div className={cn(bar, 'h-3.5 w-2/5')} />
            <div className={cn(bar, 'h-3 w-1/4')} />
          </div>
        </div>
        <div className="mb-4 space-y-2">
          <div className={cn(bar, 'h-3.5 w-4/5')} />
          <div className={cn(bar, 'h-3.5 w-3/5')} />
        </div>
        <div className="flex gap-2">
          <div className={cn(bar, 'h-7 w-14 rounded-full')} />
          <div className={cn(bar, 'h-7 w-14 rounded-full')} />
        </div>
      </div>
    </div>
  )
}
