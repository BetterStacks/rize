'use client'

import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'

interface LoadingProps {
  variant?: 'spinner' | 'dots' | 'pulse' | 'skeleton' | 'wave'
  size?: 'sm' | 'md' | 'lg'
  className?: string
  text?: string
}

const sizeStyles = {
  sm: 'w-4 h-4',
  md: 'w-6 h-6', 
  lg: 'w-8 h-8'
}

// Spinner Loading
const SpinnerLoading = ({ size = 'md', className }: Pick<LoadingProps, 'size' | 'className'>) => (
  <motion.div
    className={cn(
      'border-2 border-neutral-200 border-t-purple-500 rounded-full',
      sizeStyles[size],
      className
    )}
    animate={{ rotate: 360 }}
    transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
  />
)

// Dots Loading
const DotsLoading = ({ size = 'md', className }: Pick<LoadingProps, 'size' | 'className'>) => {
  const dotSize = size === 'sm' ? 'w-1.5 h-1.5' : size === 'md' ? 'w-2 h-2' : 'w-3 h-3'
  
  return (
    <div className={cn('flex gap-1', className)}>
      {[0, 1, 2].map((i) => (
        <motion.div
          key={i}
          className={cn(
            'bg-gradient-to-r from-purple-500 to-blue-500 rounded-full',
            dotSize
          )}
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.7, 1, 0.7]
          }}
          transition={{
            duration: 0.6,
            repeat: Infinity,
            delay: i * 0.2
          }}
        />
      ))}
    </div>
  )
}

// Pulse Loading
const PulseLoading = ({ size = 'md', className }: Pick<LoadingProps, 'size' | 'className'>) => (
  <motion.div
    className={cn(
      'bg-gradient-to-r from-purple-500 to-blue-500 rounded-full',
      sizeStyles[size],
      className
    )}
    animate={{
      scale: [1, 1.2, 1],
      opacity: [0.7, 1, 0.7]
    }}
    transition={{
      duration: 1.5,
      repeat: Infinity,
      ease: 'easeInOut'
    }}
  />
)

// Skeleton Loading
const SkeletonLoading = ({ className }: Pick<LoadingProps, 'className'>) => (
  <div className={cn('animate-pulse space-y-3', className)}>
    <div className="h-4 bg-gradient-to-r from-neutral-200 via-neutral-300 to-neutral-200 rounded-2xl dark:from-neutral-700 dark:via-neutral-600 dark:to-neutral-700" />
    <div className="space-y-2">
      <div className="h-3 bg-gradient-to-r from-neutral-200 via-neutral-300 to-neutral-200 rounded-2xl dark:from-neutral-700 dark:via-neutral-600 dark:to-neutral-700" />
      <div className="h-3 bg-gradient-to-r from-neutral-200 via-neutral-300 to-neutral-200 rounded-2xl w-5/6 dark:from-neutral-700 dark:via-neutral-600 dark:to-neutral-700" />
    </div>
  </div>
)

// Wave Loading
const WaveLoading = ({ size = 'md', className }: Pick<LoadingProps, 'size' | 'className'>) => {
  const barHeight = size === 'sm' ? 'h-6' : size === 'md' ? 'h-8' : 'h-10'
  
  return (
    <div className={cn('flex items-end gap-1', className)}>
      {[0, 1, 2, 3, 4].map((i) => (
        <motion.div
          key={i}
          className={cn(
            'w-1 bg-gradient-to-t from-purple-500 to-blue-500 rounded-full',
            barHeight
          )}
          animate={{
            scaleY: [0.3, 1, 0.3]
          }}
          transition={{
            duration: 1,
            repeat: Infinity,
            delay: i * 0.1,
            ease: 'easeInOut'
          }}
        />
      ))}
    </div>
  )
}

export function Loading({ 
  variant = 'spinner', 
  size = 'md', 
  className, 
  text 
}: LoadingProps) {
  const LoadingComponent = {
    spinner: SpinnerLoading,
    dots: DotsLoading,
    pulse: PulseLoading,
    skeleton: SkeletonLoading,
    wave: WaveLoading
  }[variant]

  return (
    <div className={cn('flex flex-col items-center gap-3', className)}>
      <LoadingComponent size={size} className={className} />
      {text && (
        <motion.p
          className="text-sm text-neutral-600 dark:text-neutral-400"
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          {text}
        </motion.p>
      )}
    </div>
  )
}

// Full page loading overlay
export function LoadingOverlay({ 
  isVisible, 
  text = 'Loading...', 
  variant = 'wave' 
}: {
  isVisible: boolean
  text?: string
  variant?: LoadingProps['variant']
}) {
  if (!isVisible) return null

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-white/80 dark:bg-dark-bg/80 backdrop-blur-sm"
    >
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="flex flex-col items-center gap-4 p-8 rounded-3xl bg-white/90 dark:bg-dark-bg/90 border border-neutral-200 dark:border-dark-border shadow-xl"
      >
        <Loading variant={variant} size="lg" text={text} />
      </motion.div>
    </motion.div>
  )
}