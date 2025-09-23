'use client'

import {
  getProfileByUsername,
  isUsernameAvailable,
  updateProfile,
} from '@/actions/profile-actions'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { queryClient } from '@/lib/providers'
import { revalidatePageOnClient } from '@/lib/server-actions'
import { profileSchema, usernameSchema } from '@/lib/types'
import { cn } from '@/lib/utils'
import { zodResolver } from '@hookform/resolvers/zod'
import { useDebouncedCallback } from '@mantine/hooks'
import { useQuery } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import {
  Check,
  Loader,
  Palette,
  Settings,
  UserPen,
  UserRound,
  X,
} from 'lucide-react'
import { useSession } from '@/lib/auth-client'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { useQueryState } from 'nuqs'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import Textarea from 'react-textarea-autosize'
import { z } from 'zod'
import { useProfileDialog } from '../dialog-provider'

// import { updateProfile } from "@/app/actions/updateProfile";

export function ProfileUpdateDialog() {
  const options = [
    {
      id: 'profile',
      label: 'Profile',
      icon: <UserPen className="size-5 opacity-80" strokeWidth={1.5} />,
      onClick: () => {},
    },
    {
      id: 'account',
      label: 'Account',
      icon: <UserRound className="size-5 opacity-80" strokeWidth={1.5} />,
      onClick: () => {},
    },
    {
      id: 'appearance',
      label: 'Appearance',
      icon: <Palette className="size-5 opacity-80" strokeWidth={1.5} />,
      onClick: () => {},
    },

    {
      id: 'settings',
      label: 'Settings',
      icon: <Settings className="size-5 opacity-80" strokeWidth={1.5} />,
      onClick: () => {},
    },
  ]
  const [tab, setTab] = useQueryState('tab')
  const [active, setActive] = useState(tab || options[0].id)
  const [open, setOpen] = useProfileDialog()

  const sections = {
    profile: <EditProfile />,
    account: <>Account</>,
    appearance: <>Appearance</>,
    settings: <>Settings</>,
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(open) => {
        setOpen(open)
        setActive(options[0].id)
        setTab(null)
      }}
    >
      <DialogContent className=" max-w-sm md:max-w-lg rounded-3xl bg-light-bg dark:bg-neutral-900  flex overflow-hidden md:w-full sm:rounded-3xl flex-col items-center justify-center">
        <DialogHeader className="p-0 sr-only w-full">
          <DialogTitle className="text-xl font-medium tracking-tight ">
            Edit Profile
          </DialogTitle>
          <DialogDescription>
            Update your profile information. This will be visible to other
            users.
          </DialogDescription>
        </DialogHeader>
        <EditProfile />
        {/* <DialogTitle className="hidden">Profile</DialogTitle>
        <DialogSidebar
          active={active}
          setActive={setActive}
          options={options}
        />
        <AnimatePresence mode="wait">
          <div className="w-full overflow-hidden   h-full ">
            <ScrollArea className=" w-full h-full overflow-y-auto">
              <motion.div
                key={active}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{
                  duration: 0.3,
                  ease: "easeInOut",
                  type: "keyframes",
                }}
                className="w-full pt-8  flex items-center justify-center overflow-hidden"
              >
                {sections[active as keyof typeof sections]}
              </motion.div>
            </ScrollArea>
          </div>
        </AnimatePresence> */}
      </DialogContent>
    </Dialog>
  )
}

type DialogSidebarProps = {
  options?: {
    id: string;
    label: string;
    icon: React.ReactNode;
    onClick: () => void;
  }[];
  active: string;
  setActive: (active: string) => void;
};

const DialogSidebar = ({ options, active, setActive }: DialogSidebarProps) => {
  return (
    <div className="w-[40%] hidden md:flex border-r  flex-col border-neutral-300 dark:border-dark-border/50  h-full overflow-y-auto">
      <div className="flex pt-6 px-5  items-center justify-between">
        <h1 className="text-xl font-medium">Settings</h1>
      </div>
      <motion.div className="w-full  pt-4 ">
        {options?.map((option) => (
          <div
            onClick={() => setActive(option.id)}
            key={option.id}
            className="flex items-center w-full px-5 cursor-pointer gap-2 p-2 relative"
          >
            {option.icon}
            <span className={cn('text-sm ')}>{option.label}</span>
            {active === option.id && (
              <motion.div
                className="h-9 flex items-center justify-end w-full -z-10 bg-amber-50 dark:bg-amber-400/20  absolute right-0"
                transition={{
                  layout: {
                    duration: 0.2,
                    ease: 'easeOut',
                  },
                }}
                layoutId={'active-line'}
              >
                <div className="w-1 h-9 bg-amber-600 rounded-full" />
              </motion.div>
            )}
          </div>
        ))}
      </motion.div>
    </div>
  )
}

