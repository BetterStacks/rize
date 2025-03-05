import { cleanUrl, cn } from "@/lib/utils";
import {
  BriefcaseBusiness,
  Edit3,
  Link2,
  LogOut,
  MapPin,
  Moon,
  MoreHorizontal,
  Sun,
  UserPenIcon,
} from "lucide-react";
import { signOut, useSession } from "next-auth/react";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import {
  useAvatarDialog,
  useExperienceDialog,
  useProfileDialog,
  useSocialLinksDialog,
} from "../dialog-provider";
import ChangeAvatarDialog from "../dialogs/ChangeAvatarDialog";
import { Button } from "../ui/button";
import { Skeleton } from "../ui/skeleton";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { useTheme } from "next-themes";
import { useRouter } from "next/navigation";

const Profile = () => {
  const { data, status } = useSession();
  const setIsOpen = useAvatarDialog()[1];
  const setOpen = useProfileDialog()[1];
  const setSocialLinkOpen = useSocialLinksDialog()[1];
  const setIsExperienceDialogOpen = useExperienceDialog()[1];
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const { theme, setTheme } = useTheme();
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
        theme === "dark" ? (
          <Sun className="opacity-80 size-5" />
        ) : (
          <Moon className="opacity-80 size-5" />
        ),
      name: "Switch Theme",
      handleClick: () => {
        setTheme(theme === "dark" ? "light" : "dark");
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

  const handleChange = (e: any) => {
    const files = e.target.files;
    if (Array(files).length === 0) return;
    setFile(files[0]);
    setIsOpen(true);
  };

  return (
    <div className=" w-full flex flex-col items-center justify-start  px-4 mb-6">
      <ChangeAvatarDialog file={file} setFile={setFile} />
      <div className="w-full max-w-2xl px-2 pb-2 flex flex-col items-start  justify-center">
        <div
          className={cn(
            "relative group border-2 border-neutral-300 dark:border-dark-border rounded-full size-24 md:size-24 lg:size-28  aspect-square ",
            status === "loading" &&
              "animate-pulse bg-neutral-300  dark:bg-dark-border rounded-full"
          )}
        >
          <input
            onChange={handleChange}
            type="file"
            className="hidden"
            id="profile-input"
          />
          <button className="absolute z-10 group-hover:opacity-100 opacity-0 transition-all duration-100 ease-in border border-neutral-300 dark:border-dark-border  bg-white dark:bg-[#363636] p-1.5 rounded-full left-1 bottom-1 drop-shadow-lg shadow-black/80 ">
            <label htmlFor="profile-input">
              <Edit3 className="size-5 dark:opacity-70" />
            </label>
          </button>
          {data?.user?.image && (
            <Image
              className=" rounded-full w-full aspect-square"
              src={data?.user?.image as string}
              fill
              style={{
                objectFit: "cover",
              }}
              quality={100}
              priority
              alt={`${data?.user?.name}`}
            />
          )}{" "}
        </div>
        <div className="w-full flex items-center justify-center">
          <div className="w-full mt-3 flex  flex-col items-start justify-start">
            {status === "loading" ? (
              <>
                <Skeleton className="h-6 w-[40%] rounded-xl animate-pulse bg-neutral-300 dark:bg-dark-border" />
                <Skeleton className="h-4 mt-2 w-[20%] rounded-xl animate-pulse bg-neutral-300 dark:bg-dark-border" />
              </>
            ) : (
              <div className="flex flex-col items-start justify-start">
                <h3 className="text-xl px-1 mb-2 leading-tight font-medium">
                  {data?.user?.name}
                </h3>
                <div className="flex items-center justify-start gap-2">
                  {data?.user?.location && (
                    <div className="flex items-center group bg-neutral-200 dark:bg-dark-border mt-1 px-2 py-1.5 rounded-3xl justify-center">
                      <MapPin className="opacity-80 size-4" />
                      <span className=" opacity-80 ml-1 group-hover:opacity-90 leading-none text-sm">
                        {/* {cleanUrl(data?.user?.website as string)} */}
                        {data?.user?.location}
                      </span>
                    </div>
                  )}
                  {data?.user?.website && (
                    <Link href={data?.user?.website} target="_blank">
                      <div className="flex items-center group bg-neutral-200 dark:bg-dark-border mt-1 px-2 py-1.5 rounded-3xl justify-center">
                        <Link2 className="-rotate-45 opacity-80 size-4" />
                        <span className=" opacity-80 group-hover:opacity-90 ml-1 leading-none text-sm">
                          {cleanUrl(data?.user?.website as string)}
                        </span>
                      </div>
                    </Link>
                  )}
                </div>
              </div>
            )}
          </div>
          <div>
            {/* <OptionsMenu> */}
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant={"outline"}
                  size={"icon"}
                  className="rounded-full"
                  // onClick={() => setOpen(true)}
                >
                  <MoreHorizontal className="size-5 opacity-80" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="rounded-3xl border max-w-xs w-full border-neutral-300 p-0 dark:border-dark-border dark:bg-neutral-800">
                {options.map((option, i) => {
                  return (
                    <div
                      key={i}
                      onClick={option.handleClick}
                      className="flex cursor-pointer items-center justify-start border-t first:border-t-0 border-neutral-300 px-6 py-2 dark:border-dark-border"
                    >
                      {option?.icon}
                      <span className="ml-2">{option?.name}</span>
                    </div>
                  );
                })}
              </PopoverContent>
            </Popover>
            {/* </OptionsMenu> */}
          </div>
        </div>
        <div className="flex flex-col items-start justify-start mt-2 w-full">
          {data?.user?.bio && (
            <div className="mt-2">
              <p className="text-sm opacity-80">{data?.user?.bio} </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;
