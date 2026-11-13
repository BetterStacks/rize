'use client'
import { cn } from '@/lib/utils'
import { Camera } from 'lucide-react'
import { useState } from 'react'
import { useAvatarDialog } from './dialog-provider'
import AvatarSelectionDialog from './dialogs/AvatarSelectionDialog'
import PersonAvatar from './profile/person-avatar'

type UserAvatarProps = {
  data: {
    image: string;
    name: string;
  };
  isLoading?: boolean;
  isMyProfile: boolean;
  className?: string;
  /** Rendered size in px. */
  size?: number;
};

/** The profile header avatar. The owner can tap it to change the photo. */
const UserAvatar = ({
  data,
  isMyProfile,
  className,
  size = 88,
}: UserAvatarProps) => {
  const [file, setFile] = useState<File | null>(null)
  const setIsOpen = useAvatarDialog()[1]

  const avatar = (
    <PersonAvatar
      src={data?.image}
      name={data?.name}
      size={size}
      priority
      className="ring-1 ring-[#E7E2D8] dark:ring-[#2E2923]"
    />
  )

  if (!isMyProfile) {
    return <div className={className}>{avatar}</div>
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        aria-label="Change profile photo"
        className={cn(
          'group relative rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-main-yellow focus-visible:ring-offset-2 dark:focus-visible:ring-offset-[#141210]',
          className,
        )}
      >
        {avatar}
        <span
          aria-hidden
          className="absolute bottom-0 right-0 flex size-7 items-center justify-center rounded-full border border-[#E7E2D8] bg-white text-[#1F1B16] shadow-sm transition-colors duration-150 group-hover:bg-main-yellow dark:border-[#2E2923] dark:bg-[#1C1916] dark:text-[#F3EEE6] dark:group-hover:text-[#1F1B16]"
        >
          <Camera className="size-3.5" />
        </span>
      </button>
      <AvatarSelectionDialog file={file} setFile={setFile} />
    </>
  )
}

export default UserAvatar
