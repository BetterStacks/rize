import DashboardLayout from '@/components/layout/DashboardLayout'
import { appSidebarSlot } from '@/components/layout/app-sidebar-slot'
import { ReactNode } from 'react'

const Layout = ({ children }: { children: ReactNode }) => (
  <DashboardLayout
    variant="full"
    contentMaxWidth="max-w-2xl"
    contentPadding="px-4 sm:px-6"
    leftSidebarSlot={appSidebarSlot}
  >
    <div className="w-full pt-10 pb-28 sm:pt-14 lg:pb-16">{children}</div>
  </DashboardLayout>
)

export default Layout
