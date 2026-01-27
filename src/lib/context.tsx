'use client'
import React, { createContext, ReactNode, useContext, useState } from 'react'

type TAppContext = {
  activeSidebarTab: { id?: string | null; tab: string };
  setActiveSidebarTab: React.Dispatch<
    React.SetStateAction<{ id?: string | null; tab: string }>
  >;
  isRightSidebarOpen: boolean;
  setIsRightSidebarOpen: React.Dispatch<React.SetStateAction<boolean>>;
  isPageSidebarOpen: boolean;
  setIsPageSidebarOpen: React.Dispatch<React.SetStateAction<boolean>>;
};

const AppContext = createContext<TAppContext>({
  activeSidebarTab: { id: null, tab: 'gallery' },
  setActiveSidebarTab: () => { },
  isRightSidebarOpen: false,
  setIsRightSidebarOpen: () => { },
  isPageSidebarOpen: false,
  setIsPageSidebarOpen: () => { },
})

export const useRightSidebar = () => {
  const ctx = useContext(AppContext)

  return [ctx.isRightSidebarOpen, ctx.setIsRightSidebarOpen] as const
}
export const usePageSidebar = () => {
  const ctx = useContext(AppContext)

  return [ctx.isPageSidebarOpen, ctx.setIsPageSidebarOpen] as const
}
export const useActiveSidebarTab = () => {
  const ctx = useContext(AppContext)

  return [ctx.activeSidebarTab, ctx.setActiveSidebarTab] as const
}

const Context = ({ children }: { children: ReactNode }) => {
  const [isRightSidebarOpen, setIsRightSidebarOpen] = useState(false)
  const [isPageSidebarOpen, setIsPageSidebarOpen] = useState(false)
  const [activeSidebarTab, setActiveSidebarTab] = useState<{
    id?: string | null;
    tab: string;
  }>({
    id: null,
    tab: 'chat',
  })

  return (
    <div className="w-full ">
      <AppContext.Provider
        value={{
          activeSidebarTab,
          setActiveSidebarTab,
          isRightSidebarOpen,
          setIsRightSidebarOpen,
          isPageSidebarOpen,
          setIsPageSidebarOpen,
        }}
      >
        {children}
      </AppContext.Provider>
    </div>
  )
}

export default Context
