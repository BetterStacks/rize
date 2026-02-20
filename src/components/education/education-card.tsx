import { deleteEducation } from '@/actions/education-actions'
import { useActiveSidebarTab, useRightSidebar } from '@/lib/context'
import { queryClient } from '@/lib/providers'
import { TEducation } from '@/lib/types'
import { cn } from '@/lib/utils'
import { useMediaQuery } from '@mantine/hooks'
import { useMutation } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { Edit2, Loader, MoreHorizontal, Trash2 } from 'lucide-react'
import { useSession } from '@/lib/auth-client'
import { FC } from 'react'
import toast from 'react-hot-toast'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '../ui/dropdown-menu'
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
          'flex flex-col first:mt-2 relative group',
        )
      }
    >
      <h3 className="md:text-lg font-medium tracking-tight">
        {education?.school}
      </h3>
      {isMine && (
        <DropdownMenu>
          <DropdownMenuTrigger asChild className="absolute right-2 ">
            <Button variant={"outline"} size={"smallIcon"}>
              <MoreHorizontal className="size-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="mt-2 dark:bg-dark-bg dark:border-dark-border border-neutral-200/80 rounded-xl">
            <DropdownMenuItem onClick={(e) => {
              setTab((prev) => ({
                id: education?.id,
                tab: 'education',
              }))
              if (!isDesktop) {
                setOpen(true)
              }

            }}>
              <Edit2 className="size-4" />
              <span>Edit</span>
            </DropdownMenuItem>
            <DropdownMenuItem className="stroke-red-500 text-red-500"
              onClick={() => handleDeleteEducation(education.id)}
              disabled={isPending}
            >
              {isPending ? (
                <Loader className="size-4 opacity-80 animate-spin" />
              ) : (
                <Trash2 className="size-4 opacity-80" />
              )}
              <span>Delete</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
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
