import DashboardLayout from '@/components/layout/DashboardLayout'
import SearchPageClient from './search-client'


export const metadata = {
    title: 'Search | Rize',
    description: 'Search profiles, projects, posts, pages, education, and work experience on Rize.',
}

export default function SearchPage() {
    return (
        <DashboardLayout variant="default" contentMaxWidth="max-w-3xl">
            <SearchPageClient />
        </DashboardLayout>
    )
}
