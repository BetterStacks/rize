'use client'

import { createPage } from '@/actions/page-actions'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { FileText, Plus } from 'lucide-react'
import { useParams, useRouter } from 'next/navigation'
import { useState } from 'react'
import toast from 'react-hot-toast'
import { Button } from '../ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog'
import { Input } from '../ui/input'
import { Label } from '../ui/label'

interface CreatePageDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function CreatePageDialog({ open, onOpenChange }: CreatePageDialogProps) {
  const [title, setTitle] = useState('')
  const router = useRouter()
  const queryClient = useQueryClient()
  const { username } = useParams<{ username: string }>()

  const { mutate: createNewPage, isPending: isCreating } = useMutation({
    mutationFn: () => createPage(title.trim() || undefined),
    onSuccess: (result) => {
      if (result?.error) {
        toast.error(result.error)
        return
      }
      
      toast.success('Page created successfully!')
      
      // Invalidate and refetch writings
      queryClient.invalidateQueries({ queryKey: ['get-writings', username] })
      
      // Navigate to the new page
      router.push(`/page/${result?.data?.id}`)
      
      // Reset form and close dialog
      setTitle('')
      onOpenChange(false)
    },
    onError: (error) => {
      toast.error('Failed to create page')
      console.error('Error creating page:', error)
    },
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    createNewPage()
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-gradient-to-br from-yellow-100 to-amber-100 dark:from-yellow-900/20 dark:to-amber-900/20">
              <FileText className="w-4 h-4 text-yellow-500 dark:text-yellow-400" />
            </div>
            Create New Page
          </DialogTitle>
          <DialogDescription>
            Give your page a memorable title. You can always change it later.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Page Title</Label>
            <Input
              id="title"
              placeholder="Enter a title for your page..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              disabled={isCreating}
              autoFocus
              maxLength={100}
            />
            <p className="text-sm text-neutral-500 dark:text-neutral-400">
              Leave empty for a random creative title
            </p>
          </div>
          
          <DialogFooter className="flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isCreating}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isCreating}
              className="bg-gradient-to-r from-yellow-500 to-amber-500 hover:from-yellow-600 hover:to-amber-600"
            >
              {isCreating ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                  Creating...
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4 mr-2" />
                  Create Page
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}