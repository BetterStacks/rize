import DashboardLayout from '@/components/layout/DashboardLayout'
import ExploreSidebar from '@/components/sidebar/ExploreSidebar'
import Sidebar from '@/components/sidebar/Sidebar'
import React from 'react'

const ExploreLayout = ({ children }: { children: React.ReactNode }) => {
    return (
        <DashboardLayout showNavbar={false} contentPadding='px-0' className='' variant='explore' leftSidebarSlot={{ content: <Sidebar className='border-none w-full' />, size: 5, minSize: 5, maxSize: 5 }}
            rightSidebarSlot={undefined}
        // rightSidebarSlot={{
        //     className: 'border-l border-neutral-200 dark:border-dark-border h-screen',
        //     content: <ExploreSidebar />, size: 20, minSize: 20, maxSize: 20
        // }}
        >
            {children}
        </DashboardLayout>
    )
}

export default ExploreLayout