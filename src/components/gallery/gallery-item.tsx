import { removeGalleryItem } from '@/actions/gallery-actions'
import { queryClient } from '@/lib/providers'
import { GalleryItemProps } from '@/lib/types'
import { cn, isImageUrl } from '@/lib/utils'
import { Trash2 } from 'lucide-react'
import Image from 'next/image'
import toast from 'react-hot-toast'
import { Button } from '../ui/button'

type TGalleryItemProps = {
  item: GalleryItemProps;
  index: number;
  isMine: boolean;
  onImageClick?: (index: number) => void;
};

function GalleryItem({ item, index, isMine, onImageClick }: TGalleryItemProps) {
  const removeItemFromGallery = async () => {
    if (!item.id) {
      throw new Error('Item not found in gallery')
    }
    try {
      const res = await removeGalleryItem(item.id)
      if (!res) {
        throw new Error('Failed to remove item from gallery')
      }
      toast.success('Item removed from gallery')
      queryClient.invalidateQueries({ queryKey: ['get-gallery-items'] })
    } catch (error) {
      toast.error((error as Error).message)
    }
  }

  const handleClick = (e: React.MouseEvent) => {
    // Don't trigger lightbox if clicking on delete button or if no click handler provided
    if ((e.target as HTMLElement).closest('button') || !onImageClick) return

    e.preventDefault()
    e.stopPropagation()
    onImageClick(index)
  }

  return (
    <>
      {isMine && (
        <Button
          onClick={removeItemFromGallery}
          className={cn(
            'rounded-full absolute group-hover:opacity-100 opacity-0 z-20 top-2 right-2 p-1 '
          )}
          size={'icon'}
        >
          <Trash2 className="size-4 " />
        </Button>
      )}
      {item?.url && item?.type === 'image' ? (
        <Image
          draggable={false}
          src={item?.url}
          alt=""
          fill
          className="select-none z-10 cursor-pointer"
          style={{ objectFit: 'cover' }}
          onClick={handleClick}
        />
      ) : (
        <video
          style={{ objectFit: 'cover' }}
          className="w-full h-full cursor-pointer"
          src={item?.url}
          autoPlay
          loop
          muted
          controls={false}
          onClick={handleClick}
        />
      )}
    </>
  )
}

export default GalleryItem
