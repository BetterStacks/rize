import { deletePage } from '@/actions/page-actions'
import { TPage } from '@/lib/types'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { MoreHorizontal, Trash2, Edit, FileText } from 'lucide-react'
import { useSession } from '@/hooks/useAuth'
import SafeImage from '../profile/safe-image'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import { FC, useMemo } from 'react'
import toast from 'react-hot-toast'
import readingTime from 'reading-time'
import { Node } from 'slate'
import { Button } from '../ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu'

type WrtingCardProps = {
  data: typeof TPage & { thumbnail: string };
};

const WritingCard: FC<WrtingCardProps> = ({ data }) => {
  const session = useSession()
  const router = useRouter()
  const queryClient = useQueryClient()
  const { username } = useParams<{ username: string }>()
  
  const isMine = session?.data?.user?.username === username

  const time = useMemo(() => {
    try {
      const editorContent = JSON.parse(data?.content || '[]')
      const stringifiedContent = editorContent
        .map((node: Node) => Node.string(node))
        .join('\n')
      return readingTime(stringifiedContent)
    } catch {
      return { text: '1 min read' }
    }
  }, [data?.content])

  const { mutate: handleDelete, isPending: isDeleting } = useMutation({
    mutationFn: () => deletePage(data.id!),
    onSuccess: (result) => {
      if (result.success) {
        toast.success('Page deleted successfully')
        queryClient.invalidateQueries({ queryKey: ['get-writings', username] })
      } else {
        toast.error(result.error || 'Failed to delete page')
      }
    },
    onError: () => {
      toast.error('Failed to delete page')
    },
  })

  const confirmDelete = () => {
    if (window.confirm('Are you sure you want to delete this page? This action cannot be undone.')) {
      handleDelete()
    }
  }

  const isDraft = (data as { status?: string })?.status === 'draft'
  const created = data?.createdAt ? new Date(data.createdAt) : null

  return (
    <article className="group relative flex w-full items-center gap-4 border-b border-[#E7E2D8] pb-4 last:border-b-0 last:pb-0 dark:border-[#2E2923]">
      <Link
        href={`/page/${data.id}`}
        className="flex min-w-0 flex-1 items-center gap-4 rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-main-yellow"
      >
        <div className="relative flex size-14 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-[#E7E2D8] bg-[#FCFBF8] dark:border-[#2E2923] dark:bg-[#1C1916]">
          <SafeImage
            src={data?.thumbnail}
            sizes="56px"
            fallback={<FileText className="size-4 text-[#5A5248] dark:text-[#B3A999]" aria-hidden />}
          />
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="line-clamp-2 text-[15px] font-medium leading-snug text-[#1F1B16] group-hover:underline group-hover:underline-offset-4 dark:text-[#F3EEE6]">
            {data?.title || 'Untitled'}
          </h3>
          <p className="mt-0.5 flex flex-wrap items-center gap-x-1.5 text-sm text-[#5A5248] dark:text-[#B3A999]">
            {isDraft && (
              <>
                <span className="rounded-md bg-[#FFF3C2] px-1.5 text-xs font-medium leading-5 text-[#1F1B16] dark:bg-[#3A3220] dark:text-[#F3EEE6]">
                  Draft
                </span>
                <span aria-hidden>·</span>
              </>
            )}
            <span>{time?.text}</span>
            {created && (
              <>
                <span aria-hidden>·</span>
                <span>
                  {created.toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: created.getUTCFullYear() !== new Date().getUTCFullYear() ? 'numeric' : undefined,
                    timeZone: 'UTC',
                  })}
                </span>
              </>
            )}
          </p>
        </div>
      </Link>

      {/* Actions (only for own pages) */}
      {isMine && (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              aria-label={`Options for ${data?.title || 'page'}`}
              className="size-11 shrink-0 rounded-lg text-[#5A5248] dark:text-[#B3A999] sm:size-9"
              disabled={isDeleting}
            >
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48 rounded-xl">
            <DropdownMenuItem
              onClick={() => router.push(`/page/${data.id}`)}
              className="flex items-center gap-2"
            >
              <Edit className="h-4 w-4" />
              Edit page
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={confirmDelete}
              disabled={isDeleting}
              className="flex items-center gap-2 text-red-600 dark:text-red-400"
            >
              <Trash2 className="h-4 w-4" />
              {isDeleting ? 'Deleting…' : 'Delete page'}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )}
    </article>
  )
}

export default WritingCard
