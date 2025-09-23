'use client'

import { motion } from 'framer-motion'
import { 
  Sparkles, 
  Zap, 
  Heart, 
  Star, 
  Flame, 
  Coffee, 
  Music, 
  Camera,
  Palette,
  Code,
  Gamepad2,
  Rocket
} from 'lucide-react'
import Image from 'next/image'
import { useMemo } from 'react'
import { cn } from '@/lib/utils'

interface CreativeAvatarProps {
  src?: string | null
  name: string
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
  variant?: 'gradient' | 'emoji' | 'geometric' | 'neon' | 'minimal' | 'auto'
  className?: string
  fallbackStyle?: 'initials' | 'creative'
  showHoverEffect?: boolean
}

const sizeClasses = {
  xs: 'w-6 h-6 text-xs',
  sm: 'w-8 h-8 text-sm', 
  md: 'w-10 h-10 text-base',
  lg: 'w-12 h-12 text-lg',
  xl: 'w-16 h-16 text-xl'
}

const emojiSizes = {
  xs: 'text-xs',
  sm: 'text-sm',
  md: 'text-base',
  lg: 'text-lg',
  xl: 'text-2xl'
}

const iconSizes = {
  xs: 'w-3 h-3',
  sm: 'w-4 h-4',
  md: 'w-5 h-5', 
  lg: 'w-6 h-6',
  xl: 'w-8 h-8'
}

// Gen Z/Alpha themed gradients
const gradients = [
  'bg-gradient-to-br from-purple-400 via-pink-500 to-red-500', // Sunset vibes
  'bg-gradient-to-br from-blue-400 via-purple-500 to-pink-500', // Cotton candy
  'bg-gradient-to-br from-green-400 via-blue-500 to-purple-600', // Ocean waves
  'bg-gradient-to-br from-yellow-400 via-orange-500 to-red-500', // Fire energy
  'bg-gradient-to-br from-pink-400 via-purple-500 to-amber-500', // Galaxy dreams
  'bg-gradient-to-br from-teal-400 via-green-500 to-blue-500', // Tropical paradise
  'bg-gradient-to-br from-orange-400 via-pink-500 to-purple-600', // Neon sunset
  'bg-gradient-to-br from-amber-400 via-purple-500 to-pink-500', // Cosmic energy
]

// Fun emojis that Gen Z/Alpha love
const emojiSets = [
  ['🚀', '✨', '🌟', '💫'], // Space vibes
  ['🎨', '🎭', '🎪', '🎨'], // Creative energy
  ['🌈', '🦄', '🍭', '💖'], // Aesthetic vibes
  ['⚡', '🔥', '💥', '⭐'], // Energy/power
  ['🌊', '🏄‍♀️', '🐚', '🌺'], // Beach/chill
  ['🎮', '🕹️', '👾', '🎯'], // Gaming culture
  ['📱', '💻', '⌨️', '🖱️'], // Tech life
  ['🎵', '🎧', '🎤', '🎹'], // Music lovers
]

// Creative icons for different personalities
const creativeIcons = [
  Sparkles, Zap, Heart, Star, Flame, Coffee, Music, Camera,
  Palette, Code, Gamepad2, Rocket
]

// Generate consistent hash from string
function stringToHash(str: string): number {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash = hash & hash // Convert to 32-bit integer
  }
  return Math.abs(hash)
}

// Get initials from name
function getInitials(name: string): string {
  if (!name) return '?'
  
  const words = name.trim().split(' ')
  if (words.length === 1) {
    return words[0].charAt(0).toUpperCase()
  }
  
  return (words[0].charAt(0) + words[words.length - 1].charAt(0)).toUpperCase()
}

