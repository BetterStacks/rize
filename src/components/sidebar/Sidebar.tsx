"use client";
import { cn } from "@/lib/utils";
import {
  Bell,
  Compass,
  Edit3,
  Plus,
  Search,
  Settings,
  UserRound,
} from "lucide-react";
import { useSession } from "next-auth/react";
import { useTheme } from "next-themes";
import Image from "next/image";
import Link from "next/link";
import {
  usePostsDialog,
  useProfileDialog,
  useSearchDialog,
} from "../dialog-provider";
import { Button } from "../ui/button";
import { motion } from "framer-motion";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";

const Sidebar = () => {
  const session = useSession();
  const setOpen = useProfileDialog()[1];
  const setOpenSearch = useSearchDialog()[1];
  const setIsPostDialogOpen = usePostsDialog()[1];
  const { theme } = useTheme();
  const options = [
    {
      id: 1,
      name: "Explore",
      href: "/",
      onClick: () => {
        // router.push("/");
      },
      icon: <Compass className="opacity-70" strokeWidth={1.5} />,
    },
    {
      id: 3,
      name: "Search",
      href: null,
      onClick: () => {
        setOpenSearch(true);
        // router.push("/");
      },
      icon: <Search className="opacity-70" strokeWidth={1.5} />,
    },
    {
      id: 4,
      name: "Notifications",
      href: null,
      onClick: () => {
        // router.push("/");
      },
      icon: <Bell className="opacity-70" strokeWidth={1.5} />,
    },
    {
      id: 2,
      name: "Account",
      href: `/${session?.data?.user?.username}`,
      onClick: () => {
        // router.push("/");
      },
      icon: <UserRound className="opacity-70" strokeWidth={1.5} />,
    },
    {
      id: 5,
      name: "Settings",
      href: `/${session?.data?.user?.username}?tab=settings`,
      onClick: () => {
        // router.push("/");
        setOpen(true);
      },
      icon: <Settings className="opacity-70" strokeWidth={1.5} />,
    },
  ];
  return (
    <div
      className={cn(
        "h-screen w-[90px] bg-light-bg dark:bg-dark-bg border-r border-neutral-300/60  dark:border-dark-border/60  hidden md:flex flex-col items-center justify-between px-2 z-40 py-4"
      )}
    >
      <div className="flex w-full flex-col mt-4 items-center justify-center gap-y-2 ">
        <div className="mb-6">
          <Link href="/">
            <Image
              width={42}
              height={42}
              className="rounded-xl hidden dark:flex size-10"
              alt=""
              src={"/logo-dark.png"}
            />
            <Image
              width={42}
              height={42}
              className="rounded-xl  dark:hidden flex size-10"
              alt=""
              src={"/logo-light.png"}
            />
          </Link>
        </div>
      </div>

      <div className="mb-8 flex flex-col gap-y-4">
        <Button
          variant={"outline"}
          className="rounded-full size-10"
          size={"icon"}
          onClick={() => {
            setOpenSearch(true);
          }}
        >
          <Search strokeWidth={1.6} className="size-5 opacity-80" />
        </Button>
        <Button
          variant={"outline"}
          className="rounded-full size-10"
          size={"icon"}
          onClick={() => {
            setIsPostDialogOpen(true);
          }}
        >
          <Plus strokeWidth={1.6} className="size-5 opacity-80" />
        </Button>
        <Link href={`/${session?.data?.user?.username}`}>
          {/* <Popover>
          <PopoverTrigger asChild> */}
          <div
            className={cn(
              "size-10 bg-neutral-200 dark:bg-dark-border rounded-full aspect-square flex relative overflow-hidden",
              session?.status === "loading" && "animate-pulse"
            )}
          >
            {session?.data?.user?.profileImage && (
              <Image
                className=" "
                src={session?.data?.user?.profileImage as string}
                fill
                style={{
                  objectFit: "cover",
                }}
                quality={100}
                priority
                alt={`${session?.data?.user?.name}`}
              />
            )}
          </div>
          {/* </PopoverTrigger>
          <PopoverContent className="w-48 rounded-2xl dark:bg-dark-bg bg-white border border-neutral-300/60 dark:border-dark-border/60 drop-shadow-2xl ml-4 mb-2 p-4">
            <OptionsMenu />
          </PopoverContent>
        </Popover> */}
        </Link>
      </div>
    </div>
  );
};

const OptionsMenu = () => {
  const session = useSession();
  const options = [
    {
      id: 1,
      name: "Manage Account",
      href: `/${session?.data?.user?.username}`,
      onClick: () => {},
      icon: <UserRound className="opacity-70 size-5" strokeWidth={1.2} />,
    },
    {
      id: 2,
      name: "Edit Profile",
      href: `/${session?.data?.user?.username}`,
      onClick: () => {},
      icon: <Edit3 className="opacity-70 size-5" strokeWidth={1.2} />,
    },
    {
      id: 3,
      name: "Settings",
      href: `/${session?.data?.user?.username}?tab=settings`,
      onClick: () => {},
      icon: <Settings className="opacity-70 size-5" strokeWidth={1.2} />,
    },
  ];
  return (
    <motion.div>
      {options.map((option) => (
        <div
          onClick={option.onClick}
          className=" relative group flex items-center justify-start my-1"
          key={option.id}
        >
          {option?.icon}{" "}
          <span className="opacity-80 font-light tracking-tight ml-4  ">
            {option?.name}
          </span>
          {/* <div className=" bg-white z-50 border border-neutral-200 dark:border-none dark:bg-neutral-800 rounded-xl opacity-0 absolute left-20 group-hover:left-24 group-hover:opacity-100 transition-all duration-300 drop-shadow-2xl px-4 py-1 ">
            <span className="text-xs opacity-70">{option.name}</span>
          </div> */}
        </div>
      ))}
    </motion.div>
  );
};

export default Sidebar;
