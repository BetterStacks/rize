import type { UploadFilesWithTypeResponse } from '@/lib/types'

/**
 * Client-side upload helpers.
 *
 * Vercel Functions reject request bodies over 4.5 MB before our code runs, so
 * every upload has to arrive well under that. Images are downsized and
 * re-encoded in the browser; videos and PDFs are not transcoded and are
 * capped at 4 MB. Each file goes up in its own request.
 */

const MB = 1024 * 1024

/** Largest file we send in one request (matches the server routes). */
export const MAX_UPLOAD_BYTES = 4 * MB
/** Size we aim for when re-encoding an image. */
export const IMAGE_TARGET_BYTES = 3.5 * MB
/** Largest raw image we will try to shrink in the browser. */
export const MAX_SOURCE_IMAGE_BYTES = 25 * MB
/** Longest edge of an uploaded image. */
export const MAX_IMAGE_EDGE = 2560
/** Longest edge of an avatar. */
export const MAX_AVATAR_EDGE = 1024

export const UPLOAD_MESSAGES = {
  imageTooLarge: 'That image is too large to upload. Try a smaller one.',
  gifTooLarge: 'GIFs can be up to 3.5 MB. Try a shorter or smaller one.',
  videoTooLarge: 'Videos can be up to 4 MB for now.',
  pdfTooLarge: 'PDFs can be up to 4 MB for now.',
  resumeTooLarge: 'Resumes can be up to 4 MB for now.',
  unreadableImage: "We couldn't read that image. Try a JPG or PNG.",
  rateLimited: "You're uploading a lot at once. Wait a minute and try again.",
  generic: "That upload didn't go through. Try again.",
} as const

// Types the upload routes accept as-is.
const PASSTHROUGH_IMAGE_TYPES = new Set([
  'image/png',
  'image/jpeg',
  'image/jpg',
  'image/webp',
])

/** An error whose message is safe to show people as-is. */
export class UploadError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'UploadError'
  }
}

const isImage = (file: File) =>
  file.type.startsWith('image/') ||
  /\.(jpe?g|png|gif|webp|heic|heif|bmp|tiff?|avif)$/i.test(file.name)

const isGif = (file: File) =>
  file.type === 'image/gif' || /\.gif$/i.test(file.name)

const fileStem = (name: string) => name.replace(/\.[^./]+$/, '') || 'image'

type Decoded = {
  source: CanvasImageSource
  width: number
  height: number
  release: () => void
}

async function decodeImage(blob: Blob): Promise<Decoded> {
  if (typeof createImageBitmap === 'function') {
    try {
      const bitmap = await createImageBitmap(blob, {
        imageOrientation: 'from-image',
      } as ImageBitmapOptions)
      return {
        source: bitmap,
        width: bitmap.width,
        height: bitmap.height,
        release: () => bitmap.close(),
      }
    } catch {
      // Fall through to <img>, which some browsers decode more formats with.
    }
  }

  const url = URL.createObjectURL(blob)
  try {
    const img = new Image()
    img.decoding = 'async'
    img.src = url
    await img.decode()
    return {
      source: img,
      width: img.naturalWidth,
      height: img.naturalHeight,
      release: () => URL.revokeObjectURL(url),
    }
  } catch {
    URL.revokeObjectURL(url)
    throw new UploadError(UPLOAD_MESSAGES.unreadableImage)
  }
}

function canvasToBlob(
  canvas: HTMLCanvasElement,
  type: string,
  quality: number
): Promise<Blob | null> {
  return new Promise((resolve) => canvas.toBlob(resolve, type, quality))
}

/**
 * Draws `decoded` scaled so its long edge is at most `maxEdge`, then encodes
 * it as WebP (or JPEG where the browser can't encode WebP), stepping quality
 * down and, if needed, the dimensions, until it fits `targetBytes`.
 */
