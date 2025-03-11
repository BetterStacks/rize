import { GetProfileByUsername } from "@/lib/types";
import { cleanUrl } from "@/lib/utils";
import {
  BriefcaseBusiness,
  Link2,
  LogOut,
  MapPin,
  Moon,
  MoreHorizontal,
  Sun,
  UserPenIcon,
} from "lucide-react";
import { signOut, useSession } from "next-auth/react";
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
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";

type ProfileProps = {
  data: GetProfileByUsername;
  isLoading: boolean;
};

const Profile = ({ data, isLoading }: ProfileProps) => {
  const setOpen = useProfileDialog()[1];
  const setSocialLinkOpen = useSocialLinksDialog()[1];
  const setIsExperienceDialogOpen = useExperienceDialog()[1];
  const router = useRouter();
  const { theme, setTheme } = useTheme();
  const [isMounted, setIsMounted] = useState(false);
  const session = useSession();
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
  const isMyProfile = session?.data?.user?.username === data?.username;
  return (
    <div className=" w-full flex flex-col items-center justify-start   mb-6">
      <div className="w-full max-w-2xl   pb-2 flex flex-col items-start  justify-center">
        <div className=" w-full flex  items-center justify-center">
          <UserAvatar
            data={{
              image: data?.image as string,
              name: data?.name as string,
            }}
            isLoading={isLoading}
            isMyProfile={isMyProfile}
          />
          <div className="  flex items-center mt-2 justify-evenly w-full">
            <div className="flex flex-col items-center justify-center ">
              <span>0</span>
              <span className="mt-1 font-medium">Posts</span>
            </div>
            <div className="flex flex-col items-center justify-center ">
              <span>280</span>
              <span className="mt-1 font-medium">Followers</span>
            </div>
            <div className="flex flex-col items-center justify-center ">
              <span>41</span>
              <span className="mt-1 font-medium">Following</span>
            </div>
          </div>
          {/* <div className="flex mt-2 max-w-md  items-center justify-start gap-2 w-full">
              <Button className="w-full" size={"sm"}>
                Edit Profile
              </Button>
              <Button className="w-full" size={"sm"}>
                Share Profile
              </Button>
            </div>
          </div> */}
        </div>
        <div className="w-full flex items-center justify-center">
          <div className="w-full mt-3 flex  flex-col items-start justify-start">
            {isLoading ? (
              <>
                <Skeleton className="h-6 w-[40%] rounded-xl animate-pulse bg-neutral-300 dark:bg-dark-border" />
                <Skeleton className="h-4 mt-2 w-[20%] rounded-xl animate-pulse bg-neutral-300 dark:bg-dark-border" />
              </>
            ) : (
              <div className="flex flex-col items-start justify-start">
                <h3 className="text-xl px-1 mb-2 leading-tight font-medium">
                  {data?.name}
                </h3>
                <div className="flex items-center justify-start gap-2">
                  {data?.location && (
                    <div className="flex items-center group bg-neutral-200 dark:bg-dark-border mt-1 px-2 py-1.5 rounded-3xl justify-center">
                      <MapPin className="opacity-80 size-4" />
                      <span className=" opacity-80 ml-1 group-hover:opacity-90 leading-none text-sm">
                        {/* {cleanUrl(data?.user?.website as string)} */}
                        {data?.location}
                      </span>
                    </div>
                  )}
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
        <div className="flex flex-col items-start justify-start mt-2 w-full">
          {data?.bio && (
            <div className="mt-2">
              <p className="opacity-80">{data?.bio} </p>
            </div>
          )}
        </div>
      </div>
      <div className="flex items-center mt-2 gap-2 justify-center w-full max-w-2xl">
        {isMyProfile ? (
          <>
            <Button
              onClick={() => {
                setOpen(true);
              }}
              variant={"outline"}
              className="w-full"
            >
              Edit Profile
            </Button>
            <Button variant={"outline"} className="w-full">
              Share Profile
            </Button>
            <Popover>
              <PopoverTrigger asChild className="">
                <Button variant={"outline"} size={"icon"} className="p-2">
                  <MoreHorizontal className="size-4" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="rounded-3xl w-[250px]">
                {options.map((option) => (
                  <div
                    key={option.name}
                    // variant={"outline"}
                    className="w-full cursor-pointer px-2 py-1 flex items-center gap-2"
                    onClick={option.handleClick}
                  >
                    {option.icon}
                    <span className="flex items-center gap-2">
                      {option.name}
                    </span>
                  </div>
                ))}
              </PopoverContent>
            </Popover>
          </>
        ) : (
          <>
            <Button variant={"outline"} className="w-full">
              Follow
            </Button>
          </>
        )}
      </div>
    </div>
  );
};

export default Profile;