const EditProfile = () => {
  const { data } = useSession()
  const [isUpdating, setIsUpdating] = useState(false)
  const { data: profile } = useQuery({
    queryKey: ['get-profile-by-username', (data?.user as any)?.username],
    queryFn: () => getProfileByUsername((data?.user as any)?.username as string),
  })
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<z.infer<typeof profileSchema>>({
    values: {
      email: profile?.email || '',
      displayName: profile?.displayName || '',
      username: profile?.username || '',
      bio: profile?.bio || '',
      website: profile?.website || '',
    },
    resolver: zodResolver(profileSchema),
  })
  const bioValue = watch('bio') || ''
  const usernameValue = watch('username') || ''
  const router = useRouter()
  const [isAvailable, setIsAvailable] = useState<boolean | null>(null)
  const [isSearching, setIsSearching] = useState<boolean | null>(null)
  const setOpen = useProfileDialog()[1]

  const onSubmit = async (data: z.infer<typeof profileSchema>) => {
    setIsUpdating(true)
    const res = await updateProfile(data)
    if (!res.success) {
      setIsUpdating(false)
      toast.error('Failed to update profile')
    }
    await queryClient.invalidateQueries({
      queryKey: ['get-profile-by-username', profile?.username],
    })
    if (data.username) {
      revalidatePageOnClient(`/${data.username}`)
    }
    setIsUpdating(false)
    toast.dismiss()
    if (isAvailable) {
      router.push(`/${data.username}`)
    }
    setOpen(false)
    toast.success('Profile updated successfully')
  }

  const handleCheck = useDebouncedCallback(async (username: string) => {
    if (username === (data?.user as any)?.username) {
      setIsAvailable(null)
      setIsSearching(false)
      return
    }
    if (username.length < 3) {
      setIsAvailable(null)
      setIsSearching(false)
      return
    }
    const result = usernameSchema.safeParse({ username })
    if (!result.success) {
      toast.dismiss()
      toast.error(result.error?.errors?.[0]?.message as string)
      setIsAvailable(false)
      return
    }
    setIsSearching(true)
    const check = await isUsernameAvailable(username)
    if (!check.available) {
      toast.dismiss()
      toast.error('Username already taken')
      setIsSearching(false)
      setIsAvailable(false)
    } else {
      toast.dismiss()
      toast.success('Username is available')
      setIsSearching(false)
      setIsAvailable(true)
    }
    setIsSearching(false)
  }, 500)
  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="space-y-4 flex flex-col w-full mb-4"
    >
      {profile?.image && (
        <div className="size-24 ring-4 mb-2 ring-neutral-300 dark:ring-dark-border overflow-hidden rounded-full ">
          <Image
            src={profile?.image}
            alt="Profile"
            width={100}
            className="rounded-full aspect-square"
            height={100}
          />
        </div>
      )}
      <div className="space-y-2  w-full">
        <Label htmlFor="displayName">Name</Label>
        <Input
          className="dark:text-neutral-200 text-neutral-800"
          id="displayName"
          {...register('displayName')}
        />
        {errors.displayName && (
          <p className="text-sm text-red-500">{errors.displayName.message}</p>
        )}
      </div>

      <div className="flex flex-col  w-full">
        <Label htmlFor="username">Username</Label>
        <div className="border mt-2 border-neutral-300 dark:border-dark-border flex items-center justify-center overflow-hidden h-9 rounded-md">
          <Input
            {...register('username', {
              onChange: (e) => handleCheck(e.target.value),
            })}
            className="focus-visible:outline-none dark:text-neutral-200 text-neutral-800 focus-visible:ring-0 bg-transparent border-none "
          />
          {isSearching && <Loader className="animate-spin size-4 mr-2" />}

          {isAvailable !== null && !isSearching && (
            <div
              className={cn(
                isAvailable ? 'bg-green-500' : 'bg-red-500',
                'size-5 rounded-full flex items-center justify-center mr-2'
              )}
            >
              {isAvailable ? (
                <Check className="text-white size-3" />
              ) : (
                <X className="text-white size-3" />
              )}
            </div>
          )}
        </div>
        <span className="text-sm mx-2 mt-1 text-neutral-500 dark:text-neutral-400">
          {' '}
          rize.so/{usernameValue}
        </span>
      </div>
      <div className="space-y-2 w-full">
        <Label htmlFor="website">Website</Label>
        <Input
          className="dark:text-neutral-200 text-neutral-800"
          id="website"
          {...register('website')}
        />
        {errors.website && (
          <p className="text-sm text-red-500">{errors.website.message}</p>
        )}
      </div>
      <div className=" space-y-2">
        <Label htmlFor="bio">Bio</Label>
        <Textarea
          minRows={3}
          maxRows={6}
          maxLength={200}
          className="w-full dark:text-neutral-200 text-neutral-800 p-2 text-opacity-80 text-sm appearance-none border focus-visible:outline-none border-neutral-300 dark:border-dark-border resize-none bg-transparent rounded-md"
          id="bio"
          {...register('bio')}
        />
        <span className="text-xs mx-1 text-neutral-500 dark:text-neutral-400">
          {bioValue?.length || 0} / 200 characters
        </span>
        {errors.bio && (
          <p className="text-sm text-red-500">{errors.bio.message}</p>
        )}
      </div>
      <Button
        disabled={isUpdating || Object.keys(errors).length > 0}
        variant={'outline'}
        type="submit"
      >
        {isUpdating && <Loader className="animate-spin size-4 mr-2" />}
        Save Changes
      </Button>
    </form>
  )
}
// const EditProfile = () => {
//   const { data, update } = useSession();
//   const [isUpdating, setIsUpdating] = useState(false);
//   const { data: profile } = useQuery({
//     queryKey: ["get-profile-by-username", data?.user?.username],
//     queryFn: () => getProfileByUsername(data?.user?.username as string),
//   });
//   const {
//     register,
//     handleSubmit,
//     formState: { errors },
//   } = useForm<z.infer<typeof profileSchema>>({
//     values: {
//       email: profile?.email || "",
//       displayName: profile?.displayName || "",
//       username: profile?.username || "",
//       bio: profile?.bio || "",
//     },
//     resolver: zodResolver(profileSchema),
//   });
//   const router = useRouter();
//   const [isAvailable, setIsAvailable] = useState<boolean | null>(null);
//   const [isSearching, setIsSearching] = useState<boolean | null>(null);
//   const setOpen = useProfileDialog()[1];

