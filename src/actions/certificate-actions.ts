'use server'

import { certificates } from '@/db/schema'
import { requireProfile } from '@/lib/auth'
import db from '@/lib/db'
import { TCertificate } from '@/lib/types'
import { and, eq } from 'drizzle-orm'
import { z } from 'zod'
import { getProfileIdByUsername } from './profile-actions'

const certificateSchema = z.object({
    id: z.string().optional(),
    name: z.string().min(1),
    fileUrl: z.string().min(1), // Required PDF file URL
    issuer: z.string().optional(),
    issueDate: z.date().optional(),
    expiryDate: z.date().optional(),
    description: z.string().optional(),
})

export async function upsertCertificate(data: z.infer<typeof certificateSchema>) {
    const profileId = await requireProfile()

    const validated = certificateSchema.parse(data)
    if (validated.id) {
        await db
            .update(certificates)
            .set({ ...validated, updatedAt: new Date() })
            .where(eq(certificates.id, validated.id))
    } else {
        await db.insert(certificates).values({ ...validated, profileId })
    }
}

export const getAllCertificates = async (username: string) => {
    const profileId = await getProfileIdByUsername(username)
    if (!profileId) {
        throw new Error('Profile not found')
    }
    const allCertificates = await db
        .select()
        .from(certificates)
        .where(eq(certificates.profileId, profileId?.id as string))
    if (allCertificates?.length === 0) {
        return []
    }
    return allCertificates as TCertificate[]
}

export const getCertificateById = async (id: string) => {
    const profileId = await requireProfile()
    const data = await db
        .select()
        .from(certificates)
        .where(and(eq(certificates.id, id as string), eq(certificates.profileId, profileId)))
        .limit(1)
    if (data?.length === 0) {
        return null
    }
    return data[0] as TCertificate
}

export async function deleteCertificate(id: string) {
    const profileId = await requireProfile()
    await db
        .delete(certificates)
        .where(and(eq(certificates.id, id), eq(certificates.profileId, profileId)))
}
