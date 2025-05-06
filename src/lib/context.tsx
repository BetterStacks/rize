"use client";
import React, { createContext, ReactNode, useContext, useState } from "react";
import { TSection } from "./types";
import { useQueryState } from "nuqs";

type TAppContext = {
  sections: TSection[];
  activeSidebarTab: { id?: string | null; tab: string };
  setActiveSidebarTab: React.Dispatch<
    React.SetStateAction<{ id?: string | null; tab: string }>
  >;
  setSections: React.Dispatch<React.SetStateAction<TSection[]>>;
  isRightSidebarOpen: boolean;
  setIsRightSidebarOpen: React.Dispatch<React.SetStateAction<boolean>>;
  isPageSidebarOpen: boolean;
  setIsPageSidebarOpen: React.Dispatch<React.SetStateAction<boolean>>;
};

const AppContext = createContext<TAppContext>({
  sections: [],
  activeSidebarTab: { id: null, tab: "gallery" },
  setActiveSidebarTab: () => {},
  setSections: () => {},
  isRightSidebarOpen: false,
  setIsRightSidebarOpen: () => {},
  isPageSidebarOpen: false,
  setIsPageSidebarOpen: () => {},
});

export const useSections = () => {
  const ctx = useContext(AppContext);

  return { sections: ctx.sections, setSections: ctx.setSections };
};
export const useRightSidebar = () => {
  const ctx = useContext(AppContext);

  return [ctx.isRightSidebarOpen, ctx.setIsRightSidebarOpen] as const;
};
export const usePageSidebar = () => {
  const ctx = useContext(AppContext);

  return [ctx.isPageSidebarOpen, ctx.setIsPageSidebarOpen] as const;
};
export const useActiveSidebarTab = () => {
  const ctx = useContext(AppContext);

  return [ctx.activeSidebarTab, ctx.setActiveSidebarTab] as const;
};

const Context = ({ children }: { children: ReactNode }) => {
  const [sections, setSections] = useState<TSection[]>([]);
  const [isRightSidebarOpen, setIsRightSidebarOpen] = useState(false);
  const [isPageSidebarOpen, setIsPageSidebarOpen] = useState(false);
  const [activeSidebarTab, setActiveSidebarTab] = useState<{
    id?: string | null;
    tab: string;
  }>({
    id: null,
    tab: "gallery",
  });

  return (
    <div className="w-full ">
      <AppContext.Provider
        value={{
          sections,
          activeSidebarTab,
          setActiveSidebarTab,
          setSections,
          isRightSidebarOpen,
          setIsRightSidebarOpen,
          isPageSidebarOpen,
          setIsPageSidebarOpen,
        }}
      >
        {children}
      </AppContext.Provider>
    </div>
  );
};

export default Context;
