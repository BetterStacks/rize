export default function ExploreLoading() {
  return (
    <div className="w-full max-w-2xl mx-auto p-4 space-y-6 animate-pulse">
      {/* Header skeleton */}
      <div className="flex items-center justify-between">
        <div className="h-8 w-32 bg-neutral-200 dark:bg-neutral-800 rounded" />
        <div className="h-8 w-24 bg-neutral-200 dark:bg-neutral-800 rounded" />
      </div>

      {/* Tab bar skeleton */}
      <div className="flex gap-2">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-9 w-20 bg-neutral-200 dark:bg-neutral-800 rounded-full" />
        ))}
      </div>

      {/* Post cards skeleton */}
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="border border-neutral-200 dark:border-neutral-800 rounded-xl p-4 space-y-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-neutral-200 dark:bg-neutral-800 rounded-full" />
            <div className="space-y-1">
              <div className="h-4 w-28 bg-neutral-200 dark:bg-neutral-800 rounded" />
              <div className="h-3 w-20 bg-neutral-200 dark:bg-neutral-800 rounded" />
            </div>
          </div>
          <div className="space-y-2">
            <div className="h-4 w-full bg-neutral-200 dark:bg-neutral-800 rounded" />
            <div className="h-4 w-3/4 bg-neutral-200 dark:bg-neutral-800 rounded" />
          </div>
          <div className="flex gap-4 pt-2">
            <div className="h-6 w-12 bg-neutral-200 dark:bg-neutral-800 rounded" />
            <div className="h-6 w-12 bg-neutral-200 dark:bg-neutral-800 rounded" />
            <div className="h-6 w-12 bg-neutral-200 dark:bg-neutral-800 rounded" />
          </div>
        </div>
      ))}
    </div>
  )
}
