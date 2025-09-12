import { deleteExperience } from '@/actions/experience-actions'
import { useActiveSidebarTab, useRightSidebar } from '@/lib/context'
import { queryClient } from '@/lib/providers'
import { TExperience } from '@/lib/types'
import { cn } from '@/lib/utils'
import { useMediaQuery } from '@mantine/hooks'
import { useMutation } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { Edit2, Loader, Trash2 } from 'lucide-react'
import { useSession } from '@/lib/auth-client'
import { FC } from 'react'
import toast from 'react-hot-toast'
import { Button } from '../ui/button'

type ExperienceCardProps = {
  experience: TExperience;
  isMine: boolean;
};

const ExperienceCard: FC<ExperienceCardProps> = ({ experience, isMine }) => {
  const session = useSession()
  const [activeTab, setActiveTab] = useActiveSidebarTab()
  const isDesktop = useMediaQuery('(min-width: 1024px)')
  const setOpen = useRightSidebar()[1]
  const formatDate = (date?: string) =>
    date
      ? new Date(date).toLocaleDateString(undefined, {
          year: 'numeric',
          month: 'short',
        })
      : '—'
  const { mutate: handleDeleteExperience, isPending } = useMutation({
    mutationFn: deleteExperience,
    onSuccess() {
      queryClient.invalidateQueries({
        queryKey: ['get-all-experience', (session?.data?.user as any)?.username],
      })
      toast.success('Experience deleted successfully')
    },
    onError() {
      toast.error('Failed to delete experience')
    },
  })
  return (
    <motion.div
      className={cn(
        'flex relative items-start group p-3 rounded-lg transition-all',
        activeTab?.id === experience?.id &&
          'dark:bg-indigo-400/10 border-2 border-dashed bg-indigo-400/15 border-indigo-400/30 dark:border-indigo-400/20'
      )}
    >
      {isMine && (
        <div className="absolute group-hover:opacity-100 opacity-0 top-2 right-2 flex gap-x-2">
          <Button
            variant="outline"
            size="smallIcon"
            onClick={() => {
              setActiveTab({
                id: experience?.id,
                tab: 'experience',
              })
              // Only open sidebar on mobile devices
              if (!isDesktop) {
                setOpen(true)
              }
            }}
          >
            <Edit2 className="h-4 w-4 opacity-80" />
          </Button>
          <Button
            variant="outline"
            size="smallIcon"
            onClick={() => {
              handleDeleteExperience(experience?.id)
            }}
            disabled={isPending}
          >
            {isPending ? (
              <Loader className="opacity-80 h-4 w-4 animate-spin" />
            ) : (
              <Trash2 className="opacity-80 h-4 w-4" />
            )}
          </Button>
        </div>
      )}
      <div className="flex flex-col ">
        <h3 className="md:text-lg font-medium tracking-tight">
          {experience?.company}
        </h3>
        <span className=" leading-tight dark:text-neutral-400 text-neutral-600 font-medium text-sm">
          {experience?.title}
        </span>
        <div className="inline-flex mt-3 text-sm gap-x-1 dark:text-neutral-400 text-neutral-600  items-center">
          <span>
            {' '}
            {formatDate(experience?.startDate?.toString())} –{' '}
            {experience?.currentlyWorking
              ? 'Present'
              : formatDate(experience?.endDate?.toString())}
          </span>
          <span>•</span>
          <span className="">{experience?.location?.split(',')[0]}</span>
          <span>•</span>
          <span className="">{experience?.employmentType}</span>
        </div>
        {experience?.description && (
          <p className="mt-3 text-sm dark:text-neutral-300 text-neutral-700 leading-relaxed">
            {experience.description}
          </p>
        )}
      </div>
    </motion.div>
  )
}

export default ExperienceCard
