'use client'

import React from 'react'
import { useRef } from 'react'
import { IconUpload } from '@tabler/icons-react'


export default function RoastCard({ roast }: { roast: string }) {
    const cardRef = useRef<HTMLDivElement>(null)

    const handleShare = async () => {
        const text = 'Just got brutally roasted by Rize Resume Roaster 💀🔥\nCheck out this tool by @betterstacks \n\n Check yours at: \n'
        const url = 'https://rize.so'
        
        const tweetUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`
        window.open(tweetUrl, '_blank')
    }

    return (
        <div ref={cardRef} className="mt-8 my-12 p-6 rounded-lg dark:bg-neutral-800 bg-neutral-100 shadow-md w-full max-w-2xl">
            <div className="flex justify-between">
                <h2 className="text-lg font-semibold tracking-wide text-sky-500 dark:text-[#FFDA37] my-3">Your Roast</h2>
                <button onClick={handleShare} className="flex items-center justify-center gap-2 border dark:border-white/30 border-black/30 hover:bg-neutral-200 dark:hover:bg-neutral-700 h-9 px-5 text-black dark:text-white tracking-wide rounded-lg font-medium text-sm cursor-pointer">
                    <IconUpload size={18} />
                    <div>Share on X</div>
                </button>
            </div>
            <p className="text-sm whitespace-pre-wrap leading-relaxed tracking-wide text-black dark:text-white">{roast}</p>
        </div>
    )
}