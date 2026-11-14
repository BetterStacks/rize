'use client'

import { getSocialLinks } from '@/actions/social-links-actions'
import { PROFILE_STALE_TIME } from '@/lib/profile-query'
import { safeHref } from '@/lib/safe-href'
import type { SocialPlatform } from '@/lib/types'
import { cn, getIcon, platformLabel } from '@/lib/utils'
import { useQuery } from '@tanstack/react-query'
import { Pencil } from 'lucide-react'
import Image from 'next/image'
import { useParams } from 'next/navigation'
import { useState } from 'react'
import { toast } from 'react-hot-toast'
import { Button } from '../ui/button'
import { SocialLinksForm } from '../SocialLinksForm'
import { EmptyLine } from './profile-section'

export const dummyLinks: { platform: SocialPlatform; url: string }[] = [
  {
    platform: 'reddit',
    url: 'https://github.com/',
  },
  {
    platform: 'twitter',
    url: 'https://twitter.com/',
  },
  {
    platform: 'linkedin',
    url: 'https://linkedin.com/in/',
  },
  {
    platform: 'youtube',
    url: 'https://instagram.com/',
  },
  {
    platform: 'github',
    url: 'https://instagram.com/',
  },
  {
    platform: 'instagram',
    url: 'https://instagram.com/',
  },
]



type SocialLink = { id?: string; platform: string; url: string }

const SocialLinks = ({ isMine, initialLinks }: { isMine: boolean; initialLinks?: SocialLink[] }) => {
  const params = useParams<{ username: string }>()
  const [showEditDialog, setShowEditDialog] = useState(false)

  const { data: links = [] } = useQuery({
    enabled: !!params?.username,
    queryKey: ['get-social-links', params?.username],
    queryFn: () => getSocialLinks(params?.username),
    initialData: initialLinks,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    staleTime: PROFILE_STALE_TIME,
  })

  const visibleLinks = (links as SocialLink[]).flatMap((link) => {
    const href = safeHref(link.url)
    return href ? [{ ...link, url: href }] : []
  })

  if (!isMine && visibleLinks.length === 0) {
    return null
  }

  return (
    <>
      <div data-social-links className="social-links flex w-full flex-wrap items-center gap-2">
        {visibleLinks.length === 0 ? (
          <EmptyLine text="No links yet" actionLabel="Add links" onAction={() => setShowEditDialog(true)} />
        ) : (
          <>
            {visibleLinks.map((link) => (
              <SocialLinkButton key={link.id ?? link.url} platform={link.platform} url={link.url} />
            ))}
            {isMine && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setShowEditDialog(true)}
                className="h-11 gap-1.5 rounded-lg px-3 text-sm text-[#5A5248] hover:text-[#1F1B16] dark:text-[#A9A9AE] dark:hover:text-[#F4F4F5] sm:h-9"
              >
                <Pencil className="size-3.5" aria-hidden />
                Edit links
              </Button>
            )}
          </>
        )}
      </div>

      {showEditDialog && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Edit social links"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-1 backdrop-blur-sm sm:p-4"
        >
          <div className="mb-4 max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-[20px] border border-[#E7E2D8] bg-white py-6 dark:border-[#2C2C31] dark:bg-[#1A1A1D] sm:p-3 sm:py-6">
            <SocialLinksForm onClose={() => setShowEditDialog(false)} />
          </div>
        </div>
      )}
    </>
  )
}

export default SocialLinks

/** A quiet icon + label chip linking out to one profile elsewhere. */
export const SocialLinkButton = ({
  platform,
  url,
  hasLink = true,
  className,
  buttonClassName,
}: {
  platform: string;
  url: string;
  hasLink?: boolean;
  className?: string;
  buttonClassName?: string;
}) => {
  const handleClick = (e: React.MouseEvent) => {
    if (!hasLink) {
      e.preventDefault()
      toast.error(`Add your ${platformLabel(platform)} link first`)
    }
  }
  return (
    <a
      className={cn(
        'inline-flex h-11 items-center gap-2 rounded-lg border border-[#E7E2D8] px-3 text-sm font-medium text-[#1F1B16] transition-colors duration-150 hover:border-[#1F1B16]/30 hover:bg-[#FCFBF8] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-main-yellow dark:border-[#2C2C31] dark:text-[#F4F4F5] dark:hover:border-[#F4F4F5]/30 dark:hover:bg-[#1A1A1D] sm:h-9',
        className,
        buttonClassName,
      )}
      href={hasLink ? url : '#'}
      target={hasLink ? '_blank' : undefined}
      rel={hasLink ? 'noopener noreferrer me' : undefined}
      onClick={handleClick}
    >
      <Image
        src={`/${getIcon(platform as SocialPlatform) || 'globe.svg'}`}
        className={cn('size-4', (platform === 'twitter' || platform === 'github') && 'dark:invert')}
        alt=""
        width={16}
        height={16}
      />
      {platformLabel(platform)}
    </a>
  )
}
