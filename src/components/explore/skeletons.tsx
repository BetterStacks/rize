import { cn } from '@/lib/utils'

export const ProfileCardSkeleton = ({ className }: { className?: string }) => {
  return (
    <div className={cn("bg-white dark:bg-neutral-800 rounded-3xl border border-neutral-200 dark:border-dark-border shadow-xl overflow-hidden break-inside-avoid", className)}>
      <div className="p-5">
        {/* Profile Image Skeleton */}
        <div className="flex justify-center mb-4">
          <div className="size-16 rounded-full bg-neutral-200 dark:bg-neutral-700 animate-pulse" />
        </div>

        {/* Name and Username Skeleton */}
        <div className="text-center mb-3">
          <div className="h-5 bg-neutral-200 dark:bg-neutral-700 rounded-md mx-auto mb-2 animate-pulse" style={{ width: '60%' }} />
          <div className="h-4 bg-neutral-200 dark:bg-neutral-700 rounded-md mx-auto animate-pulse" style={{ width: '40%' }} />
        </div>

        {/* Bio Skeleton */}
        <div className="mb-4">
          <div className="h-3 bg-neutral-200 dark:bg-neutral-700 rounded-md mx-auto mb-2 animate-pulse" style={{ width: '80%' }} />
          <div className="h-3 bg-neutral-200 dark:bg-neutral-700 rounded-md mx-auto animate-pulse" style={{ width: '60%' }} />
        </div>

        {/* Details Skeleton */}
        <div className="flex flex-col items-center gap-2 mb-4">
          <div className="h-3 bg-neutral-200 dark:bg-neutral-700 rounded-md animate-pulse" style={{ width: '50%' }} />
        </div>

        {/* Button Skeleton */}
        <div className="h-9 bg-neutral-200 dark:bg-neutral-700 rounded-full animate-pulse" />
      </div>
    </div>
  )
}

export const PostCardSkeleton = ({ className }: { className?: string }) => {
  return (
    <div className={cn("bg-white dark:bg-neutral-800 rounded-3xl border border-neutral-200 dark:border-dark-border shadow-xl overflow-hidden break-inside-avoid", className)}>
      {/* Random height for variety */}
      <div className="p-4">
        {/* Header with avatar and name */}
        <div className="flex items-center gap-3 mb-4">
          <div className="size-10 rounded-full bg-neutral-200 dark:bg-neutral-700 animate-pulse" />
          <div className="flex-1">
            <div className="h-4 bg-neutral-200 dark:bg-neutral-700 rounded-md mb-1 animate-pulse" style={{ width: '40%' }} />
            <div className="h-3 bg-neutral-200 dark:bg-neutral-700 rounded-md animate-pulse" style={{ width: '60%' }} />
          </div>
        </div>

        {/* Content lines */}
        <div className="space-y-2 mb-4">
          <div className="h-4 bg-neutral-200 dark:bg-neutral-700 rounded-md animate-pulse" style={{ width: '90%' }} />
          <div className="h-4 bg-neutral-200 dark:bg-neutral-700 rounded-md animate-pulse" style={{ width: '75%' }} />
          <div className="h-4 bg-neutral-200 dark:bg-neutral-700 rounded-md animate-pulse" style={{ width: '60%' }} />
        </div>

        {/* Interaction buttons */}
        <div className="flex gap-2">
          <div className="h-8 bg-neutral-200 dark:bg-neutral-700 rounded-full animate-pulse" style={{ width: '60px' }} />
          <div className="h-8 bg-neutral-200 dark:bg-neutral-700 rounded-full animate-pulse" style={{ width: '60px' }} />
        </div>
      </div>
    </div>
  )
}

export const PostCardSkeletonWithImage = ({ className }: { className?: string }) => {
  return (
    <div className={cn("bg-white dark:bg-neutral-800 rounded-3xl border border-neutral-200 dark:border-dark-border shadow-xl overflow-hidden break-inside-avoid", className)}>
      {/* Image skeleton */}
      <div className="h-48 bg-neutral-200 dark:bg-neutral-700 animate-pulse" />
      
      <div className="p-4">
        {/* Header with avatar and name */}
        <div className="flex items-center gap-3 mb-4">
          <div className="size-10 rounded-full bg-neutral-200 dark:bg-neutral-700 animate-pulse" />
          <div className="flex-1">
            <div className="h-4 bg-neutral-200 dark:bg-neutral-700 rounded-md mb-1 animate-pulse" style={{ width: '40%' }} />
            <div className="h-3 bg-neutral-200 dark:bg-neutral-700 rounded-md animate-pulse" style={{ width: '60%' }} />
          </div>
        </div>

        {/* Content lines */}
        <div className="space-y-2 mb-4">
          <div className="h-4 bg-neutral-200 dark:bg-neutral-700 rounded-md animate-pulse" style={{ width: '80%' }} />
          <div className="h-4 bg-neutral-200 dark:bg-neutral-700 rounded-md animate-pulse" style={{ width: '60%' }} />
        </div>

        {/* Interaction buttons */}
        <div className="flex gap-2">
          <div className="h-8 bg-neutral-200 dark:bg-neutral-700 rounded-full animate-pulse" style={{ width: '60px' }} />
          <div className="h-8 bg-neutral-200 dark:bg-neutral-700 rounded-full animate-pulse" style={{ width: '60px' }} />
        </div>
      </div>
    </div>
  )
}