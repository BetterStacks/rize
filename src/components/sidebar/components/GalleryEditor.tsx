'use client'

import { uploadMedia } from '@/actions/client-actions'
import { addGalleryItem } from '@/actions/gallery-actions'
import { useGalleryItems } from '@/components/gallery/gallery-context'
import GalleryLimit from '@/components/GalleryLimit'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { queryClient } from '@/lib/providers'
import { bytesToMB, cn, MAX_GALLERY_ITEMS } from '@/lib/utils'
import { useMutation } from '@tanstack/react-query'
import axios from 'axios'
import { FileImage, Loader, Upload, X } from 'lucide-react'
import Image from 'next/image'
import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { useDropzone } from 'react-dropzone'
import toast from 'react-hot-toast'
import { v4 } from 'uuid'

type MediaFile = {
  id: string
  url: string
  type: 'image' | 'video'
  file: File
}

const uploadMediaToAPI = async (formData: FormData) => {
  const res = await axios.post('/api/upload/files', formData)
  if (res.status !== 200) throw new Error('Upload failed')
  return res.data?.data
}

export function GalleryEditor() {
  const [files, setFiles] = useState<MediaFile[]>([])
  const { items } = useGalleryItems()
  const [isDisabled, setIsDisabled] = useState(false)

  // Memoized calculations
  const { limit, isAtLimit } = useMemo(() => {
    const count = items.length
    const total = count + files.length
    const limitPercentage = Math.floor((count / MAX_GALLERY_ITEMS) * 100)
    
    return {
      limit: limitPercentage,
      isAtLimit: total >= MAX_GALLERY_ITEMS
    }
  }, [items.length, files.length])

  useEffect(() => {
    if (isAtLimit && !isDisabled) {
      setIsDisabled(true)
      const allowedCount = MAX_GALLERY_ITEMS - items.length
      setFiles(prev => prev.slice(0, Math.max(0, allowedCount)))
    } else if (!isAtLimit && isDisabled) {
      setIsDisabled(false)
    }
  }, [isAtLimit, isDisabled, items.length])

  // Helper function to determine if a file is an image
  const isImageFile = useCallback((file: File): boolean => {
    // Check MIME type first
    if (file.type.startsWith('image/')) {
      return true
    }
    
    // Fallback to file extension for cases where MIME type is incorrect or missing
    const fileName = file.name.toLowerCase()
    const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.heic', '.heif', '.bmp', '.tiff', '.svg']
    return imageExtensions.some(ext => fileName.endsWith(ext))
  }, [])

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const newFiles: MediaFile[] = acceptedFiles.map((file) => {
      const detectedType = isImageFile(file) ? 'image' : 'video'
      
      // Debug logging for HEIC files
      if (file.name.toLowerCase().includes('heic') || file.type.includes('heic')) {
        console.log('HEIC file detected:', {
          name: file.name,
          mimeType: file.type,
          detectedType,
          size: file.size
        })
      }
      
      return {
        id: v4(),
        url: URL.createObjectURL(file),
        type: detectedType,
        file,
      }
    })
    
    setFiles(prev => [...prev, ...newFiles])
  }, [isImageFile])

  const onDropRejected = useCallback((fileRejections: any[]) => {
    fileRejections.forEach(({ file, errors }) => {
      errors.forEach((error: any) => {
        if (error.code === 'file-too-large') {
          toast.error(`File too large (${bytesToMB(file?.size)}MB). Max 8MB.`)
        } else if (error.code === 'file-invalid-type') {
          toast.error('Invalid file type. Only images and videos allowed.')
        } else {
          toast.error(`Error: ${error.message}`)
        }
      })
    })
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    onDropRejected,
    multiple: true,
    disabled: isDisabled,
    maxSize: 8 * 1024 * 1024, // 8MB
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg', '.heic', '.heif', '.gif', '.webp', '.bmp', '.tiff'],
      'video/*': ['.mp4', '.webm', '.mov'],
    },
  })

  const removeFile = useCallback((id: string) => {
    setFiles(prev => {
      const fileToRemove = prev.find(f => f.id === id)
      if (fileToRemove?.url.startsWith('blob:')) {
        // Clean up blob URL to prevent memory leaks
        URL.revokeObjectURL(fileToRemove.url)
      }
      return prev.filter(file => file.id !== id)
    })
  }, [])

  const { mutate: handleUpload, isPending } = useMutation({
    mutationFn: uploadMediaToAPI,
    onSuccess: async (data) => {
      // Clean up blob URLs before clearing files
      files.forEach(file => {
        if (file.url.startsWith('blob:')) {
          URL.revokeObjectURL(file.url)
        }
      })
      setFiles([])
      await Promise.all(
        data.map(async (result: any) => {
          return await addGalleryItem(result)
        })
      )
      queryClient.invalidateQueries({ queryKey: ['get-gallery-items'] })
      toast.success(`${data.length} media items added!`)
    },
    onError: (error) => {
      toast.error(error?.message || 'Upload failed')
    },
  })

  const handleAddItems = useCallback(() => {
    const formData = new FormData()
    files.forEach((file) => formData.append('files', file.file))
    formData.append('folder', 'fyp-stacks/gallery')
    handleUpload(formData)
  }, [files, handleUpload])

  // Cleanup blob URLs on unmount to prevent memory leaks
  useEffect(() => {
    return () => {
      files.forEach(file => {
        if (file.url.startsWith('blob:')) {
          URL.revokeObjectURL(file.url)
        }
      })
    }
  }, [files])

  // Don't render if at 100% capacity
  if (limit >= 100) {
    return (
      <div className="px-2">
        <GalleryLimit itemCount={items?.length} />
      </div>
    )
  }

  return (
    <div className="h-full overflow-hidden max-w-sm w-full">
      <div className="px-2">
        <Card className="bg-white gallery-editor w-full mb-6 mt-6 shadow-lg dark:bg-dark-bg border border-neutral-300/60 dark:border-dark-border/80 rounded-3xl">
          <CardHeader className="pb-4">
            <CardTitle className="text-xl font-medium dark:text-white">
              Add To Gallery
            </CardTitle>
            <CardDescription className="text-left leading-snug">
              Share your media with the world. Add photos and videos to showcase your experiences.
            </CardDescription>
          </CardHeader>
          
          <CardContent className="p-0">
            <div className="p-4 flex flex-col">
              <div
                {...getRootProps()}
                className={cn(
                  'w-full max-w-lg p-6 border-2 flex flex-col items-center justify-center border-dashed rounded-2xl text-center cursor-pointer transition border-neutral-300 dark:border-dark-border',
                  isDisabled && 'opacity-50 cursor-not-allowed',
                  isDragActive && 'border-blue-500 bg-blue-50 dark:bg-blue-950/20'
                )}
              >
                <input {...getInputProps()} />
                <div className="w-full h-full flex flex-col items-center justify-center">
                  <div className="mb-2">
                    <Upload className="opacity-70 size-12" strokeWidth={1.2} />
                  </div>
                  <p className="text-neutral-600 dark:text-neutral-400 max-w-[200px] text-center text-sm">
                    {isDragActive 
                      ? 'Drop files here...' 
                      : 'Drag & Drop images or videos here, or click to select'
                    }
                  </p>
                </div>
              </div>
            </div>
            
            <div className="w-full h-full px-4 pt-2 mb-4">
              <Button
                disabled={files.length === 0 || isPending}
                onClick={handleAddItems}
                className="w-full"
                variant="secondary"
              >
                {isPending && (
                  <Loader className="opacity-80 animate-spin size-4 mr-2" />
                )}
                Add Media ({files.length})
              </Button>
              
              {files.length > 0 && (
                <div className="w-full flex flex-wrap gap-2 mt-4">
                  {files.map((file) => (
                    <FilePreview
                      key={file.id}
                      file={file}
                      onRemove={removeFile}
                    />
                  ))}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
        
        <GalleryLimit itemCount={items?.length} />
      </div>
    </div>
  )
}

// Memoized file preview component
const FilePreview = React.memo<{
  file: MediaFile
  onRemove: (id: string) => void
}>(function FilePreview({ file, onRemove }) {
  const [loadError, setLoadError] = React.useState(false)

  return (
  <div className="w-fit flex items-center justify-center gap-x-2 border border-neutral-300/60 dark:border-dark-border/80 rounded-xl relative group p-1">
    <div className="size-8 relative rounded-lg overflow-hidden bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center">
      {loadError ? (
        <FileImage className="size-4 text-neutral-400" />
      ) : file.type === 'image' ? (
        <img
          src={file.url}
          alt="Preview"
          className="w-full h-full aspect-square object-cover rounded-lg"
          onError={(e) => {
            console.error('Failed to load image preview:', file.url)
            setLoadError(true)
          }}
          onLoad={() => setLoadError(false)}
        />
      ) : (
        <video
          src={file.url}
          className="w-full h-full aspect-square object-cover rounded-lg"
          muted
          onError={(e) => {
            console.error('Failed to load video preview:', file.url)
            setLoadError(true)
          }}
          onLoadedData={() => setLoadError(false)}
        />
      )}
    </div>
    <div className="max-w-[80px] truncate">
      <span className="opacity-80 text-sm">
        {file.file.name}
      </span>
    </div>
    <Button
      onClick={() => onRemove(file.id)}
      variant="outline"
      size="smallIcon"
      className="size-6"
    >
      <X className="size-3" />
    </Button>
  </div>
  )
})