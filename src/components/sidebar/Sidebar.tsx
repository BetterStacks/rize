"use client";
import { cleanUrl, cn } from "@/lib/utils";
import {
  AlignJustify,
  Bell,
  Edit3,
  Home,
  Link2,
  MoreHorizontal,
  Search,
  Settings,
  UserRound,
} from "lucide-react";
import { useSession } from "next-auth/react";
import Image from "next/image";
import { useState } from "react";
import { useAvatarDialog, useProfileDialog } from "../dialog-provider";
import ChangeAvatarDialog from "../dialogs/ChangeAvatarDialog";
import { Skeleton } from "../ui/skeleton";
import { Button } from "../ui/button";
import Link from "next/link";
import { useSections } from "@/lib/context";
import { DndContext, closestCenter } from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { arrayMove } from "@dnd-kit/sortable";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

const Sidebar = () => {
  const { data, status } = useSession();
  const [_, setIsOpen] = useAvatarDialog();
  const [__, setOpen] = useProfileDialog();
  const [file, setFile] = useState<File | null>(null);
  const { sections, setSections } = useSections();

  const handleDragEnd = (event: any) => {
    const { active, over } = event;
    if (active.id !== over.id) {
      const oldIndex = sections.findIndex((s) => s.id === active.id);
      const newIndex = sections.findIndex((s) => s.id === over.id);
      setSections(arrayMove(sections, oldIndex, newIndex));
    }
  };

  const handleChange = (e: any) => {
    const files = e.target.files;
    if (Array(files).length === 0) return;
    setFile(files[0]);
    setIsOpen(true);
  };
  const options = [
    { id: 1, name: "Home", icon: <Home className="opacity-80" size={24} /> },
    {
      id: 3,
      name: "Search",
      icon: <Search className="opacity-80" size={24} />,
    },
    {
      id: 4,
      name: "Notifications",
      icon: <Bell className="opacity-80" size={24} />,
    },
    {
      id: 2,
      name: "Account",
      icon: <UserRound className="opacity-80" size={24} />,
    },
    {
      id: 5,
      name: "Settings",
      icon: <Settings className="opacity-80" size={24} />,
    },
  ];
  return (
    <div
      className={cn(
        "h-screen w-[80px]  hidden md:flex flex-col items-center justify-start border-r border-neutral-200  dark:border-dark-border/60"
      )}
    >
      <div className="flex w-full flex-col mt-24 items-center justify-center gap-y-2">
        {options.map((option) => (
          <div
            className="size-12 flex items-center justify-center"
            key={option.id}
          >
            {option?.icon}
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
