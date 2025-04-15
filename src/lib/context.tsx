"use client";
import React, { createContext, ReactNode, useContext, useState } from "react";
import { TSection } from "./types";

type TAppContext = {
  sections: TSection[];
  setSections: React.Dispatch<React.SetStateAction<TSection[]>>;
};

const AppContext = createContext<TAppContext>({
  sections: [],
  setSections: () => {},
});

export const useSections = () => {
  const ctx = useContext(AppContext);

  return { sections: ctx.sections, setSections: ctx.setSections };
};

const Context = ({ children }: { children: ReactNode }) => {
  const [sections, setSections] = useState<TSection[]>([]);
  return (
    <div className="w-full ">
      <AppContext.Provider
        value={{
          sections,
          setSections,
        }}
      >
        {children}
      </AppContext.Provider>
    </div>
  );
};

export default Context;
