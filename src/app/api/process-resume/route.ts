import { requireAuth } from '@/lib/auth'
import { checkRateLimit } from '@/lib/rate-limit'
import { NextRequest, NextResponse } from 'next/server'
import { parseResumeContent } from '@/lib/resume-parser'
import { safeFetch } from '@/lib/safe-url'

export async function POST(request: NextRequest) {
  try {
    const session = await requireAuth()

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    const limited = await checkRateLimit('ai', session.user.id)
    if (!limited.success) return limited.response!

    const { fileUrl } = await request.json()

    if (!fileUrl) {
      return NextResponse.json({ error: 'No file URL provided' }, { status: 400 })
    }

    if (typeof fileUrl !== 'string') {
      return NextResponse.json({ error: 'Invalid file URL' }, { status: 400 })
    }

    try {
      // Download the resume (Rize's S3 bucket, or Cloudinary for claim links).
      // safeFetch only reaches public hosts.
      const response = await safeFetch(fileUrl)
      if (!response.ok) {
        throw new Error('Failed to download resume from URL')
      }

      // Convert response to File-like object for parsing
      const arrayBuffer = await response.arrayBuffer()
      const fileName = fileUrl.split('/').pop()?.replace(/^resume_\d+_/, '') || 'resume.pdf'

      // Determine file type from extension
      let mimeType = 'application/pdf'
      if (fileName.toLowerCase().endsWith('.doc')) {
        mimeType = 'application/msword'
      } else if (fileName.toLowerCase().endsWith('.docx')) {
        mimeType = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
      }

      // Create a File-like object
      const file = new File([arrayBuffer], fileName, { type: mimeType })

      // Parse resume content
      const extractedData = await parseResumeContent(file)

      return NextResponse.json({
        success: true,
        fileUrl: fileUrl,
        fileName: fileName,
        ...extractedData,
      })

    } catch (parseError) {
      console.error('Resume parsing error:', parseError)
      return NextResponse.json(
        { error: 'Failed to parse resume content' },
        { status: 500 }
      )
    }

  } catch (error) {
    console.error('Process resume error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}