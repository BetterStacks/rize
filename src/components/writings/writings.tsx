'use client'
import { getAllPages } from '@/actions/page-actions'
import { PROFILE_STALE_TIME } from '@/lib/profile-query'
import { GetAllWritings } from '@/lib/types'
import { useQuery } from '@tanstack/react-query'
import { useParams } from 'next/navigation'
import { useState } from 'react'
import { EmptyLine, ProfileSection, SectionNewButton } from '../profile/profile-section'
import { CreatePageDialog } from './create-page-dialog'
import WritingCard from './writing-card'

type WritingsProps = {
  isMine: boolean;
  writings: GetAllWritings[];
};

const Writings = ({ isMine, writings }: WritingsProps) => {
  const [showCreateDialog, setShowCreateDialog] = useState(false)

  const { username } = useParams<{ username: string }>()
  const { data = [] } = useQuery({
    queryKey: ['get-writings', username],
    initialData: writings,
    queryFn: () => getAllPages(username),
    staleTime: PROFILE_STALE_TIME,
    refetchOnWindowFocus: false,
  })

  if (!isMine && data.length === 0) return null

  return (
    <ProfileSection
      id="writings"
      title="Writings"
      actions={isMine ? <SectionNewButton onClick={() => setShowCreateDialog(true)} what="page" /> : undefined}
    >
      {data.length === 0 ? (
        <EmptyLine text="Nothing written yet" actionLabel="Start a page" onAction={() => setShowCreateDialog(true)} />
      ) : (
        <div className="flex flex-col gap-4">
          {data.map((writing) => (
            <WritingCard key={writing.id} data={writing} />
          ))}
        </div>
      )}

      {isMine && (
        <CreatePageDialog
          open={showCreateDialog}
          onOpenChange={setShowCreateDialog}
        />
      )}
    </ProfileSection>
  )
}

export default Writings
