import { deleteProject } from '@/actions/project-actions'
import { useActiveSidebarTab, useRightSidebar } from '@/lib/context'
import { queryClient } from '@/lib/providers'
import { GetAllProjects } from '@/lib/types'
import { cn } from '@/lib/utils'
import { useMutation } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { Edit2, Globe, Loader, Trash } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { FC, useState } from 'react'
import { toast } from 'sonner'
import { Button } from '../ui/button'
import { useMediaQuery } from '@mantine/hooks'

type ProjectCardProps = {
  project: GetAllProjects;
  isMine: boolean;
};

const ProjectCard: FC<ProjectCardProps> = ({ project, isMine }) => {
  const [tab, setTab] = useActiveSidebarTab()
  const { username } = useParams<{ username: string }>()
  const isDesktop = useMediaQuery('(min-width: 1024px)')
  const setOpen = useRightSidebar()[1]
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  const { mutate: handleDeleteProject, isPending } = useMutation({
    mutationFn: deleteProject,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['get-projects', username] })
      toast.success('Project deleted successfully')
    },
    onError: () => {
      toast.error('Failed to delete project')
    },
  })
  return (
    <motion.div
      className={cn(
        'flex w-full bg-neutral-100 group relative dark:bg-neutral-800 transition-all  rounded-2xl border border-neutral-300/60 dark:border-dark-border px-4 py-4 ',
        tab?.id === project?.id &&
          'dark:bg-amber-400/10 border-2 border-dashed bg-amber-400/15 border-amber-400/30 dark:border-amber-400/20'
      )}
    >
      <div className="w-full inline-flex">
        {project.logo ? (
          <Image
            width={50}
            height={50}
            className="aspect-square border border-neutral-300/60 dark:border-dark-border  rounded-full size-10 bg-white dark:bg-dark-border"
            src={project.logo!}
            alt={project.name}
          />
        ) : (
          <div className="flex items-center justify-center size-10 bg-neutral-200 dark:bg-dark-border rounded-full">
            <Globe strokeWidth={1.5} className="size-4 opacity-80" />
          </div>
        )}
        <div className="flex ml-4 flex-col">
          <div className="flex items-center justify-start ">
            {project.url ? (
              <Link href={project.url} target="_blank">
                <h2 className="font-medium tracking-tight leading-tight">
                  {project.name}
                </h2>
              </Link>
            ) : (
              <h2 className="font-medium tracking-tight leading-tight">
                {project.name}
              </h2>
            )}
          </div>
          <p className="opacity-80 text-sm leading-tight">
            {project.description}
          </p>
        </div>
      </div>
      {isMine && (
        <div className="space-x-2 absolute right-4 opacity-0 group-hover:opacity-100 flex items-center justify-center">
          <Button
            variant={'outline'}
            className="rounded-lg  text-sm"
            size={'smallIcon'}
            onClick={() => {
              setTab((prev) => ({
                id: prev?.id === project?.id ? null : project?.id,
                tab: 'projects',
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
            onClick={() => setShowDeleteConfirm(true)}
            disabled={isPending}
          >
            {isPending ? (
              <Loader className="size-4 opacity-80 animate-spin" />
            ) : (
              <Trash className="size-4 opacity-80" />
            )}
          </Button>
        </div>
      )}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-dark-bg rounded-3xl max-w-sm w-full border border-neutral-300/60 dark:border-dark-border p-6">
            <h3 className="text-lg font-semibold mb-2 text-neutral-900 dark:text-white">Delete Project?</h3>
            <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-6">
              Are you sure you want to delete "{project.name}"? This action cannot be undone.
            </p>
            <div className="flex gap-3 justify-end">
              <Button
                variant="ghost"
                className="rounded-full px-4"
                onClick={() => setShowDeleteConfirm(false)}
              >
                Cancel
              </Button>
              <Button
                variant="outline"
                className="rounded-full px-4 text-red-600 dark:text-red-500 hover:text-red-700 dark:hover:text-red-400"
                onClick={() => {
                  handleDeleteProject(project.id)
                  setShowDeleteConfirm(false)
                }}
                disabled={isPending}
              >
                {isPending ? <Loader className="size-4 animate-spin mr-2" /> : null}
                Delete
              </Button>
            </div>
          </div>
        </div>
      )}
    </motion.div>
  )
}

export default ProjectCard
