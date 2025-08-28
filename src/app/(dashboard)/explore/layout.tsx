import DashboardLayout from '@/components/layout/DashboardLayout'
import React, { FC } from 'react'

type Props = {
  children: React.ReactNode;
};

const ExploreLayout: FC<Props> = ({ children }) => {
  return (
    <DashboardLayout 
      variant="explore"
      sidebarConfig={{
        left: {
          component: null,
          show: false,
        },
        right: {
          component: null,
          show: false,
        }
      }}
    >
      {children}
    </DashboardLayout>
  )
}

export default ExploreLayout
