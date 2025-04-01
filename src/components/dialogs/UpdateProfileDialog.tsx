"use client";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { queryClient } from "@/lib/providers";
import {
  getProfileByUsername,
  isUsernameAvailable,
  updateUserAndProfile,
} from "@/lib/server-actions";
import { profileSchema, usernameSchema } from "@/lib/types";
import { cn } from "@/lib/utils";
import { zodResolver } from "@hookform/resolvers/zod";
import { useDebouncedCallback } from "@mantine/hooks";
import { useQuery } from "@tanstack/react-query";
import { AnimatePresence, motion } from "framer-motion";
import {
  Check,
  Loader,
  Palette,
  Settings,
  UserPen,
  UserRound,
  X,
} from "lucide-react";
import { useSession } from "next-auth/react";
import Image from "next/image";
import { useState } from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import Textarea from "react-textarea-autosize";
import { z } from "zod";
import { useProfileDialog } from "../dialog-provider";
import { ScrollArea } from "../ui/scroll-area";
import { useQueryState } from "nuqs";
import { useRouter } from "next/navigation";

// import { updateProfile } from "@/app/actions/updateProfile";

export function ProfileUpdateDialog() {
  const options = [
    {
      id: "profile",
      label: "Profile",
      icon: <UserPen className="size-5 opacity-80" strokeWidth={1.5} />,
      onClick: () => {},
    },
    {
      id: "account",
      label: "Account",
      icon: <UserRound className="size-5 opacity-80" strokeWidth={1.5} />,
      onClick: () => {},
    },
    {
      id: "appearance",
      label: "Appearance",
      icon: <Palette className="size-5 opacity-80" strokeWidth={1.5} />,
      onClick: () => {},
    },

    {
      id: "settings",
      label: "Settings",
      icon: <Settings className="size-5 opacity-80" strokeWidth={1.5} />,
      onClick: () => {},
    },
  ];
  const [tab, setTab] = useQueryState("tab");
  const [active, setActive] = useState(tab || options[0].id);
  const [open, setOpen] = useProfileDialog();

  const sections = {
    profile: <EditProfile />,
    account: <>Account</>,
    appearance: <>Appearance</>,
    settings: <>Settings</>,
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(open) => {
        setOpen(open);
        setActive(options[0].id);
        setTab(null);
      }}
    >
      <DialogContent className="max-w-2xl bg-light-bg dark:bg-neutral-900 p-0 flex h-[80vh] overflow-hidden w-full md:rounded-3xl">
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
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  );
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
    <div className="w-[40%] border-r border-neutral-300 dark:border-dark-border/50  h-full overflow-y-auto">
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
            <span
              className={cn(
                "text-sm "
                // active === option.id && "opacity-100"
              )}
            >
              {option.label}
            </span>
            {active === option.id && (
              <motion.div
                className="h-8 w-1 bg-green-500 rounded-full absolute right-0"
                transition={{
                  layout: {
                    duration: 0.2,
                    ease: "easeOut",
                  },
                }}
                layoutId={`active-line`}
              />
            )}
          </div>
        ))}
      </motion.div>
    </div>
  );
};

