'use client'

import { getExperienceById, upsertExperience } from '@/actions/experience-actions'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import { Textarea } from '@/components/ui/textarea'
import { queryClient } from '@/lib/providers'
import { cn } from '@/lib/utils'
import { zodResolver } from '@hookform/resolvers/zod'
import { useQuery } from '@tanstack/react-query'
import { Loader } from 'lucide-react'
import { FC, useCallback, useEffect } from 'react'
import { Controller, useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import { z } from 'zod'
import { FormCard } from '../components/FormCard'

const ExperienceSchema = z.object({
  title: z.string().min(1, 'Job title is required').max(100),
  company: z.string().min(1, 'Company name is required'),
  location: z.string().optional(),
  employmentType: z.string().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  currentlyWorking: z.boolean(),
  description: z.string().optional(),
  website: z.string().optional(),
  companyLogo: z.string().optional(),
})

type ExperienceFormData = z.infer<typeof ExperienceSchema>

const employmentTypes = [
  'Full-time',
  'Part-time',
  'Internship',
  'Freelance',
  'Contract',
]

interface ExperienceFormProps {
  id: string | null
}

export const ExperienceForm: FC<ExperienceFormProps> = ({ id }) => {
  const mode = id ? 'edit' : 'create'

  // Fetch existing experience data
  const { data: initialData, isLoading: isFetchingValues } = useQuery({
    queryKey: ['get-experience-by-id', id],
    enabled: !!id,
    queryFn: () => getExperienceById(id as string),
  })

  const form = useForm<ExperienceFormData>({
    resolver: zodResolver(ExperienceSchema),
  })

  // Reset form when data changes
  useEffect(() => {
    if (mode === 'edit' && initialData) {
      form.reset({
        company: initialData.company,
        title: initialData.title,
        location: initialData.location || '',
        employmentType: initialData.employmentType || '',
        startDate: initialData.startDate
          ? new Date(initialData.startDate).toISOString().split('T')[0]
          : '',
        endDate: initialData.endDate
          ? new Date(initialData.endDate).toISOString().split('T')[0]
          : '',
        description: initialData.description || '',
        currentlyWorking: initialData.currentlyWorking || false,
        website: initialData.website || '',
        companyLogo: initialData.companyLogo || '',
      })
    } else if (mode === 'create') {
      form.reset({
        company: '',
        title: '',
        location: '',
        employmentType: '',
        startDate: new Date().toISOString().split('T')[0],
        endDate: new Date().toISOString().split('T')[0],
        description: '',
        currentlyWorking: false,
        website: '',
        companyLogo: '',
      })
    }
  }, [initialData, mode, form])

  const resetForm = useCallback(() => {
    form.reset({
      company: '',
      title: '',
      location: '',
      employmentType: '',
      startDate: new Date().toISOString().split('T')[0],
      endDate: new Date().toISOString().split('T')[0],
      description: '',
      currentlyWorking: false,
      website: '',
      companyLogo: '',
    })
  }, [form])

  const onSubmit = useCallback(async (data: ExperienceFormData) => {
    try {
      await upsertExperience({
        ...data,
        endDate: data.endDate ? new Date(data.endDate) : undefined,
        startDate: data.startDate ? new Date(data.startDate) : undefined,
        ...(mode === 'edit' && { id: id as string }),
      })

      toast.success(mode === 'create' ? 'Experience added successfully' : 'Experience updated successfully')
      await queryClient.invalidateQueries({ queryKey: ['get-all-experience'] })
      resetForm()
    } catch (error) {
      console.error('Experience form error:', error)
      toast.error('Something went wrong')
    }
  }, [mode, id, resetForm])

  const title = mode === 'edit' ? 'Edit Work Experience' : 'Share Work Experience'
  const description = 'Share your work experience with the world. Showcase your professional journey and achievements.'

  return (
    <FormCard title={title} description={description}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col">
        {isFetchingValues ? (
          <ExperienceFormSkeleton />
        ) : (
          <>
            {/* Job Title */}
            <div className="space-y-2">
              <Label htmlFor="title">Job Title *</Label>
              <Input
                id="title"
                placeholder="Software Engineer"
                {...form.register('title')}
              />
              {form.formState.errors.title && (
                <span className="text-red-500 text-xs">{form.formState.errors.title.message}</span>
              )}
            </div>

            {/* Company */}
            <div className="mt-4 space-y-2">
              <Label htmlFor="company">Company *</Label>
              <Input
                id="company"
                placeholder="Google"
                {...form.register('company')}
              />
              {form.formState.errors.company && (
                <span className="text-red-500 text-xs">{form.formState.errors.company.message}</span>
              )}
            </div>

            {/* Location and Employment Type */}
            <div className="grid grid-cols-2 gap-4 mt-4">
              <div>
                <Label htmlFor="location">Location</Label>
                <Input
                  id="location"
                  placeholder="San Francisco, CA"
                  {...form.register('location')}
                />
              </div>
              <div>
                <Label htmlFor="employmentType">Employment Type</Label>
                <Controller
                  control={form.control}
                  name="employmentType"
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

            {/* Start and End Dates */}
            <div className="grid grid-cols-2 gap-4 mt-4">
              <div>
                <Label htmlFor="startDate">Start Date</Label>
                <Input
                  id="startDate"
                  type="date"
                  {...form.register('startDate')}
                />
              </div>
              <div>
                <Label htmlFor="endDate">End Date</Label>
                <Input
                  id="endDate"
                  type="date"
                  {...form.register('endDate')}
                  disabled={form.watch('currentlyWorking')}
                />
              </div>
            </div>

            {/* Currently Working */}
            <div className="flex items-center space-x-2 mt-4">
              <Controller
                name="currentlyWorking"
                control={form.control}
                render={({ field }) => (
                  <Checkbox
                    className="size-6 rounded-lg"
                    checked={field.value}
                    onCheckedChange={field.onChange}
                    id="currentlyWorking"
                  />
                )}
              />
              <Label htmlFor="currentlyWorking">Currently working here</Label>
            </div>

            {/* Description */}
            <div className="mt-4">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                rows={3}
                placeholder="Describe your role, responsibilities, and achievements..."
                {...form.register('description')}
              />
            </div>

            {/* Website */}
            <div className="mt-4">
              <Label htmlFor="website">Website</Label>
              <Input
                id="website"
                placeholder="https://company.com"
                {...form.register('website')}
              />
            </div>

            {/* Error Display */}
            {Object.keys(form.formState.errors).length > 0 && (
              <div className="mt-4 text-red-500 text-sm">
                {Object.values(form.formState.errors).map((error, index) => (
                  <div key={index}>{error?.message}</div>
                ))}
              </div>
            )}
          </>
        )}

        <Button
          disabled={form.formState.isSubmitting || isFetchingValues}
          variant="secondary"
          className="mt-6 w-full"
          type="submit"
        >
          {form.formState.isSubmitting && (
            <Loader className="size-4 animate-spin opacity-80 mr-2" />
          )}
          {mode === 'edit' ? 'Update Experience' : 'Add Experience'}
        </Button>
      </form>
    </FormCard>
  )
}

// Skeleton loading component
const ExperienceFormSkeleton = () => (
  <>
    {[...Array(6)].map((_, i) => (
      <div key={i} className="mt-4 space-y-2">
        <Skeleton className={cn('h-[40px] w-full rounded-lg', i === 4 && 'h-[100px]')} />
      </div>
    ))}
  </>
)