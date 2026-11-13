'use client'

import { useState, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Loader2, Plus, X } from 'lucide-react'
import { cn } from '@/lib/utils'
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

// Type assertion to fix @dnd-kit/sortable compatibility issue
const SortableContextComponent = SortableContext as any

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
    examples: ['Empowering others through technology', 'Creating sustainable solutions', 'Building inclusive communities']
  },
  {
    type: 'superpower' as const,
    title: 'Your Superpower',
    description: 'What\'s your unique strength or talent?',
    examples: ['Turning complex problems into simple solutions', 'Connecting diverse people', 'Seeing patterns others miss']
  },
  {
    type: 'value' as const,
    title: 'Core Values',
    description: 'What principles guide your decisions?',
    examples: ['Authenticity over perfection', 'Collaboration over competition', 'Growth over comfort']
  },
  {
    type: 'dream' as const,
    title: 'Big Dream',
    description: 'What change do you want to see in the world?',
    examples: ['A world where everyone has access to education', 'Technology that brings people together', 'Communities that support mental health']
  },
  {
    type: 'milestone' as const,
    title: 'Proud Milestone',
    description: 'What achievement are you most proud of?',
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
      className={cn(
        'relative rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink',
        isDragging && 'z-10 bg-surface opacity-80 shadow-raised'
      )}
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
      {/* Story elements: hairline-divided, drag to reorder */}
      {elements.length > 0 && (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContextComponent
            items={elements.map(el => el.id)}
            strategy={verticalListSortingStrategy}
          >
            <div className="divide-y divide-hairline border-y border-hairline">
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
          </SortableContextComponent>
        </DndContext>
      )}

      {elements.length > 1 && (
        <p className="-mt-3 text-xs text-ink-secondary">Drag a story to reorder it.</p>
      )}

      {/* "Add another" toggle once there's something on the list */}
      {elements.length > 0 && availablePrompts.length > 0 && (
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => setShowPrompts(!showPrompts)}
          aria-expanded={showPrompts}
          className="touch-target -ml-3 h-11 gap-1.5 px-3 text-sm text-ink-secondary hover:text-ink"
        >
          {showPrompts ? <X className="size-4" aria-hidden /> : <Plus className="size-4" aria-hidden />}
          {showPrompts ? 'Close' : 'Add another'}
        </Button>
      )}

      {/* Prompts: one row each, like the profile assistant's suggestions */}
      <AnimatePresence initial={false}>
        {showPrompts && availablePrompts.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2, ease: [0.2, 0.8, 0.2, 1] }}
            className="overflow-hidden"
          >
            <p className="mb-2 text-sm text-ink-secondary">
              {elements.length === 0 ? 'Pick one to start. You can change the words after.' : 'Pick one to add.'}
            </p>
            <ul className="flex flex-col border-t border-hairline" aria-label="Story prompts">
              {availablePrompts.map((prompt) => (
                <li key={prompt.type} className="border-b border-hairline">
                  <button
                    type="button"
                    onClick={() => handleAddElement(prompt.type)}
                    disabled={isLoading}
                    className="-mx-3 flex min-h-11 w-[calc(100%+1.5rem)] items-center gap-3 rounded-xl px-3 py-3 text-left transition-colors duration-fast ease-calm hover:bg-subtle focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink disabled:opacity-50"
                  >
                    <span className="min-w-0 flex-1">
                      <span className="block text-sm font-medium text-ink">{prompt.title}</span>
                      <span className="block text-sm leading-snug text-ink-secondary">{prompt.description}</span>
                      <span className="mt-0.5 block text-xs text-ink-secondary">
                        For example, &ldquo;{prompt.examples[0]}&rdquo;
                      </span>
                    </span>
                    <Plus className="size-4 shrink-0 text-ink-secondary" aria-hidden />
                  </button>
                </li>
              ))}
            </ul>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Empty: one line, one action */}
      {elements.length === 0 && !showPrompts && (
        <p className="flex flex-wrap items-center gap-x-2 text-[15px] text-ink-secondary">
          <span>No stories yet.</span>
          <span aria-hidden>·</span>
          <button
            type="button"
            onClick={() => setShowPrompts(true)}
            className="min-h-11 rounded-md font-medium text-ink underline decoration-brand decoration-2 underline-offset-4 hover:decoration-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
          >
            Add your first
          </button>
        </p>
      )}

      {isLoading && (
        <p role="status" className="flex items-center gap-2 text-sm text-ink-secondary">
          <Loader2 className="size-4 animate-spin" aria-hidden />
          Saving…
        </p>
      )}
    </div>
  )
}
