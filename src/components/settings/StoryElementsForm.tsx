'use client'

import { useState, useCallback, useTransition } from 'react'
import { useSession } from '@/lib/auth-client'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'react-hot-toast'
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
import { AlertCircle } from 'lucide-react'

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
        toast.success('Added')
      } else {
        toast.error(typeof result.error === 'string' ? result.error : "Couldn't add that")
      }
    },
    onError: (error) => {
      toast.error("Couldn't add that")
      console.error('Create story element error:', error)
    },
  })

  const updateMutation = useMutation({
    mutationFn: updateStoryElement,
    onSuccess: (result) => {
      if (result.success) {
        queryClient.invalidateQueries({ queryKey: ['my-story-elements'] })
        toast.success('Saved')
      } else {
        toast.error(typeof result.error === 'string' ? result.error : "Couldn't save that")
      }
    },
    onError: (error) => {
      toast.error("Couldn't save that")
      console.error('Update story element error:', error)
    },
  })

  const deleteMutation = useMutation({
    mutationFn: deleteStoryElement,
    onSuccess: (result) => {
      if (result.success) {
        queryClient.invalidateQueries({ queryKey: ['my-story-elements'] })
        toast.success('Deleted')
      } else {
        toast.error(typeof result.error === 'string' ? result.error : "Couldn't delete that")
      }
    },
    onError: (error) => {
      toast.error("Couldn't delete that")
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
          toast.success(isPublic ? 'Shown on your profile' : 'Now private')
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
    return <p className="text-sm text-ink-secondary">Sign in to add your story.</p>
  }

  const elements = (storyElementsData?.success ? (storyElementsData.data || []) : []) as any[]

  // The settings page gives this its section title and description.
  return (
    <div className="w-full space-y-4">
      {storyElementsData?.success === false && (
        <p role="alert" className="flex items-start gap-2 text-sm text-danger">
          <AlertCircle className="mt-0.5 size-4 shrink-0" aria-hidden />
          Couldn&apos;t load your stories: {storyElementsData.error}
        </p>
      )}

      <StoryPrompts
        elements={elements}
        onAddElement={handleAddElement}
        onUpdateElement={handleUpdateElement}
        onDeleteElement={handleDeleteElement}
        onToggleVisibility={handleToggleVisibility}
        onReorderElements={handleReorderElements}
        isLoading={isLoading || createMutation.isPending || updateMutation.isPending || deleteMutation.isPending || isPending}
      />
    </div>
  )
}
