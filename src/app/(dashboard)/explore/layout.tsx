import DashboardLayout from '@/components/layout/DashboardLayout'
import RecentlyJoined from '@/components/recently-joined'
import React, { FC } from 'react'

type Props = {
  children: React.ReactNode;
};

const ExploreLayout: FC<Props> = ({ children }) => {
  return (
    <DashboardLayout 
      variant="explore"
      sidebarConfig={{
        right: {
          component: (
            <div className="border-l hidden z-40 bg-white dark:bg-dark-bg lg:flex border-neutral-300/60 dark:border-dark-border max-w-[280px] lg:flex-col w-full h-screen">
              <RecentlyJoined />
            </div>
          ),
          show: true,
        }
      }}
    >
      {children}
    </DashboardLayout>
  )
}

export default ExploreLayout
