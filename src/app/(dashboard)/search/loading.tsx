import DashboardLayout from '@/components/layout/DashboardLayout'
import { appSidebarSlot } from '@/components/layout/app-sidebar-slot'

const Block = ({ className }: { className: string }) => (
    <span className={`block rounded bg-subtle motion-safe:animate-pulse ${className}`} />
)

/** Same frame as the search page, so nothing jumps when it arrives. */
export default function SearchLoading() {
    return (
        <DashboardLayout
            variant="full"
            contentMaxWidth="max-w-2xl"
            contentPadding="px-4 sm:px-6"
            leftSidebarSlot={appSidebarSlot}
        >
            <div className="w-full pt-10 pb-28 sm:pt-14 lg:pb-12" role="status" aria-label="Loading search">
                <h1 className="font-instrument text-4xl text-ink">Search</h1>
                <p className="mt-1 text-sm text-ink-secondary">
                    Find people, projects, posts, schools and companies on Rize.
                </p>
                <div className="mt-8 h-12 w-full rounded-xl border border-hairline" />
                <Block className="mt-3 h-10 w-72 max-w-full rounded-xl" />
                <ul className="mt-8 divide-y divide-hairline border-t border-hairline" aria-hidden>
                    {[0, 1, 2, 3, 4].map((i) => (
                        <li key={i} className="flex items-center gap-3 py-4">
                            <span className="size-10 shrink-0 rounded-full bg-subtle motion-safe:animate-pulse" />
                            <span className="flex flex-1 flex-col gap-2">
                                <Block className="h-3.5 w-40 max-w-[60%]" />
                                <Block className="h-3 w-56 max-w-[80%]" />
                            </span>
                        </li>
                    ))}
                </ul>
            </div>
        </DashboardLayout>
    )
}
