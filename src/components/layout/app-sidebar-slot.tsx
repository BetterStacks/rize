import Sidebar from '@/components/sidebar/Sidebar'

/**
 * The left rail every app page uses (explore, search, notifications, settings,
 * post, project, page, a signed-in profile). Pass it as DashboardLayout's
 * `leftSidebarSlot` so the shell is the same everywhere.
 */
export const appSidebarSlot = {
  content: <Sidebar className="border-none w-full" />,
  size: 5,
  minSize: 5,
  maxSize: 5,
}
