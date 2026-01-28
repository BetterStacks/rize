'use client'

import React from 'react'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { X } from 'lucide-react'
import { useAIPromptDialog } from '@/components/dialog-provider'
import { useActiveSidebarTab } from '@/lib/context'
import { usePanel } from '@/lib/panel-context'
import { useLocalStorage } from '@mantine/hooks'
import Image from 'next/image'

export const AIDialogPrompt = () => {
    const [isOpen, setIsOpen] = useAIPromptDialog()
    const [, setActiveSidebarTab] = useActiveSidebarTab()
    const { toggleRightPanel } = usePanel()
    const [, setIsAIPromptDismissed] = useLocalStorage<boolean>({
        key: 'ai-prompt-dismissed',
        defaultValue: false,
    })

    const handleStartAI = () => {
        setIsOpen(false)
        setIsAIPromptDismissed(true)
        setActiveSidebarTab({ id: null, tab: 'chat' })

    }

    const handleDismiss = () => {
        setIsOpen(false)
        setIsAIPromptDismissed(true)
    }

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogContent
                className="sm:max-w-[440px] dark:bg-dark-bg sm:rounded-[24px] p-0 overflow-hidden border-neutral-100 dark:border-dark-border shadow-2xl"
                onPointerDownOutside={(e) => e.preventDefault()}
                onEscapeKeyDown={(e) => e.preventDefault()}
            >
                <div className="relative">
                    {/* Illustration Area */}
                    <div className="w-full h-52 flex items-center justify-center relative overflow-hidden">

                        <Image src={"/claude.png"} className='absolute top-0 left-0 ' alt="AI" width={500} height={500} />
                    </div>

                    <button
                        onClick={handleDismiss}
                        className="absolute right-4 top-4 z-[60] p-1.5 rounded-full bg-black/5 hover:bg-black/10 dark:bg-white/5 dark:hover:bg-white/10 text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white transition-all"
                    >
                        <X className="w-4 h-4" />
                    </button>

                    <div className="p-8 pb-10">
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <DialogTitle className="text-xl font-medium tracking-tight">
                                    Get started building profile with AI
                                </DialogTitle>
                            </div>

                            <DialogDescription className="text-sm leading-relaxed text-neutral-600 dark:text-neutral-400">
                                Our AI assistant can help you craft a professional personal brand in just a few minutes. Tap into Harvard guided resume principles to stand out.
                            </DialogDescription>
                        </div>

                        <div className="mt-6 flex flex-col gap-3">
                            <Button
                                // size={"sm"}
                                onClick={handleStartAI}
                                className="w-full bg-neutral-900 hover:bg-neutral-800 dark:bg-white dark:hover:bg-neutral-200 text-white dark:text-neutral-900 font-medium rounded-lg  transition-all"
                            >
                                Start Building with AI
                            </Button>
                            {/* <Button
                                // size={"sm"}
                                variant="ghost"
                                onClick={handleDismiss}
                                className="w-full text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white font-medium rounded-lg transition-all"
                            >
                                Maybe Later
                            </Button> */}
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    )
}
