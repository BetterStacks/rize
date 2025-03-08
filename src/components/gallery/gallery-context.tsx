import { getGalleryItems } from "@/lib/server-actions";
import { GalleryItemProps } from "@/lib/types";
import { useQuery, UseQueryResult } from "@tanstack/react-query";
import {
  createContext,
  ReactNode,
  useContext,
  useOptimistic,
  useState,
} from "react";

type TGallerItemsContext = {
  items: GalleryItemProps[];
  setItems: (items: GalleryItemProps[]) => void;
  addItem: (item: GalleryItemProps) => void;
};

export const GalleryItemsContext = createContext<TGallerItemsContext>({
  items: [],
  setItems: () => {},
  addItem: () => {},
});

export const useGalleryItems = () => {
  const context = useContext(GalleryItemsContext);
  if (!context) {
    throw new Error("useGallerItems must be used within a GalleryItemsContext");
  }
  return [context.items, context.setItems, context.addItem] as const;
};

const GalleryContextProvider = ({ children }: { children: ReactNode }) => {
  const [items, setItems] = useState<GalleryItemProps[]>([]);
  const { data, isLoading } = useQuery({
    queryKey: ["get-gallery-items"],
    queryFn: getGalleryItems,
  });

  const [optimisticGallery, addOptimisticGalleryItem] = useOptimistic(
    items,
    (currentItems, newGalleryItem: GalleryItemProps) => [
      ...currentItems,
      newGalleryItem,
    ]
  );

  return (
    <GalleryItemsContext.Provider
      value={{
        items: optimisticGallery,
        setItems,
        addItem: addOptimisticGalleryItem,
      }}
    >
      {children}
    </GalleryItemsContext.Provider>
  );
};

export default GalleryContextProvider;
