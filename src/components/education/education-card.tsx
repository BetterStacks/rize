import { deleteEducation } from '@/actions/education-actions'
import { useActiveSidebarTab, useRightSidebar } from '@/lib/context'
import { queryClient } from '@/lib/providers'
import { TEducation } from '@/lib/types'
import { cn } from '@/lib/utils'
import { useMediaQuery } from '@mantine/hooks'
import { useMutation } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { Edit2, Loader, Trash2 } from 'lucide-react'
import { useSession } from '@/lib/auth-client'
import { FC } from 'react'
import toast from 'react-hot-toast'
import { Button } from '../ui/button'

type EducationCardProps = {
  education: TEducation;
  isMine: boolean;
};

const EducationCard: FC<EducationCardProps> = ({ education, isMine }) => {
  const [tab, setTab] = useActiveSidebarTab()
  const session = useSession()
  const isDesktop = useMediaQuery('(min-width: 1024px)')
  const setOpen = useRightSidebar()[1]
  const formatDate = (date?: string) =>
    date
      ? new Date(date).toLocaleDateString(undefined, {
        year: 'numeric',
      })
      : '—'
  const { mutate: handleDeleteEducation, isPending } = useMutation({
    mutationFn: deleteEducation,
    onSuccess() {
      queryClient.invalidateQueries({
        queryKey: ['get-education', (session?.data?.user as any)?.username],
      })
      toast.success('Education deleted successfully')
    },
    onError() {
      toast.error('Failed to delete Education')
    },
  })
  return (
    <motion.div
      className={
        cn(
          'flex flex-col relative group',
          tab?.id === education?.id &&
          'dark:bg-amber-400/10 border-2 border-dashed bg-amber-400/15 border-amber-400/30 dark:border-amber-400/20'
        )
        // "flex flex-col w-full bg-neutral-100 dark:bg-neutral-800 transition-all  rounded-2xl border border-neutral-300/60 dark:border-dark-border p-4 md:p-6 ",
        // tab?.id === education?.id &&
        //   "dark:bg-amber-400/10 border-2 border-dashed bg-amber-400/15 border-amber-400/30 dark:border-amber-400/20"
      }
    >
      <h3 className="md:text-lg font-medium tracking-tight">
        {education?.school}
      </h3>
      {isMine && (
        <div className="space-x-2 group-hover:opacity-100 opacity-0 absolute right-0 flex items-center justify-center">
          <Button
            variant={'outline'}
            className="rounded-lg  text-sm"
            size={'smallIcon'}
            onClick={() => {
              setTab((prev) => ({
                id: prev?.id === education?.id ? null : education?.id,
                tab: 'education',
              }))
              if (!isDesktop) {
                setOpen(true)
              }
            }}
          >
            <Edit2 className="size-4 opacity-80" />
          </Button>
          <Button
            variant={'outline'}
            className="rounded-lg  text-sm"
            size={'smallIcon'}
            onClick={() => handleDeleteEducation(education.id)}
            disabled={isPending}
          >
            {isPending ? (
              <Loader className="size-4 opacity-80 animate-spin" />
            ) : (
              <Trash2 className="size-4 opacity-80" />
            )}
          </Button>
        </div>
      )}

      <span className="dark:text-neutral-400 leading-none text-neutral-600 text-sm">
        {education?.fieldOfStudy}
      </span>
      <span className="text-xs mt-3 opacity-70 ">
        {' '}
        {formatDate(education?.startDate?.toString())} –{' '}
        {formatDate(education?.endDate?.toString())}
      </span>
      <span className="text-sm mt-3 ">
        {education?.description}
      </span>
    </motion.div>
  )
}

export default EducationCard
