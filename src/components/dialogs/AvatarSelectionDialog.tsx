'use client'

import { updateProfile } from '@/actions/profile-actions'
import { queryClient } from '@/lib/providers'
import { getBase64Image, getCroppedImg } from '@/lib/utils'
import { motion } from 'framer-motion'
import { Camera, Palette, Upload, Loader, ArrowLeft } from 'lucide-react'
import { useSession } from '@/lib/auth-client'
import React, { FC, useEffect, useState } from 'react'
import Cropper, { Area } from 'react-easy-crop'
import toast from 'react-hot-toast'
import { useAvatarDialog } from '../dialog-provider'
import { Button } from '../ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog'
import { CreativeAvatar } from '../ui/creative-avatar'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs'

type AvatarSelectionDialogProps = {
  file: File | null
  setFile: (file: File | null) => void
}

type Step = 'selection' | 'crop' | 'creative'

const AvatarSelectionDialog: FC<AvatarSelectionDialogProps> = ({ file, setFile }) => {
  const [isOpen, setIsOpen] = useAvatarDialog()
  const { data: session } = useSession()
  const [step, setStep] = useState<Step>('selection')
  const [selectedMethod, setSelectedMethod] = useState<'upload' | 'creative'>('upload')
  
  // Upload states
  const [image, setImage] = useState<string | null>(null)
  const [crop, setCrop] = useState({ x: 0, y: 0 })
  const [rotation, setRotation] = useState(0)
  const [zoom, setZoom] = useState(1)
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null)
  const [croppedImage, setCroppedImage] = useState<string | null>(null)
  
  // Creative avatar states
  const [selectedVariant, setSelectedVariant] = useState<'gradient' | 'emoji' | 'geometric' | 'neon' | 'minimal'>('gradient')
  
  const [isUploading, setIsUploading] = useState(false)

  const variants = [
    { type: 'gradient' as const, label: 'Gradient', icon: '🌈' },
    { type: 'emoji' as const, label: 'Emoji', icon: '😀' },
    { type: 'geometric' as const, label: 'Geometric', icon: '🔷' },
    { type: 'neon' as const, label: 'Neon', icon: '✨' },
    { type: 'minimal' as const, label: 'Minimal', icon: '◯' },
  ]

  const onCropComplete = (croppedArea: Area, croppedAreaPixels: Area) => {
    setCroppedAreaPixels(croppedAreaPixels)
  }

  useEffect(() => {
    if (!file) return
    setImage(URL.createObjectURL(file))
  }, [file])

  useEffect(() => {
    if (step === 'crop' && file && image && croppedAreaPixels) {
      const showCroppedImage = async () => {
        try {
          const croppedImage = await getCroppedImg(
            image as string,
            croppedAreaPixels as Area,
            rotation
          )
          setCroppedImage(croppedImage as string)
        } catch (e) {
          console.error(e)
        }
      }
      showCroppedImage()
    }
  }, [croppedAreaPixels, rotation, image, file, step])

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (!selectedFile) return

    const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB
    const ACCEPTED_IMAGE_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']

    if (selectedFile.size > MAX_FILE_SIZE) {
      toast.error('File size is too large (max 5MB)')
      return
    }
    if (!ACCEPTED_IMAGE_TYPES.includes(selectedFile.type)) {
      toast.error('Invalid file type. Please use JPEG, PNG, or WebP')
      return
    }

    setFile(selectedFile)
    setSelectedMethod('upload')
    setStep('crop')
  }

  const handleUploadAvatar = async () => {
    if (!file || !croppedImage) return

    setIsUploading(true)
    try {
      const url = await getBase64Image(file, croppedImage)

      const formData = new FormData()
      formData.append('file', url as string)
      formData.append('type', 'avatar')

      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      })
      const data = await res.json()

      if (!res.ok) {
        toast.error(`Failed to upload image: ${data.error}`)
        return
      }

      const resp = await updateProfile({ profileImage: data.url })

      if (!resp?.success) {
        toast.error(resp?.error || 'Failed to update profile picture')
        return
      }

      await queryClient.invalidateQueries({
        queryKey: ['get-profile-by-username', (session?.user as any)?.username],
      })

      toast.success('Profile picture updated successfully')
      handleClose()
    } catch (error) {
      toast.error('Failed to update profile picture')
    } finally {
      setIsUploading(false)
    }
  }

  const handleSaveCreativeAvatar = async () => {
    if (!session?.user?.name) return

    setIsUploading(true)
    try {
      // Save the creative avatar variant choice with timestamp for uniqueness
      const timestamp = Date.now()
      const avatarData = `creative-${selectedVariant}-${timestamp}`
      
      const resp = await updateProfile({ 
        profileImage: avatarData 
      })

      if (!resp?.success) {
        toast.error(resp?.error || 'Failed to update profile picture')
        return
      }

      await queryClient.invalidateQueries({
        queryKey: ['get-profile-by-username', (session?.user as any)?.username],
      })

      toast.success('Profile picture updated successfully')
      handleClose()
    } catch (error) {
      toast.error('Failed to update profile picture')
    } finally {
      setIsUploading(false)
    }
  }

  const handleClose = () => {
    setIsOpen(false)
    setStep('selection')
    setFile(null)
    setImage(null)
    setCroppedImage(null)
    setSelectedMethod('upload')
  }

  const renderSelectionStep = () => (
    <div className="p-6">
      <div className="space-y-4">
        <div className="text-center mb-6">
          <h3 className="text-lg font-medium mb-2">Choose Your Avatar Style</h3>
          <p className="text-sm text-neutral-600 dark:text-neutral-400">
            Upload a custom photo or select from our creative avatars
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          {/* Upload Option */}
          <div className="space-y-3">
            <label 
              htmlFor="file-upload"
              className="flex flex-col items-center justify-center h-32 border-2 border-dashed border-neutral-300 dark:border-dark-border rounded-2xl cursor-pointer hover:border-purple-400 dark:hover:border-purple-500 transition-colors group"
            >
              <input
                id="file-upload"
                type="file"
                className="hidden"
                accept="image/*"
                onChange={handleFileUpload}
              />
              <div className="flex flex-col items-center space-y-2">
                <div className="p-3 rounded-full bg-neutral-100 dark:bg-neutral-800 group-hover:bg-purple-100 dark:group-hover:bg-purple-900/20 transition-colors">
                  <Upload className="w-6 h-6 text-neutral-600 dark:text-neutral-400 group-hover:text-purple-600 dark:group-hover:text-purple-400" />
                </div>
                <span className="text-sm font-medium text-neutral-700 dark:text-neutral-300">Upload Photo</span>
              </div>
            </label>
          </div>

          {/* Creative Avatar Option */}
          <motion.div
            className="flex flex-col items-center justify-center h-32 border-2 border-dashed border-neutral-300 dark:border-dark-border rounded-2xl cursor-pointer hover:border-purple-400 dark:hover:border-purple-500 transition-colors group"
            onClick={() => {
              setSelectedMethod('creative')
              setStep('creative')
            }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <div className="flex flex-col items-center space-y-2">
              <div className="p-3 rounded-full bg-gradient-to-br from-purple-100 to-amber-100 dark:from-purple-900/20 dark:to-amber-900/20 group-hover:from-purple-200 group-hover:to-amber-200 dark:group-hover:from-purple-800/30 dark:group-hover:to-amber-800/30 transition-colors">
                <Palette className="w-6 h-6 text-purple-600 dark:text-purple-400" />
              </div>
              <span className="text-sm font-medium text-neutral-700 dark:text-neutral-300">Creative Avatar</span>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  )

  const renderCropStep = () => (
    <div className="p-0">
      <div className="px-6 py-4 border-b border-neutral-200 dark:border-dark-border">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setStep('selection')}
            className="p-1"
          >
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div>
            <h3 className="font-medium">Crop Your Photo</h3>
            <p className="text-sm text-neutral-600 dark:text-neutral-400">
              Adjust the position and zoom
            </p>
          </div>
        </div>
      </div>

      <div className="aspect-square relative w-full max-w-md mx-auto">
        <Cropper
          classes={{
            containerClassName: 'overflow-hidden relative',
            mediaClassName: 'aspect-square',
          }}
          image={image as string}
          crop={crop}
          zoom={zoom}
          aspect={1}
          cropShape="round"
          cropSize={{ width: 300, height: 300 }}
          showGrid={false}
          onCropChange={setCrop}
          onRotationChange={setRotation}
          onCropComplete={onCropComplete}
          onZoomChange={setZoom}
        />
      </div>

      <div className="p-6 border-t border-neutral-200 dark:border-dark-border">
        <Button
          onClick={handleUploadAvatar}
          disabled={isUploading}
          className="w-full bg-gradient-to-r from-purple-500 to-amber-500 hover:from-purple-600 hover:to-amber-600"
        >
          {isUploading && <Loader className="w-4 h-4 mr-2 animate-spin" />}
          Save Profile Picture
        </Button>
      </div>
    </div>
  )

  const renderCreativeStep = () => (
    <div className="p-0">
      <div className="px-6 py-4 border-b border-neutral-200 dark:border-dark-border">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setStep('selection')}
            className="p-1"
          >
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div>
            <h3 className="font-medium">Choose Your Style</h3>
            <p className="text-sm text-neutral-600 dark:text-neutral-400">
              Select a creative avatar style
            </p>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Preview */}
        <div className="flex justify-center">
          <div className="p-4 rounded-2xl bg-neutral-50 dark:bg-neutral-800/50">
            <CreativeAvatar
              src={null}
              name={session?.user?.name || 'You'}
              size="xl"
              variant={selectedVariant}
              showHoverEffect={false}
            />
          </div>
        </div>

        {/* Variant Selection */}
        <div className="space-y-3">
          <h4 className="text-sm font-medium text-neutral-700 dark:text-neutral-300">Avatar Style</h4>
          <div className="grid grid-cols-2 gap-3">
            {variants.map((variant) => (
              <motion.button
                key={variant.type}
                onClick={() => setSelectedVariant(variant.type)}
                className={`flex items-center gap-3 p-3 rounded-xl border-2 transition-all ${
                  selectedVariant === variant.type
                    ? 'border-purple-400 bg-purple-50 dark:border-purple-500 dark:bg-purple-900/20'
                    : 'border-neutral-200 dark:border-dark-border hover:border-neutral-300 dark:hover:border-neutral-600'
                }`}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-white dark:bg-neutral-800 text-sm">
                  {variant.icon}
                </div>
                <span className="text-sm font-medium">{variant.label}</span>
              </motion.button>
            ))}
          </div>
        </div>

        <Button
          onClick={handleSaveCreativeAvatar}
          disabled={isUploading}
          className="w-full bg-gradient-to-r from-purple-500 to-amber-500 hover:from-purple-600 hover:to-amber-600"
        >
          {isUploading && <Loader className="w-4 h-4 mr-2 animate-spin" />}
          Save Creative Avatar
        </Button>
      </div>
    </div>
  )

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="sm:rounded-3xl p-0 max-w-md overflow-hidden">
        <DialogHeader className="hidden">
          <DialogTitle>Change Avatar</DialogTitle>
          <DialogDescription>Choose your avatar style</DialogDescription>
        </DialogHeader>

        {step === 'selection' && renderSelectionStep()}
        {step === 'crop' && renderCropStep()}
        {step === 'creative' && renderCreativeStep()}
      </DialogContent>
    </Dialog>
  )
}

export default AvatarSelectionDialog