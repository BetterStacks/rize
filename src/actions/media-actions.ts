'use server'

import db from '@/lib/db'
import { media } from '@/db/schema'
import { getServerSession } from '@/lib/auth'
import axios from 'axios'

export async function uploadMedia(file: File, username: string) {
    const session = await getServerSession()
    if (!session?.user) return { success: false, error: 'Unauthorized' }

    try {
        const formData = new FormData()
        formData.append('files', file)
        formData.append('folder', 'organizations/logos')

        // Call your existing upload API
        const res = await axios.post(`${process.env.NEXT_PUBLIC_APP_URL}/api/upload/files`, formData)
        if (res.status !== 200) throw new Error('Upload failed')
        const uploadedFile = res.data?.data[0]

        const profile = await db.query.profile.findFirst({
            where: (profile, { eq }) => eq(profile.userId, session.user.id)
        })

        if (!profile) return { success: false, error: 'Profile not found' }

        const result = await db.insert(media).values({
            url: uploadedFile.url,
            type: 'image', 
            width: 1024,
            height: 1024,
            profileId: profile.id,
        }).returning()

        return { success: true, data: result[0] }
    } catch (error) {
        console.error('Upload error:', error)
        return { success: false, error: 'Upload failed' }
    }
}