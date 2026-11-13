'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import * as z from 'zod'
import { Button } from '@/components/ui/button'
import PersonAvatar from '@/components/profile/person-avatar'
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
import { UploadError } from '@/lib/prepare-upload'
import { Skeleton } from '../ui/skeleton'
import { useCallback, useEffect, useRef, useState } from 'react'
import toast from 'react-hot-toast'
import { Check, ChevronsUpDown, Loader, X } from 'lucide-react'
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
  /** Leave out the heading: the settings page gives each form its own section title. */
  bare?: boolean
}

export function ProfileForm({ className, bare = false }: TProfileFormProps) {
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
  const { getRootProps, getInputProps, open: openFilePicker } = useDropzone({
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
      toast.success('Saved')
      queryClient.invalidateQueries({ queryKey: ['get-profile-by-username'] })
      queryClient.invalidateQueries({ queryKey: ['get-profile'] })
    },
    onError: (error: any) => {
      toast.error(error?.message ? `Couldn't save: ${error.message}` : "Couldn't save your profile")
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
      // mutateUpdate toasts its own errors; upload errors need one here.
      if (err instanceof UploadError) toast.error(err.message)
    }
  }

  const busy = isUploading || isUpdating

  // ── Render ────────────────────────────────────────────────────────────
  const skillIds = form.watch('skillIds') || []
  const descClass = 'text-xs leading-relaxed text-ink-secondary'
  const messageClass = 'text-xs text-danger'

  return (
    <div className={cn('w-full max-w-[640px]', className)}>
      {!bare && (
        <div className="mb-8">
          <h2 className="font-instrument text-[28px] leading-none text-ink">Profile details</h2>
          <p className="mt-2 text-sm text-ink-secondary">What people see at the top of your profile.</p>
        </div>
      )}

      {isLoading ? (
        <ProfileFormSkeleton />
      ) : (
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Photo. The file input stays mounted so an existing photo can be replaced too. */}
            <div className="flex items-center gap-4">
              <div className="relative shrink-0">
                <div
                  {...getRootProps({
                    'aria-label': avatarPreviewUrl ? 'Change profile photo' : 'Add a profile photo',
                    role: 'button',
                  })}
                  className="block size-20 cursor-pointer rounded-full ring-1 ring-hairline transition-shadow duration-fast ease-calm hover:ring-ink-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink focus-visible:ring-offset-2 focus-visible:ring-offset-ground"
                >
                  <input {...getInputProps()} />
                  {avatarFile && avatarPreviewUrl ? (
                    <span className="relative block size-full overflow-hidden rounded-full">
                      <Image className="object-cover" src={avatarPreviewUrl} fill alt="" unoptimized />
                    </span>
                  ) : (
                    <PersonAvatar src={existingAvatar} name={data?.displayName || session?.user?.name} size={80} />
                  )}
                </div>
                {avatarFile && (
                  <Button
                    size="smallIcon"
                    variant="outline"
                    type="button"
                    aria-label="Keep the old photo"
                    className="absolute -bottom-1 -right-1 size-7 rounded-full"
                    onClick={() => setAvatarFile(null)}
                  >
                    <X className="size-3.5" aria-hidden />
                  </Button>
                )}
              </div>
              <div className="min-w-0">
                <Button type="button" variant="outline" size="sm" className="touch-target" onClick={openFilePicker}>
                  {existingAvatar || avatarFile ? 'Change photo' : 'Add photo'}
                </Button>
                <p className={cn(descClass, 'mt-1.5')}>
                  {avatarFile ? 'The new photo is saved when you save.' : 'A clear photo of your face works best.'}
                </p>
              </div>
            </div>

            <FormField
              control={form.control}
              name="displayName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Display name</FormLabel>
                  <FormControl>
                    <Input placeholder="Your name" autoComplete="name" {...field} />
                  </FormControl>
                  <FormMessage className={messageClass} />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="bio"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Bio</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="A line or two about what you do"
                      className="resize-none"
                      rows={3}
                      {...field}
                    />
                  </FormControl>
                  <FormDescription className={cn(descClass, 'tabular-nums')}>
                    {(field.value?.length || 0)}/200
                  </FormDescription>
                  <FormMessage className={messageClass} />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="location"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Location</FormLabel>
                  <FormControl>
                    <Input placeholder="City, country" {...field} />
                  </FormControl>
                  <FormMessage className={messageClass} />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="website"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Website</FormLabel>
                  <FormControl>
                    <Input type="url" inputMode="url" placeholder="https://" {...field} />
                  </FormControl>
                  <FormMessage className={messageClass} />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="age"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Age</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      inputMode="numeric"
                      placeholder="Optional"
                      className="max-w-[8rem]"
                      {...field}
                      value={field.value ?? ''}
                      onChange={(e) => {
                        const v = e.target.value
                        field.onChange(v === '' ? undefined : parseInt(v))
                      }}
                    />
                  </FormControl>
                  <FormMessage className={messageClass} />
                </FormItem>
              )}
            />

            <div className="space-y-6 border-t border-hairline pt-6">
              <FormField
                control={form.control}
                name="personalMission"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Personal mission</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="What drives you?"
                        className="resize-none"
                        rows={2}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage className={messageClass} />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="lifePhilosophy"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Life philosophy</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="The ideas you try to live by"
                        className="resize-none"
                        rows={2}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage className={messageClass} />
                  </FormItem>
                )}
              />
            </div>

            <div className="space-y-2 border-t border-hairline pt-6">
              <FormLabel>Skills</FormLabel>
              <Popover>
                <PopoverTrigger asChild>
                  <div
                    role="combobox"
                    tabIndex={0}
                    className="flex min-h-10 w-full cursor-pointer items-center justify-between gap-2 rounded-xl border border-hairline px-3 py-2 text-sm transition-[border-color,box-shadow] duration-fast ease-calm hover:border-ink-secondary focus-visible:border-ink focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-brand/50"
                  >
                    <div className="flex flex-wrap gap-1.5">
                      {skillIds.length > 0 ? (
                        skillIds.map((skillId) => {
                          const skill = skillsData?.find((s) => s.id === skillId)
                          return (
                            <button
                              type="button"
                              key={skillId}
                              aria-label={`Remove ${skill?.name ?? 'skill'}`}
                              className="inline-flex h-7 items-center gap-1 rounded-lg bg-subtle px-2.5 text-xs font-medium text-ink transition-colors duration-fast ease-calm hover:bg-hairline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink"
                              onClick={(e) => {
                                e.stopPropagation()
                                form.setValue(
                                  'skillIds',
                                  skillIds.filter((id) => id !== skillId)
                                )
                              }}
                            >
                              {skill?.name}
                              <X className="size-3 text-ink-secondary" aria-hidden />
                            </button>
                          )
                        })
                      ) : (
                        <span className="text-ink-secondary">Add skills</span>
                      )}
                    </div>
                    <ChevronsUpDown className="size-4 shrink-0 text-ink-secondary" aria-hidden />
                  </div>
                </PopoverTrigger>
                <PopoverContent
                  className="h-auto max-h-[260px] w-[var(--radix-popover-trigger-width)] p-0"
                  align="start"
                >
                  <Command>
                    <CommandInput placeholder="Search skills" />
                    <CommandList className="max-h-[220px] overflow-y-auto">
                      <CommandEmpty>No skill by that name.</CommandEmpty>
                      <CommandGroup>
                        {skillsData
                          ?.filter((skill) => !skillIds.includes(skill.id))
                          .map((skill) => (
                            <CommandItem
                              className="rounded-lg"
                              key={skill.id}
                              value={skill.name}
                              onSelect={() => {
                                const current = form.getValues('skillIds') || []
                                if (!current.includes(skill.id)) {
                                  if (current.length >= 20) {
                                    toast.error('You can add up to 20 skills')
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
                                  'mr-2 size-4',
                                  skillIds.includes(skill.id) ? 'opacity-100' : 'opacity-0'
                                )}
                                aria-hidden
                              />
                              {skill.name}
                            </CommandItem>
                          ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
              <p className={descClass}>Up to 20. They help people find you.</p>
            </div>

            <div className="pt-2">
              <Button type="submit" className="w-full sm:w-auto sm:min-w-32" disabled={busy}>
                {busy ? (
                  <span className="flex items-center gap-2">
                    <Loader className="size-4 animate-spin" aria-hidden /> Saving…
                  </span>
                ) : (
                  'Save profile'
                )}
              </Button>
            </div>
          </form>
        </Form>
      )}
    </div>
  )
}

// ── Skeleton ──────────────────────────────────────────────────────────────
const ProfileFormSkeleton = () => (
  <div className="space-y-6" aria-busy="true" aria-label="Loading your profile">
    <div className="flex items-center gap-4">
      <Skeleton className="size-20 rounded-full" />
      <Skeleton className="h-8 w-28 rounded-lg" />
    </div>
    {[...Array(6)].map((_, i) => (
      <div key={i} className="space-y-2">
        <Skeleton className="h-4 w-20" />
        <Skeleton
          className={cn('h-10 w-full rounded-xl', i === 1 && 'h-20')}
        />
      </div>
    ))}
  </div>
)
