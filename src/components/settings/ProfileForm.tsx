'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import * as z from 'zod'
import { Button, buttonVariants } from '@/components/ui/button'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useSession } from '@/hooks/useAuth'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getProfileByUsername, updateProfile } from '@/actions/profile-actions'
import { getAllSkills } from '@/actions/project-actions'
import { uploadMedia } from '@/actions/client-actions'
import { Separator } from '../ui/separator'
import { Skeleton } from '../ui/skeleton'
import { useCallback, useEffect, useRef, useState } from 'react'
import toast from 'react-hot-toast'
import { Check, ChevronsUpDown, Loader, Plus, X } from 'lucide-react'
import Image from 'next/image'
import { useDropzone } from 'react-dropzone'
import { cn } from '@/lib/utils'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command'

// ── Schema ────────────────────────────────────────────────────────────────
const profileFormSchema = z.object({
  displayName: z.string().min(2, 'At least 2 characters').max(30).optional(),
  bio: z.string().max(200, 'Bio must be 200 characters or less').optional(),
  website: z.string().url().optional().or(z.literal('')),
  location: z.string().max(100).optional(),
  personalMission: z.string().max(300).optional(),
  lifePhilosophy: z.string().max(300).optional(),
  age: z.number().int().min(0).max(120).optional(),
  skillIds: z.array(z.string()).max(20, 'Maximum 20 skills').optional(),
})

type FormData = z.infer<typeof profileFormSchema>


type TProfileFormProps = {
  className?: string
}

