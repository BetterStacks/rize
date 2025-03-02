"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { profileSchema } from "@/lib/types";
import { zodResolver } from "@hookform/resolvers/zod";
import { useSession } from "next-auth/react";
import { Form, useForm } from "react-hook-form";
import Textarea from "react-textarea-autosize";
import { z } from "zod";
import { useProfileDialog } from "../dialog-provider";
import { updateUserAndProfile } from "@/lib/server-actions";
import toast from "react-hot-toast";

// import { updateProfile } from "@/app/actions/updateProfile";

export function ProfileUpdateDialog() {
  const [open, setOpen] = useProfileDialog();
  const { data, update } = useSession();
  const {
    register,
    handleSubmit,
    formState: { errors },
    control,
    setValue,
  } = useForm<z.infer<typeof profileSchema>>({
    values: {
      email: data?.user?.email || "",
      name: data?.user?.name || "",
      username: data?.user?.username || "",
      age: data?.user?.age || 18,
      bio: data?.user?.bio || "",
      location: data?.user?.location || "",
      pronouns: data?.user?.pronouns || "he/him",
      website: data?.user?.website || "",
    },
    resolver: zodResolver(profileSchema),
  });

  const onSubmit = async (data: z.infer<typeof profileSchema>) => {
    console.log({ data: data });

    const res = await updateUserAndProfile(data);
    console.log({ res });
    if (!res.success) {
      toast.error("Failed to update profile");
    }
    await update();
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="max-w-2xl  w-full md:rounded-3xl">
        <DialogHeader>
          <DialogTitle>Update Profile</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="flex items-center justify-center w-full gap-3">
            <div className="space-y-2  w-full">
              <Label htmlFor="name">Name</Label>
              <Input id="name" {...register("name")} />
              {errors.name && (
                <p className="text-sm text-red-500">{errors.name.message}</p>
              )}
            </div>
            <div className="space-y-2 w-full">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" {...register("email")} />
              {errors.email && (
                <p className="text-sm text-red-500">{errors.email.message}</p>
              )}
            </div>
          </div>
          <div className="flex items-center justify-center w-full gap-3">
            <div className="space-y-2  w-full">
              <Label htmlFor="username">Username</Label>
              <Input id="username" {...register("username")} />
              {errors.username && (
                <p className="text-sm text-red-500">
                  {errors.username.message}
                </p>
              )}
            </div>
            <div className="space-y-2 w-full">
              <Label htmlFor="age">Age</Label>
              <Input
                id="age"
                type="number"
                {...register("age", { valueAsNumber: true })}
              />
              {errors.age && (
                <p className="text-sm text-red-500">{errors.age.message}</p>
              )}
            </div>
          </div>
          <div className="flex items-center justify-center w-full gap-3">
            <div className="space-y-2  w-full">
              <Label htmlFor="pronouns">Pronouns</Label>
              <Select
                onValueChange={(value) => setValue("pronouns", value as any)}
                defaultValue="he/him"
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select pronouns" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="he/him">He/Him</SelectItem>
                  <SelectItem value="she/her">She/Her</SelectItem>
                  <SelectItem value="they/them">They/Them</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
              {errors.pronouns && (
                <p className="text-sm text-red-500">
                  {errors.pronouns.message}
                </p>
              )}
            </div>
            <div className="space-y-2 w-full">
              <Label htmlFor="location">Location</Label>
              <Input id="location" {...register("location")} />
              {errors.location && (
                <p className="text-sm text-red-500">
                  {errors.location.message}
                </p>
              )}
            </div>
          </div>
          <div className="space-y-2 w-full">
            <Label htmlFor="website">Website</Label>
            <Input id="website" {...register("website")} />
            {errors.website && (
              <p className="text-sm text-red-500">{errors.website.message}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="bio">Bio</Label>
            <Textarea
              minRows={6}
              maxRows={6}
              className="w-full p-2 appearance-none border focus-visible:outline-none border-neutral-300 rounded-md"
              id="bio"
              {...register("bio")}
            />
            {errors.bio && (
              <p className="text-sm text-red-500">{errors.bio.message}</p>
            )}
          </div>
          <Button
            className="bg-indigo-700 rounded-lg py-2 w-full"
            type="submit"
          >
            Update Profile
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
