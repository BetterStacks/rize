import instance from '@/lib/axios-instance'

export const uploadMedia = async (formData: FormData) => {
  const res = await instance.post('/upload/files', formData)
  if (res.status !== 200) throw new Error('Upload failed')
  return res.data?.data
}
