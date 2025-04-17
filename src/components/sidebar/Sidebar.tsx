"use client";
import { cn } from "@/lib/utils";
import { Bell, Compass, Search, Settings, UserRound } from "lucide-react";
import { useSession } from "next-auth/react";
import { useTheme } from "next-themes";
import Image from "next/image";
import Link from "next/link";
import { useProfileDialog, useSearchDialog } from "../dialog-provider";

const Sidebar = () => {
  const session = useSession();
  const setOpen = useProfileDialog()[1];
  const setOpenSearch = useSearchDialog()[1];
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
        "h-screen w-[80px] bg-light-bg dark:bg-dark-bg border-r border-neutral-200  dark:border-dark-border/60  hidden md:flex flex-col items-center justify-start "
      )}
    >
      <div className="mt-6">
        <Link href="/">
          {theme === "dark" ? (
            <Image
              width={42}
              height={42}
              className="rounded-xl size-10"
              alt=""
              src={"/logo-dark.png"}
            />
          ) : (
            <Image
              width={42}
              height={42}
              className="rounded-xl size-10"
              alt=""
              src={"/logo-light.png"}
            />
          )}
        </Link>
      </div>

      <div className="flex w-full flex-col mt-16 items-center justify-center gap-y-2 ">
        {options.map((option) => (
          <div
            onClick={option.onClick}
            className="size-12  group flex items-center justify-center"
            key={option.id}
          >
            {option.href ? (
              <Link href={option.href}>{option?.icon}</Link>
            ) : (
              option.icon
            )}
            <div className=" bg-white border border-neutral-200 dark:border-none dark:bg-neutral-800 rounded-xl opacity-0 absolute left-20 group-hover:left-24 group-hover:opacity-100 transition-all duration-300 shadow-lg px-4 py-1 ">
              <span className="text-xs opacity-70">{option.name}</span>
            </div>
          </div>
        ))}
      </div>
      {/* <div className="pt-10 w-full flex flex-col items-center justify-start px-4">
        <div className="w-full flex flex-col mt-10">
          <DndContext
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={sections.map((s) => s.id)}
              strategy={verticalListSortingStrategy}
            >
              {sections.map((section) => (
                <SortableItem
                  key={section.id}
                  id={section.id}
                  name={section.name}
                />
              ))}
            </SortableContext>
          </DndContext>
        </div>
      </div> */}
    </div>
  );
};

export default Sidebar;
