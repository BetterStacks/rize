'use client'

import { GalleryItemProps } from '@/lib/types'
import { isImageUrl } from '@/lib/utils'
import { ChevronLeft, ChevronRight, X } from 'lucide-react'
import Image from 'next/image'
import { useCallback, useEffect } from 'react'
import { Button } from '../ui/button'
import { Dialog, DialogContent, DialogOverlay, DialogPortal, DialogTitle } from '../ui/dialog'

interface GalleryLightboxProps {
  items: GalleryItemProps[]
  currentIndex: number
  isOpen: boolean
  onClose: () => void
  onNavigate: (index: number) => void
}

export function GalleryLightbox({
  items,
  currentIndex,
  isOpen,
  onClose,
  onNavigate,
}: GalleryLightboxProps) {
  const currentItem = items[currentIndex]

  const goToPrevious = useCallback(() => {
    const newIndex = currentIndex > 0 ? currentIndex - 1 : items.length - 1
    onNavigate(newIndex)
  }, [currentIndex, items.length, onNavigate])

  const goToNext = useCallback(() => {
    const newIndex = currentIndex < items.length - 1 ? currentIndex + 1 : 0
    onNavigate(newIndex)
  }, [currentIndex, items.length, onNavigate])

  // Keyboard navigation
  useEffect(() => {
    if (!isOpen) return

    const handleKeyDown = (event: KeyboardEvent) => {
      switch (event.key) {
        case 'ArrowLeft':
          event.preventDefault()
          goToPrevious()
          break
        case 'ArrowRight':
          event.preventDefault()
          goToNext()
          break
        case 'Escape':
          event.preventDefault()
          onClose()
          break
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, goToPrevious, goToNext, onClose])

  if (!currentItem) return null

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogPortal>
        <DialogOverlay className="bg-black/90 backdrop-blur-sm" />
        <DialogContent className="max-w-none w-screen h-screen max-h-screen p-0 border-0 bg-transparent shadow-none overflow-hidden">
          {/* Visually hidden title for accessibility */}
          <DialogTitle className="sr-only">
            Gallery Image {currentIndex + 1} of {items.length}
          </DialogTitle>
          {/* Close button */}
          <Button
            onClick={onClose}
            variant="ghost"
            size="icon"
            className="absolute top-4 right-4 z-50 bg-black/20 hover:bg-black/40 text-white border-0"
          >
            <X className="h-6 w-6" />
          </Button>

          {/* Navigation buttons */}
          {items.length > 1 && (
            <>
              <Button
                onClick={goToPrevious}
                variant="ghost"
                size="icon"
                className="absolute left-4 top-1/2 -translate-y-1/2 z-50 bg-black/20 hover:bg-black/40 text-white border-0"
              >
                <ChevronLeft className="h-8 w-8" />
              </Button>
              <Button
                onClick={goToNext}
                variant="ghost"
                size="icon"
                className="absolute right-4 top-1/2 -translate-y-1/2 z-50 bg-black/20 hover:bg-black/40 text-white border-0"
              >
                <ChevronRight className="h-8 w-8" />
              </Button>
            </>
          )}

          {/* Media content */}
          <div className="flex items-center justify-center w-full h-full p-2 sm:p-4 md:p-8">
            {currentItem?.url && isImageUrl(currentItem?.url) ? (
              <div className="relative w-full h-full flex items-center justify-center max-h-[calc(100vh-4rem)]">
                <Image
                  src={currentItem.url}
                  alt=""
                  fill
                  className="object-contain"
                  priority
                  sizes="100vw"
                />
              </div>
            ) : (
              <video
                src={currentItem?.url}
                controls
                autoPlay
                className="max-w-full max-h-full object-contain"
                style={{ maxHeight: 'calc(100vh - 4rem)' }}
              />
            )}
          </div>

          {/* Image counter */}
          {items.length > 1 && (
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/50 text-white px-3 py-1 rounded-full text-sm">
              {currentIndex + 1} / {items.length}
            </div>
          )}
        </DialogContent>
      </DialogPortal>
    </Dialog>
  )
}
