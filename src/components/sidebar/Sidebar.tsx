'use client'
import { useSession } from '@/hooks/useAuth'
import { cn } from '@/lib/utils'
import { motion } from 'framer-motion'
import { Compass, Edit3, Plus, Search, Settings, UserRound } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  useAuthDialog,
  usePostsDialog,
  useSearchDialog,
} from '../dialog-provider'
import Menu from '../menu'
import { Button } from '../ui/button'
import { Separator } from '../ui/separator'

const Sidebar = ({ className }: { className?: string }) => {
  const session = useSession()
  const router = useRouter()
  const setIsPostDialogOpen = usePostsDialog()[1]
  const setIsAuthDialogOpen = useAuthDialog()[1]
  const setIsSearchDialogOpen = useSearchDialog()[1]

  return (
    <div
      className={cn(
        className,
        'h-screen w-[90px] bg-light-bg dark:bg-dark-bg border-r border-neutral-300/60  dark:border-dark-border/60  hidden md:flex flex-col items-center justify-between px-2 z-40 py-4'
      )}
    >
      <div className="flex w-full flex-col mt-4 items-center justify-center gap-y-2 ">
        <div className="mb-6">
          <Link href={session?.data?.user?.username ? `/${session?.data?.user?.username}` : '/'}>
            <Image
              width={42}
              height={42}
              className="rounded-xl hidden dark:flex size-10"
              alt=""
              src={'/logo-dark.png'}
            />
            <Image
              width={42}
              height={42}
              className="rounded-xl  dark:hidden flex size-10"
              alt=""
              src={'/logo-light.png'}
            />
          </Link>
        </div>
      </div>

      <div className="mb-8 flex flex-col gap-y-4">
        <Button
          variant={'ghost'}
          className="rounded-full size-10 group relative"
          size={'icon'}
          onClick={() => {
            router.push('/')
          }}
          title="Explore"
        >
          <Compass strokeWidth={1.4} className="size-5 opacity-80 group-hover:opacity-100 transition-opacity" />
        </Button>
        <Button
          variant={'ghost'}
          className="rounded-full size-10 group relative"
          size={'icon'}
          onClick={() => {
            setIsSearchDialogOpen(true)
          }}
          title="Search (⌘K)"
        >
          <Search strokeWidth={1.4} className="size-5 opacity-80 group-hover:opacity-100 transition-opacity" />
        </Button>
        {session?.data && (
          <>
            <Button
              variant={'ghost'}
              className={cn('rounded-full size-10', !session?.data && 'mb-10')}
              size={'icon'}
              onClick={() => {
                if (!session?.data) {
                  setIsAuthDialogOpen(true)
                  return
                }
                setIsPostDialogOpen(true)
              }}
            >
              <Plus strokeWidth={1.4} className="size-5 opacity-80" />
            </Button>
            <Button
              variant={'ghost'}
              className="rounded-full size-10 group relative"
              size={'icon'}
              onClick={() => {
                router.push(`/settings`)
              }}
              title="Settings"
            >
              <Settings strokeWidth={1.4} className="size-5 opacity-80 group-hover:opacity-100 transition-opacity" />
            </Button>
          </>
        )}
        <Separator className='w-6 h-px mb-2 mt-1 bg-neutral-200 dark:bg-dark-border mx-auto' />
        <Menu />
        {/* {session?.data && (
                      <Link href={`/${session?.data?.user?.username}`}>
            <PostAvatar
              avatar={session?.data?.user?.profileImage || session?.data?.user?.image || ''}
              name={session?.data?.user?.displayName || session?.data?.user?.name || ''}
            />
          </Link>
        )} */}
      </div>
    </div>
  )
}

const OptionsMenu = () => {
  const session = useSession()
  const options = [
    {
      id: 1,
      name: 'Manage Account',
      href: `/${session?.data?.user?.username}`,
      onClick: () => { },
      icon: <UserRound className="opacity-70 size-5" strokeWidth={1.2} />,
    },
    {
      id: 2,
      name: 'Edit Profile',
      href: `/${session?.data?.user?.username}`,
      onClick: () => { },
      icon: <Edit3 className="opacity-70 size-5" strokeWidth={1.2} />,
    },
    {
      id: 3,
      name: 'Settings',
      href: `/${session?.data?.user?.username}?tab=settings`,
      onClick: () => { },
      icon: <Settings className="opacity-70 size-5" strokeWidth={1.2} />,
    },
  ]
  return (
    <motion.div>
      {options.map((option) => (
        <div
          onClick={option.onClick}
          className=" relative group flex items-center justify-start my-1"
          key={option.id}
        >
          {option?.icon}{' '}
          <span className="opacity-80 font-light tracking-tight ml-4  ">
            {option?.name}
          </span>
          {/* <div className=" bg-white z-50 border border-neutral-200 dark:border-none dark:bg-neutral-800 rounded-xl opacity-0 absolute left-20 group-hover:left-24 group-hover:opacity-100 transition-all duration-300 drop-shadow-2xl px-4 py-1 ">
            <span className="text-xs opacity-70">{option.name}</span>
          </div> */}
        </div>
      ))}
    </motion.div>
  )
}

export default Sidebar
