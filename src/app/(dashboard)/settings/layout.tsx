import SettingsLayout from '@/components/layout/SettingsLayout'
import { ReactNode } from 'react'

const Layout = ({ children }: { children: ReactNode }) => {
  return <SettingsLayout>{children}</SettingsLayout>
}

export default Layout
