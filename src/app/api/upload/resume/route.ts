import { requireAuth } from '@/lib/auth'
import { NextRequest, NextResponse } from 'next/server'
import { parseResumeContent } from '@/lib/resume-parser'
import { eq } from 'drizzle-orm'
import db from '@/lib/db'
import { users } from '@/db/schema'
import { uploadToS3 } from '@/lib/s3'

export async function POST(request: NextRequest) {
  try {
    const session = await requireAuth()

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const formData = await request.formData()
    const file = formData.get('file') as File

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    // Validate file type
    const allowedTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ]

    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: 'Invalid file type. Only PDF, DOC, and DOCX files are allowed.' },
        { status: 400 }
      )
    }

    // Validate file size (10MB limit)
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json(
        { error: 'File too large. Maximum size is 10MB.' },
        { status: 400 }
      )
    }

    // Convert file to buffer for S3 upload
    const fileBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(fileBuffer)

    // Upload file to S3
    let s3Upload
    try {
      s3Upload = await uploadToS3(buffer, {
        folder: 'fyp-stacks/resumes',
        fileName: `resume_${session.user.id}_${Date.now()}.${file.name.split('.').pop()}`,
        contentType: file.type,
      })
    } catch (s3Error) {
      console.error('S3 upload error:', s3Error)
      return NextResponse.json(
        { error: 'Failed to upload file to S3' },
        { status: 500 }
      )
    }

    if (!s3Upload || !s3Upload.url) {
      console.error('S3 upload failed')
      return NextResponse.json(
        { error: 'Failed to upload file to S3' },
        { status: 500 }
      )
    }

    await db.update(users)
      .set({
        resumeFileId: s3Upload.url
      })
      .where(eq(users.id, session.user.id))

    // Parse resume content
    const extractedData = await parseResumeContent(file)

    return NextResponse.json({
      success: true,
      fileUrl: s3Upload.url,
      fileName: file.name,
      s3Key: s3Upload.key,
      ...extractedData,
    })

  } catch (error) {
    console.error('Resume upload error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}