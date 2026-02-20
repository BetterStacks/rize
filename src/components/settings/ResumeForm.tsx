'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { cn } from '@/lib/utils'
import { useMutation, useQuery } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { FileText, Upload, X, CheckCircle, AlertCircle, Download, RefreshCw, Trash2 } from 'lucide-react'
import { useState, useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import toast from 'react-hot-toast'
import { getResumeProcessingStatus, processResumeData, clearResumeData } from '@/actions/resume-actions'

export function ResumeForm() {
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

  const { mutate: processData, isPending: isProcessing } = useMutation({
    mutationFn: ({ data, fileUrl }: { data: any, fileUrl?: string }) => processResumeData(data, fileUrl),
    onSuccess: (result) => {
      if (result.success) {
        toast.success(`Resume data imported: ${result.stats?.experience || 0} experiences, ${result.stats?.education || 0} education entries`)
        setUploadedFile(null)
        setUploadStatus('idle')
        setExtractedData(null)
        refetchStatus()
      } else {
        toast.error('Failed to import resume data')
      }
    },
    onError: (error) => {
      toast.error('Failed to process resume data')
    },
  })

  const { mutate: clearData, isPending: isClearing } = useMutation({
    mutationFn: clearResumeData,
    onSuccess: (result) => {
      if (result.success) {
        toast.success('Resume data cleared successfully')
        refetchStatus()
      } else {
        toast.error('Failed to clear resume data')
      }
    },
    onError: (error) => {
      toast.error('Failed to clear resume data')
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
    <Card className='dark:bg-dark-bg dark:border-dark-border sm:rounded-3xl'>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="w-5 h-5" />
          Resume Management
        </CardTitle>
        <CardDescription>
          Upload your resume to automatically populate your profile with experience, education, and skills.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Current Resume Status */}
        {resumeStatus?.success && (
          <div className="rounded-lg w-full border p-4 bg-muted/50">
            <div className="flex flex-col items-start">
              <p className="font-medium text-sm">Current Resume Data</p>
              <p className="text-xs text-muted-foreground">
                {resumeStatus.experienceCount} work experiences • {resumeStatus.educationCount} education entries
              </p>
            </div>
            {resumeStatus.hasResumeData && (
              <div className="flex items-center mt-2 w-full justify-between gap-2">
                <>
                  <span className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800 dark:bg-green-900 dark:text-green-300">
                    <CheckCircle className="w-3 h-3 mr-1" />
                    Active
                  </span>
                  <Button
                    variant="outline"
                    size="smallIcon"
                    onClick={() => clearData()}
                    disabled={isClearing}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/20"
                  >
                    {isClearing ? (
                      <RefreshCw className="w-3 h-3 animate-spin" />
                    ) : (
                      <Trash2 className="w-3 h-3" />
                    )}
                  </Button>
                </>
              </div>
            )}
          </div>
        )}

        <Separator />

        {/* Upload New Resume */}
        <div className="space-y-4">
          <div>
            <h3 className="font-medium">Upload New Resume</h3>
            <p className="text-sm text-muted-foreground">
              Upload a new resume to update your profile information
            </p>
          </div>

          {!uploadedFile ? (
            <Card
              {...getRootProps()}
              className={cn(
                'border-2 border-dashed transition-all duration-200 bg-neutral-100 dark:bg-dark-bg cursor-pointer hover:border-neutral-400 dark:hover:border-neutral-600',
                isDragActive && 'border-blue-500 bg-blue-50 dark:bg-blue-950/20'
              )}
            >
              <input {...getInputProps()} />
              <CardContent className="p-8 text-center">
                <div className="mx-auto w-12 h-12 rounded-full flex items-center justify-center mb-4">
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
              </CardContent>
            </Card>
          ) : (
            <Card className="border">
              <CardContent className="p-4">
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
              </CardContent>
            </Card>
          )}
        </div>

        {/* Extracted Data Preview */}
        {uploadStatus === 'success' && extractedData && (
          <div className="space-y-4">
            <Separator />
            <Card className="bg-green-50/50 dark:bg-green-950/10 border-green-200/50 dark:border-green-800/50">
              <CardContent className="p-6">
                <div className="text-sm">
                  <p className="font-medium text-green-800 dark:text-green-200 mb-4 flex items-center gap-2">
                    <CheckCircle className="w-4 h-4" />
                    Extraction complete! Select what you'd like to import:
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {[
                      { id: 'experience', label: 'Work Experience', count: extractedData.experience?.length },
                      { id: 'education', label: 'Education', count: extractedData.education?.length },
                      { id: 'skills', label: 'Skills', count: extractedData.skills?.length },
                      { id: 'projects', label: 'Projects', count: extractedData.projects?.length },
                    ].map((item) => (
                      item.count > 0 && (
                        <div
                          key={item.id}
                          onClick={() => toggleCategory(item.id)}
                          className={cn(
                            "flex items-center justify-between p-3 rounded-xl border transition-all cursor-pointer group",
                            selectedCategories.includes(item.id)
                              ? "bg-white dark:bg-neutral-900 border-green-500/50 shadow-sm"
                              : "bg-transparent border-neutral-200 dark:border-neutral-800 opacity-60 grayscale"
                          )}
                        >
                          <div className="flex items-center gap-3">
                            <div className={cn(
                              "w-5 h-5 rounded-md border flex items-center justify-center transition-colors",
                              selectedCategories.includes(item.id)
                                ? "bg-green-500 border-green-500 text-white"
                                : "border-neutral-300 dark:border-neutral-700"
                            )}>
                              {selectedCategories.includes(item.id) && <CheckCircle className="w-3.5 h-3.5" />}
                            </div>
                            <div>
                              <p className="font-medium text-xs dark:text-neutral-200">{item.label}</p>
                              <p className="text-[10px] text-neutral-500">{item.count} items found</p>
                            </div>
                          </div>
                        </div>
                      )
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="flex gap-3">
              <Button
                onClick={removeFile}
                variant="outline"
                className="flex-1"
                disabled={isProcessing}
              >
                Cancel
              </Button>
              <Button
                onClick={handleImportData}
                className="flex-1"
                disabled={isProcessing}
              >
                {isProcessing ? (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                    Importing...
                  </>
                ) : (
                  <>
                    <Download className="w-4 h-4 mr-2" />
                    Import Data
                  </>
                )}
              </Button>
            </div>
          </div>
        )}

        <div className="text-xs text-muted-foreground">
          <p>• Your resume data is processed securely and used only to populate your profile</p>
          <p>• You can review and edit all imported information before it appears on your profile</p>
          <p>• Original resume files are stored securely and can be deleted at any time</p>
        </div>
      </CardContent>
    </Card>
  )
}