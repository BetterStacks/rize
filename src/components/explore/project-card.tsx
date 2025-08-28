import { GetAllProjects } from '@/lib/types'
import { cn } from '@/lib/utils'
import { ExternalLink, Globe, User2, Calendar, Briefcase } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { FC } from 'react'
import { Button } from '../ui/button'
import { PostCardContainer } from './post-interactions'
import moment from 'moment'

type ProjectCardProps = {
  project: GetAllProjects
  className?: string
}

const ProjectCard: FC<ProjectCardProps> = ({ project, className }) => {
  const handleViewProject = () => {
    if (project.url) {
      window.open(project.url, '_blank')
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
      case 'wip':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400'
      case 'archived':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400'
      default:
        return 'bg-neutral-100 text-neutral-800 dark:bg-neutral-900/30 dark:text-neutral-400'
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'wip':
        return 'Work in Progress'
      case 'completed':
        return 'Completed'
      case 'archived':
        return 'Archived'
      default:
        return status
    }
  }

  return (
    <PostCardContainer 
      handlePostClick={handleViewProject}
      className={cn("group", className)}
    >
      {/* Project Header */}
      <div className="relative">
        {/* Project Thumbnail/Logo Area */}
        <div className="h-32 bg-gradient-to-br from-neutral-100 via-neutral-50 to-white dark:from-neutral-800 dark:via-neutral-700 dark:to-neutral-600 rounded-t-3xl flex items-center justify-center relative overflow-hidden">
          {project.logo ? (
            <Image
              src={project.logo}
              alt={project.name}
              width={80}
              height={80}
              className="object-contain"
            />
          ) : (
            <div className="w-16 h-16 rounded-2xl bg-white dark:bg-neutral-700 border border-neutral-200 dark:border-neutral-600 flex items-center justify-center">
              <Briefcase className="size-8 opacity-40" />
            </div>
          )}
          
          {/* Status Badge */}
          <div className="absolute top-3 right-3">
            <span className={cn(
              'px-2 py-1 text-xs font-medium rounded-full',
              getStatusColor(project.status)
            )}>
              {getStatusLabel(project.status)}
            </span>
          </div>
        </div>
      </div>

      {/* Project Content */}
      <div className="p-4">
        {/* Project Title */}
        <div className="mb-2">
          <h3 className="font-semibold text-lg text-neutral-900 dark:text-white leading-tight">
            {project.name}
          </h3>
        </div>

        {/* Project Description */}
        {project.description && (
          <p className="text-sm text-neutral-600 dark:text-neutral-300 leading-relaxed mb-3 line-clamp-3">
            {project.description}
          </p>
        )}

        {/* Project Meta */}
        <div className="space-y-2 mb-4">
          {/* Creator Info - if available */}
          {project.profileId && (
            <div className="flex items-center gap-2 text-xs text-neutral-500 dark:text-neutral-400">
              <User2 className="size-3" />
              <Link 
                href={`/profile/${project.profileId}`}
                className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                onClick={(e) => e.stopPropagation()}
              >
                View Creator
              </Link>
            </div>
          )}

          {/* Duration */}
          {project.startDate && (
            <div className="flex items-center gap-2 text-xs text-neutral-500 dark:text-neutral-400">
              <Calendar className="size-3" />
              <span>
                {moment(project.startDate).format('MMM YYYY')}
                {project.endDate && ` - ${moment(project.endDate).format('MMM YYYY')}`}
              </span>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2">
          {project.url ? (
            <Button 
              variant="default" 
              size="sm" 
              className="flex-1 text-xs h-8 bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600"
              onClick={(e) => {
                e.stopPropagation()
                window.open(project.url!, '_blank')
              }}
            >
              <ExternalLink className="size-3 mr-1" />
              Visit Project
            </Button>
          ) : (
            <Button 
              variant="outline" 
              size="sm" 
              className="flex-1 text-xs h-8 border-neutral-300 dark:border-neutral-600"
              disabled
            >
              <Globe className="size-3 mr-1" />
              No Link Available
            </Button>
          )}
        </div>

        {/* Project Footer */}
        <div className="mt-3 pt-3 border-t border-neutral-200 dark:border-neutral-700">
          <div className="flex items-center justify-between text-xs text-neutral-400 dark:text-neutral-500">
            <span>Project</span>
            {project.endDate && (
              <span>
                Updated {moment(project.endDate).fromNow()}
              </span>
            )}
          </div>
        </div>
      </div>
    </PostCardContainer>
  )
}

export default ProjectCard