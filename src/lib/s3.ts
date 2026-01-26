import { S3Client, PutObjectCommand, DeleteObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'
import sharp from 'sharp'

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
    width?: number
    height?: number
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

    const extension = getFileExtension(fileName, contentType)
    let finalFileName = fileName
    if (!fileName.includes('.') && extension !== 'bin') {
        finalFileName = `${fileName}.${extension}`
    }

    const sanitizedFileName = sanitizeFileName(finalFileName)
    const key = folder ? `${folder}/${sanitizedFileName}` : sanitizedFileName

    // Detect dimensions
    let width: number | undefined;
    let height: number | undefined;

    try {
        if (contentType.startsWith('image/')) {
            const dims = await getImageDimensions(fileBuffer);
            width = dims.width;
            height = dims.height;
        } else if (contentType.startsWith('video/')) {
            const dims = getVideoDimensions(fileBuffer);
            width = dims.width;
            height = dims.height;
        }
    } catch (error) {
        console.warn('Failed to detect dimensions:', error);
    }

    const command = new PutObjectCommand({
        Bucket: BUCKET_NAME,
        Key: key,
        Body: fileBuffer,
        ContentType: contentType,
    })

    try {
        await s3Client.send(command)
    } catch (error: any) {
        console.error('S3 Upload Error:', error)
        throw new Error(`S3 upload failed: ${error.message}`)
    }

    const region = process.env.AWS_S3_REGION || 'us-west-2'
    const url = `https://${BUCKET_NAME}.s3.${region}.amazonaws.com/${key}`

    return {
        url,
        key,
        bucket: BUCKET_NAME,
        width,
        height,
    }
}

/**
 * Get image dimensions using sharp
 */
async function getImageDimensions(buffer: Buffer): Promise<{ width?: number, height?: number }> {
    try {
        const metadata = await sharp(buffer).metadata();
        return { width: metadata.width, height: metadata.height };
    } catch (error) {
        console.error('Error getting image dimensions:', error);
        return {};
    }
}

/**
 * Get video dimensions (MP4/MOV) by parsing atoms in pure JS
 */
function getVideoDimensions(buffer: Buffer): { width?: number, height?: number } {
    try {
        // Look for 'tkhd' atom in MP4/MOV
        const tkhdOffset = buffer.indexOf(Buffer.from('tkhd'));
        if (tkhdOffset === -1) return {};

        // Version is at tkhdOffset + 4
        // Flags are at tkhdOffset + 5 (3 bytes)
        // Creation time, modification time...
        // The width and height are at the end of the tkhd atom.
        // For version 0: width starts at offset + 76, height at offset + 80
        // For version 1: width starts at offset + 88, height at offset + 92

        const version = buffer[tkhdOffset + 4];
        let widthOffset = tkhdOffset + (version === 0 ? 76 : 88);
        let heightOffset = tkhdOffset + (version === 0 ? 80 : 92);

        if (widthOffset + 4 > buffer.length || heightOffset + 4 > buffer.length) return {};

        // Width and height are 32-bit fixed-point (16.16)
        const width = buffer.readUInt32BE(widthOffset) >> 16;
        const height = buffer.readUInt32BE(heightOffset) >> 16;

        return { width, height };
    } catch (error) {
        console.error('Error parsing video dimensions:', error);
        return {};
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
        'video/mp4': 'mp4',
        'video/quicktime': 'mov',
        'video/webm': 'webm',
        'audio/mpeg': 'mp3',
        'audio/wav': 'wav',
        'application/pdf': 'pdf',
        'application/msword': 'doc',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'docx',
    }

    return contentType ? contentTypeMap[contentType] || (contentType.split('/')[1] || 'bin') : 'bin'
}

/**
 * Extract the S3 key from a full S3 URL.
 * Example: https://bucket.s3.region.amazonaws.com/folder/file.jpg -> folder/file.jpg
 */
export function getS3KeyFromUrl(url: string): string {
    try {
        const urlObj = new URL(url)
        // Pathname starts with /, so we slice(1) to get the key
        return decodeURIComponent(urlObj.pathname.slice(1))
    } catch (error) {
        console.error('Error parsing S3 URL:', error)
        return ''
    }
}

/**
 * Sanitize filename to be URL-safe by removing or replacing special characters.
 * S3 keys with characters like '#' or '?' can break direct URL access in browsers.
 */
export function sanitizeFileName(fileName: string): string {
    return fileName
        .replace(/\s+/g, '_')           // Replace spaces with underscores
        .replace(/[#?%&]/g, '')         // Remove characters that have special meaning in URLs
        .replace(/[^\w.-]/g, '_')       // Replace any other non-word characters (except . and -) with underscores
        .replace(/_{2,}/g, '_')         // Replace multiple underscores with a single one
        .trim()
}

export { s3Client }
