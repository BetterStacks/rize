'use client'

import { motion } from 'framer-motion'
import { CreativeAvatar } from './creative-avatar'

interface AvatarGridProps {
  names: string[]
  className?: string
}

export function AvatarGrid({ names, className }: AvatarGridProps) {
  // Sample names if none provided
  const sampleNames = names.length > 0 ? names : [
    'Alex Chen', 'Sarah Kim', 'Marcus Johnson', 'Luna Rodriguez', 
    'Dev Patel', 'Maya Singh', 'Jordan Lee', 'Zoe Martinez',
    'Ryan Taylor', 'Aria Okafor', 'Sam Rivera', 'Nova Clark'
  ]

  return (
    <div className={`grid grid-cols-4 md:grid-cols-6 gap-3 ${className}`}>
      {sampleNames.slice(0, 12).map((name, index) => (
        <motion.div
          key={name}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ 
            delay: index * 0.05,
            type: 'spring',
            stiffness: 300,
            damping: 20 
          }}
          className="flex flex-col items-center gap-2"
        >
          <CreativeAvatar
            src={null}
            name={name}
            size="md"
            variant="auto"
            showHoverEffect={true}
          />
          <span className="text-xs text-center text-neutral-600 dark:text-neutral-400 font-medium">
            {name.split(' ')[0]}
          </span>
        </motion.div>
      ))}
    </div>
  )
}

// Component for showcasing specific variants
export function AvatarVariantGrid({ name }: { name: string }) {
  const variants = ['gradient', 'emoji', 'geometric', 'neon', 'minimal'] as const

  return (
    <div className="grid grid-cols-5 gap-4">
      {variants.map((variant, index) => (
        <motion.div
          key={variant}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
          className="flex flex-col items-center gap-2"
        >
          <CreativeAvatar
            src={null}
            name={name}
            size="lg"
            variant={variant}
            showHoverEffect={true}
          />
          <span className="text-xs text-center text-neutral-600 dark:text-neutral-400 capitalize">
            {variant}
          </span>
        </motion.div>
      ))}
    </div>
  )
}