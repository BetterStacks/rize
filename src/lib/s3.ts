import { S3Client, PutObjectCommand, DeleteObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'

// Initialize S3 client
const s3Client = new S3Client({
    region: process.env.AWS_S3_REGION || 'us-east-2',
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
    },
})

const BUCKET_NAME = process.env.AWS_S3_BUCKET_NAME || ''

export interface UploadOptions {
    folder?: string
    fileName?: string
    contentType?: string
    isPublic?: boolean
}

export interface UploadResult {
    url: string
    key: string
    bucket: string
}

/**
 * Upload a file to S3
 * @param fileBuffer - The file buffer to upload
 * @param options - Upload options
 * @returns Upload result with URL and key
 */
export async function uploadToS3(
    fileBuffer: Buffer,
    options: UploadOptions = {}
): Promise<UploadResult> {
    const {
        folder = 'uploads',
        fileName = `file_${Date.now()}`,
        contentType = 'application/octet-stream',
        isPublic = true,
    } = options

    const key = folder ? `${folder}/${fileName}` : fileName

    const command = new PutObjectCommand({
        Bucket: BUCKET_NAME,
        Key: key,
        Body: fileBuffer,
        ContentType: contentType,
        // ACL: 'public-read' removed because bucket does not allow ACLs
    })

    try {
        await s3Client.send(command)
    } catch (error: any) {
        console.error('S3 Upload Error:', error)
        // If this fails with "AccessControlListNotSupported", it means the bucket 
        // has disabled ACLs. In that case, the employer must set a Bucket Policy.
        throw new Error(`S3 upload failed: ${error.message}`)
    }

    // Use AWS_REGION if available, otherwise fallback to AWS_S3_REGION or us-west-2
    const region = process.env.AWS_S3_REGION || 'us-west-2'
    const url = `https://${BUCKET_NAME}.s3.${region}.amazonaws.com/${key}`

    return {
        url,
        key,
        bucket: BUCKET_NAME,
    }
}

/**
 * Upload a base64 encoded file to S3
 * @param base64Data - Base64 encoded file data (with or without data URI prefix)
 * @param options - Upload options
 * @returns Upload result with URL and key
 */
export async function uploadBase64ToS3(
    base64Data: string,
    options: UploadOptions = {}
): Promise<UploadResult> {
    // Remove data URI prefix if present
    const base64String = base64Data.includes(',')
        ? base64Data.split(',')[1]
        : base64Data

    const fileBuffer = Buffer.from(base64String, 'base64')
    return uploadToS3(fileBuffer, options)
}

/**
 * Delete a file from S3
 * @param key - The S3 object key to delete
 */
export async function deleteFromS3(key: string): Promise<void> {
    const command = new DeleteObjectCommand({
        Bucket: BUCKET_NAME,
        Key: key,
    })

    await s3Client.send(command)
}

/**
 * Generate a presigned URL for temporary access to a private file
 * @param key - The S3 object key
 * @param expiresIn - Expiration time in seconds (default: 3600 = 1 hour)
 * @returns Presigned URL
 */
export async function getPresignedUrl(
    key: string,
    expiresIn: number = 3600
): Promise<string> {
    const command = new GetObjectCommand({
        Bucket: BUCKET_NAME,
        Key: key,
    })

    return getSignedUrl(s3Client, command, { expiresIn })
}

/**
 * Extract file extension from filename or content type
 */
export function getFileExtension(fileName: string, contentType?: string): string {
    // Try to get extension from filename
    const fileNameExt = fileName.split('.').pop()
    if (fileNameExt && fileNameExt !== fileName) {
        return fileNameExt
    }

    // Fallback to content type mapping
    const contentTypeMap: Record<string, string> = {
        'image/jpeg': 'jpg',
        'image/png': 'png',
        'image/gif': 'gif',
        'image/webp': 'webp',
        'application/pdf': 'pdf',
        'application/msword': 'doc',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'docx',
    }

    return contentType ? contentTypeMap[contentType] || 'bin' : 'bin'
}

export { s3Client }