const EditProfile = () => {
  const { data, update } = useSession();
  const [isUpdating, setIsUpdating] = useState(false);
  const { data: profile, isLoading } = useQuery({
    queryKey: ["get-profile-by-username", data?.user?.username],
    queryFn: () => getProfileByUsername(data?.user?.username!),
  });
  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm<z.infer<typeof profileSchema>>({
    values: {
      email: profile?.email || "",
      name: profile?.name || "",
      username: profile?.username || "",
      age: profile?.age || 18,
      bio: profile?.bio || "",
      location: profile?.location || "",
      pronouns: profile?.pronouns || "he/him",
      website: profile?.website || "",
    },
    resolver: zodResolver(profileSchema),
  });
  const router = useRouter();
  const [isAvailable, setIsAvailable] = useState<boolean | null>(null);
  const [isSearching, setIsSearching] = useState<boolean | null>(null);
  const setOpen = useProfileDialog()[1];

  const onSubmit = async (data: z.infer<typeof profileSchema>) => {
    // console.log({ data: data });
    setIsUpdating(true);
    const res = await updateUserAndProfile(data);
    console.log({ res });
    if (!res.success) {
      setIsUpdating(false);
      toast.error("Failed to update profile");
    }
    await update();
    await queryClient.invalidateQueries({
      queryKey: ["get-profile-by-username", profile?.username],
    });
    setIsUpdating(false);
    toast.dismiss();
    isAvailable && router.push(`/${data.username}`);
    setOpen(false);
    toast.success("Profile updated successfully");
  };

  const handleCheck = useDebouncedCallback(async (username: string) => {
    if (username === data?.user?.username) {
      setIsAvailable(null);
      setIsSearching(false);
      return;
    }
    if (username.length < 3) {
      setIsAvailable(null);
      setIsSearching(false);
      return;
    }
    const result = usernameSchema.safeParse({ username });
    if (!result.success) {
      toast.dismiss();
      toast.error(result.error?.flatten()?.fieldErrors?.username?.[0]);
      setIsAvailable(false);
      return;
    }
    setIsSearching(true);
    const check = await isUsernameAvailable(username);
    if (!check.available) {
      toast.dismiss();
      toast.error("Username already taken");
      setIsSearching(false);
      setIsAvailable(false);
    } else {
      toast.dismiss();
      toast.success("Username is available");
      setIsSearching(false);
      setIsAvailable(true);
    }
    setIsSearching(false);
  }, 500);
  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="space-y-4 flex flex-col max-w-sm w-full mb-10"
    >
      <div className="size-24 ring-4 mb-2 ring-neutral-300 dark:ring-dark-border overflow-hidden rounded-full ">
        <Image
          src={profile?.profileImage as string}
          alt="Profile"
          width={100}
          className="rounded-full aspect-square"
          height={100}
        />
      </div>
      {/* <div className="flex items-center justify-center w-full gap-3"> */}
      <div className="space-y-2  w-full">
        <Label htmlFor="name">Name</Label>
        <Input className="text-opacity-80" id="name" {...register("name")} />
        {errors.name && (
          <p className="text-sm text-red-500">{errors.name.message}</p>
        )}
      </div>
      <div className="space-y-2 w-full">
        <Label htmlFor="email">Email</Label>
        <Input
          className="text-opacity-80"
          id="email"
          type="email"
          {...register("email")}
        />
        {errors.email && (
          <p className="text-sm text-red-500">{errors.email.message}</p>
        )}
      </div>
      {/* </div> */}
      {/* <div className="flex items-center justify-center w-full gap-3"> */}
      <div className="space-y-2  w-full">
        <Label htmlFor="username">Username</Label>
        <div className="border border-neutral-300 dark:border-dark-border flex items-center justify-center overflow-hidden h-9 rounded-md">
          <Input
            {...register("username", {
              onChange: (e) => handleCheck(e.target.value),
            })}
            className="focus-visible:outline-none text-opacity-80 focus-visible:ring-0 bg-transparent border-none "
          />
          {isSearching && <Loader className="animate-spin size-4 mr-2" />}

          {isAvailable !== null && !isSearching && (
            <div
              className={cn(
                isAvailable ? "bg-green-500" : "bg-red-500",
                "size-5 rounded-full flex items-center justify-center mr-2"
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
        {/* <Input id="username" {...register("username")} />
        {errors.username && (
          <p className="text-sm text-red-500">{errors.username.message}</p>
        )}
        {isChecking && (
          <p className="text-sm text-green-500">Checking availability...</p>
        )}
        {!isChecking && isUsernameAvailable ? (
          <p className="text-sm text-green-500">Username is available</p>
        ) : (
          <p className="text-sm text-red-500">Username is not available</p>
        )} */}

        <div className="space-y-2 w-full">
          <Label htmlFor="age">Age</Label>
          <Input
            className="text-opacity-80"
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
            <SelectTrigger className="text-opacity-80">
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
            <p className="text-sm text-red-500">{errors.pronouns.message}</p>
          )}
        </div>
        <div className="space-y-2 w-full">
          <Label htmlFor="location">Location</Label>
          <Input
            className="text-opacity-80"
            id="location"
            {...register("location")}
          />
          {errors.location && (
            <p className="text-sm text-red-500">{errors.location.message}</p>
          )}
        </div>
      </div>
      <div className="space-y-2 w-full">
        <Label htmlFor="website">Website</Label>
        <Input
          className="text-opacity-80"
          id="website"
          {...register("website")}
        />
        {errors.website && (
          <p className="text-sm text-red-500">{errors.website.message}</p>
        )}
      </div>
      <div className="space-y-2">
        <Label htmlFor="bio">Bio</Label>
        <Textarea
          minRows={3}
          maxRows={6}
          className="w-full  p-2 text-opacity-80 text-sm appearance-none border focus-visible:outline-none border-neutral-300 dark:border-dark-border bg-transparent rounded-md"
          id="bio"
          {...register("bio")}
        />
        {errors.bio && (
          <p className="text-sm text-red-500">{errors.bio.message}</p>
        )}
      </div>
      <Button
        disabled={isUpdating || Object.keys(errors).length > 0}
        className="bg-green-500 hover:bg-green-600 rounded-lg py-2 w-fit"
        type="submit"
      >
        {isUpdating && <Loader className="animate-spin size-4 mr-2" />}
        Save Changes
      </Button>
    </form>
  );
};
