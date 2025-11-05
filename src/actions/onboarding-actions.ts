'use server'

import db from '@/lib/db'
import { users } from '@/db/schema'
import { getServerSession } from '@/lib/auth'
import { eq } from 'drizzle-orm'
import { revalidatePath } from 'next/cache'
import axios from 'axios'
import { VAPI_ASSISTANT_CONFIG } from '@/lib/vapi-config'

export async function initiateOnboardingCall(phoneNumber: string) {
    try {
        const session = await getServerSession()
    
        if (!session?.user?.id) {
            return { success: false, error: 'Not authenticated' }
        }

        // Update user with phone number
        await db
            .update(users)
            .set({
                phoneNumber: phoneNumber,
                phoneNumberCollected: true,
                updatedAt: new Date(),
            })
            .where(eq(users.id, session.user.id))

        // Trigger Vapi call here
        const vapiResponse = await axios.post('https://api.vapi.ai/call/phone', {
            phoneNumberId: process.env.VAPI_PHONE_NUMBER_ID,
            customer: { number: phoneNumber },
            assistant: {
                ...VAPI_ASSISTANT_CONFIG,
                firstMessage: VAPI_ASSISTANT_CONFIG.firstMessage.replace('{userName}', session.user.name)
            },
            metadata: {
                userId: session.user.id,
                userName: session.user.name
            }
        }, {
            headers: {
                Authorization: `Bearer ${process.env.VAPI_API_KEY}`,
                'Content-Type': 'application/json',
            }
        })

        
        
        // Save call ID
        await db.update(users)
            .set({ onboardingCallId: vapiResponse.data.id })
            .where(eq(users.id, session.user.id))
    
        revalidatePath('/[username]')
        return { success: true }

    } catch (error) {
        return { success: false, error: 'Failed to initiate call' }
    }
}

export async function skipOnboarding() {
    try {
        const session = await getServerSession()
    
        if (!session?.user?.id) {
            return { success: false, error: 'Not authenticated' }
        }

        // Use session token as cookie key (expires with session)
        const { cookies } = await import('next/headers')
        const cookieStore = await cookies()
        cookieStore.set(`phone_skipped_${session.session.token}`, 'true')
    
        revalidatePath('/[username]')
    
        return { success: true }
    } catch (error) {
        return { success: false, error: 'Failed to skip' }
    }
}