async function encodeImage(
  decoded: Decoded,
  maxEdge: number,
  targetBytes: number
): Promise<Blob> {
  const qualities = [0.85, 0.75, 0.65, 0.6]
  let edge = Math.min(maxEdge, Math.max(decoded.width, decoded.height))

  for (let attempt = 0; attempt < 3; attempt++) {
    const scale = Math.min(1, edge / Math.max(decoded.width, decoded.height))
    const width = Math.max(1, Math.round(decoded.width * scale))
    const height = Math.max(1, Math.round(decoded.height * scale))

    const canvas = document.createElement('canvas')
    canvas.width = width
    canvas.height = height
    const ctx = canvas.getContext('2d')
    if (!ctx) throw new UploadError(UPLOAD_MESSAGES.unreadableImage)

    let type = 'image/webp'
    const draw = (fillWhite: boolean) => {
      ctx.clearRect(0, 0, width, height)
      if (fillWhite) {
        // JPEG has no transparency; keep transparent areas white, not black.
        ctx.fillStyle = '#ffffff'
        ctx.fillRect(0, 0, width, height)
      }
      ctx.imageSmoothingQuality = 'high'
      ctx.drawImage(decoded.source, 0, 0, width, height)
    }
    draw(false)

    for (const quality of qualities) {
      let blob = await canvasToBlob(canvas, type, quality)
      // Browsers that can't encode WebP silently return PNG instead.
      if (type === 'image/webp' && blob?.type !== 'image/webp') {
        type = 'image/jpeg'
        draw(true)
        blob = await canvasToBlob(canvas, type, quality)
      }
      if (blob && blob.size <= targetBytes) return blob
    }

    edge = Math.round(edge * 0.75)
  }

  throw new UploadError(UPLOAD_MESSAGES.imageTooLarge)
}

/**
 * Makes a file safe to upload: images are shrunk to fit, GIFs up to 3.5 MB
 * pass through untouched (larger ones are rejected, since converting them
 * would lose the animation), and videos and PDFs over 4 MB are rejected.
 * Throws an `UploadError` with a message meant for people.
 */
export async function prepareUpload(
  file: File,
  { maxEdge = MAX_IMAGE_EDGE }: { maxEdge?: number } = {}
): Promise<File> {
  if (!isImage(file)) {
    if (file.size <= MAX_UPLOAD_BYTES) return file
    throw new UploadError(
      file.type === 'application/pdf'
        ? UPLOAD_MESSAGES.pdfTooLarge
        : UPLOAD_MESSAGES.videoTooLarge
    )
  }

  if (isGif(file)) {
    if (file.size <= IMAGE_TARGET_BYTES) return file
    throw new UploadError(UPLOAD_MESSAGES.gifTooLarge)
  }

  // Small images in a format the server takes: send as-is. The server already
  // rotates, resizes and converts them, so re-encoding here would only cost
  // quality.
  if (
    PASSTHROUGH_IMAGE_TYPES.has(file.type) &&
    file.size <= IMAGE_TARGET_BYTES &&
    maxEdge >= MAX_IMAGE_EDGE
  ) {
    return file
  }

  if (file.size > MAX_SOURCE_IMAGE_BYTES) {
    throw new UploadError(UPLOAD_MESSAGES.imageTooLarge)
  }

  const decoded = await decodeImage(file)
  try {
    const blob = await encodeImage(decoded, maxEdge, IMAGE_TARGET_BYTES)
    const ext = blob.type === 'image/webp' ? 'webp' : 'jpg'
    return new File([blob], `${fileStem(file.name)}.${ext}`, {
      type: blob.type,
      lastModified: Date.now(),
    })
  } finally {
    decoded.release()
  }
}

/**
 * Turns an image (a Blob or a blob:/data:/http URL) into a small JPEG data
 * URL for the avatar route, with the long edge at most 1024px.
 */
