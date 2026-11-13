import { getGalleryItems, addGalleryItem } from '@/actions/gallery-actions'
import { GalleryItemProps } from '@/lib/types'
import { cn } from '@/lib/utils'
import { useQuery, useMutation } from '@tanstack/react-query'
import { motion, Variants } from 'framer-motion'
import { useParams } from 'next/navigation'
import { FC, useEffect, useState, useRef, useCallback } from 'react'
import { Skeleton } from '../ui/skeleton'
import { queryClient } from '@/lib/providers'
import { uploadMedia } from '@/actions/client-actions'
import { uploadErrorMessage } from '@/lib/prepare-upload'
import toast from 'react-hot-toast'
import { GalleryLightbox } from './gallery-lightbox'
import {
  mansoryGridItemVariants,
  mansoryGridVariants,
  messyGridItemVariants,
  messyGridVariants,
} from './gallery-config'
import { EmptyLine, ProfileSection, SectionNewButton } from '../profile/profile-section'
import { PROFILE_STALE_TIME } from '@/lib/profile-query'
import GalleryItem from './gallery-item'

export const galleryLayouts = {
  'messy-grid': {
    container:
      'flex flex-wrap mt-6 -space-x-6 -space-y-6 w-full  max-w-3xl   items-center justify-center',
    item: 'w-[260px] h-[260px]  aspect-square  shadow-2xl ',
    containerVariants: messyGridVariants,
    itemVariants: messyGridItemVariants,
  },
  'masonry-grid': {
    container: 'w-full columns-2 md:columns-3  max-w-2xl relative',
    item: 'mt-4 first:mt-0 shadow-lg ',
    containerVariants: mansoryGridVariants,
    itemVariants: mansoryGridItemVariants,
  },
}

type GalleryProps = {
  isMine: boolean;
  items: GalleryItemProps[];
};

const imagesContainerVariants: Variants = {
  hidden: {
    // opacity: 0,
    spacing: -100,
  },
  visible: {
    // opacity: 1,
    spacing: -2,
    transition: {
      staggerChildren: 0.1, // Adjust the stagger duration as needed
    },
  },
}

const itemVariants: Variants = {
  hidden: { opacity: 0, x: 50, rotate: 0 },
  visible: (i) => ({
    opacity: 1,
    x: 0,
    rotate: i % 2 == 0 ? 6 : -6,
    transition: {
      duration: 0.25,
      type: 'spring',
      stiffness: 260,
      damping: 20,
    },
  }),
}

const Gallery: FC<GalleryProps> = ({ isMine, items }) => {
  const { username } = useParams<{ username: string }>()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const { data } = useQuery({
    queryKey: ['get-gallery-items', username],
    initialData: items,
    queryFn: () => getGalleryItems(username!),
    staleTime: PROFILE_STALE_TIME,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  })
  const [sortedItems, setSortedItems] = useState(data || [])

  // Lightbox state
  const [lightboxOpen, setLightboxOpen] = useState(false)
  const [currentImageIndex, setCurrentImageIndex] = useState(0)

  useEffect(() => {
    setSortedItems(data)
  }, [data])

  // Upload functionality
  const { mutate: handleUpload, isPending } = useMutation({
    mutationFn: uploadMedia,
    onSuccess: async (data) => {
      await Promise.all(
        data.map(async (result: any) => {
          return await addGalleryItem(result)
        })
      )
      queryClient.invalidateQueries({ queryKey: ['get-gallery-items'] })
      toast.success(`${data.length} media items added!`)
    },
    onError: (error) => {
      toast.error(uploadErrorMessage(error))
    },
  })

  const handleAddImages = useCallback(() => {
    if (!isMine) return
    fileInputRef.current?.click()
  }, [isMine])

  const handleFileChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (!files || files.length === 0) return

    const formData = new FormData()
    Array.from(files).forEach((file) => {
      formData.append('files', file)
    })
    formData.append('folder', 'fyp-stacks/gallery')

    handleUpload(formData)

    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }, [handleUpload])

  // Lightbox functions
  const openLightbox = useCallback((index: number) => {
    setCurrentImageIndex(index)
    setLightboxOpen(true)
  }, [])

  const closeLightbox = useCallback(() => {
    setLightboxOpen(false)
  }, [])

  const navigateLightbox = useCallback((index: number) => {
    setCurrentImageIndex(index)
  }, [])

  const addAction = isMine ? (
    <SectionNewButton
      onClick={handleAddImages}
      what="images"
      label={isPending ? 'Uploading…' : 'New'}
      disabled={isPending}
    />
  ) : undefined

  const isEmpty = !sortedItems || sortedItems.length === 0

  if (!isMine && isEmpty) return null

  return (
    <ProfileSection id="gallery" title="Gallery" actions={addAction}>
      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept="image/*,video/*"
        onChange={handleFileChange}
        className="hidden"
        aria-hidden
        tabIndex={-1}
      />

      {isEmpty ? (
        <EmptyLine
          text="No images yet"
          actionLabel={isPending ? 'Uploading…' : 'Add images'}
          onAction={handleAddImages}
          disabled={isPending}
        />
      ) : (
        <>
          <div className="relative hidden w-full flex-col items-center justify-center pt-4 md:flex">
            <motion.div
              variants={imagesContainerVariants}
              initial="hidden"
              animate="visible"
              className="grid grid-cols-5"
            >
              {sortedItems.map((item, i) => {
                return (
                  <SortableGalleryItem
                    key={item.galleryMediaId ?? i}
                    index={i}
                    isMine={isMine}
                    item={item}
                    onImageClick={openLightbox}
                  />
                )
              })}
            </motion.div>
          </div>
          <div className="relative flex w-full flex-col items-center justify-center md:hidden">
            <div className="columns-3 gap-1 space-y-1">
              {sortedItems.map((item, i) => {
                return (
                  <div
                    key={item.galleryMediaId ?? i}
                    style={{
                      aspectRatio: (item?.width || 1) / (item?.height || 1),
                    }}
                    className="group relative overflow-hidden rounded-lg"
                  >
                    <GalleryItem index={i} isMine={isMine} item={item} onImageClick={openLightbox} />
                  </div>
                )
              })}
            </div>
          </div>

          {/* Lightbox */}
          <GalleryLightbox
            items={sortedItems}
            currentIndex={currentImageIndex}
            isOpen={lightboxOpen}
            onClose={closeLightbox}
            onNavigate={navigateLightbox}
          />
        </>
      )}
    </ProfileSection>
  )
}

