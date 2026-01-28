'use client'

import { useMemo } from 'react'
import type { GetProfileByUsername, GalleryItemProps, GetAllWritings, GetAllProjects, TEducation, TExperience, GetExplorePosts } from '@/lib/types'
import { usePanel } from '@/lib/panel-context'

interface StoryElement {
    id: string
    type: string
    title: string
    content: string
}

interface UseProfileCompletionProps {
    profile: GetProfileByUsername
    gallery?: GalleryItemProps[]
    writings?: GetAllWritings[]
    projects?: GetAllProjects[]
    education?: TEducation[]
    workExperience?: TExperience[]
    posts?: GetExplorePosts[]
    storyElements?: StoryElement[]
    socialLinks?: { platform: string; url: string }[]
    onOpenChat?: () => void
}

export interface ProfileTask {
    id: string
    title: string
    description?: string
    completed: boolean
    action?: () => void
}

export function useProfileCompletion({
    profile,
    gallery = [],
    writings = [],
    projects = [],
    education = [],
    workExperience = [],
    posts = [],
    storyElements = [],
    socialLinks = [],
    onOpenChat
}: UseProfileCompletionProps) {
    const { toggleRightPanel } = usePanel()
    const tasks = useMemo<ProfileTask[]>(() => {
        const hasBasicInfo = Boolean(
            profile?.displayName &&
            profile?.bio &&
            profile?.bio !== "I'm still setting up, but this is where it all starts 🌱.\n\nA place to share what I do, what I love, and where I'm headed.It's quiet for now, but trust me—it won't stay that way for long."
        )

        const hasStoryElements = storyElements.length > 0

        const hasContent = {
            hasWorkXP: workExperience.length > 0,
            hasEducation: education.length > 0,
            hasProjects: projects.length > 0,
            hasWritings: writings.length > 0,
            hasPosts: posts.length > 0,
            hasGallery: gallery.length > 0
        }


        const hasSocialLinks = socialLinks.length > 0

        return [
            {
                id: 'basic-info',
                title: 'Fill in your profile',
                description: 'Add your name, bio, and profile picture',
                completed: hasBasicInfo,
                action: () => {
                    // Just scroll to top or do nothing if undesired to toggle panel
                }
            },
            {
                id: 'projects',
                title: 'Add Projects',
                description: 'Share about personal & company projects',
                completed: hasContent.hasProjects,
                action: () => {
                    // Use the callback if provided, otherwise try to find the button
                    if (onOpenChat) {
                        onOpenChat()
                    } else {
                        const chatButton = document.querySelector('[data-profile-chat-trigger]')
                        if (chatButton instanceof HTMLElement) {
                            chatButton.click()
                        }
                    }
                }
            },
            {
                id: 'work-experience',
                title: 'Add Work Experience',
                description: 'Share about your work experience',
                completed: hasContent.hasWorkXP,
                action: () => {
                    // Use the callback if provided, otherwise try to find the button
                    if (onOpenChat) {
                        onOpenChat()
                    } else {
                        const chatButton = document.querySelector('[data-profile-chat-trigger]')
                        if (chatButton instanceof HTMLElement) {
                            chatButton.click()
                        }
                    }
                }
            },
            {
                id: 'education',
                title: 'Add Education',
                description: 'Share about your education',
                completed: hasContent.hasEducation,
                action: () => {
                    // Scroll to social links section
                    const socialSection = document.querySelector('[data-social-links]')
                    socialSection?.scrollIntoView({ behavior: 'smooth', block: 'center' })
                }
            },
            // {
            //     id: 'content',
            //     title: 'Create content',
            //     description: 'Add projects, experience, education, or posts',
            //     completed: hasContent,
            //     action: () => {
            //         // Scroll to first empty section
            //         const sections = document.querySelectorAll('[data-section-empty]')
            //         if (sections.length > 0) {
            //             sections[0].scrollIntoView({ behavior: 'smooth', block: 'center' })
            //         }
            //     }
            // }
        ]
    }, [profile, gallery, writings, projects, education, workExperience, posts, storyElements, socialLinks, onOpenChat])

    const completedCount = tasks.filter(task => task.completed).length
    const totalCount = tasks.length
    const progress = (completedCount / totalCount) * 100
    const isComplete = completedCount === totalCount

    // Get hasBasicInfo from the first task
    const hasBasicInfo = tasks.find(t => t.id === 'basic-info')?.completed || false

    return {
        tasks,
        completedCount,
        totalCount,
        progress,
        isComplete,
        hasBasicInfo
    }
}
