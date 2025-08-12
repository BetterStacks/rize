'use client'

import { useState, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Plus, Sparkles } from 'lucide-react'
import { StoryElement } from './story-element'
import { motion, AnimatePresence } from 'framer-motion'
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core'
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import {
  useSortable,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'

interface StoryPromptsProps {
  elements: StoryElement[]
  onAddElement: (type: StoryElement['type']) => void
  onUpdateElement: (element: StoryElement) => void
  onDeleteElement: (elementId: string) => void
  onToggleVisibility: (elementId: string, isPublic: boolean) => void
  onReorderElements: (elements: StoryElement[]) => void
  isLoading?: boolean
}

const storyPrompts = [
  {
    type: 'mission' as const,
    title: 'Personal Mission',
    description: 'What drives you? What\'s your purpose in life?',
    emoji: '🎯',
    examples: ['Empowering others through technology', 'Creating sustainable solutions', 'Building inclusive communities']
  },
  {
    type: 'superpower' as const,
    title: 'Your Superpower',
    description: 'What\'s your unique strength or talent?',
    emoji: '⚡',
    examples: ['Turning complex problems into simple solutions', 'Connecting diverse people', 'Seeing patterns others miss']
  },
  {
    type: 'value' as const,
    title: 'Core Values',
    description: 'What principles guide your decisions?',
    emoji: '💎',
    examples: ['Authenticity over perfection', 'Collaboration over competition', 'Growth over comfort']
  },
  {
    type: 'dream' as const,
    title: 'Big Dream',
    description: 'What change do you want to see in the world?',
    emoji: '✨',
    examples: ['A world where everyone has access to education', 'Technology that brings people together', 'Communities that support mental health']
  },
  {
    type: 'milestone' as const,
    title: 'Proud Milestone',
    description: 'What achievement are you most proud of?',
    emoji: '🏆',
    examples: ['Built my first app at 16', 'Organized a community fundraiser', 'Overcame a major fear']
  },
]

interface SortableStoryElementProps {
  element: StoryElement
  isEditing: boolean
  onEdit: (element: StoryElement) => void
  onDelete: (elementId: string) => void
  onToggleVisibility: (elementId: string, isPublic: boolean) => void
  onSave: (element: StoryElement) => void
  onCancel: () => void
}

function SortableStoryElement({
  element,
  isEditing,
  onEdit,
  onDelete,
  onToggleVisibility,
  onSave,
  onCancel
}: SortableStoryElementProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: element.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  return (
    <div 
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={isDragging ? 'opacity-50' : ''}
    >
      <StoryElement
        element={element}
        isEditing={isEditing}
        onEdit={onEdit}
        onDelete={onDelete}
        onToggleVisibility={onToggleVisibility}
        onSave={onSave}
        onCancel={onCancel}
      />
    </div>
  )
}

export function StoryPrompts({
  elements,
  onAddElement,
  onUpdateElement,
  onDeleteElement,
  onToggleVisibility,
  onReorderElements,
  isLoading
}: StoryPromptsProps) {
  const [editingElementId, setEditingElementId] = useState<string | null>(null)
  const [showPrompts, setShowPrompts] = useState(elements.length === 0)

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  const handleDragEnd = useCallback((event: DragEndEvent) => {
    const { active, over } = event

    if (over && active.id !== over.id) {
      const oldIndex = elements.findIndex((element) => element.id === active.id)
      const newIndex = elements.findIndex((element) => element.id === over.id)

      const reorderedElements = arrayMove(elements, oldIndex, newIndex).map((element, index) => ({
        ...element,
        order: index
      }))

      onReorderElements(reorderedElements)
    }
  }, [elements, onReorderElements])

  const handleEdit = useCallback((element: StoryElement) => {
    setEditingElementId(element.id)
  }, [])

  const handleSave = useCallback((element: StoryElement) => {
    onUpdateElement(element)
    setEditingElementId(null)
  }, [onUpdateElement])

  const handleCancel = useCallback(() => {
    setEditingElementId(null)
  }, [])

  const handleDelete = useCallback((elementId: string) => {
    onDeleteElement(elementId)
    if (editingElementId === elementId) {
      setEditingElementId(null)
    }
  }, [onDeleteElement, editingElementId])

  const handleAddElement = useCallback((type: StoryElement['type']) => {
    onAddElement(type)
    setShowPrompts(false)
  }, [onAddElement])

  const existingTypes = new Set(elements.map(el => el.type))
  const availablePrompts = storyPrompts.filter(prompt => !existingTypes.has(prompt.type))

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-purple-500" />
            Your Story Elements
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Share what makes you unique beyond your resume
          </p>
        </div>

        {elements.length > 0 && availablePrompts.length > 0 && (
          <Button
            variant="outline"
            onClick={() => setShowPrompts(!showPrompts)}
            className="flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            Add Story
          </Button>
        )}
      </div>

      {/* Story Elements */}
      {elements.length > 0 && (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={elements.map(el => el.id)}
            strategy={verticalListSortingStrategy}
          >
            <div className="space-y-4">
              <AnimatePresence>
                {elements.map((element) => (
                  <SortableStoryElement
                    key={element.id}
                    element={element}
                    isEditing={editingElementId === element.id}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                    onToggleVisibility={onToggleVisibility}
                    onSave={handleSave}
                    onCancel={handleCancel}
                  />
                ))}
              </AnimatePresence>
            </div>
          </SortableContext>
        </DndContext>
      )}

      {/* Story Prompts */}
      <AnimatePresence>
        {showPrompts && availablePrompts.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <Card className="border-dashed border-2 border-purple-200 dark:border-purple-800 bg-purple-50/50 dark:bg-purple-900/10">
              <CardHeader>
                <CardTitle className="text-purple-700 dark:text-purple-300 flex items-center gap-2">
                  <Sparkles className="h-5 w-5" />
                  Tell Your Story
                </CardTitle>
                <p className="text-sm text-purple-600 dark:text-purple-400">
                  Choose a story element to add to your profile. These help others understand who you are beyond your work.
                </p>
              </CardHeader>
              <CardContent>
                <div className="grid gap-3 sm:grid-cols-2">
                  {availablePrompts.map((prompt) => (
                    <motion.div
                      key={prompt.type}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <Card 
                        className="cursor-pointer hover:border-purple-300 dark:hover:border-purple-600 transition-colors group"
                        onClick={() => handleAddElement(prompt.type)}
                      >
                        <CardContent className="p-4">
                          <div className="flex items-start gap-3">
                            <span className="text-2xl">{prompt.emoji}</span>
                            <div className="space-y-1 flex-1">
                              <h4 className="font-medium text-sm group-hover:text-purple-700 dark:group-hover:text-purple-300 transition-colors">
                                {prompt.title}
                              </h4>
                              <p className="text-xs text-gray-600 dark:text-gray-400">
                                {prompt.description}
                              </p>
                              <div className="pt-1">
                                <p className="text-xs text-gray-500 dark:text-gray-500 italic">
                                  e.g. "{prompt.examples[0]}"
                                </p>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </div>

                {availablePrompts.length === 0 && (
                  <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                    <Sparkles className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p>You've added all available story elements!</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Empty State */}
      {elements.length === 0 && !showPrompts && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center py-12"
        >
          <Sparkles className="h-12 w-12 mx-auto mb-4 text-gray-400" />
          <h3 className="text-lg font-medium mb-2">Share Your Story</h3>
          <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-md mx-auto">
            Add story elements to showcase what makes you unique beyond your resume. 
            Let others understand your values, dreams, and what drives you.
          </p>
          <Button
            onClick={() => setShowPrompts(true)}
            className="flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            Add Your First Story
          </Button>
        </motion.div>
      )}

      {isLoading && (
        <div className="text-center py-8 text-gray-500">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
        </div>
      )}
    </div>
  )
}