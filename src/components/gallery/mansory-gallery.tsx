import { getGalleryItems } from '@/actions/gallery-actions'
import { GalleryItemProps } from '@/lib/types'
import { cn } from '@/lib/utils'
import { useQuery } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { useParams } from 'next/navigation'
import { FC } from 'react'
import { Skeleton } from '../ui/skeleton'
import GalleryItem from './gallery-item'
import { Plus } from 'lucide-react'

type GalleryProps = {
  isMine: boolean;
  items: GalleryItemProps[];
};

const MansoryGallery: FC<GalleryProps> = ({ isMine, items }) => {
  const { username } = useParams<{ username: string }>()

  const { data, isLoading } = useQuery({
    queryKey: ['get-gallery-items', username],
    initialData: items,
    queryFn: () => getGalleryItems(username!),
  })

  return (
    <div className="w-full mt-6 md:hidden flex flex-col items-center justify-center">
      <motion.div className=" w-full max-w-2xl">
        {isLoading ? (
          <GallerySkeleton />
        ) : (
          <motion.div
            className="flex w-full items-center justify-start gap-2.5 py-4 overflow-x-auto snap-x snap-mandatory scrollbar-hide"
            // className="columns-2 md:columns-3 space-0 gap-2.5 relative w-full"
          >
            {isMine && (
              <motion.div className=" relative shrink-0 aspect-[9/16] max-w-[160px] w-full border-2 border-dashed flex items-center justify-center border-neutral-300/80 bg-neutral-100 dark:bg-dark-border/50 dark:border-dark-border/90 rounded-2xl  first:mt-0 mt-2.5 overflow-hidden ">
                <Plus strokeWidth={1.8} className="size-10 opacity-80" />
              </motion.div>
            )}

            {data?.map((item, i) => {
              return (
                <motion.div
                  // style={{
                  //   aspectRatio: item.width / item.height,
                  // }}
                  key={i}
                  className="flex relative shrink-0 aspect-[9/16] max-w-[160px] w-full border border-neutral-300/60 dark:border-dark-border/90 rounded-2xl  first:mt-0 mt-2.5 overflow-hidden "
                >
                  <GalleryItem index={i} isMine={isMine} item={item} />
                </motion.div>
              )
            })}
          </motion.div>
        )}
      </motion.div>
    </div>
  )
}

const GallerySkeleton = () => {
  return (
    <div className={cn('w-full columns-2 md:columns-3 gap-2 relative', '')}>
      {[...Array.from({ length: 4 })].map((_, i) => (
        <Skeleton
          key={i}
          className={cn(
            ' h-[250px] aspect-auto w-full bg-neutral-200 dark:bg-dark-border rounded-3xl cursor-grab  first:mt-0 mt-3 active:cursor-grabbing '
          )}
        />
      ))}
    </div>
  )
}

export default MansoryGallery
