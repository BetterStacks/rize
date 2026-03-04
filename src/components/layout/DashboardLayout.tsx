'use client'
import * as React from 'react'
import { useRightSidebar } from '@/lib/context'
import { useMediaQuery } from '@mantine/hooks'
import { motion } from 'framer-motion'
import { FC, ReactNode, useState, useEffect } from 'react'
import { useEnsureScroll } from '@/hooks/useScrollFix'
import GalleryContextProvider from '../gallery/gallery-context'
import Navbar from '../navbar'
import Sidebar from '../sidebar/Sidebar'
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from '../ui/resizable'
import { ScrollArea } from '../ui/scroll-area'
import { Sheet, SheetContent } from '../ui/sheet'
import { cn } from '@/lib/utils'
import { usePanel } from '@/lib/panel-context'

type LayoutVariant = 'profile' | 'explore' | 'post' | 'writing' | 'full' | 'default'

/** Config for customising a sidebar slot */
type SidebarSlot = {
  /** The content to render inside the sidebar */
  content: ReactNode;
  /** Extra classes merged onto the ResizablePanel / Sheet container */
  className?: string;
  /** ResizablePanel size (percentage). Defaults: left=5, right=25 */
  size?: number;
  /** Min size for the panel */
  minSize?: number;
  /** Max size for the panel */
  maxSize?: number;
  /** Classes for the mobile Sheet (right sidebar only) */
  mobileSheetClassName?: string;
}

type DashboardLayoutProps = {
  children: ReactNode;
  variant?: LayoutVariant;
  isMine?: boolean;
  className?: string;
  customNavbar?: ReactNode;
  showNavbar?: boolean;
  contentMaxWidth?: string;
  contentPadding?: string;
  /** Extra className applied to the direct children wrapper div */
  childrenClassName?: string;
  /** Left sidebar slot — omit to hide */
  leftSidebarSlot?: SidebarSlot;
  /** Right sidebar slot — omit to hide */
  rightSidebarSlot?: SidebarSlot;
};

const DashboardLayoutInner: FC<DashboardLayoutProps> = ({
  children,
  variant = 'default',
  isMine = false,
  className,
  customNavbar,
  showNavbar,
  contentMaxWidth,
  contentPadding = 'px-3',
  childrenClassName,
  leftSidebarSlot,
  rightSidebarSlot,
}) => {
  const [rightSidebarOpen, setRightSidebarOpen] = useRightSidebar()
  const isDesktop = useMediaQuery('(min-width: 1024px)')
  const isMobile = useMediaQuery('(max-width: 768px)')
  const { rightPanelRef } = usePanel()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEnsureScroll()

  const finalShowNavbar = showNavbar !== undefined ? showNavbar : (variant === 'full' ? false : true)

  const getContentStyling = () => {
    switch (variant) {
      case 'post':
        return {
          maxWidth: contentMaxWidth || 'max-w-2xl',
          padding: contentPadding,
          className: 'border-x border-neutral-300/60 dark:border-dark-border'
        }
      case 'writing':
        return {
          maxWidth: contentMaxWidth || 'max-w-3xl',
          padding: contentPadding,
          className: ''
        }
      case 'explore':
        return {
          maxWidth: contentMaxWidth || 'max-w-none',
          padding: contentPadding,
          className: ''
        }
      case 'full':
        return {
          maxWidth: contentMaxWidth || 'max-w-none',
          padding: contentPadding || 'px-0',
          className: ''
        }
      default:
        return {
          maxWidth: contentMaxWidth || 'max-w-none',
          padding: contentPadding,
          className: ''
        }
    }
  }

  const contentStyles = getContentStyling()

  if (!mounted) return null

  return (
    <ResizablePanelGroup
      className="w-full h-full flex items-center justify-center"
      direction="horizontal"
      id="dashboard-layout-group"
      autoSaveId="dashboard-layout-persistence"
    >
      <GalleryContextProvider>
        {/* Left Sidebar */}
        {leftSidebarSlot && isDesktop && (
          <ResizablePanel
            id="dashboard-left-sidebar"
            defaultSize={leftSidebarSlot.size ?? 5}
            maxSize={leftSidebarSlot.maxSize ?? leftSidebarSlot.size ?? 5}
            minSize={leftSidebarSlot.minSize ?? leftSidebarSlot.size ?? 5}
            className={cn(
              'h-screen flex items-center',
              'justify-start max-w-[80px] border-r border-neutral-300/60 dark:border-dark-border',
              leftSidebarSlot.className
            )}
          >
            {leftSidebarSlot.content}
          </ResizablePanel>
        )}

        {/* Main Content Area */}
        <ResizablePanel
          id="dashboard-main-content"
          className={cn(
            'w-full h-screen relative overflow-hidden',
            contentStyles.className,
            className
          )}
        >
          {/* {finalShowNavbar && (
            customNavbar || <Navbar isMine={isMine} variant={variant as any} />
          )} */}

          <ScrollArea className="h-full overflow-y-auto relative w-full">
            <motion.div
              className={cn(
                'w-full flex flex-col items-center h-full justify-start',
                finalShowNavbar ? 'mt-20 md:mt-24' : 'mt-0',
                'mb-10',
                contentStyles.padding
              )}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, ease: 'easeOut' }}
            >
              <div className={cn('w-full', contentStyles.maxWidth, childrenClassName)}>
                {children}
              </div>
            </motion.div>
          </ScrollArea>
        </ResizablePanel>

        {/* Right Sidebar - Desktop */}
        {rightSidebarSlot && isDesktop && (
          <>
            <ResizableHandle />
            <ResizablePanel
              ref={rightPanelRef}
              id="dashboard-right-sidebar"
              defaultSize={rightSidebarSlot.size ?? 25}
              maxSize={rightSidebarSlot.maxSize ?? rightSidebarSlot.size ?? 25}
              minSize={rightSidebarSlot.minSize ?? rightSidebarSlot.size ?? 25}
              collapsible
              collapsedSize={0}
              className={cn(
                'border-l border-neutral-200/80 dark:border-neutral-800 flex flex-col items-center justify-center h-screen',
                rightSidebarSlot.className
              )}
            >
              <ScrollArea className="relative h-screen w-full overflow-y-auto flex flex-col items-center justify-start">
                {rightSidebarSlot.content}
              </ScrollArea>
            </ResizablePanel>
          </>
        )}

        {/* Right Sidebar - Mobile Sheet */}
        {rightSidebarSlot && !isDesktop && (
          <Sheet open={rightSidebarOpen} onOpenChange={setRightSidebarOpen}>
            <SheetContent className={cn(
              'max-w-[90%] sm:max-w-md md:max-w-lg w-full h-screen p-0 bg-white dark:bg-dark-border/80 border border-neutral-200 dark:border-dark-border/60 dark:bg-dark-bg',
              rightSidebarSlot.mobileSheetClassName
            )}>
              {rightSidebarSlot.content}
            </SheetContent>
          </Sheet>
        )}
      </GalleryContextProvider>
    </ResizablePanelGroup>
  )
}

const DashboardLayout: FC<DashboardLayoutProps> = (props) => {
  return <DashboardLayoutInner {...props} />
}

export default DashboardLayout