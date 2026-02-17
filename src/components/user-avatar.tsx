'use client'
import { cn, isImageUrl } from '@/lib/utils'
import { Edit3, Upload } from 'lucide-react'
import { useState } from 'react'
import { useAvatarDialog } from './dialog-provider'
import AvatarSelectionDialog from './dialogs/AvatarSelectionDialog'
import { CreativeAvatar } from './ui/creative-avatar'
import Image from 'next/image'
import { Button } from './ui/button'

type UserAvatarProps = {
  data: {
    image: string;
    name: string;
  };
  isLoading: boolean;
  isMyProfile: boolean;
  className?: string;
};


const UserAvatar = ({
  data,
  isLoading,
  isMyProfile,
  className,
}: UserAvatarProps) => {
  const [file, setFile] = useState<File | null>(null)
  const setIsOpen = useAvatarDialog()[1]

  const handleEditClick = () => {
    setIsOpen(true)
  }

  const url = data?.image || `https://api.dicebear.com/9.x/initials/svg?seed=${data?.name?.trim()}&radius=50`

  return (
    <>
      <div
        className={cn(
          'relative group ring-2 ring-neutral-300 dark:ring-dark-border rounded-full overflow-hidden cursor-pointer group size-24 md:size-20 lg:size-24  aspect-square',
          className,
          isLoading && 'animate-pulse bg-neutral-300 dark:bg-dark-border rounded-full'
        )}
      >
        {/* {isMyProfile && (
          <button 
            onClick={handleEditClick}
            className="absolute z-10 group-hover:opacity-100 opacity-0 transition-all duration-100 ease-in border border-neutral-300 dark:border-dark-border bg-white dark:bg-[#363636] p-1.5 rounded-full left-0 bottom-0 drop-shadow-lg shadow-black/80"
          >
            <Edit3 className="size-5 dark:opacity-70" />
          </button>
        )} */}

        {/* {!isLoading && (
          <CreativeAvatar
            src={data?.image && (isImageUrl(data?.image) || data.image.startsWith('creative-')) ? data.image : null}
            name={data?.name || 'Anonymous'}
            size="xl"
            variant="auto"
            className="w-full h-full"
            showHoverEffect={isMyProfile}
          />
        )} */}

        <button onClick={handleEditClick} className='group-hover:opacity-100 z-50 opacity-0 bg-white border-neutral-200 absolute inset-4 flex items-center justify-center rounded-full transition-all'>
          <Upload className='size-4 md:size-6 stroke-neutral-800' />
        </button>
        {!isLoading && <Image src={url} alt="Profile" className='size-full' fill style={{ objectFit: "cover" }} priority quality={100} />}
      </div>
      <AvatarSelectionDialog file={file} setFile={setFile} />
    </>
  )
}

export default UserAvatar
