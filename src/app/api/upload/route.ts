import { requireAuth } from '@/lib/auth'
import { NextRequest } from 'next/server'
import { uploadToS3 } from '@/lib/s3'
import sharp from 'sharp'

export async function POST(req: NextRequest) {
  try {
    const data = await req.formData()
    const type = data.get('type') as string
    const files = data.getAll('file')
    const session = await requireAuth()
    const results: string[] = []

    if (!files || files.length === 0) {
      throw new Error('No file found')
    }

    const processFile = async (item: any) => {
      let uploadResult;
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

      const options: any = {
        folder: type === 'avatar' ? 'fyp-stacks/avatar' : 'fyp-stacks/gallery',
      };

      if (type === 'avatar') {
        // Force filename to {profileId}_avatar.png and convert to PNG
        fileName = `${session?.user?.profileId}_avatar.png`;
        fileBuffer = await sharp(fileBuffer).png().toBuffer();
        contentType = 'image/png';
      } else {
        fileName = `${Date.now()}_${fileName.replace(/\s+/g, '_')}`;
      }

      uploadResult = await uploadToS3(fileBuffer, {
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
    console.error('S3 upload error:', error)
    return Response.json(
      { message: 'S3 upload failed', error: error.message },
      { status: 500 }
    )
  }
}
