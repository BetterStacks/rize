import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu"
import { useSession } from '@/hooks/useAuth'
import { useClickOutside } from '@mantine/hooks'
import {
  ArrowUpRight,
  Compass,
  LogOut,
  Moon,
  Search,
  Settings,
  Sun,
  UserRound
} from 'lucide-react'
import { useTheme } from 'next-themes'
import Image from 'next/image'
import { useParams, useRouter } from 'next/navigation'
import { useState } from 'react'
import { useProfileDialog } from './dialog-provider'
import { Button } from './ui/button'

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
      onClick: () => { },
      icon: UserRound,
    },
    {
      id: 5,
      name: 'Settings',
      href: '/settings',
      onClick: () => {
        router.push('/settings')
        setOpen(false) // Close the menu
      },
      icon: Settings,
    },
  ]
  const guestOptions = [
    {
      id: 1,
      name: 'Explore',
      href: '/explore',
      onClick: () => {
        router.push('/explore')
        setOpen(false)
      },
      icon: Compass,
    },
    {
      id: 2,
      name: 'Login',
      href: '/login',
      onClick: () => {
        router.push('/login')
        setOpen(false)
      },
      icon: UserRound,
    },
  ]

  const options = [
    {
      id: 1,
      name: 'Explore',
      href: '/explore',
      icon: Compass,
    },
    {
      id: 2,
      name: 'Search',
      href: null,
      onClick: () => {
        // setOpenSearch(true);
      },
      icon: Search,
    },
    {
      id: 3,
      name: 'Your Page',
      href: `/${session?.data?.user?.username}`,
      icon: ArrowUpRight,
    },
    {
      id: 4,
      name: 'Settings',
      href: '/settings',
      icon: Settings,
    },
  ]


  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          variant={'outline'}
          size={'icon'}
          className="rounded-full relative overflow-hidden size-10 "
          onClick={() => setOpen(true)}
        >
          {/* {open ? (
              <X strokeWidth={1.5} className="size-5 opacity-70" />
            ) : (
              <MenuIcon strokeWidth={1.5} className="size-5 opacity-70" />
            )} */}
          <Image src={session?.data?.user?.profileImage || session?.data?.user?.image || '/'} alt="Profile" className='rounded-lg size-full' width={24} height={24} priority />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-64 mt-2 dark:bg-dark-bg dark:border-dark-border border-neutral-200/80 rounded-2xl" align="end">
        <DropdownMenuGroup className='p-3'>
          {session?.data ? (
            <>
              {' '}
              <div className="flex items-center justify-start">

                <div className="flex flex-col items-start justify-start ">
                  <h3 className="font-medium tracking-tight text-sm leading-tight truncate">
                    {session?.data?.user?.displayName}
                  </h3>
                  <span className="opacity-60 text-sm  leading-tight truncate">
                    @{session?.data?.user?.username}
                  </span>
                </div>
              </div>
            </>
          ) : (
            <>
              <div className="flex p-4 mt-2 items-center justify-center">
                <div className="flex flex-col items-center justify-center text-center">
                  <h3 className="font-medium leading-tight text-lg">
                    Claim your profile
                  </h3>
                  <span className="opacity-70 text-sm leading-tight mt-1">
                    Join the community today
                  </span>
                </div>
              </div>
            </>
          )}
        </DropdownMenuGroup>
        <DropdownMenuSeparator className='dark:bg-dark-border/60 bg-neutral-200/60' />
        <DropdownMenuGroup className=''>
          {options.map((option) => (
            <DropdownMenuItem key={option.id} onClick={() => {
              if (option.href) {
                router.push(option.href)
              }
            }}>
              <option.icon /> {option.name}
            </DropdownMenuItem>
          ))}
        </DropdownMenuGroup>
        <DropdownMenuSeparator className='dark:bg-dark-border/60 bg-neutral-200/60' />
        <DropdownMenuGroup className=''>
          <DropdownMenuItem onClick={() => setTheme(theme === "dark" ? "light" : "dark")}>
            {theme === "dark" ? <Sun /> : <Moon />} Switch to {theme === "dark" ? "light" : "dark"}
            <DropdownMenuShortcut>⇧⌘T</DropdownMenuShortcut>
          </DropdownMenuItem>
          <DropdownMenuItem className='text-red-500'>
            <LogOut /> Log out
            <DropdownMenuShortcut>⇧⌘Q</DropdownMenuShortcut>
          </DropdownMenuItem>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>


  )
}
// <>
//   <Button
//     variant={'outline'}
//     size={'icon'}
//     className="rounded-full size-10 "
//     onClick={() => setOpen(true)}
//   >
//     {/* {open ? (
//       <X strokeWidth={1.5} className="size-5 opacity-70" />
//     ) : (
//       <MenuIcon strokeWidth={1.5} className="size-5 opacity-70" />
//     )} */}
//     <Image src={session?.data?.user?.profileImage || session?.data?.user?.image || '/'} alt="Profile" className='rounded-full size-8' width={24} height={24} priority />
//   </Button>
//   <AnimatePresence custom={open}>
//     {open && (
//       <motion.div
//         ref={ref}
//         variants={menuVariants}
//         transition={{ duration: 0.3 }}
//         initial="hide"
//         animate="show"
//         exit={'exit'}
//         className={cn(
//           'absolute top-14 shadow-md bg-white backdrop-blur-2xl dark:bg-dark-bg rounded-3xl border border-neutral-200 flex flex-col max-w-[280px] w-full  overflow-hidden  dark:border-dark-border/80 z-50',
//           isMine ? 'right-4' : 'right-4'
//         )}
//       >
//         {session?.data ? (
//           <>
//             {' '}
//             <div className="flex p-4 mt-2 items-center justify-start">
//               <CreativeAvatar
//                 src={session?.data?.user?.profileImage || session?.data?.user?.image || null}
//                 name={session?.data?.user?.name || 'User'}
//                 size="md"
//                 variant="auto"
//                 showHoverEffect={false}
//               />

