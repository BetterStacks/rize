'use client'

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { Button, buttonVariants } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { cn } from '@/lib/utils'
import { useMutation, useQuery } from '@tanstack/react-query'
import { AlertCircle, CheckCircle, FileText, Loader2, Upload, X } from 'lucide-react'
import { useState, useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import toast from 'react-hot-toast'
import { MAX_UPLOAD_BYTES, UPLOAD_MESSAGES } from '@/lib/prepare-upload'
import { getResumeProcessingStatus, processResumeData, clearResumeData } from '@/actions/resume-actions'

type ResumeFormProps = {
  /** Leave out the card and heading: the settings page gives it a section. */
  bare?: boolean
}

export function ResumeForm({ bare = false }: ResumeFormProps = {}) {
  const [uploadedFile, setUploadedFile] = useState<File | null>(null)
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'uploading' | 'processing' | 'success' | 'error'>('idle')
  const [extractedData, setExtractedData] = useState<any>(null)
  const [selectedCategories, setSelectedCategories] = useState<string[]>(['experience', 'education', 'skills', 'projects'])

  // Query to get current resume status
  const { data: resumeStatus, refetch: refetchStatus } = useQuery({
    queryKey: ['resume-status'],
    queryFn: getResumeProcessingStatus,
  })

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
        throw new Error(
          response.status === 413
            ? UPLOAD_MESSAGES.resumeTooLarge
            : 'Failed to upload resume'
        )
      }

      return response.json()
    },
    onSuccess: (data) => {
      setExtractedData(data)
      setUploadStatus('success')
      toast.success('Resume read. Choose what to add.')
    },
    onError: (error) => {
      setUploadStatus('error')
      toast.error(`Couldn't read that resume: ${error.message}`)
    },
  })

  const { mutate: processData, isPending: isProcessing } = useMutation({
    mutationFn: ({ data, fileUrl }: { data: any, fileUrl?: string }) => processResumeData(data, fileUrl),
    onSuccess: (result) => {
      if (result.success) {
        toast.success(`Added ${result.stats?.experience || 0} roles and ${result.stats?.education || 0} schools`)
        setUploadedFile(null)
        setUploadStatus('idle')
        setExtractedData(null)
        refetchStatus()
      } else {
        toast.error("Couldn't add that to your profile")
      }
    },
    onError: (error) => {
      toast.error("Couldn't add that to your profile")
    },
  })

  const { mutate: clearData, isPending: isClearing } = useMutation({
    mutationFn: clearResumeData,
    onSuccess: (result) => {
      if (result.success) {
        toast.success('Cleared')
        refetchStatus()
      } else {
        toast.error("Couldn't clear that")
      }
    },
    onError: (error) => {
      toast.error("Couldn't clear that")
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
    // Vercel caps request bodies at 4.5 MB.
    maxSize: MAX_UPLOAD_BYTES,
    onDropRejected: (rejections) => {
      const code = rejections[0]?.errors?.[0]?.code
      toast.error(
        code === 'file-too-large'
          ? UPLOAD_MESSAGES.resumeTooLarge
          : 'Choose a PDF, DOC or DOCX file.'
      )
    },
  })

  const removeFile = () => {
    setUploadedFile(null)
    setUploadStatus('idle')
    setExtractedData(null)
  }

  const handleImportData = () => {
    if (extractedData) {
      const filteredData = {
        ...extractedData,
        experience: selectedCategories.includes('experience') ? extractedData.experience : [],
        education: selectedCategories.includes('education') ? extractedData.education : [],
        skills: selectedCategories.includes('skills') ? extractedData.skills : [],
        projects: selectedCategories.includes('projects') ? extractedData.projects : [],
      }
      processData({ data: filteredData, fileUrl: extractedData.fileUrl })
    }
  }

  const toggleCategory = (category: string) => {
    setSelectedCategories(prev =>
      prev.includes(category)
        ? prev.filter(c => c !== category)
        : [...prev, category]
    )
  }

  const getStatusText = () => {
    switch (uploadStatus) {
      case 'uploading':
        return 'Uploading…'
      case 'processing':
        return 'Reading your resume…'
      case 'success':
        return 'Read. Choose what to add below.'
      case 'error':
        return "Couldn't read this file"
      default:
        return ''
    }
  }

  const plural = (n: number, one: string, many: string) => `${n} ${n === 1 ? one : many}`
  const busy = uploadStatus === 'uploading' || uploadStatus === 'processing' || isUploading

  const body = (
    <div className="space-y-6">
      {/* What's on the profile now */}
      {resumeStatus?.success && (
        <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2 rounded-xl bg-subtle px-4 py-3">
          <p className="text-sm text-ink-secondary">
            On your profile now:{' '}
            <span className="text-ink">
              {plural(resumeStatus.experienceCount ?? 0, 'role', 'roles')} and{' '}
              {plural(resumeStatus.educationCount ?? 0, 'school', 'schools')}
            </span>
          </p>
          {resumeStatus.hasResumeData && (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="touch-target -mr-2 text-ink-secondary hover:text-danger"
                  disabled={isClearing}
                >
                  {isClearing ? 'Clearing…' : 'Clear'}
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Clear experience and education?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This removes every role and school on your profile, including ones you added by hand.
                    It can&apos;t be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    className={buttonVariants({ variant: 'destructive' })}
                    onClick={() => clearData()}
                  >
                    Clear
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
        </div>
      )}

      {/* Upload */}
      {!uploadedFile ? (
        <div
          {...getRootProps({ 'aria-label': 'Upload a resume' })}
          className={cn(
            'flex cursor-pointer flex-col items-center gap-2 rounded-2xl border border-dashed border-hairline px-6 py-10 text-center',
            'transition-colors duration-fast ease-calm hover:border-ink-secondary hover:bg-subtle',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink focus-visible:ring-offset-2 focus-visible:ring-offset-ground',
            isDragActive && 'border-ink bg-subtle'
          )}
        >
          <input {...getInputProps()} />
          <Upload className="size-5 text-ink-secondary" aria-hidden />
          <p className="text-sm font-medium text-ink">
            {isDragActive ? 'Drop it here' : 'Drop your resume here, or choose a file'}
          </p>
          <p className="text-xs text-ink-secondary">PDF, DOC or DOCX, up to 4 MB</p>
        </div>
      ) : (
        <div className="flex items-center justify-between gap-3 rounded-xl border border-hairline px-4 py-3">
          <div className="flex min-w-0 items-center gap-3">
            {busy ? (
              <Loader2 className="size-4 shrink-0 animate-spin text-ink-secondary" aria-hidden />
            ) : uploadStatus === 'success' ? (
              <CheckCircle className="size-4 shrink-0 text-success" aria-hidden />
            ) : uploadStatus === 'error' ? (
              <AlertCircle className="size-4 shrink-0 text-danger" aria-hidden />
            ) : (
              <FileText className="size-4 shrink-0 text-ink-secondary" aria-hidden />
            )}
            <div className="min-w-0" aria-live="polite">
              <p className="truncate text-sm font-medium text-ink">{uploadedFile.name}</p>
              <p className="text-xs text-ink-secondary">{getStatusText()}</p>
            </div>
          </div>
          {!busy && (
            <Button
              variant="ghost"
              size="smallIcon"
              onClick={removeFile}
              aria-label="Remove this file"
              className="shrink-0 text-ink-secondary"
            >
              <X className="size-4" aria-hidden />
            </Button>
          )}
        </div>
      )}

      {/* Pick what to add */}
      {uploadStatus === 'success' && extractedData && (
        <div className="space-y-4">
          <p className="text-sm font-medium text-ink">Choose what to add to your profile</p>
          <ul className="divide-y divide-hairline border-y border-hairline">
            {[
              { id: 'experience', label: 'Experience', count: extractedData.experience?.length },
              { id: 'education', label: 'Education', count: extractedData.education?.length },
              { id: 'skills', label: 'Skills', count: extractedData.skills?.length },
              { id: 'projects', label: 'Projects', count: extractedData.projects?.length },
            ].map((item) =>
              item.count > 0 ? (
                <li key={item.id}>
                  <label className="flex min-h-11 cursor-pointer items-center gap-3 py-2.5 text-sm">
                    <Checkbox
                      checked={selectedCategories.includes(item.id)}
                      onCheckedChange={() => toggleCategory(item.id)}
                      disabled={isProcessing}
                    />
                    <span className="flex-1 text-ink">{item.label}</span>
                    <span className="tabular-nums text-ink-secondary">{item.count} found</span>
                  </label>
                </li>
              ) : null
            )}
          </ul>

          <div className="flex flex-col-reverse gap-2 sm:flex-row">
            <Button onClick={removeFile} variant="outline" disabled={isProcessing}>
              Cancel
            </Button>
            <Button
              onClick={handleImportData}
              disabled={isProcessing || selectedCategories.length === 0}
            >
              {isProcessing ? (
                <>
                  <Loader2 className="mr-2 size-4 animate-spin" aria-hidden />
                  Adding…
                </>
              ) : (
                'Add to profile'
              )}
            </Button>
          </div>
        </div>
      )}

      <ul className="space-y-1 text-xs leading-relaxed text-ink-secondary">
        <li>Your resume is only used to fill in your profile.</li>
        <li>You can edit or remove anything it adds.</li>
        <li>The file is stored securely and can be deleted at any time.</li>
      </ul>
    </div>
  )

  if (bare) return body

  return (
    <Card className="p-5 sm:p-6">
      <h2 className="font-instrument text-[28px] leading-none text-ink">Resume</h2>
      <p className="mb-6 mt-2 text-sm leading-relaxed text-ink-secondary">
        Upload a resume to fill in your experience, education, skills and projects. You pick what gets added.
      </p>
      {body}
    </Card>
  )
}
