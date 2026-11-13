// Streamed instantly while the profile loads; mirrors the real header so the
// page doesn't jump when it arrives.
const bar = 'rounded-md bg-[#EFEBE3] dark:bg-[#1C1916]'

export default function ProfileLoading() {
  return (
    <div className="mx-auto w-full max-w-2xl px-4 pt-6 sm:pt-10" aria-busy="true" aria-label="Loading profile">
      <div className="animate-pulse motion-reduce:animate-none">
        <div className="mb-5 size-[88px] rounded-full bg-[#EFEBE3] dark:bg-[#1C1916]" />
        <div className={`h-10 w-56 ${bar}`} />
        <div className={`mt-3 h-4 w-40 ${bar}`} />
        <div className="mt-5 space-y-2">
          <div className={`h-4 w-full ${bar}`} />
          <div className={`h-4 w-4/5 ${bar}`} />
        </div>
        <div className="mt-5 flex gap-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className={`h-9 w-24 ${bar}`} />
          ))}
        </div>
        <div className="mt-8 border-t border-[#E7E2D8] pt-8 dark:border-[#2E2923]">
          <div className={`h-7 w-32 ${bar}`} />
          <div className="mt-4 space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className={`h-12 w-full ${bar}`} />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
