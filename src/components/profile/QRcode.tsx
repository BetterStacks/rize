'use client'

import { useState, useEffect } from 'react'
import { X, Copy, Check } from 'lucide-react'
import { IoQrCodeOutline } from 'react-icons/io5'
import Image from 'next/image'
import { Skeleton } from '../ui/skeleton'

interface QRcodeProps {
    username?: string
    profileImage?: string
}

const QRcode = ({ username, profileImage }: QRcodeProps) => {
    const [isOpen, setIsOpen] = useState(false)
    const [qrCodeUrl, setQrCodeUrl] = useState<string | null>(null)
    const [isLoading, setIsLoading] = useState(false)
    const [isCopied, setIsCopied] = useState(false)

    const handleCopyLink = () => {
        const profileUrl = `${window.location.origin}/${username}`
        navigator.clipboard.writeText(profileUrl)
        setIsCopied(true)
  
        setTimeout(() => {
            setIsCopied(false)
        }, 1000)
    }

    useEffect(() => {
        if (isOpen && !qrCodeUrl && username) {
            setIsLoading(true)
      
            // Generate the profile URL
            const profileUrl = `${window.location.origin}/${username}`
      
            // Using goqr.me API - free and no authentication needed
            const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(profileUrl)}`
            
            // Add delay for better UX
            setTimeout(() => {
                setQrCodeUrl(qrUrl)
                setIsLoading(false)
            }, 800) 
        }
    }, [isOpen, username, qrCodeUrl])

    const handleOpenModal = () => {
        setIsOpen(true)
    }

    const handleCloseModal = () => {
        setIsOpen(false)
    }

    return (
    <>
        <div className="pt-6 py-2">
            <button
                onClick={handleOpenModal}
                className="dark:text-white text-black font-medium text-sm cursor-pointer transition-all duration-200 flex items-center gap-2"
            >
                <IoQrCodeOutline className='size-7 sm:size-8' />
            </button>
        </div>

        {isOpen && (
            <div 
                className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            >
                <div 
                    className="bg-white dark:bg-neutral-900 rounded-2xl shadow-2xl max-w-md w-full p-6 relative animate-in fade-in zoom-in-95 duration-200"
                    onClick={(e) => e.stopPropagation()}
                >
                    <button
                        onClick={handleCloseModal}
                        className="absolute top-6 right-8 text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300 transition-colors"
                        aria-label="Close"
                    >
                        <X className="w-6 h-6" />
                    </button>

                    {isLoading ? (
                        <div className="flex flex-col items-center">
                            <div className="bg-gradient-to-br from-neutral-50 to-neutral-100 dark:from-neutral-800 dark:to-neutral-900 p-5 mt-4 rounded-xl">
                                <Skeleton className="w-[300px] h-[300px]" />
                            </div>
                        </div>
                    ) : qrCodeUrl ? (
                        <div className="flex flex-col items-center">
                            <div className="mt-8 relative flex justify-center">
                                <Image
                                    src={profileImage || '/default-avatar.png'}
                                    alt='profile'
                                    width={65}
                                    height={65}
                                    className='rounded-full absolute -top-[35px] z-10 mx-auto mb-2'
                                />
                                <div className='bg-white p-4 px-7 pb-5 pt-10 rounded-md'>
                                    <Image
                                        src={qrCodeUrl}
                                        alt="Profile QR Code"
                                        width={300}
                                        height={300}
                                        className="w-full h-auto"
                                    />
                                </div>
                            </div>
                            <p className="flex items-center gap-4 mt-4 text-sm text-neutral-500 dark:text-neutral-400 text-center">
                                {window.location.origin}/{username}
                                <button 
                                    onClick={handleCopyLink}
                                    className="hover:text-neutral-700 dark:hover:text-neutral-300 transition-colors"
                                >
                                    {isCopied ? (
                                        <Check size={18} className='text-green-500' />
                                    ) : (
                                        <Copy size={18} className='cursor-pointer' />
                                    )}
                                </button>
                            </p>
                            <h3 className="mt-5 rounded-sm w-fit px-10 sm:px-14 py-1 mx-auto text-sm sm:text-xl font-semibold border border-dashed border-[#F3A10B] text-neutral-900 dark:text-white mb-4 tracking-wide">
                                Scan to Connect
                            </h3>
                        </div>
                    ) : null}
                </div>
            </div>
        )}
    </>
  )
}

export default QRcode