//   const onSubmit = async (data: z.infer<typeof profileSchema>) => {
//     // console.log({ data: data });
//     setIsUpdating(true);
//     const res = await updateProfile(data);
//     console.log({ res });
//     if (!res.success) {
//       setIsUpdating(false);
//       toast.error("Failed to update profile");
//     }
//     await update();
//     await queryClient.invalidateQueries({
//       queryKey: ["get-profile-by-username", profile?.username],
//     });
//     revalidatePageOnClient(`/${data.username}`);
//     setIsUpdating(false);
//     toast.dismiss();
//     if (isAvailable) {
//       router.push(`/${data.username}`);
//     }
//     setOpen(false);
//     toast.success("Profile updated successfully");
//   };

//   const handleCheck = useDebouncedCallback(async (username: string) => {
//     if (username === data?.user?.username) {
//       setIsAvailable(null);
//       setIsSearching(false);
//       return;
//     }
//     if (username.length < 3) {
//       setIsAvailable(null);
//       setIsSearching(false);
//       return;
//     }
//     const result = usernameSchema.safeParse({ username });
//     if (!result.success) {
//       toast.dismiss();
//       toast.error(result.error?.flatten()?.fieldErrors?.username?.[0]);
//       setIsAvailable(false);
//       return;
//     }
//     setIsSearching(true);
//     const check = await isUsernameAvailable(username);
//     if (!check.available) {
//       toast.dismiss();
//       toast.error("Username already taken");
//       setIsSearching(false);
//       setIsAvailable(false);
//     } else {
//       toast.dismiss();
//       toast.success("Username is available");
//       setIsSearching(false);
//       setIsAvailable(true);
//     }
//     setIsSearching(false);
//   }, 500);
//   return (
//     <form
//       onSubmit={handleSubmit(onSubmit)}
//       className="space-y-4 flex flex-col max-w-sm w-full mb-10"
//     >
//       {/* <div className="flex items-center justify-center w-full gap-3"> */}
//       <div className="flex flex-col   ">
//         <h1 className="text-xl font-medium">Edit Profile</h1>
//         <p className="text-sm opacity-80 mt-2">
//           Update your profile information. This will be visible to other users.
//         </p>
//         <Separator className="bg-neutral-300 mt-4 h-[1px] w-full dark:bg-dark-border/80" />
//       </div>
//       {profile?.image && (
//         <div className="size-24 ring-4 mb-2 ring-neutral-300 dark:ring-dark-border overflow-hidden rounded-full ">
//           <Image
//             src={profile?.image}
//             alt="Profile"
//             width={100}
//             className="rounded-full aspect-square"
//             height={100}
//           />
//         </div>
//       )}
//       <div className="space-y-2  w-full">
//         <Label htmlFor="displayName">Name</Label>
//         <Input
//           className="text-opacity-80"
//           id="displayName"
//           {...register("displayName")}
//         />
//         {errors.displayName && (
//           <p className="text-sm text-red-500">{errors.displayName.message}</p>
//         )}
//       </div>
//       <div className="space-y-2 w-full">
//         <Label htmlFor="email">Email</Label>
//         <Input
//           className="text-opacity-80"
//           id="email"
//           type="email"
//           {...register("email")}
//         />
//         {errors.email && (
//           <p className="text-sm text-red-500">{errors.email.message}</p>
//         )}
//       </div>
//       {/* </div> */}
//       {/* <div className="flex items-center justify-center w-full gap-3"> */}
//       <div className="space-y-2  w-full">
//         <Label htmlFor="username">Username</Label>
//         <div className="border border-neutral-300 dark:border-dark-border flex items-center justify-center overflow-hidden h-9 rounded-md">
//           <Input
//             {...register("username", {
//               onChange: (e) => handleCheck(e.target.value),
//             })}
//             className="focus-visible:outline-none text-opacity-80 focus-visible:ring-0 bg-transparent border-none "
//           />
//           {isSearching && <Loader className="animate-spin size-4 mr-2" />}

