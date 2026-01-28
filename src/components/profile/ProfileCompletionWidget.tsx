'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronDown, CheckCircle2, Circle, ArrowRight, Check, MessageSquareText } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { cn } from '@/lib/utils'
import { usePanel } from '@/lib/panel-context'
import { useActiveSidebarTab } from '@/lib/context'

interface ProfileTask {
    id: string
    title: string
    description?: string
    completed: boolean
    action?: () => void
}

interface ProfileCompletionWidgetProps {
    tasks: ProfileTask[]
    onDismiss?: () => void
    className?: string
    hasBasicInfo?: boolean
}

export function ProfileCompletionWidget({
    tasks,
    onDismiss,
    className,
    hasBasicInfo = false
}: ProfileCompletionWidgetProps) {
    const [isExpanded, setIsExpanded] = useState(false)
    const [isDismissed, setIsDismissed] = useState(false)
    const { isRightPanelExpanded, toggleRightPanel, rightPanelRef } = usePanel()
    const [, setActiveSidebarTab] = useActiveSidebarTab()

    const completedCount = tasks.filter(task => task.completed).length
    const totalCount = tasks.length
    const progress = totalCount > 0 ? (completedCount / totalCount) * 100 : 0
    const isAllCompleted = totalCount > 0 && completedCount === totalCount

    // Determine the stage based on completion
    const stage = isAllCompleted ? 'Ask AI' : (completedCount > 0 ? 'Complete Profile' : 'Get Started')

    const handleDismiss = () => {
        setIsDismissed(true)
        onDismiss?.()
    }

    const handleAskAI = () => {
        setActiveSidebarTab({ id: null, tab: 'chat' })
    }

    if (isDismissed) return null

    return (
        <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{
                opacity: 1,
                y: 0,
                scale: 1,
                right: isRightPanelExpanded ? 'calc(26% + 1.5rem)' : '4rem'
            }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.3 }}
            className={cn(
                'fixed bottom-6 z-40',
                className
            )}
        >
            <div className="relative">
                {/* Expanded Content - Renders on top */}
                <AnimatePresence>
                    {isExpanded && !isAllCompleted && (
                        <motion.div
                            initial={{ opacity: 0, y: 10, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: 10, scale: 0.95 }}
                            transition={{ duration: 0.2 }}
                            className="absolute bottom-full mb-2 right-0 w-full min-w-[400px] max-w-md"
                        >
                            <div className="dark:bg-dark-bg bg-white border border-neutral-200 dark:border-dark-border shadow-xl shadow-neutral-200/50 dark:shadow-none rounded-2xl overflow-hidden">
                                {/* Expanded Header */}
                                <div className="p-4 pb-3">
                                    <div className="flex items-start justify-between ">
                                        <div className="flex-1">
                                            <h3 className=" font-medium dark:text-white text-neutral-900">{stage}</h3>
                                            <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
                                                Get familiar with your profile by completing the following tasks.
                                            </p>
                                        </div>
                                        <div className="flex items-center gap-1 ml-2">
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={handleDismiss}
                                                className="h-8 px-2 text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800"
                                            >
                                                <span className="text-xs">Dismiss forever</span>
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => setIsExpanded(false)}
                                                className="h-8 w-8 p-0 text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800"
                                            >
                                                <ChevronDown className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </div>
                                </div>

                                {/* Tasks List */}
                                <div className="mx-3 mb-4 rounded-xl mt-2 border border-neutral-200 dark:border-dark-border overflow-hidden">
                                    {tasks.map((task, index) => (
                                        <motion.div
                                            className='group '
                                            key={task.id}
                                            initial={{ opacity: 0, x: -20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: index * 0.05 }}
                                        >
                                            <button
                                                onClick={task.action}
                                                disabled={task.completed}
                                                className={cn(
                                                    "w-full p-3 hover:dark:bg-neutral-700/20 flex items-center justify-between group-first:border-0 border-t dark:border-dark-border transition-all group",
                                                    // 'w-full flex items-center justify-between p-3 rounded-lg transition-all group',
                                                    // 'border border-neutral-200 dark:border-dark-border  hover:border-neutral-300',
                                                    // task.completed && "dark:bg-neutral-700/20"
                                                )}
                                            >
                                                <div className="flex items-center gap-3 flex-1">
                                                    <div className={cn('size-5 rounded-full flex items-center justify-center', task.completed ? "bg-green-500" : " border border-neutral-200 dark:border-dark-border ")}>
                                                        {task.completed && (
                                                            <Check strokeWidth={2.4} className="size-3 stroke-white flex-shrink-0" />

                                                        )}
                                                    </div>
                                                    <div className="text-left">
                                                        <p
                                                            className={cn(
                                                                'text-sm font-medium',
                                                                task.completed
                                                                    ? 'text-neutral-500 dark:text-neutral-500 line-through'
                                                                    : 'dark:text-white text-neutral-900'
                                                            )}
                                                        >
                                                            {task.title}
                                                        </p>
                                                        {task.description && !task.completed && (
                                                            <p className="text-xs text-neutral-500 mt-0.5">
                                                                {task.description}
                                                            </p>
                                                        )}
                                                    </div>
                                                </div>
                                                {!task.completed && (
                                                    <ArrowRight className="h-4 w-4 text-neutral-400 dark:text-neutral-600 group-hover:text-neutral-600 dark:group-hover:text-neutral-400 transition-colors flex-shrink-0" />
                                                )}
                                            </button>
                                        </motion.div>
                                    ))}
                                </div>

                                {/* Progress Footer */}
                                <div className="px-4 py-3 mb-1 border-t dark:border-dark-border border-neutral-200">
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-sm dark:text-neutral-400 text-neutral-600">{stage}</span>
                                        <span className="text-sm dark:text-white text-neutral-900">{Math.round(progress)}%</span>
                                    </div>
                                    <Progress
                                        value={progress}
                                        className="h-2"
                                        indicatorClassName="dark:bg-green-500 bg-green-500"
                                    />
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Collapsed Button - Always visible */}
                <motion.button
                    layout
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={isAllCompleted ? handleAskAI : () => setIsExpanded(!isExpanded)}
                    className={cn(
                        "px-4 py-2.5 flex items-center gap-3 transition-all duration-300 dark:bg-dark-bg bg-white border shadow-2xl rounded-full",
                        isAllCompleted
                            ? "border-neutral-200 dark:border-dark-border hover:bg-neutral-50 dark:hover:bg-neutral-800/50"
                            : "border-neutral-300 dark:border-dark-border hover:bg-neutral-50 dark:hover:bg-neutral-800/50"
                    )}
                >
                    <div className="flex items-center gap-3">
                        {isAllCompleted ? (
                            <MessageSquareText className="size-5 text-green-500" />
                        ) : (
                            <div className="relative size-5">
                                {/* Circular progress background */}
                                <svg className="size-5 transform -rotate-90">
                                    <circle
                                        cx="10"
                                        cy="10"
                                        r="8"
                                        strokeWidth="3"
                                        fill="none"
                                        className="text-neutral-200 dark:stroke-neutral-600 dark:text-neutral-800"
                                    />
                                    <circle
                                        cx="10"
                                        cy="10"
                                        r="8"
                                        stroke="currentColor"
                                        strokeWidth="3"
                                        fill="none"
                                        strokeDasharray={`${2 * Math.PI * 8}`}
                                        strokeDashoffset={`${2 * Math.PI * 8 * (1 - progress / 100)}`}
                                        className="transition-all duration-500 text-green-500"
                                        strokeLinecap="round"
                                    />
                                </svg>
                            </div>
                        )}
                        <span className="text-sm font-medium mr-2 dark:text-white text-neutral-900">{stage}</span>
                    </div>
                </motion.button>
            </div>
        </motion.div>
    )
}
