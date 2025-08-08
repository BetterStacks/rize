'use client'
import { uploadMedia } from '@/actions/client-actions'
import { getEducationById, upsertEducation } from '@/actions/education-actions'
import {
  getExperienceById,
  upsertExperience,
} from '@/actions/experience-actions'
import { addGalleryItem } from '@/actions/gallery-actions'
import {
  createProject,
  getProjectByID,
  updateProject,
} from '@/actions/project-actions'
import { useActiveSidebarTab } from '@/lib/context'
import { queryClient } from '@/lib/providers'
import { bytesToMB, cn, isEqual, MAX_GALLERY_ITEMS } from '@/lib/utils'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQuery } from '@tanstack/react-query'
import axios from 'axios'
import { format } from 'date-fns'
import { motion } from 'framer-motion'
import { CalendarIcon, ChevronLeft, Loader, Upload, X } from 'lucide-react'
import { useSession } from 'next-auth/react'
import Image from 'next/image'
import { FC, useEffect, useMemo, useState, useTransition } from 'react'
import { useDropzone } from 'react-dropzone'
import { Controller, useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import { v4 } from 'uuid'
import { z } from 'zod'
import { useGalleryItems } from '../gallery/gallery-context'
import GalleryLimit from '../GalleryLimit'
import SectionManager from '../SectionManager'
import SocialLinksManager from '../SocialLinksManager'
import { Button } from '../ui/button'
import { Calendar } from '../ui/calendar'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '../ui/card'
import { Checkbox } from '../ui/checkbox'
import { Input } from '../ui/input'
import { Label } from '../ui/label'
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover'
import { ScrollArea } from '../ui/scroll-area'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select'
import { Skeleton } from '../ui/skeleton'
import { Textarea } from '../ui/textarea'
import { Switch } from '../ui/switch'

const RightSidebar = ({ className }: { className?: string }) => {
  const [active, setActive] = useActiveSidebarTab()

  const sections = {
    gallery: (
      <>
        {/* <VisibiltyControl /> */}
        <EditGallery />
        <SocialLinksManager />
        <SectionManager />
      </>
    ),
    projects: (
      <>
        <ProjectsTab id={active?.id as string} />
      </>
    ),
    education: (
      <>
        <EducationForm id={active?.id as string} />
      </>
    ),
    experience: (
      <>
        <ExperienceForm id={active?.id as string} />
      </>
    ),
  }

  return (
    <div
      className={cn(
        className,
        'h-screen w-full  flex flex-col items-center  justify-start'
      )}
    >
      <ScrollArea className="relative  h-full w-full overflow-y-auto  flex flex-col items-center justify-start">
        {active?.tab !== 'gallery' && (
          <Button
            onClick={() => {
              setActive({ id: null, tab: 'gallery' })
            }}
            size={'smallIcon'}
            variant={'outline'}
            className="absolute top-3 left-3 z-50"
          >
            <ChevronLeft className="size-4 opacity-80" />
          </Button>
        )}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 100 }}
          transition={{ duration: 0.9, ease: [0.075, 0.82, 0.165, 1] }}
          key={active.tab}
          className="mt-6 mb-20 flex flex-col items-center justify-start  relative"
        >
          {sections[active?.tab as keyof typeof sections]}
        </motion.div>
      </ScrollArea>
    </div>
  )
}

type MediaFile = {
  id: string;
  url: string;
  type: 'image' | 'video';
  file: File;
};

