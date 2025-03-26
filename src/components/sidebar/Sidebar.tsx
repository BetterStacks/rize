"use client";
import { cn } from "@/lib/utils";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  AlignJustify,
  Bell,
  Compass,
  Search,
  Settings,
  UserRound,
} from "lucide-react";
import { useSession } from "next-auth/react";
import Image from "next/image";
import Link from "next/link";
import { useProfileDialog } from "../dialog-provider";
const Sidebar = () => {
  const session = useSession();
  const [open, setOpen] = useProfileDialog();
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
      href: "/search",
      onClick: () => {
        // router.push("/");
      },
      icon: <Search className="opacity-70" strokeWidth={1.5} />,
    },
    {
      id: 4,
      name: "Notifications",
      href: "/notifications",
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
        <Image
          src="/logo2.png"
          alt="logo"
          width={42}
          height={42}
          className="rounded-xl size-10"
        />
      </div>

      <div className="flex w-full flex-col mt-16 items-center justify-center gap-y-2 ">
        {options.map((option) => (
          <div
            onClick={option.onClick}
            className="size-12  group flex items-center justify-center"
            key={option.id}
          >
            <Link href={option.href}>{option?.icon}</Link>
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

function SortableItem({ id, name }: { [key: string]: string }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "p-2 mb-2 bg-white w-full flex items-center justify-between border border-neutral-200 dark:border-dark-border dark:bg-neutral-800   rounded-lg cursor-pointer",
        isDragging && "drop-shadow-xl z-10 shadow-black/40 "
      )}
    >
      <span className="ml-2">{name}</span>
      <button {...attributes} {...listeners}>
        <AlignJustify strokeWidth={1.4} className="size-4" />
      </button>
    </div>
  );
}

export default Sidebar;
