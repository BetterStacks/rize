"use client";
import Gallery from "@/components/gallery/gallery";
import Writings from "@/components/writings/writings";
import React, {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useState,
} from "react";
import { Item } from "./types";

type TSection = {
  id: string;
  name: string;
  component: ReactNode;
};

type TAppContext = {
  items: Item[];
  setItems: React.Dispatch<React.SetStateAction<Item[]>>;
  sections: TSection[];
  setSections: React.Dispatch<React.SetStateAction<TSection[]>>;
  map: Map<string, Record<string, any>>;
  set: (key: string, value: Record<string, any>) => void;
  remove: (key: string) => void;
  clear: () => void;
  has: (key: string) => boolean;
  get: (key: string) => any;
};

export const layout: Item[] = [
  {
    i: "160b243e-0c74-43bb-bdaf-a510d6af540b",
    x: 0,
    y: 0,
    w: 1,
    h: 2,
    isResizable: true,
    isBounded: true,
    resizeHandles: ["se"],
  },
  {
    i: "7a16e47e-a462-46ba-b245-41a5fd924bce",
    x: 1,
    y: 0,
    w: 1,
    h: 2,
    isResizable: true,
    isBounded: true,
    resizeHandles: ["se", "e", "w"],
  },
];

const initMap = new Map<string, Record<string, any>>();
initMap.set("160b243e-0c74-43bb-bdaf-a510d6af540b", {
  type: "text",
  text: "Hello",
});
initMap.set("7a16e47e-a462-46ba-b245-41a5fd924bce", {
  type: "text",
  text: "World",
});

const AppContext = createContext<TAppContext>({
  items: [],
  setItems: () => {},
  sections: [],
  setSections: () => {},
  map: new Map(),
  set: () => {},
  clear: () => {},
  remove: () => {},
  has: () => false,
  get: () => ({}),
});

export const useGridtems = () => {
  const ctx = useContext(AppContext);

  return { items: ctx.items, setItems: ctx.setItems };
};
export const useMap = () => {
  const ctx = useContext(AppContext);
  const { map, set, remove, clear, has, get } = ctx;
  return { map, set, remove, clear, has, get };
};
export const useSections = () => {
  const ctx = useContext(AppContext);

  return { sections: ctx.sections, setSections: ctx.setSections };
};

const Context = ({ children }: { children: ReactNode }) => {
  // const storedLayout = JSON.parse(localStorage.getItem("layout") as string);
  // const storedMap = JSON.parse(localStorage.getItem("map") as string);
  // console.log({ storedLayout, s: new Map(storedMap) });
  const [sections, setSections] = useState<TSection[]>([]);
  const [items, setItems] = React.useState<Item[]>(layout);
  const [map, setMap] = useState(initMap);
  // const [map, setMap] = useState((new Map(storedMap) as any) || initMap);

  const set = useCallback((key: string, value: any) => {
    // setMap((prev: any) => new Map(prev).set(key, value));
  }, []);

  const remove = useCallback((key: string) => {
    // setMap((prev: any) => {
    //   const newMap = new Map(prev);
    //   newMap.delete(key);
    //   return newMap;
    // });
  }, []);

  const clear = useCallback(() => {
    setMap(new Map());
  }, []);

  const has = useCallback((key: string) => map.has(key), [map]);
  const get = useCallback((key: string) => map.get(key), [map]);

  return (
    <div className="w-full ">
      <AppContext.Provider
        value={{
          items,
          setItems,
          clear,
          map,
          set,
          remove,
          has,
          // @ts-ignore
          get,
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
