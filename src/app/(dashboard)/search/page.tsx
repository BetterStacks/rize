import DashboardLayout from '@/components/layout/DashboardLayout'
import { appSidebarSlot } from '@/components/layout/app-sidebar-slot'
import SearchPageClient from './search-client'

export const metadata = {
    title: 'Search | Rize',
    description: 'Search profiles, projects, posts, pages, education, and work experience on Rize.',
}

export default function SearchPage() {
    return (
        <DashboardLayout
            variant="full"
            contentMaxWidth="max-w-2xl"
            contentPadding="px-4 sm:px-6"
            leftSidebarSlot={appSidebarSlot}
        >
            <SearchPageClient />
        </DashboardLayout>
    )
}
