'use client'

import { useActiveSidebarTab } from '@/lib/context'
import { cn } from '@/lib/utils'
import { Check, ChevronDown } from 'lucide-react'
import { useId, useState } from 'react'
import { hairline, ink, inkSecondary } from './profile-section'

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

/**
 * The owner's profile checklist, inline under the header (it used to float
 * over the content at the bottom of the screen). Same tasks, same actions,
 * same "dismiss forever".
 */
export function ProfileCompletionWidget({
    tasks,
    onDismiss,
    className,
}: ProfileCompletionWidgetProps) {
    const [isExpanded, setIsExpanded] = useState(false)
    const [, setActiveSidebarTab] = useActiveSidebarTab()
    const listId = useId()

    const completedCount = tasks.filter((task) => task.completed).length
    const totalCount = tasks.length
    const progress = totalCount > 0 ? (completedCount / totalCount) * 100 : 0
    const isAllCompleted = totalCount > 0 && completedCount === totalCount
    const nextTask = tasks.find((task) => !task.completed)

    if (totalCount === 0) return null

    return (
        <div className={cn('w-full rounded-xl border', hairline, className)}>
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 px-4 py-2">
                <div className="flex min-w-0 flex-1 items-center gap-3">
                    <div
                        className="h-1.5 w-16 shrink-0 overflow-hidden rounded-full bg-[#EFEBE3] dark:bg-[#2C2C31]"
                        role="progressbar"
                        aria-label="Profile progress"
                        aria-valuenow={completedCount}
                        aria-valuemin={0}
                        aria-valuemax={totalCount}
                    >
                        <div className="h-full rounded-full bg-main-yellow transition-[width] duration-200" style={{ width: `${progress}%` }} />
                    </div>
                    <p className={cn('min-w-0 truncate text-sm', ink)}>
                        {isAllCompleted ? (
                            'Your profile is filled in'
                        ) : (
                            <>
                                {completedCount} of {totalCount} done
                                {nextTask && <span className={inkSecondary}> · Next: {nextTask.title.toLowerCase()}</span>}
                            </>
                        )}
                    </p>
                </div>
                <div className="flex items-center">
                    {isAllCompleted ? (
                        <button
                            type="button"
                            onClick={() => setActiveSidebarTab({ id: null, tab: 'chat' })}
                            className={cn('min-h-11 rounded-md px-2 text-sm font-medium underline-offset-4 hover:underline', ink)}
                        >
                            Open profile chat
                        </button>
                    ) : (
                        <button
                            type="button"
                            onClick={() => setIsExpanded((v) => !v)}
                            aria-expanded={isExpanded}
                            aria-controls={listId}
                            className={cn('inline-flex min-h-11 items-center gap-1 rounded-md px-2 text-sm font-medium', ink)}
                        >
                            {isExpanded ? 'Hide steps' : 'Show steps'}
                            <ChevronDown className={cn('size-4 transition-transform duration-150', isExpanded && 'rotate-180')} aria-hidden />
                        </button>
                    )}
                    <button
                        type="button"
                        onClick={onDismiss}
                        className={cn('min-h-11 rounded-md px-2 text-sm', inkSecondary, 'hover:text-[#1F1B16] dark:hover:text-[#F4F4F5]')}
                    >
                        Dismiss
                    </button>
                </div>
            </div>

            {isExpanded && !isAllCompleted && (
                <ul id={listId} className={cn('border-t', hairline)}>
                    {tasks.map((task) => (
                        <li key={task.id} className={cn('border-b last:border-b-0', hairline)}>
                            <button
                                type="button"
                                onClick={task.action}
                                disabled={task.completed}
                                className="flex min-h-11 w-full items-center gap-3 px-4 py-2 text-left transition-colors duration-150 hover:bg-[#FCFBF8] disabled:cursor-default disabled:hover:bg-transparent dark:hover:bg-[#1A1A1D]"
                            >
                                <span
                                    className={cn(
                                        'flex size-5 shrink-0 items-center justify-center rounded-full border',
                                        task.completed ? 'border-main-yellow bg-main-yellow text-[#1F1B16]' : hairline,
                                    )}
                                    aria-hidden
                                >
                                    {task.completed && <Check strokeWidth={2.5} className="size-3" />}
                                </span>
                                <span className="min-w-0">
                                    <span className={cn('block text-sm font-medium', task.completed ? cn(inkSecondary, 'line-through') : ink)}>
                                        {task.title}
                                        {task.completed && <span className="sr-only"> (done)</span>}
                                    </span>
                                    {task.description && !task.completed && (
                                        <span className={cn('block text-sm', inkSecondary)}>{task.description}</span>
                                    )}
                                </span>
                            </button>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    )
}
