'use server'

import db from '@/lib/db'
import { organizations } from '@/db/schema'
import { getServerSession } from '@/lib/auth'
import { eq, and } from 'drizzle-orm'
import { revalidatePath } from 'next/cache'

function generateSlug(name: string): string {
    return name
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
}

export async function createOrganization(data: {
    name: string;
    type: string;
    logo: string;
    description: string;
    address: string;
    email: string;
    phone: string;
    website: string;
    foundedYear: number;
}) {
    const session = await getServerSession()
    if (!session?.user) return { success: false, error: 'Unauthorized' }
    if (!session.user.emailVerified) return { success: false, error: 'Email not verified' }

    const slug = generateSlug(data.name)

    try {
        const org = await db.insert(organizations).values({
            userId: session.user.id,
            slug,
            ...data,
        }).returning()

        revalidatePath(`/${session.user.username}`)
        return { success: true, data: org[0] }
    } catch (error) {
        return { success: false, error: 'Failed to create organization' }
    }
}

export async function getOrganizationsByUsername(username: string) {
    // First get user by username
    const profile = await db.query.profile.findFirst({
        where: (profile, { eq }) => eq(profile.username, username),
    })

    if (!profile) return []

    const orgs = await db.query.organizations.findMany({
        where: (organizations, { eq }) => eq(organizations.userId, profile.userId),
        with: { logo: true },
    })
    return orgs
}

export async function getOrganizationBySlug(username: string, slug: string) {
    const profile = await db.query.profile.findFirst({
        where: (profile, { eq }) => eq(profile.username, username),
    })
    
    if (!profile) return null
    
    const org = await db.query.organizations.findFirst({
        where: (organizations, { and, eq }) => and(
            eq(organizations.userId, profile.userId),
            eq(organizations.slug, slug)
        ),
        with: { logo: true, user: true },
    })
    return org
}

export async function getOrganizationById(id: string) {
    const org = await db.query.organizations.findFirst({
        where: eq(organizations.id, id),
        with: { logo: true },
    })
    return org
}

export async function updateOrganization(id: string, data: Partial<typeof organizations.$inferInsert>) {
    const session = await getServerSession()
    if (!session?.user) return { success: false, error: 'Unauthorized' }

    const org = await db.query.organizations.findFirst({ where: eq(organizations.id, id) })
    if (!org || org.userId !== session.user.id) {
        return { success: false, error: 'Unauthorized' }
    }
    
    if (data.name) {
        data.slug = generateSlug(data.name)
    }


    try {
        const updated = await db.update(organizations)
        .set({ ...data, updatedAt: new Date() })
        .where(eq(organizations.id, id))
        .returning()

        revalidatePath(`/${session.user.username}`)
        return { success: true, data: updated[0] }
    } catch (error) {
        return { success: false, error: 'Failed to update' }
    }
}

export async function deleteOrganization(id: string) {
    const session = await getServerSession()
    if (!session?.user) return { success: false, error: 'Unauthorized' }

    const org = await db.query.organizations.findFirst({ where: eq(organizations.id, id) })
    if (!org || org.userId !== session.user.id) {
        return { success: false, error: 'Unauthorized' }
    }

    try {
        await db.delete(organizations).where(eq(organizations.id, id))
        revalidatePath(`/${session.user.username}`)
        return { success: true }
    } catch (error) {
        return { success: false, error: 'Failed to delete' }
    }
}
