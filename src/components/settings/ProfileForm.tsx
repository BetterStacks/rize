'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import * as z from 'zod'
import { Button } from '@/components/ui/button'
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
import { profileSchema } from '@/lib/types'
import { Separator } from '../ui/separator'
import { useEffect } from 'react'
import toast from 'react-hot-toast'

// Use a subset of the main profileSchema for the settings form
const settingsProfileSchema = z.object({
  website: z.string().url().optional().or(z.literal('')),
  bio: z.string().max(200).optional(),
  displayName: z.string().min(2).max(30).optional(),
})

export function ProfileForm() {
  const { data: session } = useSession()
  const queryClient = useQueryClient()
  
  const { data, isLoading } = useQuery({
    queryKey: ['get-profile-by-username', (session?.user as any)?.username],
    queryFn: () => getProfileByUsername((session?.user as any)?.username as string),
          enabled: !!(session?.user as any)?.username,
  })

  const form = useForm<z.infer<typeof settingsProfileSchema>>({
    resolver: zodResolver(settingsProfileSchema),
    defaultValues: {
      website: '',
      bio: '',
      displayName: '',
    },
  })

  // Reset form when data loads
  useEffect(() => {
    if (data && !isLoading) {
      form.reset({
        website: data.website || '',
        bio: data.bio || '',
        displayName: data.displayName || '',
      })
    }
  }, [data, isLoading, form])

  const updateMutation = useMutation({
    mutationFn: updateProfile,
    onSuccess: async () => {
      toast.success('Profile updated successfully!')
      queryClient.invalidateQueries({ queryKey: ['get-profile-by-username'] })
      // Session will update automatically with better-auth
    },
    onError: (error: any) => {
      toast.error('Failed to update profile: ' + (error?.message || 'Unknown error'))
    },
  })

  async function onSubmit(values: z.infer<typeof settingsProfileSchema>) {
    updateMutation.mutate(values)
  }

  return (
    <div className="space-y-4 w-full max-w-2xl">
      <div>
        <h2 className="text-2xl font-medium">Profile Details</h2>
        <p className="text-sm opacity-80 mt-1">
          Update your profile information that will be displayed to other users.
        </p>
        <Separator className="my-4" />
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
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
                    {...field}
                  />
                </FormControl>
                <FormDescription>Maximum 200 characters.</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="displayName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Display Name</FormLabel>
                <FormControl>
                  <Input placeholder="Your display name" {...field} />
                </FormControl>
                <FormDescription>This name will be shown on your profile.</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button type="submit" disabled={updateMutation.isPending || isLoading}>
            {updateMutation.isPending ? 'Saving...' : 'Save Changes'}
          </Button>
        </form>
      </Form>
    </div>
  )
}
