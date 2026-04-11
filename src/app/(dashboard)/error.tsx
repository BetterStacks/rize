'use client'

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="text-center space-y-4 p-8">
        <h2 className="text-xl font-semibold text-neutral-900 dark:text-white">
          Something went wrong
        </h2>
        <p className="text-neutral-600 dark:text-neutral-400 max-w-md">
          We encountered an error loading this page. Please try again.
        </p>
        <button
          onClick={reset}
          className="px-4 py-2 bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 rounded-lg font-medium hover:opacity-90 transition-opacity"
        >
          Try again
        </button>
      </div>
    </div>
  )
}
