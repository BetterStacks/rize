'use client'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import { useMutation } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { FileText, Upload, X, CheckCircle, AlertCircle } from 'lucide-react'
import { useState, useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import toast from 'react-hot-toast'
import type { ResumeData } from '@/types/onboarding'

interface ResumeStepProps {
  formData: { resumeData: ResumeData | null };
  onNext: (resumeData?: ResumeData) => void;
  isPending?: boolean;
}

export function ResumeStep({ formData, onNext, isPending }: ResumeStepProps) {
  const [uploadedFile, setUploadedFile] = useState<File | null>(null)
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'uploading' | 'processing' | 'success' | 'error'>('idle')
  const [extractedData, setExtractedData] = useState<any>(null)

  const { mutate: uploadResume, isPending: isUploading } = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('type', 'resume')
      
      const response = await fetch('/api/upload/resume', {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        throw new Error('Failed to upload resume')
      }

      return response.json()
    },
    onSuccess: (data) => {
      setExtractedData(data)
      setUploadStatus('success')
      toast.success('Resume processed successfully!')
    },
    onError: (error) => {
      setUploadStatus('error')
      toast.error('Failed to process resume: ' + error.message)
    },
  })

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0]
    if (file) {
      setUploadedFile(file)
      setUploadStatus('uploading')
      uploadResume(file)
    }
  }, [uploadResume])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'application/msword': ['.doc'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
    },
    multiple: false,
    maxSize: 10 * 1024 * 1024, // 10MB
  })

  const removeFile = () => {
    setUploadedFile(null)
    setUploadStatus('idle')
    setExtractedData(null)
  }

  const handleSkip = () => {
    onNext()
  }

  const handleContinue = () => {
    onNext(extractedData)
  }

  const getStatusIcon = () => {
    switch (uploadStatus) {
      case 'uploading':
      case 'processing':
        return <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full"
        />
      case 'success':
        return <CheckCircle className="w-5 h-5 text-green-500" />
      case 'error':
        return <AlertCircle className="w-5 h-5 text-red-500" />
      default:
        return <FileText className="w-5 h-5" />
    }
  }

  const getStatusText = () => {
    switch (uploadStatus) {
      case 'uploading':
        return 'Uploading...'
      case 'processing':
        return 'Processing resume...'
      case 'success':
        return 'Resume processed successfully'
      case 'error':
        return 'Failed to process resume'
      default:
        return ''
    }
  }

  return (
    <div className="p-8">
      <div className="mb-6">
        <h2 className="text-2xl tracking-tight font-semibold mb-2">
          Upload your resume 📄
        </h2>
        <p className="text-sm text-neutral-600 dark:text-neutral-400">
          Let us auto-fill your profile with your experience, education, and skills from your resume
        </p>
      </div>

      {!uploadedFile ? (
        <Card
          {...getRootProps()}
          className={cn(
            'border-2 border-dashed transition-all duration-200 cursor-pointer hover:border-neutral-400 dark:hover:border-neutral-600',
            isDragActive && 'border-blue-500 bg-blue-50 dark:bg-blue-950/20'
          )}
        >
          <input {...getInputProps()} />
          <div className="p-8 text-center">
            <div className="mx-auto w-12 h-12 rounded-full bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center mb-4">
              <Upload className="w-6 h-6 text-neutral-600 dark:text-neutral-400" />
            </div>
            <h3 className="font-medium mb-2">
              {isDragActive ? 'Drop your resume here' : 'Upload your resume'}
            </h3>
            <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-2">
              Drag & drop or click to browse
            </p>
            <p className="text-xs text-neutral-500">
              Supports PDF, DOC, DOCX (max 10MB)
            </p>
          </div>
        </Card>
      ) : (
        <Card className="p-4 mb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {getStatusIcon()}
              <div>
                <p className="font-medium text-sm">{uploadedFile.name}</p>
                <p className="text-xs text-neutral-600 dark:text-neutral-400">
                  {getStatusText()}
                </p>
              </div>
            </div>
            {uploadStatus !== 'uploading' && uploadStatus !== 'processing' && (
              <Button
                variant="ghost"
                size="sm"
                onClick={removeFile}
                className="h-8 w-8 p-0"
              >
                <X className="w-4 h-4" />
              </Button>
            )}
          </div>
        </Card>
      )}

      {uploadStatus === 'success' && extractedData && (
        <Card className="p-4 mb-4 bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-800">
          <div className="text-sm">
            <p className="font-medium text-green-800 dark:text-green-200 mb-2">
              Great! We found the following information:
            </p>
            <ul className="space-y-1 text-green-700 dark:text-green-300">
              {extractedData.experience?.length > 0 && (
                <li>• {extractedData.experience.length} work experience entries</li>
              )}
              {extractedData.education?.length > 0 && (
                <li>• {extractedData.education.length} education entries</li>
              )}
              {extractedData.skills?.length > 0 && (
                <li>• {extractedData.skills.length} skills identified</li>
              )}
              {extractedData.projects?.length > 0 && (
                <li>• {extractedData.projects.length} projects found</li>
              )}
            </ul>
          </div>
        </Card>
      )}

      <div className="flex gap-3">
        <Button
          variant="outline"
          onClick={handleSkip}
          className="flex-1"
          disabled={isPending || isUploading}
        >
          Skip for now
        </Button>
        <Button
          variant="secondary"
          onClick={uploadStatus === 'success' ? handleContinue : handleSkip}
          disabled={isPending || isUploading || (uploadedFile && uploadStatus !== 'success')}
          className="flex-1"
        >
          {uploadStatus === 'success' ? 'Continue with data' : 'Continue'}
        </Button>
      </div>
    </div>
  )
}
