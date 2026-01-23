'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { cn } from '@/lib/utils'
import { motion } from 'framer-motion'
import { AlertCircle, ArrowRight, Briefcase, GraduationCap, Lightbulb, Sparkles, User } from 'lucide-react'
import Link from 'next/link'
import { useMemo } from 'react'

interface ProfileData {
    displayName?: string | null
    bio?: string | null
    location?: string | null
    personalMission?: string | null
    age?: number | null
}

interface ProfileCompletionPromptProps {
    profile: ProfileData
    educationCount: number
    experienceCount: number
    projectsCount: number
    storyElementsCount: number
    className?: string
}

export default function ProfileCompletionPrompt({
    profile,
    educationCount,
    experienceCount,
    projectsCount,
    storyElementsCount,
    className,
}: ProfileCompletionPromptProps) {
    // Calculate completion metrics
    const completionMetrics = useMemo(() => {
        const checks = [
            { label: 'Display Name', completed: !!profile?.displayName, icon: User },
            { label: 'Bio', completed: !!profile?.bio, icon: User },
            { label: 'Location', completed: !!profile?.location, icon: User },
            { label: 'Personal Mission', completed: !!profile?.personalMission, icon: Lightbulb },
            { label: 'Education', completed: educationCount > 0, icon: GraduationCap },
            { label: 'Work Experience', completed: experienceCount > 0, icon: Briefcase },
            { label: 'Projects', completed: projectsCount > 0, icon: Lightbulb },
        ]

        const completedCount = checks.filter((c) => c.completed).length
        const totalCount = checks.length
        const percentage = Math.round((completedCount / totalCount) * 100)
        const missingItems = checks.filter((c) => !c.completed)

        return {
            completedCount,
            totalCount,
            percentage,
            missingItems,
            isComplete: completedCount === totalCount,
            hasSignificantGaps: completedCount < 4, // Less than 4 items completed
        }
    }, [profile, educationCount, experienceCount, projectsCount])

    // Don't show if profile is mostly complete
    if (completionMetrics.percentage >= 70) {
        return null
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className={cn('w-full', className)}
        >
            <Card className="border-2 border-amber-200 dark:border-amber-900/50 bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/20 dark:to-orange-950/20 shadow-lg">
                <CardHeader className="pb-3">
                    <div className="flex items-start gap-3">
                        <div className="p-2 bg-amber-100 dark:bg-amber-900/30 rounded-xl">
                            <AlertCircle className="size-5 text-amber-600 dark:text-amber-400" />
                        </div>
                        <div className="flex-1">
                            <CardTitle className="text-lg font-semibold text-neutral-900 dark:text-white flex items-center gap-2">
                                Complete Your Profile
                                <span className="text-xs font-normal px-2 py-0.5 bg-amber-200 dark:bg-amber-900/50 text-amber-900 dark:text-amber-200 rounded-full">
                                    {completionMetrics.percentage}% Complete
                                </span>
                            </CardTitle>
                            <CardDescription className="text-sm text-neutral-600 dark:text-neutral-400 mt-1">
                                Your profile is missing some key information. Let our AI help you build a standout profile!
                            </CardDescription>
                        </div>
                    </div>
                </CardHeader>

                <CardContent className="space-y-4">
                    {/* Progress Bar */}
                    <div className="space-y-2">
                        <div className="flex items-center justify-between text-xs text-neutral-600 dark:text-neutral-400">
                            <span className="font-medium">Profile Completion</span>
                            <span className="font-semibold">
                                {completionMetrics.completedCount} / {completionMetrics.totalCount}
                            </span>
                        </div>
                        <Progress
                            value={completionMetrics.percentage}
                            className="h-2 bg-amber-100 dark:bg-amber-950/50"
                            indicatorClassName="bg-gradient-to-r from-amber-500 to-orange-500"
                        />
                    </div>

                    {/* Missing Items */}
                    {completionMetrics.missingItems.length > 0 && (
                        <div className="space-y-2">
                            <p className="text-xs font-medium text-neutral-700 dark:text-neutral-300">
                                Missing Information:
                            </p>
                            <div className="grid grid-cols-2 gap-2">
                                {completionMetrics.missingItems.slice(0, 4).map((item) => {
                                    const Icon = item.icon
                                    return (
                                        <div
                                            key={item.label}
                                            className="flex items-center gap-2 text-xs text-neutral-600 dark:text-neutral-400 bg-white/50 dark:bg-neutral-900/30 px-2 py-1.5 rounded-lg border border-neutral-200 dark:border-neutral-800"
                                        >
                                            <Icon className="size-3 flex-shrink-0" />
                                            <span className="truncate">{item.label}</span>
                                        </div>
                                    )
                                })}
                            </div>
                            {completionMetrics.missingItems.length > 4 && (
                                <p className="text-xs text-neutral-500 dark:text-neutral-500 italic">
                                    +{completionMetrics.missingItems.length - 4} more items...
                                </p>
                            )}
                        </div>
                    )}

                    {/* CTA Button */}
                    <Link href="/ai-profile-builder" className="block">
                        <Button
                            className="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white shadow-lg shadow-amber-200 dark:shadow-none transition-all group"
                            size="lg"
                        >
                            <Sparkles className="size-4 mr-2" />
                            Build Profile with AI
                            <ArrowRight className="size-4 ml-2 group-hover:translate-x-1 transition-transform" />
                        </Button>
                    </Link>

                    <p className="text-xs text-center text-neutral-500 dark:text-neutral-500">
                        Takes just 5 minutes • Powered by Harvard Resume Guide
                    </p>
                </CardContent>
            </Card>
        </motion.div>
    )
}
