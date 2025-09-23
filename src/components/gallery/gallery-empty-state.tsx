'use client'

import { motion } from 'framer-motion'
import { Camera, Plus } from 'lucide-react'

import { Button } from '@/components/ui/button'

interface EmptyGalleryStateProps {
  title?: string;
  description?: string;
  ctaText?: string;
  onAddImages?: () => void;
  disabled?: boolean;
}

export function EmptyGalleryState({
  title = 'Your Gallery Awaits',
  description = 'Add your first images to create a stunning gallery. Share your visual story with the world.',
  ctaText = 'Add Images',
  onAddImages = () => {},
  disabled = false,
}: EmptyGalleryStateProps) {
  return (
    <div className="flex h-full min-h-[400px] max-w-2xl border-2 border-neutral-300/60 dark:border-dark-border/80 rounded-3xl border-dashed w-full items-center justify-center">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex max-w-md flex-col items-center text-center"
      >
        <div className="relative mb-8">
          {/* Main icon */}
          <motion.div
            className="mb-6 flex size-16 items-center justify-center rounded-full bg-gradient-to-br from-yellow-100 to-amber-100 dark:from-yellow-900/20 dark:to-amber-900/20"
            whileHover={{ scale: 1.05 }}
            transition={{ type: 'spring', stiffness: 300, damping: 15 }}
          >
            <Camera
              className="size-6 text-yellow-500 dark:text-yellow-400"
              strokeWidth={1.5}
            />
          </motion.div>
        </div>
        <h3 className="mb-2 md:text-xl font-medium tracking-tight">{title}</h3>
        <p className="mb-6 opacity-80 text-sm md:text-base leading-tight px-6">
          {description}
        </p>

        <div className="flex gap-3">
          <Button
            size="sm"
            className="gap-2 scale-90 !bg-main-yellow text-black"
            onClick={onAddImages}
            disabled={disabled}
          >
            <Plus className="h-4 w-4" />
            {ctaText}
          </Button>
        </div>
      </motion.div>
    </div>
  )
}
