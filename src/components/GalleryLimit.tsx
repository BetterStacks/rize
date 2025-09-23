import { cn, MAX_GALLERY_ITEMS } from '@/lib/utils'
import { motion } from 'framer-motion'
import React, { FC, useMemo } from 'react'

type GalleryLimitProps = {
  itemCount: number;
};

const GalleryLimit: FC<GalleryLimitProps> = ({ itemCount }) => {
  const limit = useMemo(
    () => Math.floor((itemCount / MAX_GALLERY_ITEMS) * 100),
    [itemCount]
  )
  return (
    <div
      className={cn(
        'w-full mb-3 mx-auto mt-4 border shadow-lg px-6 py-6 flex flex-col space-y-3   rounded-3xl  items-start justify-center border-neutral-300/60 dark:border-dark-border/80',
        limit === 100 &&
          'border-dashed border-2 dark:bg-red-500/5 dark:border-red-500/20 bg-red-500/5 border-red-500/20'
      )}
    >
      <span className="text-3xl font-semibold">{limit}%</span>
      <motion.div className="w-full h-2 overflow-hidden relative bg-neutral-300 dark:bg-dark-border rounded-xl">
        <motion.div
          animate={{
            width: `${limit}%`,
          }}
          className={cn('bg-main-yellow z-10 h-4', limit > 60 && 'bg-red-500')}
          // style={{ width: Math.floor(items.length / 12) }}
        />
      </motion.div>
      <span className="opacity-80 text-sm">
        {limit === 100
          ? 'You have reached the maximum limit of 10 items in your gallery'
          : 'You can add up to 10 media items to the gallery '}
      </span>
    </div>
  )
}

export default GalleryLimit
