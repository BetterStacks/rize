'use client'

import { Check, Copy, QrCode } from 'lucide-react'
import { useState } from 'react'
import { Button } from '../ui/button'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '../ui/dialog'
import PersonAvatar from './person-avatar'

interface QRcodeProps {
    username?: string
    profileImage?: string
    name?: string
}

/** A small icon button that opens the profile's QR code and link. */
const QRcode = ({ username, profileImage, name }: QRcodeProps) => {
    const [isOpen, setIsOpen] = useState(false)
    const [isCopied, setIsCopied] = useState(false)
    const [profileUrl, setProfileUrl] = useState('')
    const [qrLoaded, setQrLoaded] = useState(false)

    const handleCopyLink = async () => {
        try {
            await navigator.clipboard.writeText(profileUrl)
            setIsCopied(true)
            setTimeout(() => setIsCopied(false), 1500)
        } catch {
            // Clipboard can be blocked; the link is visible to copy by hand.
        }
    }

    const qrUrl = profileUrl
        ? `https://api.qrserver.com/v1/create-qr-code/?size=300x300&margin=0&data=${encodeURIComponent(profileUrl)}`
        : null

    return (
        <>
            <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => {
                    if (username) setProfileUrl(`${window.location.origin}/${username}`)
                    setIsOpen(true)
                }}
                aria-label="Show QR code for this profile"
                className="size-11 rounded-lg text-[#5A5248] hover:text-[#1F1B16] dark:text-[#B3A999] dark:hover:text-[#F3EEE6]"
            >
                <QrCode className="size-5" />
            </Button>

            <Dialog open={isOpen} onOpenChange={setIsOpen}>
                <DialogContent className="max-w-sm rounded-[20px]">
                    <DialogHeader>
                        <DialogTitle className="font-instrument text-2xl font-normal">Scan to open</DialogTitle>
                        <DialogDescription>Point a phone camera at the code to open this profile.</DialogDescription>
                    </DialogHeader>
                    <div className="flex flex-col items-center gap-4 pt-2">
                        <PersonAvatar src={profileImage} name={name || username} size={48} />
                        <div className="relative size-[240px] rounded-xl bg-white p-3">
                            {!qrLoaded && <div className="absolute inset-3 animate-pulse rounded-lg bg-[#F1EEE7]" />}
                            {qrUrl && isOpen && (
                                <img
                                    src={qrUrl}
                                    alt={`QR code for ${profileUrl}`}
                                    width={216}
                                    height={216}
                                    className="size-full"
                                    onLoad={() => setQrLoaded(true)}
                                />
                            )}
                        </div>
                        <div className="flex w-full items-center justify-between gap-2 rounded-lg border border-[#E7E2D8] px-3 py-1 dark:border-[#2E2923]">
                            <span className="truncate text-sm text-[#5A5248] dark:text-[#B3A999]">
                                {profileUrl.replace(/^https?:\/\//, '')}
                            </span>
                            <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                onClick={handleCopyLink}
                                aria-label={isCopied ? 'Link copied' : 'Copy link'}
                                className="size-11 shrink-0 rounded-lg"
                            >
                                {isCopied ? <Check className="size-4" /> : <Copy className="size-4" />}
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </>
    )
}

export default QRcode
