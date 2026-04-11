export default function SearchLoading() {
  return (
    <div className="w-full max-w-2xl mx-auto p-4 space-y-6 animate-pulse">
      {/* Search bar skeleton */}
      <div className="h-11 w-full bg-neutral-200 dark:bg-neutral-800 rounded-xl" />

      {/* Filter tabs skeleton */}
      <div className="flex gap-2">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="h-8 w-16 bg-neutral-200 dark:bg-neutral-800 rounded-full" />
        ))}
      </div>

      {/* Results skeleton */}
      {[1, 2, 3, 4, 5].map((i) => (
        <div key={i} className="flex items-center gap-3 p-3 border border-neutral-200 dark:border-neutral-800 rounded-xl">
          <div className="w-12 h-12 bg-neutral-200 dark:bg-neutral-800 rounded-full shrink-0" />
          <div className="flex-1 space-y-2">
            <div className="h-4 w-32 bg-neutral-200 dark:bg-neutral-800 rounded" />
            <div className="h-3 w-48 bg-neutral-200 dark:bg-neutral-800 rounded" />
          </div>
        </div>
      ))}
    </div>
  )
}
