import { getServerSession } from '@/lib/auth'
import db from '@/lib/db'
import { verification } from '@/db/schema' 
import { NextResponse } from 'next/server'
import { Resend } from 'resend'

export async function POST(req: Request) {
    try {
        const session = await getServerSession()
        if (!session?.user) {
            return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
        }

        const { email } = await req.json()
    
        if (session.user.email !== email) {
            return NextResponse.json({ message: 'Email mismatch' }, { status: 400 })
        }

        // Generate 6-digit OTP
        const otp = Math.floor(100000 + Math.random() * 900000).toString()
    
        // Store OTP in verification table with 10 min expiry
        await db.insert(verification).values({
            identifier: email,
            value: otp,
            expiresAt: new Date(Date.now() + 10 * 60 * 1000), // 10 minutes
        })

        const resend = new Resend(process.env.RESEND_API_KEY)
        
        await resend.emails.send({
            from: 'onboarding@resend.dev', // Use verified Resend domain i'm using test email
            to: email,
            subject: 'Verify your email',
            html: `<p>Your verification code is: <strong>${otp}</strong></p> <p>This code expires in 10 minutes.</p>`
        })
    
        console.log(`OTP for ${email}: ${otp}`) // For testing only

        return NextResponse.json({ message: 'OTP sent successfully' })
    } catch (error) {
        console.error('Send OTP error:', error)
        return NextResponse.json({ message: 'Failed to send OTP' }, { status: 500 })
    }
}