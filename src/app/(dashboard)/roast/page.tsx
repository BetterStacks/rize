'use client'

import { FileUpload } from '@/components/ui/file-upload'
import { toast } from 'sonner'
import { useState, useEffect } from 'react'
import axios from 'axios'
import RoastCard from '@/components/RoastCard'
import { Spinner } from '@/components/ui/spinner'
import { Skeleton } from '@/components/ui/skeleton'
import Back from '@/components/Back'
import RoastAnalytics from '@/components/analytics/RoastAnalytics'
import { useSession } from '@/lib/auth-client'


function ResumeRoasterSkeleton() {
  return (
    <div className="min-h-screen overflow-x-hidden w-full dark:bg-neutral-900 bg-white flex flex-col items-center justify-center py-20">
      {/* FileUpload Skeleton */}
      <div className="mx-2 w-full max-w-2xl px-4">
        <Skeleton className="w-full h-[280px] sm:h-[320px] rounded-lg" />
      </div>

      {/* Button Skeleton */}
      <div className="mt-10">
        <Skeleton className="h-9 w-[120px] rounded-lg" />
      </div>
    </div>
  )
}


export default function Home() {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([])
  const [loading, setLoading] = useState(false)
  const [roast, setRoast] = useState<string>('')
  const [existingResumeUrl, setExistingResumeUrl] = useState<string | null>(null)
  const [fetchingResume, setFetchingResume] = useState(true)

  const { data: session } = useSession()

  useEffect(() => {
    const fetchExistingResume = async () => {
      try {
        const res = await axios.get('/api/user/resume')
        if (res.data.resumeUrl) {
          setExistingResumeUrl(res.data.resumeUrl)
        }
      } catch (err) {
        console.error('Failed to fetch resume:', err)
      } finally {
        setFetchingResume(false)
      }
    }
    fetchExistingResume()
  }, [])

  const handleRoast = async () => {

    if (!selectedFiles.length && !existingResumeUrl) {
      toast.error('Please upload a resume first!')
      return
    }

    setLoading(true)
    setRoast('')
    
    try {
      let fileToRoast: File | Blob

      if (selectedFiles.length) {
        fileToRoast = selectedFiles[0]
      } else if (existingResumeUrl) {
        // Fetch the resume from Cloudinary
        const response = await fetch(existingResumeUrl)
        fileToRoast = await response.blob()
      } else {
        toast.error('No resume available!')
        return
      }

      const formData = new FormData()
      formData.append('file', fileToRoast)

      const res = await axios.post('/api/upload/roast', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      })

      setRoast(res.data.roast)
    } catch (err: any) {
      console.error(err)
      toast.error(err?.response?.data?.error || 'Something went wrong!')
    } finally {
      setLoading(false)
    }
  }

  if (fetchingResume) {
    return <ResumeRoasterSkeleton />
  }

  
  return (
    <div className="min-h-screen overflow-x-hidden w-full dark:bg-neutral-900 bg-white flex flex-col items-center justify-center py-20">

      <div className="absolute top-0 left-0">
        <Back />
      </div>

      <div className="max-w-6xl mx-auto w-fit lg:w-full">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:px-6 items-start py-10 lg:py-0">
          {/* Left Side - Upload & Roast */}
          <div className="flex flex-col items-center lg:col-span-2">
            {!existingResumeUrl && (
              <div className="w-full max-w-2xl">
                <FileUpload onChange={(files) => setSelectedFiles(files)} />
              </div>
            )}

            <div className="mt-10">
              <button onClick={handleRoast} disabled={loading} className="flex items-center justify-center gap-2 border dark:bg-[#E6E6E6] bg-[#FFDA37] hover:bg-[#FFDA37]/85 dark:hover:bg-[#F6F6F6] h-9 px-8 text-black tracking-wide rounded-lg font-medium text-sm cursor-pointer disabled:opacity-50 disabled:cursor-default">
                {loading && <Spinner className="w-4 h-4" />}
                Roast Me
              </button>
            </div>
            {roast && <RoastCard roast={roast} />}
          </div>
      
          {session?.user?.username && (
            <div className="lg:sticky lg:top-6">
              <RoastAnalytics username={session.user.username} key={roast} />
            </div>
          )}
        </div>
      </div>
    </div>
  )
}