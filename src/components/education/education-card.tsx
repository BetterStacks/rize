import { deleteEducation } from '@/actions/education-actions'
import { useActiveSidebarTab, useRightSidebar } from '@/lib/context'
import { queryClient } from '@/lib/providers'
import { TEducation } from '@/lib/types'
import { cn } from '@/lib/utils'
import { sanitizeHtml } from '@/lib/sanitize'
import { useMediaQuery } from '@mantine/hooks'
import { useMutation } from '@tanstack/react-query'
import { useSession } from '@/lib/auth-client'
import { FC } from 'react'
import toast from 'react-hot-toast'
import { OwnerItemMenu, TimelineItem } from '../profile/timeline-item'

type EducationCardProps = {
  education: TEducation;
  isMine: boolean;
};

const year = (date?: Date | string | null) =>
  date ? new Date(date).toLocaleDateString('en-US', { year: 'numeric', timeZone: 'UTC' }) : null

const EducationCard: FC<EducationCardProps> = ({ education, isMine }) => {
  const [, setTab] = useActiveSidebarTab()
  const session = useSession()
  const isDesktop = useMediaQuery('(min-width: 1024px)')
  const setOpen = useRightSidebar()[1]
  const { mutate: handleDeleteEducation, isPending } = useMutation({
    mutationFn: deleteEducation,
    onSuccess() {
      queryClient.invalidateQueries({
        queryKey: ['get-education', (session?.data?.user as any)?.username],
      })
      toast.success('Education deleted')
    },
    onError() {
      toast.error('Couldn’t delete that. Try again.')
    },
  })

  const start = year(education?.startDate)
  const end = year(education?.endDate)
  const dates = start || end ? `${start ?? '—'} – ${end ?? 'Present'}` : ''
  const subtitle = [education?.degree, education?.fieldOfStudy].filter(Boolean).join(', ')

  return (
    <TimelineItem
      title={education?.school}
      subtitle={subtitle || undefined}
      dates={dates}
      menu={
        isMine ? (
          <OwnerItemMenu
            label={education?.school}
            isDeleting={isPending}
            onEdit={() => {
              setTab({ id: education?.id, tab: 'education' })
              if (!isDesktop) setOpen(true)
            }}
            onDelete={() => handleDeleteEducation(education.id)}
          />
        ) : undefined
      }
    >
      {education?.description && (
        <div
          className={cn(
            'prose prose-sm dark:prose-invert max-w-none mt-2 text-[#5A5248] dark:text-[#B3A999]',
            'prose-p:my-1 prose-p:leading-relaxed',
          )}
          dangerouslySetInnerHTML={{ __html: sanitizeHtml(education.description ?? '') }}
        />
      )}
    </TimelineItem>
  )
}

export default EducationCard