function EditGallery() {
  const [files, setFiles] = useState<MediaFile[]>([])
  const { items } = useGalleryItems()
  const [isDisabled, setIsDisabled] = useState(false)

  useEffect(() => {
    if (items.length === 0 || files.length === 0) return
    const count = items.length
    const limit = MAX_GALLERY_ITEMS
    // console.log("items", items, files);

    const total = count + files.length

    if (total >= limit) {
      setIsDisabled(true)

      setFiles((prev) => prev.slice(0, limit - count))
    } else {
      setIsDisabled(false)
    }
  }, [files, items])

  const onDrop = (acceptedFiles: File[]) => {
    const newFiles = acceptedFiles.map((file) => ({
      id: v4(),
      url: URL.createObjectURL(file),
      type: file.type.startsWith('image') ? 'image' : 'video',
      file: file,
    }))
    setFiles((prev) => [...prev, ...(newFiles as MediaFile[])])
  }

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    multiple: true,
    disabled: isDisabled,
    maxSize: 8 * 1024 * 1024, // 10MB,
    onDropRejected(fileRejections, event) {
      console.log(fileRejections, event)
      fileRejections.forEach(({ file, errors }) => {
        errors.forEach((error) => {
          if (error.code === 'file-too-large') {
            toast.error(
              `File is too large (${bytesToMB(
                file?.size
              )}MB). Maximum size is 8MB.`
            )
          } else if (error.code === 'file-invalid-type') {
            toast.error(
              'File  has an invalid type. Only images and videos are allowed.'
            )
          } else {
            toast.error(`Error uploading file ${file.name}: ${error.message}`)
          }
        })
      })
    },
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg'],
      'video/*': ['.mp4', '.webm', '.mov'],
    },
  })

  const removeFile = (id: string) => {
    setFiles((prev) => prev.filter((file) => file.id !== id))
  }
  const uploadMedia = async (formData: FormData) => {
    const res = await axios.post('/api/upload/files', formData)
    if (res.status !== 200) throw new Error('Upload failed')
    return res.data?.data
  }

  const { mutate: handleUpload, isPending } = useMutation({
    mutationFn: uploadMedia,
    onSuccess: async (data) => {
      setFiles([])
      await Promise.all(
        data.map(async (result: any) => {
          const item = await addGalleryItem(result)
          return item
        })
      )
      queryClient.invalidateQueries({ queryKey: ['get-gallery-items'] })
    },
    onError: (error) => {
      toast.error(error?.message)
    },
  })

  const handleAddItems = () => {
    const formData = new FormData()
    files.forEach((file) => formData.append('files', file?.file))
    formData.append('folder', 'fyp-stacks/gallery')

    handleUpload(formData)
  }

  const limit = useMemo(
    () => Math.floor((items.length / MAX_GALLERY_ITEMS) * 100),
    [items.length]
  )

  return (
    <div className="h-full overflow-hidden max-w-sm  w-full pt-6">
      {limit !== 100 && (
        <div className="px-2">
          <Card className="bg-white gallery-editor w-full mb-6 mt-4 shadow-lg dark:bg-dark-bg border border-neutral-300/60 dark:border-dark-border/80 rounded-3xl">
            <CardHeader className="pb-4">
              <CardTitle className="text-xl font-medium dark:text-white">
                Add To Gallery
              </CardTitle>
              <CardDescription className="text-left leading-snug">
                Share your media with the world. Add a media to your gallery to
                share memories and experiences.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <div className="p-4 flex flex-col">
                <div
                  {...getRootProps()}
                  className={cn(
                    'w-full max-w-lg p-6 border-2 flex flex-col items-center justify-center border-dashed rounded-2xl text-center cursor-pointer transition border-neutral-300 dark:border-dark-border',
                    limit >= 100 && 'opacity-50',
                    isDragActive && 'border-blue-500 bg-blue-50'
                  )}
                >
                  <input {...getInputProps()} />
                  <div
                    className={cn(
                      'w-full h-full flex flex-col items-center justify-center'
                    )}
                  >
                    <div className="mb-2">
                      <Upload
                        className="opacity-70 size-12"
                        strokeWidth={1.2}
                      />
                    </div>
                    <p className="text-neutral-600 dark:text-neutral-400 max-w-[200px] text-center text-sm">
                      Drag & Drop images or videos here, or click to select
                      files
                    </p>
                  </div>{' '}
                </div>
              </div>
              <div className="w-full h-full px-4 pt-2 mb-4">
                <Button
                  disabled={files.length === 0}
                  onClick={handleAddItems}
                  className="w-full"
                  variant="secondary"
                >
                  {isPending && (
                    <Loader className="opacity-80 animate-spin size-4 mr-2" />
                  )}{' '}
                  Add Media
                </Button>
                <div className="w-full flex flex-wrap gap-2 mt-4">
                  {files.map((file) => (
                    <div
                      key={file.id}
                      className="w-fit flex items-center justify-center gap-x-2 border border-neutral-300/60 dark:border-dark-border/80 rounded-xl relative group p-1 "
                    >
                      <div className="size-8 relative rounded-lg overflow-hidden">
                        {file.type === 'image' ? (
                          <Image
                            fill
                            src={file.url}
                            alt="Preview"
                            className="w-full aspect-square object-cover "
                          />
                        ) : (
                          <video
                            src={file.url}
                            className="w-full aspect-square object-cover"
                          />
                        )}
                      </div>
                      <div className="max-w-[80px] line-clamp-1">
                        <span className="opacity-80 text-sm">
                          {file?.file?.name}
                        </span>
                      </div>
                      <Button
                        onClick={() => removeFile(file?.id)}
                        variant={'outline'}
                        size={'smallIcon'}
                        className="size-6"
                        // className="absolute top-2 z-10 right-2"
                      >
                        <X className="size-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
      <div className="px-2 ">
        <GalleryLimit itemCount={items?.length} />
      </div>
    </div>
  )
}

const ProjectSchema = z.object({
  name: z.string().min(1, 'Project name is required'),
  url: z.string().url('Invalid URL'),
  description: z.string().optional(),
  logo: z.string(),
  startDate: z.date().optional(),
  endDate: z.date().optional(),
})

type ProjectTabProps = {
  id: string | null;
};

export const ProjectsTab: FC<ProjectTabProps> = ({ id }) => {
  const session = useSession()
  const { data: defaultValues, isLoading: isFetchingValues } = useQuery({
    queryKey: [
      'get-project-by-id',
      session?.data?.user?.username as string,
      id as string,
    ],
    enabled: !!id,
    queryFn: () =>
      getProjectByID(session?.data?.user?.username as string, id as string),
  })
  const [logoFile, setLogoFile] = useState<File | undefined>(undefined)
  // const [isFormPending, startTransition] = useTransition();
  const tab = useActiveSidebarTab()[0]
  const mode = id ? 'edit' : 'create'
  const form = useForm<z.infer<typeof ProjectSchema>>({
    resolver: zodResolver(ProjectSchema),
  })

  useEffect(() => {
    if (mode === 'edit' && defaultValues) {
      form.reset({
        name: defaultValues?.name,
        url: defaultValues?.url as string,
        description: defaultValues?.description,
        endDate: defaultValues?.endDate as Date,
        startDate: defaultValues?.startDate as Date,
        logo: defaultValues?.logo || undefined,
      })
    } else if (mode === 'create') {
      form.reset({
        name: '',
        url: '',
        description: '',
        endDate: new Date(),
        startDate: new Date(),
        logo: '',
      })
    }
  }, [defaultValues, mode, form])

  const logo = form.watch('logo')
  const startDate = form.watch('startDate')

  const onSubmit = (data: z.infer<typeof ProjectSchema>) => {
    // startTransition(() => {
    if (mode == 'edit' && tab?.id) {
      handleUpdateProject({
        ...data,
      })
    } else {
      if (!logoFile) {
        toast.error('Please upload a project logo')
        return
      }
      const formData = new FormData()
      formData.append('files', logoFile)
      formData.append('folder', 'fyp-stacks/projects')
      handleUpload(formData)
    }
    // });
  }

  const onDrop = (acceptedFiles: File[]) => {
    setLogoFile(acceptedFiles[0])
    form.setValue('logo', URL.createObjectURL(acceptedFiles[0]))
  }

  const { getRootProps, getInputProps } = useDropzone({
    onDrop,
    multiple: false,
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg', '.heic', '.webp', '.gif'],
    },
  })

  const { mutate: handleUpload, isPending } = useMutation({
    mutationFn: uploadMedia,
    onSuccess: async (data) => {
      const uploadedLogo = data[0]
      const payload = form.getValues()
      const newProject = {
        name: payload.name,
        url: payload.url,
        description: payload.description as string,
        startDate: (payload.startDate as Date)?.toISOString(),
        endDate: payload.endDate?.toISOString(),
        logo: uploadedLogo?.url as string,
        width: String(uploadedLogo?.width),
        height: String(uploadedLogo?.height),
      }

      await createProject(newProject)

      toast.success('Project created successfully')
      queryClient.invalidateQueries({ queryKey: ['get-projects'] })
    },
    onError: (error) => {
      toast.error(error?.message)
    },
  })

  const handleUpdateProject = async (values: {
    name: string;
    url: string;
    description?: string;
    startDate?: Date;
    endDate?: Date;
  }) => {
    try {
      const updatedFields: Record<string, any> = {}
      const newValues = { ...values }

      const isLogoUpdated = logo !== defaultValues?.logo && logoFile
      const uploadedLogo = isLogoUpdated ? await uploadNewLogo(logoFile) : null

      Object.entries(newValues).forEach(([key, value]) => {
        if (!isEqual(value, defaultValues?.[key as keyof typeof newValues])) {
          updatedFields[key] = value
        }
      })

      if (Object.keys(updatedFields).length === 0 && !uploadedLogo) {
        toast.error('No changes made')
        return
      }

      const res = await updateProject({
        id: tab?.id as string,
        ...updatedFields,
        ...(uploadedLogo && {
          logo: uploadedLogo?.url,
          width: uploadedLogo?.width,
          height: uploadedLogo?.height,
        }),
      })

      if (res.ok && !res.error) {
        toast.success('Project updated successfully')
        resetFormState()
        queryClient.invalidateQueries({ queryKey: ['get-projects'] })
        queryClient.invalidateQueries({ queryKey: ['get-projects-by-id'] })
      } else {
        toast.error(res.error || 'Failed to update project')
      }
    } catch (err) {
      console.error(err)
      toast.error('An unexpected error occurred')
    }
  }

  const uploadNewLogo = async (file: File) => {
    const formData = new FormData()
    formData.append('files', file)
    formData.append('folder', 'fyp-stacks/projects')
    const [data] = await uploadMedia(formData)
    return data
      ? { url: data.url, width: data.width, height: data.height }
      : null
  }

  const resetFormState = () => {
    form.reset({
      name: '',
      url: '',
      description: '',
      startDate: new Date(),
      endDate: new Date(),
      logo: '',
    })
    setLogoFile(undefined)
  }
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="px-4 mt-6"
    >
      <Card className="bg-white w-full mt-4 shadow-xl dark:bg-dark-bg border border-neutral-300/60 dark:border-dark-border/80 rounded-3xl">
        <CardHeader className="pb-4">
          <CardTitle className="text-xl font-medium dark:text-white">
            {mode === 'edit' ? 'Edit Project' : 'Add Project'}
          </CardTitle>
          <CardDescription className="text-left leading-snug">
            Share your projects with the world. Add a project to your profile to
            showcase your work and skills.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className=" flex flex-col "
          >
            {isFetchingValues ? (
              <>
                <Skeleton className="size-20 rounded-full" />
                {[...Array(5)].map((_, i) => {
                  return (
                    <div key={i} className="mt-4 space-y-2">
                      <Skeleton
                        className={cn(
                          'h-[40px] w-full rounded-lg ',
                          i === 2 && 'h-[120px]'
                        )}
                      />
                    </div>
                  )
                })}
              </>
            ) : (
              <>
                <div className="flex gap-3 items-start">
                  <div
                    {...getRootProps()}
                    className={cn(
                      !logo && ' border-dashed p-0',
                      'size-20 border-2 rounded-full flex items-center justify-center border-neutral-300/60 dark:border-dark-border relative p-2'
                    )}
                  >
                    {logo ? (
                      <>
                        <Image
                          unoptimized
                          src={logo}
                          alt=""
                          className="rounded-full"
                          fill
                        />
                        {mode === 'edit' && (
                          <Button
                            onClick={() => {
                              setLogoFile(undefined)
                              form.setValue('logo', '')
                            }}
                            // variant={"outline"}
                            size={'smallIcon'}
                            className="absolute rounded-full -bottom-1 -left-1"
                          >
                            <X
                              // strokeWidth={1.6}
                              className="size-4 opacity-80"
                            />
                          </Button>
                        )}
                      </>
                    ) : (
                      <>
                        <input
                          {...getInputProps()}
                          // className="hidden"
                        />
                        <Label>
                          <Upload
                            strokeWidth={1.6}
                            className="size-8 opacity-80"
                          />
                        </Label>
                      </>
                    )}
                  </div>
                </div>
                <div className="mt-3 space-y-2">
                  <Label htmlFor="name">Project Name</Label>
                  <Input
                    id="name"
                    placeholder="Pluto"
                    {...form.register('name')}
                  />
                </div>
                <div className="mt-3 space-y-2">
                  <Label htmlFor="url">Project URL</Label>
                  <Input
                    placeholder="https://dub.sh/pluto.wtf"
                    {...form.register('url')}
                  />
                </div>
                <div className="mt-3 space-y-2">
                  <Label htmlFor="url">Project Description</Label>
                  <Textarea {...form.register('description')} />
                </div>
                <Controller
                  control={form.control}
                  name="startDate"
                  render={({ field }) => (
                    <div className="mt-3 w-full flex flex-col space-y-2">
                      <Label>Start Date</Label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className={` justify-start text-left font-normal ${
                              !field.value && 'text-muted-foreground'
                            }`}
                          >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {field.value ? (
                              format(field.value, 'PPP')
                            ) : (
                              <span>Select a date</span>
                            )}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0">
                          <Calendar
                            mode="single"
                            selected={field.value}
                            onSelect={field.onChange}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                    </div>
                  )}
                />
                <Controller
                  control={form.control}
                  name="endDate"
                  rules={{
                    validate: (endDate) =>
                      (endDate as Date) >= (startDate as Date) ||
                      'End date cannot be before start date',
                  }}
                  render={({ field }) => (
                    <div className="mt-3 w-full flex flex-col space-y-2">
                      <Label>End Date</Label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className={` justify-start text-left font-normal ${
                              !field.value && 'text-muted-foreground'
                            }`}
                          >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {field.value ? (
                              format(field.value, 'PPP')
                            ) : (
                              <span>Select a date</span>
                            )}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0">
                          <Calendar
                            mode="single"
                            selected={field.value}
                            onSelect={field.onChange}
                            disabled={(date) =>
                              (date as Date) < (startDate as Date)
                            }
                          />
                        </PopoverContent>
                      </Popover>
                    </div>
                  )}
                />
                {form.formState?.errors && (
                  <span>
                    {form.formState?.errors?.startDate?.message ||
                      form.formState?.errors?.endDate?.message ||
                      form.formState?.errors?.name?.message ||
                      form.formState?.errors?.url?.message}
                  </span>
                )}
              </>
            )}
            <Button
              disabled={isPending}
              variant={'secondary'}
              className="mt-4 w-full"
              type="submit"
            >
              {isPending && (
                <Loader className="size-4 animate-spin opacity-80 mr-2" />
              )}
              {mode === 'edit' ? 'Edit Project' : 'Create Project'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </motion.div>
  )
}

const schema = z.object({
  school: z.string().min(1, 'School name is required'),
  degree: z.string().optional(),
  fieldOfStudy: z.string().optional(),
  startDate: z.date().optional(),
  endDate: z.date().optional(),
  grade: z.string().optional(),
  description: z.string().optional(),
})

type EducationFormData = z.infer<typeof schema>;

type EducationFormProps = {
  id: string | null;
};

export function EducationForm({ id }: EducationFormProps) {
  const { data: initialData } = useQuery({
    queryKey: ['get-education-by-id', id],
    enabled: !!id,
    queryFn: () => getEducationById(id as string),
  })
  const mode = id ? 'edit' : 'create'

  const form = useForm<EducationFormData>({
    resolver: zodResolver(schema),
  })

  useEffect(() => {
    if (mode === 'edit' && initialData) {
      form.reset({
        school: initialData?.school,
        degree: initialData?.degree,
        fieldOfStudy: initialData?.fieldOfStudy,
        startDate: initialData?.startDate,
        endDate: initialData?.endDate,
        grade: initialData?.grade,
        description: initialData?.description,
      } as any)
    } else if (mode === 'create') {
      form.reset({
        school: '',
        degree: '',
        fieldOfStudy: '',
        startDate: new Date(),
        endDate: new Date(),
        grade: '',
        description: '',
      } as any)
    }
  }, [initialData, mode, form])

  const {
    register,
    handleSubmit,
    formState: { isSubmitting },
  } = form

  const onSubmit = async (data: EducationFormData) => {
    try {
      // console.log(data);
      await upsertEducation({
        ...data,
        ...(mode === 'edit' && { id: id as string }),
      })
      await queryClient.invalidateQueries({
        queryKey: ['get-education'],
      })
      toast.success(
        mode === 'create' ? 'Added education' : 'Updated education'
      )
      form.reset()
    } catch {
      toast.error('Something went wrong')
    }
  }
  const startDate = form.watch('startDate')
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="px-4 mt-6"
    >
      <Card className="bg-white w-full mt-4 shadow-xl dark:bg-dark-bg border border-neutral-300/60 dark:border-dark-border/80 rounded-3xl">
        <CardHeader className="pb-4">
          <CardTitle className="text-xl font-medium dark:text-white">
            {mode === 'edit' ? 'Edit Education' : 'Add Education'}
          </CardTitle>
          <CardDescription className="text-left leading-snug">
            Share your education with the world. Add an education to your
            profile to showcase your work and skills.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 mb-6">
          <form onSubmit={handleSubmit(onSubmit)}>
            <div>
              <Label htmlFor="school">School *</Label>
              <Input id="school" {...register('school')} />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="degree">Degree</Label>
                <Input id="degree" {...register('degree')} />
              </div>
              <div>
                <Label htmlFor="fieldOfStudy">Field of Study</Label>
                <Input id="fieldOfStudy" {...register('fieldOfStudy')} />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Controller
                  control={form?.control}
                  name="startDate"
                  render={({ field }) => (
                    <div className="mt-3 w-full flex flex-col space-y-2">
                      <Label>Start Date</Label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className={` justify-start text-left font-normal ${
                              !field.value && 'text-muted-foreground'
                            }`}
                          >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {field.value ? (
                              format(field.value, 'PPP')
                            ) : (
                              <span>Select a date</span>
                            )}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0">
                          <Calendar
                            mode="single"
                            selected={field.value}
                            onSelect={field.onChange}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                    </div>
                  )}
                />
              </div>
              <div>
                <Controller
                  control={form.control}
                  name="endDate"
                  rules={{
                    validate: (endDate) =>
                      (endDate as Date) >= (startDate as Date) ||
                      'End date cannot be before start date',
                  }}
                  render={({ field }) => (
                    <div className="mt-3 w-full flex flex-col space-y-2">
                      <Label>End Date</Label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className={` justify-start text-left font-normal ${
                              !field.value && 'text-muted-foreground'
                            }`}
                          >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {field.value ? (
                              format(field.value, 'PPP')
                            ) : (
                              <span>Select a date</span>
                            )}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0">
                          <Calendar
                            mode="single"
                            selected={field.value}
                            onSelect={field.onChange}
                            disabled={(date) =>
                              (date as Date) < (startDate as Date)
                            }
                          />
                        </PopoverContent>
                      </Popover>
                    </div>
                  )}
                />
              </div>
            </div>

            {/* <div className="grid grid-cols-2 gap-4"> */}
            <div>
              <Label htmlFor="grade">Grade</Label>
              <Input id="grade" {...register('grade')} />
            </div>
            {/* <div>
                <Label htmlFor="activities">Activities</Label>
                <Input id="activities" {...register("activities")} />
              </div> */}
            {/* </div> */}

            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                rows={3}
                {...register('description')}
              />
            </div>
            {form.formState?.errors && (
              <span className="text-red-500 text-sm">
                {form.formState?.errors?.startDate?.message ||
                  form.formState?.errors?.endDate?.message ||
                  form.formState?.errors?.school?.message ||
                  form.formState?.errors?.degree?.message ||
                  form.formState?.errors?.fieldOfStudy?.message ||
                  form.formState?.errors?.grade?.message ||
                  form.formState?.errors?.description?.message}
              </span>
            )}

            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full mt-4"
            >
              {isSubmitting && (
                <Loader className="size-4 animate-spin opacity-80 mr-2" />
              )}{' '}
              {mode === 'edit' ? 'Update Education' : 'Add Education'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </motion.div>
  )
}

const experienceSchema = z.object({
  title: z.string().min(1).max(100),
  company: z.string().min(1),
  location: z.string().optional(),
  employmentType: z.string().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  currentlyWorking: z.boolean(),
  description: z.string().optional(),
  website: z.string().optional(),
  companyLogo: z.string().optional(),
})

type ExperienceFormData = z.infer<typeof experienceSchema>;

const employmentTypes = [
  'Full-time',
  'Part-time',
  'Internship',
  'Freelance',
  'Contract',
]
export function ExperienceForm({ id }: { id: string | null }) {
  const { data: initialData } = useQuery({
    queryKey: ['get-experience-by-id', id as string],
    enabled: !!id,
    queryFn: () => getExperienceById(id as string),
  })

  const mode = id ? 'edit' : 'create'
  const form = useForm<ExperienceFormData>({
    resolver: zodResolver(experienceSchema),
  })
  // console.log({ initialData });
  useEffect(() => {
    if (mode === 'edit' && initialData) {
      form.reset({
        company: initialData?.company,
        title: initialData?.title,
        location: initialData?.location as string,
        employmentType: initialData?.employmentType as any,
        startDate: (initialData?.startDate as Date)
          ?.toISOString()
          .split('T')[0],
        endDate: (initialData?.endDate as Date)?.toISOString().split('T')[0],
        description: initialData?.description as string,
        currentlyWorking: initialData?.currentlyWorking,
      })
    } else if (mode === 'create') {
      form.reset({
        company: '',
        title: '',
        location: '',
        employmentType: '',
        startDate: new Date()?.toISOString().split('T')[0],
        endDate: new Date()?.toISOString().split('T')[0],
        description: '',
        currentlyWorking: false,
      })
    }
  }, [initialData, mode, form])

  const {
    register,
    handleSubmit,
    formState: { isSubmitting },
  } = form

  const onSubmit = async (data: ExperienceFormData) => {
    try {
      // console.log({ data });
      await upsertExperience({
        ...data,
        endDate: new Date(data.endDate as string),
        startDate: new Date(data.startDate as string),
        ...(mode === 'edit' && { id: id as string }),
      })
      toast.success(
        mode === 'create' ? 'Experience added' : 'Experience updated'
      )
      form.reset()
      await queryClient.invalidateQueries({
        queryKey: ['get-all-experience'],
      })
    } catch {
      toast.error('Something went wrong')
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="px-4 mt-6"
    >
      <Card className="bg-white w-full mt-4 shadow-xl dark:bg-dark-bg border border-neutral-300/60 dark:border-dark-border/80 rounded-3xl">
        <CardHeader className="pb-4">
          <CardTitle className="text-xl font-medium dark:text-white">
            {mode === 'create'
              ? 'Share Work Experience'
              : 'Edit Work Experience'}
          </CardTitle>
          <CardDescription className="text-left leading-snug">
            Share your work experience with the world. Add an experience to your
            profile to showcase your work and skills.
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit(onSubmit)}>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="title">Job Title *</Label>
              <Input id="title" {...register('title')} />
            </div>

            <div>
              <Label htmlFor="company">Company *</Label>
              <Input id="company" {...register('company')} />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="location">Location</Label>
                <Input id="location" {...register('location')} />
              </div>
              <div>
                <Label htmlFor="employmentType">Employment Type</Label>
                <Controller
                  control={form?.control}
                  name={'employmentType'}
                  render={({ field }) => (
                    <Select onValueChange={field.onChange} value={field.value}>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select employment type" />
                      </SelectTrigger>
                      <SelectContent>
                        {employmentTypes.map((type) => (
                          <SelectItem key={type} value={type}>
                            {type}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="startDate">Start Date</Label>
                <Input id="startDate" type="date" {...register('startDate')} />
              </div>
              <div>
                <Label htmlFor="endDate">End Date</Label>
                <Input
                  id="endDate"
                  type="date"
                  {...register('endDate')}
                  // disabled={currentlyWorking}
                />
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Controller
                name="currentlyWorking"
                control={form?.control}
                render={({ field }) => (
                  <Checkbox
                    className=" size-6  rounded-lg"
                    checked={field.value}
                    onCheckedChange={field.onChange}
                    id="currentlyWorking"
                  />
                )}
              />
              <Label htmlFor="currentlyWorking">Currently working here</Label>
            </div>

            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                rows={3}
                {...register('description')}
              />
            </div>
            {form?.formState?.errors && (
              <span className="text-red-500 text-sm">
                {form.formState?.errors?.startDate?.message ||
                  form.formState?.errors?.endDate?.message ||
                  form.formState?.errors?.title?.message ||
                  form.formState?.errors?.company?.message ||
                  form.formState?.errors?.location?.message ||
                  form.formState?.errors?.employmentType?.message ||
                  form.formState?.errors?.description?.message}
              </span>
            )}
            <Button type="submit" disabled={isSubmitting} className="w-full">
              {/* {isSubmitting
                ? "Saving..."
                : initialData.id
                ? "Update Experience"
                // }
                :  */}
              {mode === 'create' ? 'Add Experience' : 'Update Experience'}
            </Button>
          </CardContent>
        </form>
      </Card>
    </motion.div>
  )
}

export const VisibiltyControl = () => {
  const [isLive, setIsLive] = useState(false)
  return (
    <div className="w-full max-w-sm px-2 flex flex-col items-center justify-center ">
      <Card className="bg-white social-links-manager w-full mt-4 shadow-xl dark:bg-dark-bg border border-neutral-300/60 dark:border-dark-border/80 rounded-3xl">
        <CardHeader className="pb-4">
          <CardTitle className="text-xl font-medium dark:text-white">
            Profile Visibility
          </CardTitle>
          <CardDescription className="text-left leading-snug">
            Toggle whether your profile is visible to others.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 px-3">
          <div>
            <Switch checked={isLive} onCheckedChange={setIsLive} />
          </div>
          <p
            className={`text-sm ${isLive ? 'text-green-600' : 'text-red-500'}`}
          >
            {isLive
              ? 'Your profile is live and visible to others.'
              : 'Your profile is not live and hidden from explore.'}
          </p>
        </CardContent>
      </Card>
    </div>
  )
}

export default RightSidebar
