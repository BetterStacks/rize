'use client'
import { useRightSidebar } from '@/lib/context'
import { useMediaQuery } from '@mantine/hooks'
import { motion } from 'framer-motion'
import { FC, ReactNode } from 'react'
import GalleryContextProvider from '../gallery/gallery-context'
import Navbar from '../navbar'
import RightSidebar from '../sidebar/RightSidebar'
import Sidebar from '../sidebar/Sidebar'
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from '../ui/resizable'
import { ScrollArea } from '../ui/scroll-area'
import { Sheet, SheetContent } from '../ui/sheet'
import { cn } from '@/lib/utils'

type LayoutVariant = 'profile' | 'explore' | 'post' | 'writing' | 'default'

type SidebarConfig = {
  left?: {
    component?: ReactNode;
    show?: boolean;
    className?: string;
  };
  right?: {
    component?: ReactNode;
    show?: boolean;
    className?: string;
  };
}

type DashboardLayoutProps = {
  children: ReactNode;
  variant?: LayoutVariant;
  isMine?: boolean;
  className?: string;
  customNavbar?: ReactNode;
  sidebarConfig?: SidebarConfig;
  showNavbar?: boolean;
  contentMaxWidth?: string;
  contentPadding?: string;
};

const DashboardLayout: FC<DashboardLayoutProps> = ({
  children,
  variant = 'default',
  isMine = false,
  className,
  customNavbar,
  sidebarConfig,
  showNavbar = true,
  contentMaxWidth,
  contentPadding = 'px-3',
}) => {
  const [rightSidebarOpen, setRightSidebarOpen] = useRightSidebar()
  const isDesktop = useMediaQuery('(min-width: 1024px)')
  const isMobile = useMediaQuery('(max-width: 768px)')

  // Default sidebar configurations based on variant
  const getDefaultSidebarConfig = (): SidebarConfig => {
    switch (variant) {
      case 'profile':
        return {
          right: {
            component: <RightSidebar className="w-full" />,
            show: isMine && isDesktop,
          }
        }
      case 'explore':
        return {
          left: {
            component: <Sidebar className="border-none w-full" />,
            show: isDesktop,
            className: 'max-w-sm'
          },
          right: {
            component: (
              <div className="border-l hidden z-40 bg-white dark:bg-dark-bg lg:flex border-neutral-300/60 dark:border-dark-border max-w-[280px] lg:flex-col w-full h-screen">
                {/* Recently Joined or other sidebar content */}
              </div>
            ),
            show: isDesktop,
          }
        }
      case 'post':
        return {
          left: {
            component: <Sidebar className="border-none w-full" />,
            show: isDesktop,
            className: 'max-w-sm'
          }
        }
      case 'writing':
        return {
          right: {
            component: <RightSidebar className="w-full" />,
            show: isMine && isDesktop,
          }
        }
      default:
        return {}
    }
  }

  const finalSidebarConfig = { ...getDefaultSidebarConfig(), ...sidebarConfig }

  // Content styling based on variant
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
      default:
        return {
          maxWidth: contentMaxWidth || 'max-w-none',
          padding: contentPadding,
          className: ''
        }
    }
  }

  const contentStyles = getContentStyling()

  return (
    <ResizablePanelGroup
      className="w-full h-full flex items-center justify-center"
      direction="horizontal"
    >
      <GalleryContextProvider>
        {/* Left Sidebar */}
        {finalSidebarConfig.left?.show && (
          <ResizablePanel
            defaultSize={20}
            maxSize={25}
            minSize={15}
            className={cn(
              'h-screen flex items-center justify-end',
              finalSidebarConfig.left.className
            )}
          >
            {finalSidebarConfig.left.component}
          </ResizablePanel>
        )}

        {/* Main Content Area */}
        <ResizablePanel
          className={cn(
            'w-full h-screen relative overflow-hidden',
            contentStyles.className,
            className
          )}
        >
          {/* Navbar */}
          {showNavbar && (
            customNavbar || <Navbar isMine={isMine} variant={variant} />
          )}

          {/* Scrollable Content */}
          <ScrollArea className="h-screen overflow-y-auto relative w-full">
            <motion.div 
              className={cn(
                'w-full flex flex-col items-center justify-center',
                showNavbar ? 'mt-20 md:mt-24' : 'mt-0',
                'mb-10',
                contentStyles.padding
              )}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, ease: 'easeOut' }}
            >
              <div className={cn('w-full', contentStyles.maxWidth)}>
                {children}
              </div>
            </motion.div>
          </ScrollArea>
        </ResizablePanel>

        {/* Right Sidebar - Desktop */}
        {finalSidebarConfig.right?.show && isDesktop && (
          <>
            {finalSidebarConfig.left?.show && <ResizableHandle />}
            <ResizablePanel
              defaultSize={26}
              maxSize={30}
              minSize={20}
              className={cn(
                'border-l flex flex-col items-center justify-center dark:border-dark-border',
                finalSidebarConfig.right.className
              )}
            >
              {finalSidebarConfig.right.component}
            </ResizablePanel>
          </>
        )}

        {/* Right Sidebar - Mobile Sheet */}
        {finalSidebarConfig.right?.component && (
          <Sheet open={rightSidebarOpen} onOpenChange={setRightSidebarOpen}>
            <SheetContent className="max-w-[90%] sm:max-w-md md:max-w-lg w-full h-screen p-0 bg-white dark:bg-dark-border/80 border border-neutral-200 dark:border-dark-border/60 dark:bg-dark-bg">
              {finalSidebarConfig.right.component}
            </SheetContent>
          </Sheet>
        )}
      </GalleryContextProvider>
    </ResizablePanelGroup>
  )
}

export default DashboardLayout