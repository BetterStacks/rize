"use client"
import DashboardLayout from '@/components/layout/DashboardLayout'
import Sidebar from '@/components/sidebar/Sidebar'
import { ReactNode } from 'react'

const Layout = ({ children }: { children: ReactNode }) => {
  return <DashboardLayout variant='full' leftSidebarSlot={{
    content: <Sidebar className='border-none w-full' />,
    size: 5,
    minSize: 5,
    maxSize: 5
  }}

  >{children}</DashboardLayout>
}

export default Layout
