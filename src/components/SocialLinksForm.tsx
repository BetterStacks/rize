'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { FormCard } from './sidebar/components/FormCard'
import { dummyLinks } from './profile/social-links'
import { capitalizeFirstLetter, getIcon } from '@/lib/utils'
import Image from 'next/image'
import { useMutation, useQuery } from '@tanstack/react-query'
import { getSocialLinks, upsertSocialLinks } from '@/actions/social-links-actions'
import { toast } from 'react-hot-toast'
import { Loader, X } from 'lucide-react'
import { useSession } from '@/lib/auth-client'
import { queryClient } from '@/lib/providers'

export const SocialLinksForm = ({ onClose }: { onClose?: () => void }) => {
    const [links, setLinks] = useState<Record<string, string>>({})
    const session = useSession()
    const username = (session?.data?.user as any)?.username

    // Fetch existing links
    const { data: existingLinks, isLoading } = useQuery({
        queryKey: ['get-my-social-links', username],
        queryFn: () => getSocialLinks(username),
        enabled: !!username,
    })

    // Populate form with existing links
    useEffect(() => {
        if (existingLinks) {
            const linksObj: Record<string, string> = {}
            existingLinks.forEach(link => {
                linksObj[link.platform] = link.url
            })
            setLinks(linksObj)
        }
    }, [existingLinks])

    // Update mutation
    const { mutate, isPending } = useMutation({
        mutationFn: upsertSocialLinks,
        onSuccess: () => {
            toast.success('Links updated successfully')
            queryClient.invalidateQueries({ queryKey: ['get-social-links'] })
            queryClient.invalidateQueries({ queryKey: ['get-my-social-links'] })
            onClose?.()
        },
        onError: (error: Error) => {
            toast.error(error.message || 'Failed to update links')
        }
    })

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        mutate(links)
    }

    return (
        <div className="relative mb-10 sm:mb-3">
            <button
                onClick={onClose}
                className="absolute -top-8 right-2 text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300 transition-colors"
                aria-label="Close"
            >
                <X className="w-6 h-6" />
            </button>
            <FormCard title="Social Links" description="Add your social media profiles">
                <form id="social-links-form" onSubmit={handleSubmit} className="space-y-4 h-[220px] overflow-y-auto">
                    {dummyLinks.map((link) => (
                        <div key={link.platform} className="flex items-center gap-3">
                            <Image
                                src={`/${getIcon(link.platform)}`}
                                width={24}
                                height={24}
                                alt={link.platform}
                                className="flex-shrink-0"
                            />
                            <div className="flex-1">
                                <Label htmlFor={link.platform}>
                                    {capitalizeFirstLetter(link.platform)}
                                </Label>
                                <Input
                                    id={link.platform}
                                    type="url"
                                    placeholder={`https://${link.platform}.com/yourprofile`}
                                    value={links[link.platform] || ''}
                                    onChange={(e) => setLinks({ ...links, [link.platform]: e.target.value })}
                                    disabled={isPending || isLoading}
                                />
                            </div>
                        </div>
                    ))}

                </form>

                <Button
                    type="submit"
                    form="social-links-form"
                    disabled={isPending || isLoading}
                    variant="secondary"
                    className="w-full mt-6 mb-4 bg-white dark:bg-black/30 text-black dark:text-white hover:bg-neutral-300/60 dark:hover:bg-black/50"
                >
                    {isPending && <Loader className="size-4 animate-spin mr-2" />}
                    Save Links
                </Button>
            </FormCard>
        </div>
    )
}