'use client'

import { uploadMedia } from '@/actions/client-actions'
import { createProject, getProjectByID, updateProject } from '@/actions/project-actions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Skeleton } from '@/components/ui/skeleton'
import { Textarea } from '@/components/ui/textarea'
import { useActiveSidebarTab } from '@/lib/context'
import { queryClient } from '@/lib/providers'
import { cn, isEqual } from '@/lib/utils'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQuery } from '@tanstack/react-query'
import { Loader, Upload, X } from 'lucide-react'
import { useSession } from '@/lib/auth-client'
import Image from 'next/image'
import { FC, useCallback, useEffect, useMemo, useState } from 'react'
import { useDropzone } from 'react-dropzone'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import { z } from 'zod'
import { DateRangePicker } from '../components/DateRangePicker'
import { FormCard } from '../components/FormCard'

const ProjectSchema = z.object({
  name: z.string().min(1, 'Project name is required'),
  url: z.string().url('Invalid URL'),
  description: z.string().optional(),
  logo: z.string(),
  startDate: z.date().optional(),
  endDate: z.date().optional(),
})

type ProjectFormData = z.infer<typeof ProjectSchema>

interface ProjectFormProps {
  id: string | null
}

export const ProjectForm: FC<ProjectFormProps> = ({ id }) => {
  const session = useSession()
  const tab = useActiveSidebarTab()[0]
  const mode = id ? 'edit' : 'create'
  
  const [logoFile, setLogoFile] = useState<File | undefined>()

  // Fetch existing project data
  const { data: defaultValues, isLoading: isFetchingValues } = useQuery({
    queryKey: ['get-project-by-id', (session?.data?.user as any)?.username, id],
    enabled: !!id,
    queryFn: () => getProjectByID((session?.data?.user as any)?.username as string, id as string),
  })

  const form = useForm<ProjectFormData>({
    resolver: zodResolver(ProjectSchema),
  })

  const logo = form.watch('logo')
  const startDate = form.watch('startDate')

  // Reset form when data changes
  useEffect(() => {
    if (mode === 'edit' && defaultValues) {
      form.reset({
        name: defaultValues.name,
        url: defaultValues.url as string,
        description: defaultValues.description || '',
        endDate: defaultValues.endDate ? new Date(defaultValues.endDate) : undefined,
        startDate: defaultValues.startDate ? new Date(defaultValues.startDate) : undefined,
        logo: defaultValues.logo || '',
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

  // File upload handlers
  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0]
    setLogoFile(file)
    form.setValue('logo', URL.createObjectURL(file))
  }, [form])

  const { getRootProps, getInputProps } = useDropzone({
    onDrop,
    multiple: false,
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg', '.heic', '.webp', '.gif'],
    },
  })

  // Upload mutation
  const { mutate: handleUpload, isPending } = useMutation({
    mutationFn: uploadMedia,
    onSuccess: async (data) => {
      const uploadedLogo = data[0]
      const payload = form.getValues()
      
      const newProject = {
        name: payload.name,
        url: payload.url,
        description: payload.description || '',
        startDate: payload.startDate?.toISOString() || '',
        endDate: payload.endDate?.toISOString() || '',
        logo: uploadedLogo?.url as string,
        width: String(uploadedLogo?.width),
        height: String(uploadedLogo?.height),
      }

      await createProject(newProject)
      toast.success('Project created successfully')
      queryClient.invalidateQueries({ queryKey: ['get-projects'] })
      resetForm()
    },
    onError: (error) => {
      toast.error(error?.message || 'Upload failed')
    },
  })

  // Update project handler
  const handleUpdateProject = useCallback(async (values: ProjectFormData) => {
    try {
      const updatedFields: Record<string, any> = {}
      const isLogoUpdated = logo !== defaultValues?.logo && logoFile

      // Compare fields to detect changes
      Object.entries(values).forEach(([key, value]) => {
        if (!isEqual(value, (defaultValues as any)?.[key])) {
          updatedFields[key] = value
        }
      })

      if (Object.keys(updatedFields).length === 0 && !isLogoUpdated) {
        toast.error('No changes made')
        return
      }

      let uploadedLogo = null
      if (isLogoUpdated && logoFile) {
        const formData = new FormData()
        formData.append('files', logoFile)
        formData.append('folder', 'fyp-stacks/projects')
        const [data] = await uploadMedia(formData)
        uploadedLogo = data ? { url: data.url, width: data.width, height: data.height } : null
      }

      const res = await updateProject({
        id: tab?.id as string,
        ...updatedFields,
        ...(uploadedLogo && {
          logo: uploadedLogo.url,
          width: uploadedLogo.width,
          height: uploadedLogo.height,
        }),
      })

      if (res.ok && !res.error) {
        toast.success('Project updated successfully')
        resetForm()
        queryClient.invalidateQueries({ queryKey: ['get-projects'] })
        queryClient.invalidateQueries({ queryKey: ['get-projects-by-id'] })
      } else {
        toast.error(res.error || 'Failed to update project')
      }
    } catch (err) {
      console.error(err)
      toast.error('An unexpected error occurred')
    }
  }, [logo, defaultValues, logoFile, tab?.id])

  const resetForm = useCallback(() => {
    form.reset({
      name: '',
      url: '',
      description: '',
      startDate: new Date(),
      endDate: new Date(),
      logo: '',
    })
    setLogoFile(undefined)
  }, [form])

  const onSubmit = useCallback((data: ProjectFormData) => {
    if (mode === 'edit' && tab?.id) {
      handleUpdateProject(data)
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
  }, [mode, tab?.id, logoFile, handleUpdateProject, handleUpload])

  const title = mode === 'edit' ? 'Edit Project' : 'Add Project'
  const description = 'Share your projects with the world. Showcase your work and skills.'

  return (
    <FormCard title={title} description={description}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col">
        {isFetchingValues ? (
          <ProjectFormSkeleton />
        ) : (
          <>
            {/* Logo Upload */}
            <div className="flex gap-3 items-start mb-4">
              <div
                {...getRootProps()}
                className={cn(
                  !logo && 'border-dashed p-0',
                  'size-20 border-2 rounded-full flex items-center justify-center border-neutral-300/60 dark:border-dark-border relative p-2 cursor-pointer'
                )}
              >
                {logo ? (
                  <>
                    <Image
                      unoptimized
                      src={logo}
                      alt="Project logo"
                      className="rounded-full object-cover"
                      fill
                    />
                    {mode === 'edit' && (
                      <Button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation()
                          setLogoFile(undefined)
                          form.setValue('logo', '')
                        }}
                        size="smallIcon"
                        className="absolute rounded-full -bottom-1 -left-1"
                      >
                        <X className="size-4 opacity-80" />
                      </Button>
                    )}
                  </>
                ) : (
                  <>
                    <input {...getInputProps()} />
                    <Label className="cursor-pointer">
                      <Upload strokeWidth={1.6} className="size-8 opacity-80" />
                    </Label>
                  </>
                )}
              </div>
            </div>

            {/* Form Fields */}
            <div className="space-y-4">
              <div>
                <Label htmlFor="name">Project Name *</Label>
                <Input
                  id="name"
                  placeholder="Awesome Project"
                  {...form.register('name')}
                />
                {form.formState.errors.name && (
                  <span className="text-red-500 text-xs">{form.formState.errors.name.message}</span>
                )}
              </div>

              <div>
                <Label htmlFor="url">Project URL *</Label>
                <Input
                  id="url"
                  placeholder="https://example.com"
                  {...form.register('url')}
                />
                {form.formState.errors.url && (
                  <span className="text-red-500 text-xs">{form.formState.errors.url.message}</span>
                )}
              </div>

              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  placeholder="Describe your project..."
                  {...form.register('description')}
                />
              </div>

              <DateRangePicker
                control={form.control}
                startName="startDate"
                endName="endDate"
                className="mt-4"
              />
            </div>
          </>
        )}

        <Button
          disabled={isPending || isFetchingValues}
          variant="secondary"
          className="mt-6 w-full"
          type="submit"
        >
          {isPending && <Loader className="size-4 animate-spin opacity-80 mr-2" />}
          {mode === 'edit' ? 'Update Project' : 'Create Project'}
        </Button>
      </form>
    </FormCard>
  )
}

// Skeleton loading component
const ProjectFormSkeleton = () => (
  <>
    <Skeleton className="size-20 rounded-full mb-4" />
    {[...Array(4)].map((_, i) => (
      <div key={i} className="mt-4 space-y-2">
        <Skeleton className={cn('h-[40px] w-full rounded-lg', i === 2 && 'h-[100px]')} />
      </div>
    ))}
  </>
)