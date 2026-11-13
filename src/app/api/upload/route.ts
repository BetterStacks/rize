import { requireAuth } from '@/lib/auth'
import { NextRequest } from 'next/server'
import { uploadToS3 } from '@/lib/s3'
import { checkRateLimit } from '@/lib/rate-limit'
import sharp from 'sharp'

// Vercel rejects request bodies over 4.5 MB before this code runs, so keep
// each file comfortably under that. Avatars arrive cropped and shrunk to
// 1024px by the client.
const MAX_FILE_SIZE = 4 * 1024 * 1024; // 4 MB
const AVATAR_MAX_EDGE = 1024
const TOO_LARGE_MESSAGE = 'That image is too large to upload. Try a smaller one.'

class FileTooLargeError extends Error {}
// This route only takes images (avatars and gallery images).
const ALLOWED_IMAGE_TYPES = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp', 'image/gif']

export async function POST(req: NextRequest) {
  const session = await requireAuth().catch(() => null)
  if (!session) {
    return Response.json({ message: 'Sign in to upload files' }, { status: 401 })
  }

  const { success, response } = await checkRateLimit('upload', session.user.id);
  if (!success) return response!;

  try {
    const data = await req.formData()
    const type = data.get('type') as string
    const files = data.getAll('file')
    const results: string[] = []

    if (!files || files.length === 0) {
      throw new Error('No file found')
    }

    const processFile = async (item: any) => {
      let fileBuffer: Buffer;
      let contentType: string;
      let fileName: string;

      if (item instanceof File) {
        fileBuffer = Buffer.from(await item.arrayBuffer());
        contentType = item.type;
        fileName = item.name;
      } else if (typeof item === 'string') {
        const base64String = item.includes(',') ? item.split(',')[1] : item;
        fileBuffer = Buffer.from(base64String, 'base64');
        contentType = item.includes('data:') ? item.split(';')[0].split(':')[1] : 'image/png';
        fileName = `file_${Date.now()}.png`;
      } else {
        throw new Error('Unsupported file format');
      }

      if (!ALLOWED_IMAGE_TYPES.includes(contentType)) {
        throw new Error('Only images can be uploaded here');
      }
      if (fileBuffer.length > MAX_FILE_SIZE) {
        throw new FileTooLargeError(TOO_LARGE_MESSAGE);
      }

      const options: any = {
        folder: type === 'avatar' ? 'fyp-stacks/avatar' : 'fyp-stacks/gallery',
      };

      if (type === 'avatar') {
        // Force filename to {profileId}_avatar.png and convert to PNG
        fileName = `${session?.user?.profileId}_avatar.png`;
        fileBuffer = await sharp(fileBuffer)
          .rotate()
          .resize(AVATAR_MAX_EDGE, AVATAR_MAX_EDGE, { fit: 'inside', withoutEnlargement: true })
          .png()
          .toBuffer();
        contentType = 'image/png';
      } else {
        fileName = `${Date.now()}_${fileName.replace(/\s+/g, '_')}`;
      }

      const uploadResult = await uploadToS3(fileBuffer, {
        ...options,
        contentType,
        fileName,
      });

      return uploadResult.url;
    }

    if (type === 'avatar') {
      const url = await processFile(files[0]);
      return Response.json(
        {
          message: 'File uploaded successfully',
          url: url,
        },
        { status: 200 }
      )
    }

    const uploadFiles = await Promise.allSettled(files.map(processFile));

    uploadFiles.forEach((result) => {
      if (result.status === 'fulfilled') {
        results.push(result.value)
      } else {
        console.error('Upload error:', result.reason)
      }
    })

    return Response.json(
      {
        message: 'File uploaded successfully',
        url: results,
      },
      { status: 200 }
    )
  } catch (error: any) {
    if (error instanceof FileTooLargeError) {
      return Response.json({ message: TOO_LARGE_MESSAGE }, { status: 413 })
    }
    console.error('S3 upload error:', error)
    return Response.json(
      { message: 'Upload failed. Please try again.' },
      { status: 500 }
    )
  }
}