export function ProfileForm({ className }: TProfileFormProps) {
  const { data: session } = useSession()
  const queryClient = useQueryClient()

  // ── State ─────────────────────────────────────────────────────────────
  const [avatarFile, setAvatarFile] = useState<File | null>(null)

  // ── Fetch profile data ────────────────────────────────────────────────
  const { data, isLoading } = useQuery({
    queryKey: ['get-profile-by-username', (session?.user as any)?.username],
    queryFn: () => getProfileByUsername((session?.user as any)?.username as string),
    enabled: !!(session?.user as any)?.username,
  })

  const { data: skillsData } = useQuery({
    queryKey: ['get-all-skills'],
    queryFn: () => getAllSkills(),
  })

  const form = useForm<FormData>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      displayName: '',
      bio: '',
      website: '',
      location: '',
      personalMission: '',
      lifePhilosophy: '',
      age: undefined,
      skillIds: [],
    },
  })

  // ── Populate form ─────────────────────────────────────────────────────
  const initializedRef = useRef(false)

  useEffect(() => {
    if (!data || isLoading || initializedRef.current) return
    const profileSkills = (data as any)?.skills as Array<{ id: string; name: string; slug: string }> | null
    form.reset({
      displayName: data.displayName || '',
      bio: data.bio || '',
      website: data.website || '',
      location: data.location || '',
      personalMission: data.personalMission || '',
      lifePhilosophy: data.lifePhilosophy || '',
      age: data.age ?? undefined,
      skillIds: profileSkills?.map((s) => s.id) || [],
    })
    initializedRef.current = true
  }, [data, isLoading, form])

  // ── Avatar dropzone ───────────────────────────────────────────────────
  const { getRootProps, getInputProps } = useDropzone({
    onDrop: useCallback((files: File[]) => {
      setAvatarFile(files[0])
    }, []),
    multiple: false,
    accept: { 'image/*': [] },
  })

  const existingAvatar = data?.profileImage || (data as any)?.image || null
  const avatarPreviewUrl = avatarFile
    ? URL.createObjectURL(avatarFile)
    : existingAvatar

  // ── Mutations ─────────────────────────────────────────────────────────
  const { mutateAsync: mutateUpload, isPending: isUploading } = useMutation({
    mutationFn: uploadMedia,
  })

  const { mutateAsync: mutateUpdate, isPending: isUpdating } = useMutation({
    mutationFn: updateProfile,
    onSuccess: async () => {
      toast.success('Profile updated!')
      queryClient.invalidateQueries({ queryKey: ['get-profile-by-username'] })
      queryClient.invalidateQueries({ queryKey: ['get-profile'] })
    },
    onError: (error: any) => {
      toast.error('Failed to update profile: ' + (error?.message || 'Unknown error'))
    },
  })

  // ── Submit ────────────────────────────────────────────────────────────
  async function onSubmit(values: FormData) {
    try {
      let profileImage: string | undefined

      // Upload avatar if changed
      if (avatarFile) {
        const fd = new FormData()
        fd.append('files', avatarFile)
        fd.append('folder', 'profiles')
        const res = await mutateUpload(fd)
        profileImage = res[0]?.url
      }

      await mutateUpdate({
        ...values,
        ...(profileImage && { profileImage }),
      })
    } catch (err) {
      console.error(err)
    }
  }

  const busy = isUploading || isUpdating

  // ── Render ────────────────────────────────────────────────────────────
  return (
    <div className={cn("space-y-4 w-full max-w-2xl", className)}>
      <div>
        <h2 className="text-xl font-medium">Profile Details</h2>
        <p className="text-sm opacity-80 mt-1">
          Update your profile information that will be displayed to other users.
        </p>
        <Separator className="my-4" />
      </div>

      {isLoading ? (
        <ProfileFormSkeleton />
      ) : (
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Profile Image */}
            <div className="flex items-center gap-4">
              <div
                {...getRootProps()}
                className="border-2 relative border-neutral-200 dark:border-dark-border size-20 aspect-square rounded-full cursor-pointer hover:border-neutral-400 dark:hover:border-neutral-500 transition-colors"
              >
                {avatarPreviewUrl ? (
                  <>
                    <Button
                      size="smallIcon"
                      variant="outline"
                      type="button"
                      className="dark:bg-dark-bg dark:hover:bg-dark-border absolute size-6 right-0 bottom-0 z-[2]"
                      onClick={(e) => {
                        e.stopPropagation()
                        setAvatarFile(null)
                      }}
                    >
                      <X className="size-3" />
                    </Button>
                    <div className="relative rounded-full size-full overflow-hidden">
                      <Image
                        className="object-cover"
                        src={avatarPreviewUrl}
                        fill
                        alt="Profile"
                        unoptimized={!avatarFile}
                      />
                    </div>
                  </>
                ) : (
                  <>
                    <Button
                      size="smallIcon"
                      variant="outline"
                      className="dark:bg-dark-bg dark:hover:bg-dark-border absolute size-6 bottom-0 right-0 z-[2]"
                      type="button"
                    >
                      <Plus className="size-3" />
                    </Button>
                    <input {...getInputProps()} />
                  </>
                )}
              </div>
              <div className="text-sm text-neutral-500 dark:text-neutral-400">
                Click to upload a profile photo
              </div>
            </div>

            {/* Display Name */}
            <FormField
              control={form.control}
              name="displayName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Display Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Your display name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Bio */}
            <FormField
              control={form.control}
              name="bio"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Bio</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Tell us about yourself"
                      className="resize-none"
                      rows={3}
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    {(field.value?.length || 0)}/200 characters
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Website */}
            <FormField
              control={form.control}
              name="website"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Website</FormLabel>
                  <FormControl>
                    <Input placeholder="https://your-website.com" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Location */}
            <FormField
              control={form.control}
              name="location"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Location</FormLabel>
                  <FormControl>
                    <Input placeholder="San Francisco, CA" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Age */}
            <FormField
              control={form.control}
              name="age"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Age</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      placeholder="25"
                      {...field}
                      value={field.value ?? ''}
                      onChange={(e) => {
                        const v = e.target.value
                        field.onChange(v === '' ? undefined : parseInt(v))
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Separator />

            {/* Personal Mission */}
            <FormField
              control={form.control}
              name="personalMission"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Personal Mission</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="What drives you?"
                      className="resize-none"
                      rows={2}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Life Philosophy */}
            <FormField
              control={form.control}
              name="lifePhilosophy"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Life Philosophy</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Your guiding principles..."
                      className="resize-none"
                      rows={2}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Separator />

            {/* Skills */}
            <div className="space-y-2">
              <FormLabel>Skills</FormLabel>
              <Popover>
                <PopoverTrigger asChild>
                  <div
                    role="combobox"
                    className={cn(
                      buttonVariants({ variant: 'outline' }),
                      'w-full dark:border-dark-border dark:bg-transparent justify-between h-auto min-h-10 px-3 py-2 flex-wrap gap-2 hover:bg-neutral-50 dark:hover:bg-dark-border/20 active:scale-100 cursor-pointer'
                    )}
                  >
                    <div className="flex flex-wrap gap-2">
                      {form.watch('skillIds') && form.watch('skillIds')!.length > 0 ? (
                        form.watch('skillIds')!.map((skillId) => {
                          const skill = skillsData?.find((s) => s.id === skillId)
                          return (
                            <Button
                              key={skillId}
                              size="sm"
                              variant="outline"
                              className="flex items-center"
                              onClick={(e) => {
                                e.stopPropagation()
                                const current = form.getValues('skillIds') || []
                                form.setValue(
                                  'skillIds',
                                  current.filter((id) => id !== skillId)
                                )
                              }}
                            >
                              {skill?.name}
                              <X className="size-4 ml-2" />
                            </Button>
                          )
                        })
                      ) : (
                        <span className="text-neutral-400 font-normal">
                          Select your skills...
                        </span>
                      )}
                    </div>
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </div>
                </PopoverTrigger>
                <PopoverContent
                  className="w-[var(--radix-popover-trigger-width)] dark:border-dark-border sm:rounded-lg max-h-[260px] h-auto p-0"
                  align="start"
                >
                  <Command>
                    <CommandInput placeholder="Search skills..." />
                    <CommandList className="max-h-[220px] overflow-y-auto">
                      <CommandEmpty>No skill found.</CommandEmpty>
                      <CommandGroup>
                        {skillsData
                          ?.filter(
                            (skill) =>
                              !(form.watch('skillIds') || []).includes(skill.id)
                          )
                          .map((skill) => (
                            <CommandItem
                              className="rounded-md"
                              key={skill.id}
                              value={skill.name}
                              onSelect={() => {
                                const current = form.getValues('skillIds') || []
                                if (!current.includes(skill.id)) {
                                  if (current.length >= 20) {
                                    toast.error('Maximum 20 skills allowed')
                                    return
                                  }
                                  form.setValue('skillIds', [
                                    ...current,
                                    skill.id,
                                  ])
                                }
                              }}
                            >
                              <Check
                                className={cn(
                                  'mr-2 h-4 w-4',
                                  (form.watch('skillIds') || []).includes(
                                    skill.id
                                  )
                                    ? 'opacity-100'
                                    : 'opacity-0'
                                )}
                              />
                              {skill.name}
                            </CommandItem>
                          ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
              <p className="text-xs text-neutral-500 dark:text-neutral-400">
                Add skills to help others discover and connect with you.
              </p>
            </div>

            {/* Submit */}
            <Button
              type="submit"
              variant="outline"
              className="w-full rounded-md"
              disabled={busy}
            >
              {busy ? (
                <span className="flex items-center gap-2">
                  <Loader className="size-4 animate-spin" /> Saving...
                </span>
              ) : (
                'Save Changes'
              )}
            </Button>
          </form>
        </Form>
      )}
    </div>
  )
}

// ── Skeleton ──────────────────────────────────────────────────────────────
const ProfileFormSkeleton = () => (
  <div className="space-y-4">
    <div className="flex items-center gap-4">
      <Skeleton className="size-20 rounded-full" />
      <Skeleton className="h-4 w-40" />
    </div>
    {[...Array(6)].map((_, i) => (
      <div key={i} className="space-y-2">
        <Skeleton className="h-4 w-20" />
        <Skeleton
          className={cn('h-[40px] w-full rounded-lg', i === 1 && 'h-[80px]')}
        />
      </div>
    ))}
  </div>
)