const GallerySkeleton = () => {
  return (
    <div
      className={cn(
        'w-full flex items-center justify-center flex-wrap gap-2 -space-x-16 ',
        ''
      )}
    >
      {[...Array.from({ length: 5 })].map((_, i) => (
        <Skeleton
          key={i}
          style={{ borderRadius: '12%' }}
          className={cn(
            'group even:rotate-6 odd:-rotate-6  aspect-square w-full h-full  relative overflow-hidden hover:shadow-2xl  bg-neutral-100 dark:bg-dark-border animate-none shadow-2xl cursor-grab size-48 first:mt-0 active:cursor-grabbing '
          )}
        />
      ))}
    </div>
  )
}

const SortableGalleryItem: FC<{
  item: GalleryItemProps;
  index: number;
  isMine: boolean;
  onImageClick?: (index: number) => void;
}> = ({ item, index, isMine, onImageClick }) => {
  return (
    <motion.div
      style={{ borderRadius: '12%' }}
      variants={itemVariants}
      custom={index}
      whileHover={{
        scale: 1.08,
        x: -10,
        y: -20,
        zIndex: 100,
      }}
      className={cn(
        'group aspect-square w-full h-full -my-4 -mx-8 relative overflow-hidden bg-neutral-100 dark:bg-dark-border cursor-grab size-48 active:cursor-grabbing shadow-2xl '
      )}
    >
      <GalleryItem index={index} isMine={isMine} item={item} onImageClick={onImageClick} />
    </motion.div>
  )
}

export default Gallery
// function handleDragEnd(event: DragEndEvent) {
//   const { active, over } = event;
//   if (active.id !== over?.id) {
//     const oldIndex = items.findIndex((item) => item.id === active.id);
//     const newIndex = items.findIndex((item) => item.id === over?.id);
//     setItems(arrayMove(items, oldIndex, newIndex));
//     setActiveItem(null);
//   }
// }
// const handleDragStart = (event: any) => {
//   const draggedItem = items.find((item) => item.id === event.active.id);
//   if (draggedItem)
//     setActiveItem({ item: draggedItem, index: items.indexOf(draggedItem) });
// };
// const sensors = useSensors(
//   useSensor(PointerSensor, {
//     activationConstraint: {
//       delay: 150, // Require 200ms press before drag starts
//       tolerance: 2, // Prevent accidental drags
//     },
//   }),
//   useSensor(KeyboardSensor, {
//     coordinateGetter: sortableKeyboardCoordinates,
//   })
// );

{
  /* </div> */
}
{
  /* <DndContext
  sensors={sensors}
  collisionDetection={closestCenter}
  onDragEnd={handleDragEnd}
  onDragStart={handleDragStart}
>
  <SortableContext items={items} strategy={horizontalListSortingStrategy}> */
}

{
  /* </SortableContext>
  <DragOverlay>
    {activeItem ? <GalleryItem {...activeItem} /> : null}
  </DragOverlay>
</DndContext> */
}
