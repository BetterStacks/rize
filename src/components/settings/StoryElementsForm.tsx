'use client'

import { useState, useCallback, useTransition } from 'react'
import { useSession } from '@/lib/auth-client'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'react-hot-toast'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { StoryPrompts } from '@/components/story/story-prompts'
import { 
  getMyStoryElements, 
  createStoryElement, 
  updateStoryElement, 
  deleteStoryElement, 
  reorderStoryElements,
  toggleStoryElementVisibility 
} from '@/actions/story-actions'
import { StoryElement } from '@/components/story/story-element'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Sparkles, AlertCircle } from 'lucide-react'

export function StoryElementsForm() {
  const { data: session } = useSession()
  const queryClient = useQueryClient()
  const [isPending, startTransition] = useTransition()

  const { data: storyElementsData, isLoading } = useQuery({
    queryKey: ['my-story-elements'],
    queryFn: getMyStoryElements,
    enabled: !!session?.user?.id,
  })

  const createMutation = useMutation({
    mutationFn: createStoryElement,
    onSuccess: (result) => {
      if (result.success) {
        queryClient.invalidateQueries({ queryKey: ['my-story-elements'] })
        toast.success('Story element added!')
      } else {
        toast.error(typeof result.error === 'string' ? result.error : 'Failed to add story element')
      }
    },
    onError: (error) => {
      toast.error('Failed to add story element')
      console.error('Create story element error:', error)
    },
  })

  const updateMutation = useMutation({
    mutationFn: updateStoryElement,
    onSuccess: (result) => {
      if (result.success) {
        queryClient.invalidateQueries({ queryKey: ['my-story-elements'] })
        toast.success('Story element updated!')
      } else {
        toast.error(typeof result.error === 'string' ? result.error : 'Failed to update story element')
      }
    },
    onError: (error) => {
      toast.error('Failed to update story element')
      console.error('Update story element error:', error)
    },
  })

  const deleteMutation = useMutation({
    mutationFn: deleteStoryElement,
    onSuccess: (result) => {
      if (result.success) {
        queryClient.invalidateQueries({ queryKey: ['my-story-elements'] })
        toast.success('Story element deleted')
      } else {
        toast.error(typeof result.error === 'string' ? result.error : 'Failed to delete story element')
      }
    },
    onError: (error) => {
      toast.error('Failed to delete story element')
      console.error('Delete story element error:', error)
    },
  })

  const handleAddElement = useCallback((type: StoryElement['type']) => {
    // Create with default content based on type
    const defaultContent = {
      mission: 'What drives you? Share your personal mission or purpose.',
      value: 'What principles guide your decisions? Share a core value.',
      milestone: 'What achievement are you most proud of? Tell your story.',
      dream: 'What change do you want to see? Share your vision.',
      superpower: 'What\'s your unique strength? What makes you special?'
    }

    const defaultTitles = {
      mission: 'My Mission',
      value: 'Core Value',
      milestone: 'Proud Achievement',
      dream: 'My Vision',
      superpower: 'My Superpower'
    }

    createMutation.mutate({
      type,
      title: defaultTitles[type],
      content: defaultContent[type],
      isPublic: true,
      order: storyElementsData?.data?.length || 0,
    })
  }, [createMutation, storyElementsData?.data?.length])

  const handleUpdateElement = useCallback((element: StoryElement) => {
    updateMutation.mutate({
      id: element.id,
      title: element.title,
      content: element.content,
      isPublic: element.isPublic,
    })
  }, [updateMutation])

  const handleDeleteElement = useCallback((elementId: string) => {
    if (window.confirm('Are you sure you want to delete this story element?')) {
      deleteMutation.mutate(elementId)
    }
  }, [deleteMutation])

  const handleToggleVisibility = useCallback((elementId: string, isPublic: boolean) => {
    startTransition(async () => {
      try {
        const result = await toggleStoryElementVisibility(elementId, isPublic)
        if (result.success) {
          queryClient.invalidateQueries({ queryKey: ['my-story-elements'] })
          toast.success(isPublic ? 'Made public' : 'Made private')
        } else {
          toast.error(typeof result.error === 'string' ? result.error : 'Failed to update visibility')
        }
      } catch (error) {
        toast.error('Failed to update visibility')
        console.error('Toggle visibility error:', error)
      }
    })
  }, [queryClient])

  const handleReorderElements = useCallback((elements: StoryElement[]) => {
    const elementIds = elements.map(el => el.id)
    startTransition(async () => {
      try {
        const result = await reorderStoryElements(elementIds)
        if (result.success) {
          queryClient.invalidateQueries({ queryKey: ['my-story-elements'] })
        } else {
          toast.error(typeof result.error === 'string' ? result.error : 'Failed to reorder elements')
        }
      } catch (error) {
        toast.error('Failed to reorder elements')
        console.error('Reorder elements error:', error)
      }
    })
  }, [queryClient])

  if (!session?.user?.id) {
    return (
      <Card className="max-w-2xl">
        <CardContent className="p-6">
          <div className="flex items-center gap-3 text-orange-600 dark:text-orange-400">
            <AlertCircle className="h-5 w-5" />
            <p>Please log in to manage your story elements.</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  const elements = (storyElementsData?.success ? (storyElementsData.data || []) : []) as any[]

  return (
    <div className="space-y-4 w-full max-w-2xl">
      <div>
        <h2 className="text-2xl font-medium flex items-center gap-2">
          <Sparkles className="h-6 w-6 text-purple-500" />
          Story Elements
        </h2>
        <p className="text-sm opacity-80 mt-1">
          Share what makes you unique beyond your resume. These story elements help others understand your values, dreams, and what drives you.
        </p>
        <Separator className="my-4" />
      </div>

      <StoryPrompts
        elements={elements}
        onAddElement={handleAddElement}
        onUpdateElement={handleUpdateElement}
        onDeleteElement={handleDeleteElement}
        onToggleVisibility={handleToggleVisibility}
        onReorderElements={handleReorderElements}
        isLoading={isLoading || createMutation.isPending || updateMutation.isPending || deleteMutation.isPending || isPending}
      />

      {storyElementsData?.success === false && (
        <Card className="border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-900/10">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-red-600 dark:text-red-400">
              <AlertCircle className="h-4 w-4" />
              <p className="text-sm">
                Failed to load story elements: {storyElementsData.error}
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}