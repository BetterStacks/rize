'use client'
import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import AnimatedOTP from '@/components/forgeui/animated-otp' // Your installed component
import { Button } from '@/components/ui/button'
import axios from 'axios'
import { toast } from 'sonner'

type EmailVerificationModalProps = {
    isOpen: boolean
    onClose: () => void
    userEmail: string
}

export default function EmailVerificationModal({ 
    isOpen, 
    onClose, 
    userEmail 
}: EmailVerificationModalProps) {
    const [otp, setOtp] = useState('')
    const [loading, setLoading] = useState(false)
    const [step, setStep] = useState<'send' | 'verify'>('send')

    const handleSendOTP = async () => {
        setLoading(true)
        try {
            // Call your API to send OTP
            await axios.post('/api/auth/send-verification-otp', { 
                email: userEmail 
            })
            toast.success('Verification code sent to your email')
            setStep('verify')
        } catch (err) {
            toast.error('Failed to send verification code')
        } finally {
            setLoading(false)
        }
    }

    const handleVerifyOTP = async () => {
        setLoading(true)
        try {
            await axios.post('/api/auth/verify-email-otp', { otp })
            toast.success('Email verified successfully!')
            onClose()
        } catch (error: any) {
            toast.error('Invalid verification code')
            setOtp('') // Clear OTP on error
        } finally {
            setLoading(false)
        }
    }

    const handleResend = () => {
        setOtp('')
        setStep('send')
    }

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Verify Your Email</DialogTitle>
                </DialogHeader>
        
                {step === 'send' ? (
                    <div className="space-y-4">
                        <p className="text-sm text-neutral-600 dark:text-neutral-400">
                            We'll send a 6-digit code to <span className="font-medium">{userEmail}</span> to verify your email before creating organizations.
                        </p>
                        <Button 
                            onClick={handleSendOTP} 
                            disabled={loading}
                            className="w-full disabled:opacity-50"
                        >
                            {loading ? 'Sending...' : 'Send Verification Code'}
                        </Button>
                    </div>
                ) : (
                    <div className="space-y-6">
                        <p className="text-sm text-neutral-600 dark:text-neutral-400">
                            Enter the 6-digit code sent to {userEmail}
                        </p>
            
                        <div className="flex justify-center">
                            <AnimatedOTP 
                                isInteractive={true}
                                value={otp} 
                                onChange={setOtp}
                                length={6}
                            />
                        </div>
            
                        <Button 
                            onClick={handleVerifyOTP} 
                            disabled={otp.length < 6 || loading} 
                            className="w-full disabled:opacity-50"
                        >
                            {loading ? 'Verifying...' : 'Verify Email'}
                        </Button>
            
                        <button 
                            onClick={handleResend}
                            disabled={loading}
                            className="text-sm text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300 w-full disabled:opacity-50"
                        >
                            Didn't receive code? Resend
                        </button>
                    </div>
                )}
            </DialogContent>
        </Dialog>
    )
}
