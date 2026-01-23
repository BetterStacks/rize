'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import { Trash2, Edit3, GripVertical, Eye, EyeOff } from 'lucide-react'
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

export interface StoryElement {
  id: string
  profileId: string
  type: 'mission' | 'value' | 'milestone' | 'dream' | 'superpower'
  title: string
  content: string
  order: number
  isPublic: boolean
  createdAt: Date
  updatedAt: Date
}

interface StoryElementProps {
  element: StoryElement
  isEditing?: boolean
  onEdit?: (element: StoryElement) => void
  onDelete?: (elementId: string) => void
  onToggleVisibility?: (elementId: string, isPublic: boolean) => void
  onSave?: (element: StoryElement) => void
  onCancel?: () => void
}

const typeConfig = {
  mission: {
    label: 'Mission',
    emoji: '🎯',
    color: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
    prompt: 'What drives you? What\'s your purpose?'
  },
  value: {
    label: 'Value',
    emoji: '💎',
    color: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
    prompt: 'What principles guide your decisions?'
  },
  milestone: {
    label: 'Milestone',
    emoji: '🏆',
    color: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
    prompt: 'What achievement are you most proud of?'
  },
  dream: {
    label: 'Dream',
    emoji: '✨',
    color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
    prompt: 'What change do you want to see in the world?'
  },
  superpower: {
    label: 'Superpower',
    emoji: '⚡',
    color: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
    prompt: 'What\'s your unique strength?'
  },
}

export function StoryElement({
  element,
  isEditing = false,
  onEdit,
  onDelete,
  onToggleVisibility,
  onSave,
  onCancel
}: StoryElementProps) {
  const [editData, setEditData] = useState({
    title: element.title,
    content: element.content,
    isPublic: element.isPublic
  })

  const config = typeConfig[element.type]

  const handleSave = () => {
    if (onSave) {
      onSave({
        ...element,
        title: editData.title,
        content: editData.content,
        isPublic: editData.isPublic,
        updatedAt: new Date()
      })
    }
  }

  const handleCancel = () => {
    setEditData({
      title: element.title,
      content: element.content,
      isPublic: element.isPublic
    })
    if (onCancel) {
      onCancel()
    }
  }

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.2 }}
      className="group"
    >
      <Card className="relative overflow-hidden border-2 hover:border-gray-300 dark:hover:border-gray-600 transition-colors">
        {/* Drag Handle */}
        <div className="absolute left-2 top-3 opacity-0 group-hover:opacity-100 transition-opacity cursor-grab">
          <GripVertical className="h-4 w-4 text-gray-400" />
        </div>

        <CardHeader className="pb-3 pl-10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Badge className={`${config.color} border-none`}>
                <span className="mr-1">{config.emoji}</span>
                {config.label}
              </Badge>
              {!element.isPublic && (
                <EyeOff className="h-4 w-4 text-gray-400" />
              )}
            </div>

            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onToggleVisibility?.(element.id, !element.isPublic)}
                className="h-8 w-8 p-0"
              >
                {element.isPublic ? (
                  <Eye className="h-3 w-3" />
                ) : (
                  <EyeOff className="h-3 w-3" />
                )}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onEdit?.(element)}
                className="h-8 w-8 p-0"
              >
                <Edit3 className="h-3 w-3" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onDelete?.(element.id)}
                className="h-8 w-8 p-0 text-red-500 hover:text-red-700"
              >
                <Trash2 className="h-3 w-3" />
              </Button>
            </div>
          </div>

          <AnimatePresence mode="wait">
            {isEditing ? (
              <motion.div
                key="editing"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <Input
                  value={editData.title}
                  onChange={(e) => setEditData(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Enter title..."
                  className="text-lg font-semibold"
                />
              </motion.div>
            ) : (
              <motion.div
                key="display"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <CardTitle className="text-lg">{element.title}</CardTitle>
              </motion.div>
            )}
          </AnimatePresence>
        </CardHeader>

        <CardContent className="pt-0 pl-10">
          <AnimatePresence mode="wait">
            {isEditing ? (
              <motion.div
                key="editing-content"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="space-y-4"
              >
                <Textarea
                  value={editData.content}
                  onChange={(e) => setEditData(prev => ({ ...prev, content: e.target.value }))}
                  placeholder={config.prompt}
                  className="min-h-[100px] resize-none"
                />

                <div className="flex items-center justify-between">
                  <label className="flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={editData.isPublic}
                      onChange={(e) => setEditData(prev => ({ ...prev, isPublic: e.target.checked }))}
                      className="rounded"
                    />
                    Make public
                  </label>

                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={handleCancel}>
                      Cancel
                    </Button>
                    <Button size="sm" onClick={handleSave}>
                      Save
                    </Button>
                  </div>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="display-content"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap leading-relaxed">
                  {element.content}
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </CardContent>
      </Card>
    </motion.div>
  )
}