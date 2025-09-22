import ClaimProfileForm from '@/components/claim-profile-form'
import { Suspense } from 'react'

const ClaimProfilePage = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-neutral-50 dark:bg-neutral-900 px-4">
      <div className="w-full max-w-md">
        <Suspense fallback={
          <div className="w-full shadow-2xl bg-white dark:bg-dark-bg border border-neutral-300/60 dark:border-dark-border/80 space-y-4 rounded-3xl p-6">
            <div className="animate-pulse">
              <div className="h-12 w-12 bg-neutral-200 dark:bg-neutral-700 rounded-full mx-auto mb-4"></div>
              <div className="h-6 bg-neutral-200 dark:bg-neutral-700 rounded w-3/4 mx-auto mb-2"></div>
              <div className="h-4 bg-neutral-200 dark:bg-neutral-700 rounded w-1/2 mx-auto mb-8"></div>
              <div className="space-y-4">
                <div className="h-10 bg-neutral-200 dark:bg-neutral-700 rounded"></div>
                <div className="h-10 bg-neutral-200 dark:bg-neutral-700 rounded"></div>
                <div className="h-10 bg-neutral-200 dark:bg-neutral-700 rounded"></div>
              </div>
            </div>
          </div>
        }>
          <ClaimProfileForm />
        </Suspense>
      </div>
    </div>
  )
}

export default ClaimProfilePage