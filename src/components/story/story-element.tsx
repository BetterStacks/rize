'use client'

import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import { Trash2, Pencil, GripVertical, Eye, EyeOff } from 'lucide-react'
import { useId, useState } from 'react'
import { motion } from 'framer-motion'

import { TStoryElement } from '@/lib/types'

export type StoryElement = TStoryElement;

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
    prompt: 'What drives you? What\'s your purpose?'
  },
  value: {
    label: 'Value',
    prompt: 'What principles guide your decisions?'
  },
  milestone: {
    label: 'Milestone',
    prompt: 'What achievement are you most proud of?'
  },
  dream: {
    label: 'Dream',
    prompt: 'What change do you want to see in the world?'
  },
  superpower: {
    label: 'Superpower',
    prompt: 'What\'s your unique strength?'
  },
}

const iconButton = 'size-9 touch-target text-ink-secondary hover:text-ink'

/** One story element: a quiet row with its type, title and the person's words. */
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
  const publicId = useId()

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
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.18, ease: [0.2, 0.8, 0.2, 1] }}
      className="flex gap-2 py-5"
    >
      {/* The whole row drags (see story-prompts); the grip just shows it. */}
      <GripVertical className="mt-1 size-4 shrink-0 cursor-grab text-ink-secondary/60" aria-hidden />

      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between gap-2">
          <p className="flex items-center gap-1.5 text-xs font-medium text-ink-secondary">
            {config.label}
            {!element.isPublic && (
              <>
                <span aria-hidden>·</span>
                <EyeOff className="size-3.5" aria-hidden />
                Private
              </>
            )}
          </p>

          {!isEditing && (
            <div className="-my-2 -mr-2 flex items-center">
              <Button
                variant="ghost"
                size="smallIcon"
                onClick={() => onToggleVisibility?.(element.id, !element.isPublic)}
                aria-label={element.isPublic ? `Make "${element.title}" private` : `Show "${element.title}" on your profile`}
                className={iconButton}
              >
                {element.isPublic ? <Eye className="size-4" aria-hidden /> : <EyeOff className="size-4" aria-hidden />}
              </Button>
              <Button
                variant="ghost"
                size="smallIcon"
                onClick={() => onEdit?.(element)}
                aria-label={`Edit "${element.title}"`}
                className={iconButton}
              >
                <Pencil className="size-4" aria-hidden />
              </Button>
              <Button
                variant="ghost"
                size="smallIcon"
                onClick={() => onDelete?.(element.id)}
                aria-label={`Delete "${element.title}"`}
                className="size-9 touch-target text-ink-secondary hover:text-danger"
              >
                <Trash2 className="size-4" aria-hidden />
              </Button>
            </div>
          )}
        </div>

        {isEditing ? (
          <div className="mt-3 space-y-3">
            <Input
              value={editData.title}
              onChange={(e) => setEditData(prev => ({ ...prev, title: e.target.value }))}
              placeholder="Title"
              aria-label="Title"
              className="font-medium"
            />
            <Textarea
              value={editData.content}
              onChange={(e) => setEditData(prev => ({ ...prev, content: e.target.value }))}
              placeholder={config.prompt}
              aria-label="In your words"
              className="min-h-[100px] resize-none"
            />

            <div className="flex flex-wrap items-center justify-between gap-3">
              <label htmlFor={publicId} className="flex min-h-11 items-center gap-2 text-sm text-ink">
                <Checkbox
                  id={publicId}
                  checked={editData.isPublic}
                  onCheckedChange={(v) => setEditData(prev => ({ ...prev, isPublic: v === true }))}
                />
                Show on my profile
              </label>

              <div className="flex gap-2">
                <Button variant="outline" size="sm" className="touch-target" onClick={handleCancel}>
                  Cancel
                </Button>
                <Button size="sm" className="touch-target" onClick={handleSave}>
                  Save
                </Button>
              </div>
            </div>
          </div>
        ) : (
          <>
            <h3 className="mt-1 text-base font-medium text-ink">{element.title}</h3>
            <p className="mt-1 whitespace-pre-wrap text-[15px] leading-relaxed text-ink">
              {element.content}
            </p>
          </>
        )}
      </div>
    </motion.div>
  )
}
