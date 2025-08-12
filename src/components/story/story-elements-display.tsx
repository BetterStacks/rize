'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Sparkles } from 'lucide-react'
import { motion } from 'framer-motion'
import { StoryElement } from '@/components/story/story-element'

interface StoryElementsDisplayProps {
  elements: StoryElement[]
  showTitle?: boolean
}

const typeConfig = {
  mission: { 
    label: 'Mission', 
    emoji: '🎯', 
    color: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
  },
  value: { 
    label: 'Value', 
    emoji: '💎', 
    color: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
  },
  milestone: { 
    label: 'Milestone', 
    emoji: '🏆', 
    color: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
  },
  dream: { 
    label: 'Dream', 
    emoji: '✨', 
    color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
  },
  superpower: { 
    label: 'Superpower', 
    emoji: '⚡', 
    color: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
  },
}

function StoryElementCard({ element }: { element: StoryElement }) {
  const config = typeConfig[element.type]

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="h-full">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2 mb-2">
            <Badge className={`${config.color} border-none`}>
              <span className="mr-1">{config.emoji}</span>
              {config.label}
            </Badge>
          </div>
          <CardTitle className="text-lg leading-tight">{element.title}</CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap leading-relaxed">
            {element.content}
          </p>
        </CardContent>
      </Card>
    </motion.div>
  )
}

export function StoryElementsDisplay({ 
  elements, 
  showTitle = true 
}: StoryElementsDisplayProps) {
  if (!elements || elements.length === 0) {
    return null
  }

  return (
    <div className="w-full max-w-2xl space-y-4">
      {showTitle && (
        <div className="space-y-1">
          <h3 className="text-xl font-semibold flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-purple-500" />
            Their Story
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Beyond the resume - what makes them unique
          </p>
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-1 md:grid-cols-2">
        {elements.map((element, index) => (
          <motion.div
            key={element.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
          >
            <StoryElementCard element={element} />
          </motion.div>
        ))}
      </div>

      {elements.length === 1 && (
        <div className="flex justify-center pt-2">
          <div className="text-xs text-gray-500 dark:text-gray-400 italic">
            More story elements coming soon...
          </div>
        </div>
      )}
    </div>
  )
}