export async function prepareAvatarDataUrl(src: Blob | string): Promise<string> {
  const blob =
    typeof src === 'string' ? await fetch(src).then((r) => r.blob()) : src
  const decoded = await decodeImage(blob)
  let out: Blob
  try {
    const scale = Math.min(
      1,
      MAX_AVATAR_EDGE / Math.max(decoded.width, decoded.height)
    )
    const width = Math.max(1, Math.round(decoded.width * scale))
    const height = Math.max(1, Math.round(decoded.height * scale))
    const canvas = document.createElement('canvas')
    canvas.width = width
    canvas.height = height
    const ctx = canvas.getContext('2d')
    if (!ctx) throw new UploadError(UPLOAD_MESSAGES.unreadableImage)
    ctx.fillStyle = '#ffffff'
    ctx.fillRect(0, 0, width, height)
    ctx.imageSmoothingQuality = 'high'
    ctx.drawImage(decoded.source, 0, 0, width, height)
    const encoded = await canvasToBlob(canvas, 'image/jpeg', 0.9)
    if (!encoded) throw new UploadError(UPLOAD_MESSAGES.unreadableImage)
    out = encoded
  } finally {
    decoded.release()
  }

  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onloadend = () => resolve(reader.result as string)
    reader.onerror = () => reject(new UploadError(UPLOAD_MESSAGES.generic))
    reader.readAsDataURL(out)
  })
}

/** Maps an HTTP status and parsed body (if any) to a message for people. */
function messageForResponse(status: number, body: unknown): string {
  if (status === 429) return UPLOAD_MESSAGES.rateLimited
  const b = body as { error?: unknown; message?: unknown } | null
  const serverMessage =
    (typeof b?.error === 'string' && b.error) ||
    (typeof b?.message === 'string' && b.message)
  // Vercel's own 413 has no JSON body; ours explains the limit.
  if (status === 413) return serverMessage || UPLOAD_MESSAGES.imageTooLarge
  return serverMessage || UPLOAD_MESSAGES.generic
}

/**
 * Reads a fetch Response from an upload route. Throws an `UploadError` with a
 * plain message when it failed; Vercel's own 413 page isn't JSON, so this
 * never assumes the body parses.
 */
export async function readUploadResponse<T = unknown>(res: Response): Promise<T> {
  const body = await res.json().catch(() => null)
  if (!res.ok) throw new UploadError(messageForResponse(res.status, body))
  return body as T
}

/**
 * Prepares and uploads files to /api/upload/files, one file per request so a
 * batch can't exceed the request size limit. Returns the same array the
 * route returns, concatenated across requests.
 */
export async function uploadFiles(
  files: File[],
  folder: string
): Promise<UploadFilesWithTypeResponse[]> {
  // Check everything first so a bad file doesn't leave half a batch uploaded.
  const prepared: File[] = []
  for (const file of files) prepared.push(await prepareUpload(file))

  const results: UploadFilesWithTypeResponse[] = []
  for (const file of prepared) {
    const fd = new FormData()
    fd.append('files', file)
    fd.append('folder', folder)
    let res: Response
    try {
      res = await fetch('/api/upload/files', { method: 'POST', body: fd })
    } catch {
      throw new UploadError(UPLOAD_MESSAGES.generic)
    }
    const body = await readUploadResponse<{
      success?: boolean
      data?: UploadFilesWithTypeResponse[] | null
    }>(res)
    if (!body?.success || !body.data?.length) {
      throw new UploadError(UPLOAD_MESSAGES.generic)
    }
    results.push(...body.data)
  }
  return results
}

/** A message safe to show for any error thrown while uploading. */
export function uploadErrorMessage(
  err: unknown,
  fallback: string = UPLOAD_MESSAGES.generic
): string {
  if (err instanceof UploadError) return err.message
  const status = (err as { response?: { status?: number } })?.response?.status
  if (status === 413) return UPLOAD_MESSAGES.imageTooLarge
  if (status === 429) return UPLOAD_MESSAGES.rateLimited
  return fallback
}