//               <div className="ml-2 flex flex-col items-start justify-start ">
//                 <h3 className="font-medium leading-tight truncate">
//                   {session?.data?.user?.displayName}
//                 </h3>
//                 <span className="opacity-70 text-sm leading-tight truncate">
//                   @{session?.data?.user?.username}
//                 </span>
//               </div>
//             </div>
//             <Separator className="h-[0.5px]" />
//           </>
//         ) : (
//           <>
//             <div className="flex p-4 mt-2 items-center justify-center">
//               <div className="flex flex-col items-center justify-center text-center">
//                 <h3 className="font-medium leading-tight text-lg">
//                   Claim your profile
//                 </h3>
//                 <span className="opacity-70 text-sm leading-tight mt-1">
//                   Join the community today
//                 </span>
//               </div>
//             </div>
//             <Separator className="h-[0.5px]" />
//           </>
//         )}
//         {[...(session?.data ? options : guestOptions), ...(session?.data ? loggedInOptions : [])].map(
//           (option, i) => {
//             const Icon = option.icon
//             return (
//               <motion.div
//                 key={i}
//                 className="flex w-full items-center  pt-1  justify-start gap-x-4 cursor-pointer mt-1 px-4 last:mb-4"
//                 onClick={option.onClick}
//               >
//                 {Icon && <Icon className="size-5 opacity-90" strokeWidth={1.8} />}
//                 <span className="tracking-tight dark:text-neutral-300 text-neutral-800 font-medium">
//                   {option.name}
//                 </span>
//               </motion.div>
//             )
//           }
//         )}
//         <Separator className="h-[0.5px] mt-2" />
//         <div className="py-2 px-4 w-full flex items-center justify-between">
//           <div className="flex w-full items-center justify-start ">
//             <Palette className="opacity-90 size-5" strokeWidth={1.8} />
//             <span className="tracking-tight dark:text-neutral-300 ml-4 text-neutral-700">
//               Theme
//             </span>
//           </div>
//           <motion.div
//             layout
//             className="flex items-center bg-neutral-200 dark:bg-neutral-900 rounded-full p-0.5  w-fit  justify-center"
//           >
//             {themeOptions.map((option, i) => {
//               const Icon = option.icon
//               return (
//                 <div
//                   key={i}
//                   onClick={() => setTheme(option?.theme)}
//                   className=" cursor-pointer relative   flex flex-col items-center justify-center p-1.5  gap-2"
//                 >
//                   <div
//                     className={cn(
//                       'z-[2] opacity-50',
//                       theme === option?.theme && 'opacity-80'
//                     )}
//                   >
//                     {Icon && <Icon className="opacity-90 size-5" strokeWidth={1.8} />}
//                   </div>
//                   {theme === option?.theme && (
//                     <motion.div
//                       layoutId="bubble"
//                       className="absolute inset-0  rounded-full z-[1] bg-white dark:bg-dark-border "
//                     />
//                   )}
//                 </div>
//               )
//             })}
//           </motion.div>
//         </div>
//         {session?.data && (
//           <>
//             {' '}
//             <Separator className="h-[0.5px] " />
//             <motion.div
//               className="flex w-full items-center  pt-1  justify-start gap-x-4 cursor-pointer mt-1 px-4 last:mb-4"
//               onClick={async () => {
//                 try {
//                   await signOut()
//                   // Redirect to home page after successful sign out
//                   window.location.href = '/'
//                 } catch (error) {
//                   console.error('Sign out error:', error)
//                 }
//               }}
//             >
//               <LogOut className="opacity-90 size-5" strokeWidth={1.8} />
//               <span className="tracking-tight dark:text-neutral-300 text-neutral-700">
//                 Logout
//               </span>
//             </motion.div>
//           </>
//         )}
//       </motion.div>
//     )}
//   </AnimatePresence>
// </>

export default Menu