//           {isAvailable !== null && !isSearching && (
//             <div
//               className={cn(
//                 isAvailable ? "bg-green-500" : "bg-red-500",
//                 "size-5 rounded-full flex items-center justify-center mr-2"
//               )}
//             >
//               {isAvailable ? (
//                 <Check className="text-white size-3" />
//               ) : (
//                 <X className="text-white size-3" />
//               )}
//             </div>
//           )}
//         </div>
//         {/* <Input id="username" {...register("username")} />
//         {errors.username && (
//           <p className="text-sm text-red-500">{errors.username.message}</p>
//         )}
//         {isChecking && (
//           <p className="text-sm text-green-500">Checking availability...</p>
//         )}
//         {!isChecking && isUsernameAvailable ? (
//           <p className="text-sm text-green-500">Username is available</p>
//         ) : (
//           <p className="text-sm text-red-500">Username is not available</p>
//         )} */}

//         {/* <div className="space-y-2 w-full">
//           <Label htmlFor="age">Age</Label>
//           <Input
//             className="text-opacity-80"
//             id="age"
//             type="number"
//             {...register("age", { valueAsNumber: true })}
//           />
//           {errors.age && (
//             <p className="text-sm text-red-500">{errors.age.message}</p>
//           )}
//         </div> */}
//       </div>
//       {/* <div className="flex items-center justify-center w-full gap-3">
//         <div className="space-y-2  w-full">
//           <Label htmlFor="pronouns">Pronouns</Label>
//           <Select
//             onValueChange={(value) => setValue("pronouns", value as any)}
//             defaultValue="he/him"
//           >
//             <SelectTrigger className="text-opacity-80">
//               <SelectValue placeholder="Select pronouns" />
//             </SelectTrigger>
//             <SelectContent>
//               <SelectItem value="he/him">He/Him</SelectItem>
//               <SelectItem value="she/her">She/Her</SelectItem>
//               <SelectItem value="they/them">They/Them</SelectItem>
//               <SelectItem value="other">Other</SelectItem>
//             </SelectContent>
//           </Select>
//           {errors.pronouns && (
//             <p className="text-sm text-red-500">{errors.pronouns.message}</p>
//           )}
//         </div>
//         <div className="space-y-2 w-full">
//           <Label htmlFor="location">Location</Label>
//           <Input
//             className="text-opacity-80"
//             id="location"
//             {...register("location")}
//           />
//           {errors.location && (
//             <p className="text-sm text-red-500">{errors.location.message}</p>
//           )}
//         </div>
//       </div>
//       <div className="space-y-2 w-full">
//         <Label htmlFor="website">Website</Label>
//         <Input
//           className="text-opacity-80"
//           id="website"
//           {...register("website")}
//         />
//         {errors.website && (
//           <p className="text-sm text-red-500">{errors.website.message}</p>
//         )}
//       </div> */}
//       <div className="space-y-2">
//         <Label htmlFor="bio">Bio</Label>
//         <Textarea
//           minRows={3}
//           maxRows={6}
//           className="w-full  p-2 text-opacity-80 text-sm appearance-none border focus-visible:outline-none border-neutral-300 dark:border-dark-border resize-none bg-transparent rounded-md"
//           id="bio"
//           {...register("bio")}
//         />
//         {errors.bio && (
//           <p className="text-sm text-red-500">{errors.bio.message}</p>
//         )}
//       </div>
//       <Button
//         disabled={isUpdating || Object.keys(errors).length > 0}
//         variant={"secondary"}
//         type="submit"
//       >
//         {isUpdating && <Loader className="animate-spin size-4 mr-2" />}
//         Save Changes
//       </Button>
//     </form>
//   );
// };
