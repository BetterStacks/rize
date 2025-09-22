import { requireAuth } from '@/lib/auth'
import { NextRequest, NextResponse } from 'next/server'
import { parseResumeContent } from '@/lib/resume-parser'

export async function POST(request: NextRequest) {
  try {
    const session = await requireAuth()
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { cloudinaryFileId } = await request.json()

    if (!cloudinaryFileId) {
      return NextResponse.json({ error: 'No cloudinary file ID provided' }, { status: 400 })
    }

    // Construct Cloudinary URL
    const cloudinaryUrl = `https://res.cloudinary.com/${process.env.CLOUDINARY_CLOUD_NAME}/raw/upload/${cloudinaryFileId}`
    
    try {
      // Download the file from Cloudinary
      const response = await fetch(cloudinaryUrl)
      if (!response.ok) {
        throw new Error('Failed to download resume from Cloudinary')
      }

      // Convert response to File-like object for parsing
      const arrayBuffer = await response.arrayBuffer()
      const fileName = cloudinaryFileId.split('/').pop()?.replace(/^resume_\d+_/, '') || 'resume.pdf'
      
      // Determine file type from extension
      let mimeType = 'application/pdf'
      if (fileName.toLowerCase().endsWith('.doc')) {
        mimeType = 'application/msword'
      } else if (fileName.toLowerCase().endsWith('.docx')) {
        mimeType = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
      }

      // Create a File-like object
      const file = new File([arrayBuffer], fileName, { type: mimeType })

      // Parse resume content using existing parser
      const extractedData = await parseResumeContent(file)

      return NextResponse.json({
        success: true,
        fileUrl: cloudinaryUrl,
        fileName: fileName,
        cloudinaryId: cloudinaryFileId,
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