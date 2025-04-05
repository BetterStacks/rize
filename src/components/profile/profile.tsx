import { GetProfileByUsername } from "@/lib/types";
import { cleanUrl } from "@/lib/utils";
import {
  BriefcaseBusiness,
  Link2,
  LogOut,
  Moon,
  Plus,
  Sun,
  UserPenIcon,
} from "lucide-react";
import { signOut } from "next-auth/react";
import { useTheme } from "next-themes";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  useExperienceDialog,
  useProfileDialog,
  useSocialLinksDialog,
} from "../dialog-provider";
import { Button } from "../ui/button";
import { Skeleton } from "../ui/skeleton";
import UserAvatar from "../user-avatar";
import SocialLinks from "../profile/social-links";

type ProfileProps = {
  data: GetProfileByUsername;
  isLoading: boolean;
  isMine: boolean;
};

const Profile = ({ data, isLoading, isMine }: ProfileProps) => {
  const setOpen = useProfileDialog()[1];
  const setSocialLinkOpen = useSocialLinksDialog()[1];
  const setIsExperienceDialogOpen = useExperienceDialog()[1];
  const router = useRouter();
  const { theme, setTheme } = useTheme();
  const [isMounted, setIsMounted] = useState(false);
  useEffect(() => {
    setIsMounted(true);
  }, []);

  const options = [
    {
      icon: <UserPenIcon className="opacity-80 size-5" />,
      name: "Edit Profile",
      handleClick: () => {
        setOpen(true);
      },
    },
    {
      icon:
        isMounted && theme === "dark" ? (
          <Sun className="opacity-80 size-5" />
        ) : (
          <Moon className="opacity-80 size-5" />
        ),
      name: "Switch Theme",
      handleClick: () => {
        isMounted && setTheme(theme === "dark" ? "light" : "dark");
      },
    },
    {
      icon: <Link2 className="opacity-80 -rotate-45 size-5" />,
      name: "Edit Contact",
      handleClick: () => {
        setSocialLinkOpen(true);
      },
    },
    {
      icon: <BriefcaseBusiness className="opacity-80 size-5" />,
      name: "Edit Experience",
      handleClick: () => {
        setIsExperienceDialogOpen(true);
      },
    },
    {
      icon: <LogOut className="opacity-80 size-5" />,
      name: "Logout",
      handleClick: () => {
        signOut();
        router.push("/login");
      },
    },
  ];

  return (
    <div className=" w-full flex flex-col items-center justify-start   mb-2">
      <div className="w-full max-w-2xl   pb-2 flex flex-col items-start  justify-center">
        <div className=" w-full flex  items-center justify-start">
          <UserAvatar
            data={{
              image: data?.profileImage as string,
              name: data?.name as string,
            }}
            isLoading={isLoading}
            isMyProfile={isMine}
          />
        </div>
        <div className="w-full flex items-start justify-center">
          <div className="w-full mt-3 flex  flex-col items-start justify-start">
            {isLoading ? (
              <>
                <Skeleton className="h-6 w-[40%] rounded-xl animate-pulse bg-neutral-300 dark:bg-dark-border" />
                <Skeleton className="h-4 mt-2 w-[20%] rounded-xl animate-pulse bg-neutral-300 dark:bg-dark-border" />
              </>
            ) : (
              <div className="flex flex-col items-start justify-start">
                <h3 className="text-xl px-1 mb-1 leading-tight font-medium">
                  {data?.displayName}
                </h3>
                <div className="flex items-center justify-start gap-2">
                  {/* {data?.location && (
                    <div className="flex items-center group bg-neutral-200 dark:bg-dark-border mt-1 px-2 py-1.5 rounded-3xl justify-center">
                      <MapPin className="opacity-80 size-4" />
                      <span className=" opacity-80 ml-1 group-hover:opacity-90 leading-none text-sm">
                        {data?.location}
                      </span>
                    </div>
                  )} */}
                  {data?.website && (
                    <Link href={data?.website} target="_blank">
                      <div className="flex items-center group bg-neutral-200 dark:bg-dark-border mt-1 px-2 py-1.5 rounded-3xl justify-center">
                        <Link2 className="-rotate-45 opacity-80 size-4" />
                        <span className=" opacity-80 group-hover:opacity-90 ml-1 leading-none text-sm">
                          {cleanUrl(data?.website as string)}
                        </span>
                      </div>
                    </Link>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="flex flex-col items-start justify-start mt-2 mb-4 w-full">
          {data?.bio && (
            <div className="mt-2 text-sm opacity-80">
              {data?.bio?.split("\n").map((word, i) => (
                <span key={i}>
                  {word}
                  <br className="" />
                </span>
              ))}{" "}
            </div>
          )}
        </div>
        <SocialLinks />
      </div>
      {/* {!isMine && (
        <div className="flex items-center justify-start mt-2 w-full ">
          <>
            <Button className="pl-6 pr-3 rounded-3xl flex-1">
              Follow
              <Plus className="size-4  " />
            </Button>
          </>
        </div>
      )} */}
    </div>
  );
};

export default Profile;
