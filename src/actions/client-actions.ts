import { uploadFiles } from '@/lib/prepare-upload'
import { UploadFilesWithTypeResponse } from '@/lib/types'

/**
 * Uploads every "files" entry in `formData` to its "folder". Images are
 * shrunk in the browser first and each file goes in its own request; see
 * `uploadFiles`.
 */
export const uploadMedia = async (
  formData: FormData
): Promise<UploadFilesWithTypeResponse[]> => {
  const files = formData
    .getAll('files')
    .filter((f): f is File => f instanceof File)
  const folder = (formData.get('folder') as string) || 'uploads'
  return uploadFiles(files, folder)
}
