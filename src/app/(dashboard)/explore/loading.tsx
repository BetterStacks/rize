import { ProfileCardSkeleton } from "@/components/explore/skeletons";

// Shown only during client navigation while the server renders the page;
// the lists themselves come from a shared cache, so this is brief.
export default function ExploreLoading() {
  return (
    <div className="mx-auto w-full max-w-6xl px-4 pb-24 sm:px-6" aria-busy="true">
      <span className="sr-only">Loading</span>
      <div className="pb-10 pt-10 md:pb-14 md:pt-14">
        <div className="h-10 w-40 rounded-md bg-subtle motion-safe:animate-pulse" />
        <div className="mt-3 h-4 w-72 max-w-full rounded-md bg-subtle motion-safe:animate-pulse" />
      </div>
      <div className="mb-5 border-b border-hairline pb-3">
        <div className="h-7 w-32 rounded-md bg-subtle motion-safe:animate-pulse" />
      </div>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-3 xl:grid-cols-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <ProfileCardSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}
