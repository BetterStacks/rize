import { ReactNode } from 'react'

// Profiles are public. This layout used to wrap the page in <AuthGuard> with
// no flags, which never redirected anyone but rendered nothing until the
// browser had fetched the session, so the server-rendered HTML was empty.
const Layout = ({ children }: { children: ReactNode }) => {
  return <>{children}</>
}

export default Layout
