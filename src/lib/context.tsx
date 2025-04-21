"use client";
import React, { createContext, ReactNode, useContext, useState } from "react";
import { TSection } from "./types";

type TAppContext = {
  sections: TSection[];
  setSections: React.Dispatch<React.SetStateAction<TSection[]>>;
  isRightSidebarOpen: boolean;
  setIsRightSidebarOpen: React.Dispatch<React.SetStateAction<boolean>>;
};

const AppContext = createContext<TAppContext>({
  sections: [],
  setSections: () => {},
  isRightSidebarOpen: false,
  setIsRightSidebarOpen: () => {},
});

export const useSections = () => {
  const ctx = useContext(AppContext);

  return { sections: ctx.sections, setSections: ctx.setSections };
};
export const useRightSidebar = () => {
  const ctx = useContext(AppContext);

  return [ctx.isRightSidebarOpen, ctx.setIsRightSidebarOpen] as const;
};

const Context = ({ children }: { children: ReactNode }) => {
  const [sections, setSections] = useState<TSection[]>([]);
  const [isRightSidebarOpen, setIsRightSidebarOpen] = useState(false);

  return (
    <div className="w-full ">
      <AppContext.Provider
        value={{
          sections,
          setSections,
          isRightSidebarOpen,
          setIsRightSidebarOpen,
        }}
      >
        {children}
      </AppContext.Provider>
    </div>
  );
};

export default Context;
