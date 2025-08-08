import { getGalleryItems } from '@/actions/gallery-actions'
import { GalleryItemProps } from '@/lib/types'
import { useQuery } from '@tanstack/react-query'
import { useParams } from 'next/navigation'
import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from 'react'

type TGallerItemsContext = {
  items: GalleryItemProps[];
  setItems: (items: GalleryItemProps[]) => void;
  isLoading?: boolean;
};

export const GalleryItemsContext = createContext<TGallerItemsContext>({
  items: [],
  setItems: () => {},
  isLoading: false,
})

export const useGalleryItems = () => {
  const context = useContext(GalleryItemsContext)
  if (!context) {
    throw new Error('useGallerItems must be used within a GalleryItemsContext')
  }
  return context
}

const GalleryContextProvider = ({ children }: { children: ReactNode }) => {
  const [items, setItems] = useState<GalleryItemProps[]>([])
  const { username } = useParams<{ username: string }>()
  const { data, isLoading } = useQuery({
    queryKey: ['get-gallery-items', username],
    enabled: !!username,
    queryFn: () => getGalleryItems(username!),
  })

  useEffect(() => {
    if (data && data?.length !== 0) {
      setItems(data)
    }
  }, [data])

  return (
    <GalleryItemsContext.Provider
      value={{
        items,
        setItems,
        isLoading: isLoading,
      }}
    >
      {children}
    </GalleryItemsContext.Provider>
  )
}

export default GalleryContextProvider
