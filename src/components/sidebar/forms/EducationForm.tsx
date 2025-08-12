'use client'

import { getEducationById, upsertEducation } from '@/actions/education-actions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Skeleton } from '@/components/ui/skeleton'
import { Textarea } from '@/components/ui/textarea'
import { queryClient } from '@/lib/providers'
import { cn } from '@/lib/utils'
import { zodResolver } from '@hookform/resolvers/zod'
import { useQuery } from '@tanstack/react-query'
import { Loader } from 'lucide-react'
import { FC, useCallback, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import { z } from 'zod'
import { DateRangePicker } from '../components/DateRangePicker'
import { FormCard } from '../components/FormCard'

const EducationSchema = z.object({
  school: z.string().min(1, 'School name is required'),
  degree: z.string().optional(),
  fieldOfStudy: z.string().optional(),
  startDate: z.date().optional(),
  endDate: z.date().optional(),
  grade: z.string().optional(),
  description: z.string().optional(),
})

type EducationFormData = z.infer<typeof EducationSchema>

interface EducationFormProps {
  id: string | null
}

export const EducationForm: FC<EducationFormProps> = ({ id }) => {
  const mode = id ? 'edit' : 'create'

  // Fetch existing education data
  const { data: initialData, isLoading: isFetchingValues } = useQuery({
    queryKey: ['get-education-by-id', id],
    enabled: !!id,
    queryFn: () => getEducationById(id as string),
  })

  const form = useForm<EducationFormData>({
    resolver: zodResolver(EducationSchema),
  })

  // Reset form when data changes
  useEffect(() => {
    if (mode === 'edit' && initialData) {
      form.reset({
        school: initialData.school,
        degree: initialData.degree || '',
        fieldOfStudy: initialData.fieldOfStudy || '',
        startDate: initialData.startDate ? new Date(initialData.startDate) : undefined,
        endDate: initialData.endDate ? new Date(initialData.endDate) : undefined,
        grade: initialData.grade || '',
        description: initialData.description || '',
      })
    } else if (mode === 'create') {
      form.reset({
        school: '',
        degree: '',
        fieldOfStudy: '',
        startDate: new Date(),
        endDate: new Date(),
        grade: '',
        description: '',
      })
    }
  }, [initialData, mode, form])

  const resetForm = useCallback(() => {
    form.reset({
      school: '',
      degree: '',
      fieldOfStudy: '',
      startDate: new Date(),
      endDate: new Date(),
      grade: '',
      description: '',
    })
  }, [form])

  const onSubmit = useCallback(async (data: EducationFormData) => {
    try {
      await upsertEducation({
        ...data,
        ...(mode === 'edit' && { id: id as string }),
      })

      toast.success(mode === 'create' ? 'Education added successfully' : 'Education updated successfully')
      await queryClient.invalidateQueries({ queryKey: ['get-education'] })
      resetForm()
    } catch (error) {
      console.error('Education form error:', error)
      toast.error('Something went wrong')
    }
  }, [mode, id, resetForm])

  const title = mode === 'edit' ? 'Edit Education' : 'Add Education'
  const description = 'Share your education with the world. Showcase your academic achievements and qualifications.'

  return (
    <FormCard title={title} description={description}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col">
        {isFetchingValues ? (
          <EducationFormSkeleton />
        ) : (
          <>
            {/* School Name */}
            <div className="space-y-2">
              <Label htmlFor="school">School *</Label>
              <Input
                id="school"
                placeholder="Harvard University"
                {...form.register('school')}
              />
              {form.formState.errors.school && (
                <span className="text-red-500 text-xs">{form.formState.errors.school.message}</span>
              )}
            </div>

            {/* Degree and Field of Study */}
            <div className="grid grid-cols-2 gap-4 mt-4">
              <div>
                <Label htmlFor="degree">Degree</Label>
                <Input
                  id="degree"
                  placeholder="Bachelor of Science"
                  {...form.register('degree')}
                />
              </div>
              <div>
                <Label htmlFor="fieldOfStudy">Field of Study</Label>
                <Input
                  id="fieldOfStudy"
                  placeholder="Computer Science"
                  {...form.register('fieldOfStudy')}
                />
              </div>
            </div>

            {/* Date Range */}
            <DateRangePicker
              control={form.control}
              startName="startDate"
              endName="endDate"
              className="mt-4"
            />

            {/* Grade */}
            <div className="mt-4">
              <Label htmlFor="grade">Grade</Label>
              <Input
                id="grade"
                placeholder="3.8 GPA"
                {...form.register('grade')}
              />
            </div>

            {/* Description */}
            <div className="mt-4">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                rows={3}
                placeholder="Describe your education experience, achievements, or relevant coursework..."
                {...form.register('description')}
              />
            </div>
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
          {mode === 'edit' ? 'Update Education' : 'Add Education'}
        </Button>
      </form>
    </FormCard>
  )
}

// Skeleton loading component
const EducationFormSkeleton = () => (
  <>
    {[...Array(5)].map((_, i) => (
      <div key={i} className="mt-4 space-y-2">
        <Skeleton className={cn('h-[40px] w-full rounded-lg', i === 2 && 'h-[100px]')} />
      </div>
    ))}
  </>
)