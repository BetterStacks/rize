import { cn } from '@/lib/utils'
import { FileText, User2, Calendar, Eye, Clock } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { FC } from 'react'
import { Button } from '../ui/button'
import { PostCardContainer } from './post-interactions'
import moment from 'moment'

type Writing = {
  id: string
  title: string
  content: string // JSON or text content
  thumbnail?: string
  status: 'draft' | 'published'
  createdAt: Date
  updatedAt: Date
  username?: string
  authorName?: string
  authorAvatar?: string
  readTime?: number // estimated reading time in minutes
}

type WritingCardProps = {
  writing: Writing
  className?: string
}

const WritingCard: FC<WritingCardProps> = ({ writing, className }) => {
  // Extract plain text from content for preview
  const getContentPreview = (content: string) => {
    try {
      // If content is JSON (from rich text editor)
      const parsed = JSON.parse(content)
      // Extract text from JSON structure (adjust based on your editor format)
      const extractText = (node: any): string => {
        if (typeof node === 'string') return node
        if (node.text) return node.text
        if (node.children) return node.children.map(extractText).join(' ')
        return ''
      }
      return extractText(parsed)
    } catch {
      // If content is plain text
      return content
    }
  }

  const contentPreview = getContentPreview(writing.content)
  const readTime = writing.readTime || Math.ceil(contentPreview.length / 1000) // rough estimate

  const handleViewWriting = () => {
    // Navigate to writing page
    window.open(`/writing/${writing.id}`, '_blank')
  }

  return (
    <PostCardContainer 
      handlePostClick={handleViewWriting}
      className={cn("group", className)}
    >
      {/* Writing Header */}
      <div className="relative">
        {/* Thumbnail or Placeholder */}
        <div className="h-40 bg-gradient-to-br from-amber-50 via-orange-50 to-red-50 dark:from-amber-900/20 dark:via-orange-900/20 dark:to-red-900/20 rounded-t-3xl flex items-center justify-center relative overflow-hidden">
          {writing.thumbnail ? (
            <Image
              src={writing.thumbnail}
              alt={writing.title}
              fill
              className="object-cover"
            />
          ) : (
            <div className="w-16 h-16 rounded-2xl bg-white dark:bg-neutral-700 border border-neutral-200 dark:border-neutral-600 flex items-center justify-center">
              <FileText className="size-8 opacity-40 text-amber-600 dark:text-amber-400" />
            </div>
          )}
          
          {/* Status Badge */}
          <div className="absolute top-3 right-3">
            <span className={cn(
              'px-2 py-1 text-xs font-medium rounded-full',
              writing.status === 'published' 
                ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'
            )}>
              {writing.status === 'published' ? 'Published' : 'Draft'}
            </span>
          </div>

          {/* Reading Time */}
          <div className="absolute bottom-3 left-3">
            <div className="bg-black/50 text-white text-xs px-2 py-1 rounded-full flex items-center gap-1">
              <Clock className="size-3" />
              {readTime} min read
            </div>
          </div>
        </div>
      </div>

      {/* Writing Content */}
      <div className="p-4">
        {/* Author Info */}
        {(writing.username || writing.authorName) && (
          <div className="flex items-center gap-2 mb-3">
            {writing.authorAvatar ? (
              <Image
                src={writing.authorAvatar}
                alt={writing.authorName || writing.username || 'Author'}
                width={24}
                height={24}
                className="rounded-full"
              />
            ) : (
              <div className="w-6 h-6 rounded-full bg-neutral-200 dark:bg-neutral-700 flex items-center justify-center">
                <User2 className="size-3 opacity-60" />
              </div>
            )}
            <div className="text-xs text-neutral-600 dark:text-neutral-400">
              {writing.username && (
                <Link 
                  href={`/${writing.username}`}
                  className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                  onClick={(e) => e.stopPropagation()}
                >
                  @{writing.username}
                </Link>
              )}
              <span className="mx-1">•</span>
              <span>{moment(writing.createdAt).format('MMM D, YYYY')}</span>
            </div>
          </div>
        )}

        {/* Writing Title */}
        <div className="mb-2">
          <h3 className="font-semibold text-lg text-neutral-900 dark:text-white leading-tight line-clamp-2">
            {writing.title}
          </h3>
        </div>

        {/* Writing Preview */}
        <p className="text-sm text-neutral-600 dark:text-neutral-300 leading-relaxed mb-4 line-clamp-3">
          {contentPreview.substring(0, 200)}
          {contentPreview.length > 200 && '...'}
        </p>

        {/* Writing Meta */}
        <div className="flex items-center gap-4 text-xs text-neutral-500 dark:text-neutral-400 mb-4">
          <div className="flex items-center gap-1">
            <Calendar className="size-3" />
            <span>{moment(writing.updatedAt).fromNow()}</span>
          </div>
          <div className="flex items-center gap-1">
            <Eye className="size-3" />
            <span>View count coming soon</span>
          </div>
        </div>

        {/* Action Button */}
        <div className="flex gap-2">
          <Button 
            variant="default" 
            size="sm" 
            className="flex-1 text-xs h-8 bg-amber-600 hover:bg-amber-700 dark:bg-amber-500 dark:hover:bg-amber-600"
            onClick={(e) => {
              e.stopPropagation()
              handleViewWriting()
            }}
          >
            <FileText className="size-3 mr-1" />
            Read Article
          </Button>
        </div>

        {/* Writing Footer */}
        <div className="mt-3 pt-3 border-t border-neutral-200 dark:border-neutral-700">
          <div className="flex items-center justify-between text-xs text-neutral-400 dark:text-neutral-500">
            <span>Article</span>
            <span>{readTime} minute read</span>
          </div>
        </div>
      </div>
    </PostCardContainer>
  )
}

export default WritingCard