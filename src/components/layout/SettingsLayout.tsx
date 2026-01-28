'use client'
import * as React from 'react'
import { ResizablePanel, ResizablePanelGroup } from '../ui/resizable'
import { ReactNode } from 'react'
import { ScrollArea } from '../ui/scroll-area'
import Sidebar from '../sidebar/Sidebar'
import RightSidebar from '../sidebar/RightSidebar'
import { PanelProvider, usePanel } from '@/lib/panel-context'

type SettingsLayoutProps = {
  children: ReactNode;
};
const SettingsLayoutInner = ({ children }: SettingsLayoutProps) => {
  const { rightPanelRef } = usePanel()
  const [mounted, setMounted] = React.useState(false)

  React.useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return null // Return null or a simple loading skeleton to avoid hydration mismatch
  }

  return (
    <ResizablePanelGroup
      direction="horizontal"
      id="settings-layout-group"
      autoSaveId="settings-layout-persistence"
      className="h-screen w-full overflow-hidden "
    >
      <Sidebar />
      <ResizablePanel id="settings-main-content" className="w-full h-screen overflow-hidden">
        <ScrollArea className="h-screen overflow-y-auto mt-28 relative w-full ">
          {children}
        </ScrollArea>
      </ResizablePanel>
      <ResizablePanel
        ref={rightPanelRef}
        id="settings-right-sidebar"
        maxSize={24}
        className="border-l border-neutral-200/80  dark:border-dark-border/60  overflow-hidden"
      >
        <RightSidebar />
      </ResizablePanel>
    </ResizablePanelGroup>
  )
}

const SettingsLayout = ({ children }: SettingsLayoutProps) => {
  return <SettingsLayoutInner>{children}</SettingsLayoutInner>
}

export default SettingsLayout
