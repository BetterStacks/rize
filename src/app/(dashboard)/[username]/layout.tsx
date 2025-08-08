import AuthGuard from '@/components/auth/AuthGuard'
import { ReactNode } from 'react'

const Layout = ({ children }: { children: ReactNode }) => {
  return <AuthGuard>{children}</AuthGuard>
}

export default Layout
