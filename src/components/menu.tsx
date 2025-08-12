import { cn } from '@/lib/utils'
import { useClickOutside } from '@mantine/hooks'
import { AnimatePresence, motion, Variants } from 'framer-motion'
import {
  Compass,
  LogOut,
  MenuIcon,
  Moon,
  Palette,
  Search,
  Settings,
  Sun,
  UserRound,
  X,
} from 'lucide-react'
import { signOut, useSession } from 'next-auth/react'
import { useTheme } from 'next-themes'
import Image from 'next/image'
import { useParams, useRouter } from 'next/navigation'
import { useState } from 'react'
import { useProfileDialog } from './dialog-provider'
import { Button } from './ui/button'
import { Separator } from './ui/separator'

const Menu = () => {
  const [open, setOpen] = useState(false)
  const session = useSession()
  const params = useParams()
  const isMine = session?.data?.user?.username === params?.username
  const setProfileDialogOpen = useProfileDialog()[1]
  const ref = useClickOutside(() => {
    setOpen(false)
  })
  const { theme, setTheme } = useTheme()
  const router = useRouter()
  const loggedInOptions = [
    {
      id: 2,
      name: 'Account',
      href: `/${session?.data?.user?.username}`,
      onClick: () => {},
      icon: <UserRound className="opacity-80 size-5" strokeWidth={1.2} />,
    },
    {
      id: 5,
      name: 'Settings',
      href: '/settings',
      onClick: () => {
        router.push('/settings')
        setOpen(false) // Close the menu
      },
      icon: <Settings className="opacity-80 size-5" strokeWidth={1.2} />,
    },
  ]
  const options = [
    {
      id: 1,
      name: 'Explore',
      href: '/explore',
      onClick: () => {
        router.push('/explore')
      },
      icon: <Compass className="opacity-80 size-5" strokeWidth={1.2} />,
    },
    {
      id: 3,
      name: 'Search',
      href: null,
      onClick: () => {
        // setOpenSearch(true);
      },
      icon: <Search className="opacity-80 size-5" strokeWidth={1.2} />,
    },
  ]
  const themeOptions = [
    {
      theme: 'light',
      name: 'Light',
      icon: <Sun className="opacity-80 size-5" strokeWidth={1.4} />,
    },
    {
      theme: 'dark',
      name: 'Dark',
      icon: <Moon className="opacity-80 size-5" strokeWidth={1.4} />,
    },
    // {
    //   theme: "system",
    //   name: "System",
    //   icon: <Monitor className="opacity-80 size-5" strokeWidth={1.4} />,
    // },
  ]
  const menuVariants: Variants = {
    hide: {
      y: -20,
      opacity: 0,
    },
    show: {
      y: 0,
      opacity: 1,
    },
    exit: {
      y: -20,
      opacity: 0,
    },
  }
  return (
    <>
      <Button
        variant={'outline'}
        size={'icon'}
        className="rounded-2xl size-10 p-2"
        onClick={() => setOpen(true)}
      >
        {open ? (
          <X strokeWidth={1.5} className="size-5 opacity-70" />
        ) : (
          <MenuIcon strokeWidth={1.5} className="size-5 opacity-70" />
        )}
      </Button>
      <AnimatePresence custom={open}>
        {open && (
          <motion.div
            ref={ref}
            variants={menuVariants}
            transition={{ duration: 0.3 }}
            initial="hide"
            animate="show"
            exit={'exit'}
            className={cn(
              'absolute top-14 bg-white  shadow-2xl backdrop-blur-2xl dark:bg-dark-bg rounded-3xl border border-neutral-300/60 flex flex-col max-w-[280px] w-full  overflow-hidden  dark:border-dark-border/80 z-50',
              isMine ? 'right-4' : 'right-4'
            )}
          >
            {session?.data && (
              <>
                {' '}
                <div className="flex p-4 mt-2 items-center justify-start">
                  <Image
                    src={
                      session?.data?.user?.profileImage ||
                      (session?.data?.user?.image as string)
                    }
                    alt="image"
                    width={50}
                    height={50}
                    className="aspect-square size-10 rounded-full"
                  />

                  <div className="ml-2 flex flex-col items-start justify-start ">
                    <h3 className="font-medium leading-tight truncate">
                      {session?.data?.user?.displayName}
                    </h3>
                    <span className="opacity-70 text-sm leading-tight truncate">
                      @{session?.data?.user?.username}
                    </span>
                  </div>
                </div>
                <Separator className="h-[0.5px]" />
              </>
            )}
            {[...options, ...(session?.data ? loggedInOptions : [])].map(
              (option, i) => (
                <motion.div
                  key={i}
                  className="flex w-full items-center  pt-1  justify-start gap-x-4 cursor-pointer mt-1 px-4 last:mb-4"
                  onClick={option.onClick}
                >
                  {option.icon}
                  <span className="tracking-tight dark:text-neutral-300 text-neutral-700">
                    {option.name}
                  </span>
                </motion.div>
              )
            )}
            <Separator className="h-[0.5px] mt-2" />
            <div className="py-2 px-4 w-full flex items-center justify-between">
              <div className="flex w-full items-center justify-start ">
                <Palette className="opacity-80 size-5" strokeWidth={1.2} />
                <span className="tracking-tight dark:text-neutral-300 ml-4 text-neutral-700">
                  Theme
                </span>
              </div>
              <motion.div
                layout
                className="flex items-center bg-neutral-200 dark:bg-neutral-900 rounded-full p-0.5  w-fit  justify-center"
              >
                {themeOptions.map((option, i) => (
                  <div
                    key={i}
                    onClick={() => setTheme(option?.theme)}
                    className=" cursor-pointer relative   flex flex-col items-center justify-center p-1.5  gap-2"
                  >
                    <div
                      className={cn(
                        'z-[2] opacity-50',
                        theme === option?.theme && 'opacity-80'
                      )}
                    >
                      {option.icon}
                    </div>
                    {theme === option?.theme && (
                      <motion.div
                        layoutId="bubble"
                        className="absolute inset-0  rounded-full z-[1] bg-white dark:bg-dark-border "
                      />
                    )}
                  </div>
                ))}
              </motion.div>
            </div>
            {session?.status === 'authenticated' && (
              <>
                {' '}
                <Separator className="h-[0.5px] " />
                <motion.div
                  className="flex w-full items-center  pt-1  justify-start gap-x-4 cursor-pointer mt-1 px-4 last:mb-4"
                  onClick={() => signOut()}
                >
                  <LogOut className="opacity-80 size-5" strokeWidth={1.2} />
                  <span className="tracking-tight dark:text-neutral-300 text-neutral-700">
                    Logout
                  </span>
                </motion.div>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}

export default Menu
