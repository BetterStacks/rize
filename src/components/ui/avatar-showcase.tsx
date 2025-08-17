'use client'

import { motion } from 'framer-motion'
import { CreativeAvatar } from './creative-avatar'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './card'

interface AvatarShowcaseProps {
  name: string
  onSelectVariant?: (variant: string) => void
}

export function AvatarShowcase({ name, onSelectVariant }: AvatarShowcaseProps) {
  const variants = [
    {
      id: 'gradient',
      name: 'Gradient Vibes',
      description: 'Colorful gradients that pop ✨',
    },
    {
      id: 'emoji',
      name: 'Emoji Energy',
      description: 'Express yourself with fun emojis 🚀',
    },
    {
      id: 'geometric', 
      name: 'Geometric Art',
      description: 'Clean shapes and modern design 🔷',
    },
    {
      id: 'neon',
      name: 'Neon Dreams',
      description: 'Cyberpunk aesthetics that glow 💫',
    },
    {
      id: 'minimal',
      name: 'Minimal Clean',
      description: 'Simple and sophisticated 🎯',
    },
  ] as const

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h3 className="text-lg font-semibold">Choose Your Vibe</h3>
        <p className="text-sm text-neutral-600 dark:text-neutral-400">
          Pick an avatar style that matches your personality
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {variants.map((variant, index) => (
          <motion.div
            key={variant.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card 
              className="cursor-pointer hover:shadow-lg transition-shadow group"
              onClick={() => onSelectVariant?.(variant.id)}
            >
              <CardHeader className="pb-2">
                <div className="flex justify-center mb-3">
                  <CreativeAvatar
                    src={null}
                    name={name}
                    size="lg"
                    variant={variant.id}
                    showHoverEffect={true}
                  />
                </div>
                <CardTitle className="text-sm text-center">{variant.name}</CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <CardDescription className="text-xs text-center">
                  {variant.description}
                </CardDescription>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <div className="bg-neutral-50 dark:bg-neutral-800/50 rounded-2xl p-4 space-y-3">
        <h4 className="font-medium text-sm">Pro Tip ✨</h4>
        <p className="text-xs text-neutral-600 dark:text-neutral-400">
          Your avatar is automatically generated based on your name, so it's unique to you! 
          Each style creates a different vibe while keeping your personal touch.
        </p>
      </div>
    </div>
  )
}

// Component to show different sizes
export function AvatarSizeDemo({ name }: { name: string }) {
  const sizes = [
    { id: 'xs', label: 'Extra Small' },
    { id: 'sm', label: 'Small' },
    { id: 'md', label: 'Medium' },
    { id: 'lg', label: 'Large' },
    { id: 'xl', label: 'Extra Large' },
  ] as const

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-center">Avatar Sizes</h3>
      
      <div className="flex items-end justify-center gap-4 flex-wrap">
        {sizes.map((size) => (
          <div key={size.id} className="flex flex-col items-center gap-2">
            <CreativeAvatar
              src={null}
              name={name}
              size={size.id}
              variant="gradient"
            />
            <span className="text-xs text-neutral-600 dark:text-neutral-400">
              {size.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}