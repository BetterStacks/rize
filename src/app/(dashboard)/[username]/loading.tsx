export default function ProfileLoading() {
  return (
    <div className="w-full max-w-2xl mx-auto p-4 space-y-6 animate-pulse">
      {/* Profile header skeleton */}
      <div className="flex items-start gap-4">
        <div className="w-20 h-20 bg-neutral-200 dark:bg-neutral-800 rounded-full shrink-0" />
        <div className="flex-1 space-y-2">
          <div className="h-6 w-40 bg-neutral-200 dark:bg-neutral-800 rounded" />
          <div className="h-4 w-24 bg-neutral-200 dark:bg-neutral-800 rounded" />
          <div className="h-4 w-56 bg-neutral-200 dark:bg-neutral-800 rounded" />
        </div>
      </div>

      {/* Bio skeleton */}
      <div className="space-y-2">
        <div className="h-4 w-full bg-neutral-200 dark:bg-neutral-800 rounded" />
        <div className="h-4 w-4/5 bg-neutral-200 dark:bg-neutral-800 rounded" />
      </div>

      {/* Social links skeleton */}
      <div className="flex gap-2">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="w-8 h-8 bg-neutral-200 dark:bg-neutral-800 rounded-full" />
        ))}
      </div>

      {/* Sections skeleton */}
      <div className="space-y-4 pt-4 border-t border-neutral-200 dark:border-neutral-800">
        <div className="h-5 w-24 bg-neutral-200 dark:bg-neutral-800 rounded" />
        <div className="grid grid-cols-2 gap-3">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-32 bg-neutral-200 dark:bg-neutral-800 rounded-xl" />
          ))}
        </div>
      </div>
    </div>
  )
}