export function CreativeAvatar({ 
  src, 
  name, 
  size = 'md', 
  variant = 'auto',
  className,
  fallbackStyle = 'creative',
  showHoverEffect = true
}: CreativeAvatarProps) {
  
  // Check if src is a creative avatar format
  const isCreativeAvatar = src?.startsWith('creative-')
  const { creativeVariantFromSrc, creativeTimestamp } = useMemo(() => {
    if (!isCreativeAvatar || !src) return { creativeVariantFromSrc: null, creativeTimestamp: null }
    const parts = src.split('-')
    if (parts.length >= 3) {
      return {
        creativeVariantFromSrc: parts[1] as 'gradient' | 'emoji' | 'geometric' | 'neon' | 'minimal',
        creativeTimestamp: parts[2]
      }
    }
    return { creativeVariantFromSrc: null, creativeTimestamp: null }
  }, [src, isCreativeAvatar])

  const hash = useMemo(() => {
    // Use creative timestamp for hash if available, otherwise use name
    const hashSource = creativeTimestamp || name || 'Anonymous'
    return stringToHash(hashSource)
  }, [name, creativeTimestamp])
  
  // Determine variant based on name if auto
  const finalVariant = useMemo(() => {
    // If we have a creative avatar format, use that variant
    if (creativeVariantFromSrc) return creativeVariantFromSrc
    
    if (variant !== 'auto') return variant
    
    // Use hash to determine variant
    const variants = ['gradient', 'emoji', 'geometric', 'neon', 'minimal']
    return variants[hash % variants.length] as typeof variant
  }, [variant, hash, creativeVariantFromSrc])

  // Select style elements based on hash
  const gradientClass = gradients[hash % gradients.length]
  const emojiSet = emojiSets[hash % emojiSets.length]
  const emoji = emojiSet[hash % emojiSet.length]
  const IconComponent = creativeIcons[hash % creativeIcons.length]
  
  
  const initials = getInitials(name)

  // Render actual image if available (but not creative avatar format)
  if (src && !isCreativeAvatar) {
    return (
      <motion.div
        className={cn(
          'relative rounded-full overflow-hidden',
          sizeClasses[size],
          showHoverEffect && 'hover:scale-105 transition-transform duration-200',
          className
        )}
        whileHover={showHoverEffect ? { scale: 1.05 } : undefined}
        transition={{ type: 'spring', stiffness: 300, damping: 20 }}
      >
        <Image
          src={src}
          alt={`${name} avatar`}
          fill
          className="object-cover rounded-full"
          sizes={`${sizeClasses[size]}`}
        />
        
        {/* Subtle overlay for better contrast */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent rounded-full" />
      </motion.div>
    )
  }

  // Fallback to creative avatars
  const renderCreativeAvatar = () => {
    switch (finalVariant) {
      case 'gradient':
        return (
          <div className={cn('w-full h-full flex items-center justify-center text-white font-bold', gradientClass)}>
            {fallbackStyle === 'initials' ? initials : <IconComponent className={iconSizes[size]} />}
          </div>
        )
      
      case 'emoji':
        return (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-900">
            <span className={emojiSizes[size]}>{emoji}</span>
          </div>
        )
      
      case 'geometric':
        const shapes = ['rounded-lg', 'rounded-full', 'rounded-none', 'rounded-xl']
        const shapeClass = shapes[hash % shapes.length]
        return (
          <div className={cn('w-full h-full flex items-center justify-center text-white font-bold', gradientClass)}>
            <div className={cn('w-2/3 h-2/3 bg-white/30 flex items-center justify-center', shapeClass)}>
              {fallbackStyle === 'initials' ? initials : <IconComponent className={iconSizes[size]} />}
            </div>
          </div>
        )
      
      case 'neon':
        return (
          <div className="w-full h-full flex items-center justify-center bg-black relative overflow-hidden">
            <div className={cn('absolute inset-0', gradientClass, 'opacity-80')} />
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
            <div className="relative z-10 text-white font-bold flex items-center justify-center">
              {fallbackStyle === 'initials' ? initials : <IconComponent className={iconSizes[size]} />}
            </div>
            
            {/* Neon glow effect */}
            <div className={cn('absolute inset-0 blur-sm', gradientClass, 'opacity-50')} />
          </div>
        )
      
      case 'minimal':
        const colors = [
          'bg-slate-500', 'bg-gray-500', 'bg-zinc-500', 'bg-neutral-500',
          'bg-stone-500', 'bg-red-500', 'bg-orange-500', 'bg-amber-500',
          'bg-yellow-500', 'bg-lime-500', 'bg-green-500', 'bg-emerald-500',
          'bg-teal-500', 'bg-cyan-500', 'bg-sky-500', 'bg-blue-500',
          'bg-amber-500', 'bg-yellow-500', 'bg-purple-500', 'bg-fuchsia-500',
          'bg-pink-500', 'bg-rose-500'
        ]
        const color = colors[hash % colors.length]
        return (
          <div className={cn('w-full h-full flex items-center justify-center text-white font-semibold', color)}>
            {initials}
          </div>
        )
      
      default:
        return (
          <div className={cn('w-full h-full flex items-center justify-center text-white font-bold', gradientClass)}>
            {initials}
          </div>
        )
    }
  }

  return (
    <motion.div
      className={cn(
        'relative rounded-full overflow-hidden',
        sizeClasses[size],
        showHoverEffect && 'hover:scale-105 cursor-pointer',
        className
      )}
      whileHover={showHoverEffect ? { scale: 1.05, rotate: 2 } : undefined}
      whileTap={showHoverEffect ? { scale: 0.95 } : undefined}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
    >
      {renderCreativeAvatar()}
      
      {/* Hover sparkle effect */}
      {showHoverEffect && (
        <motion.div
          className="absolute -top-1 -right-1 text-yellow-400"
          initial={{ opacity: 0, scale: 0 }}
          whileHover={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
        >
          <Sparkles className="w-3 h-3" />
        </motion.div>
      )}
    </motion.div>
  )
}

// Convenience component for different use cases
export function ProfileAvatar(props: Omit<CreativeAvatarProps, 'size' | 'variant'>) {
  return <CreativeAvatar {...props} size="xl" variant="gradient" />
}

export function PostAvatar(props: Omit<CreativeAvatarProps, 'size' | 'showHoverEffect'>) {
  return <CreativeAvatar {...props} size="md" showHoverEffect={false} />
}

export function CommentAvatar(props: Omit<CreativeAvatarProps, 'size' | 'showHoverEffect'>) {
  return <CreativeAvatar {...props} size="sm" showHoverEffect={false} />
}

export function NavAvatar(props: Omit<CreativeAvatarProps, 'size'>) {
  return <CreativeAvatar {...props} size="md" />
}