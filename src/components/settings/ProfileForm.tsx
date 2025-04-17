"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useSession } from "next-auth/react";
import { useQuery } from "@tanstack/react-query";
import { getProfileByUsername } from "@/actions/profile-actions";
import { Separator } from "../ui/separator";

const profileSchema = z.object({
  website: z.string().url().optional().or(z.literal("")),
  bio: z.string().max(160).optional(),
  location: z.string().max(30).optional(),
  pronouns: z.enum(["he/him", "she/her", "they/them", "other"]).optional(),
  age: z.number().min(13).max(120).optional(),
});

export function ProfileForm() {
  const { data: session, update } = useSession();
  const { data } = useQuery({
    queryKey: ["get-profile-by-username", session?.user?.username],
    queryFn: () => getProfileByUsername(session?.user?.username as string),
  });

  const form = useForm<z.infer<typeof profileSchema>>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      website: data?.website || "",
      bio: data?.bio || "",
      location: data?.location || "",
      pronouns: data?.pronouns || undefined,
      age: data?.age || undefined,
    },
  });

  async function onSubmit(values: z.infer<typeof profileSchema>) {
    try {
      await update({ ...session, user: { ...session?.user, ...values } });
    } catch (error) {
      console.error("Failed to update profile:", error);
    }
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
                <FormDescription>Maximum 160 characters.</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="location"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Location</FormLabel>
                  <FormControl>
                    <Input placeholder="Your location" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="pronouns"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Pronouns</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select pronouns" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="he/him">he/him</SelectItem>
                      <SelectItem value="she/her">she/her</SelectItem>
                      <SelectItem value="they/them">they/them</SelectItem>
                      <SelectItem value="other">other</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <Button type="submit">Save Changes</Button>
        </form>
      </Form>
    </div>
  );
}
