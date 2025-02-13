"use client";
import { cleanUrl, cn } from "@/lib/utils";
import { AlignJustify, Edit3, Link2, MoreHorizontal } from "lucide-react";
import { useSession } from "next-auth/react";
import Image from "next/image";
import { useState } from "react";
import { useAvatarDialog, useProfileDialog } from "./dialog-provider";
import ChangeAvatarDialog from "./dialogs/ChangeAvatarDialog";
import { Skeleton } from "./ui/skeleton";
import { Button } from "./ui/button";
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
  return (
    <div className={cn("h-screen  w-full border-r border-neutral-200")}>
      <ChangeAvatarDialog file={file} setFile={setFile} />

      <div className="pt-10 w-full flex flex-col items-center justify-start px-4">
        <div className="w-full px-2 pb-2 flex flex-col items-start justify-center">
          <div
            className={cn(
              "relative group border border-neutral-300 rounded-full  md:size-24 lg:size-28 xl:size-36 aspect-square ",
              status === "loading" &&
                "animate-pulse bg-neutral-300 rounded-full"
            )}
          >
            <input
              onChange={handleChange}
              type="file"
              className="hidden"
              id="profile-input"
            />
            <button className="absolute z-10 group-hover:opacity-100 opacity-0 transition-all duration-100 ease-in border border-neutral-300 bg-white p-1.5 rounded-full left-1 bottom-1 drop-shadow-lg shadow-black/80 ">
              <label htmlFor="profile-input">
                <Edit3 className="size-5 " />
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
            <div className="w-full mt-4 flex  flex-col items-start justify-start">
              {status === "loading" && (
                <>
                  <Skeleton className="h-8 w-full rounded-xl animate-pulse bg-neutral-300 " />
                  <Skeleton className="h-6 mt-2 w-[60%] rounded-xl animate-pulse bg-neutral-300 " />
                </>
              )}
              <h3 className="text-3xl leading-tight font-bold">
                {data?.user?.name}
              </h3>
            </div>
            <div>
              <Button
                variant={"outline"}
                size={"icon"}
                onClick={() => setOpen(true)}
              >
                <MoreHorizontal className="size-5 opacity-80" />
              </Button>
            </div>
          </div>
          <div className="flex flex-col items-start justify-start mt-2 w-full">
            {data?.user?.website && (
              <Link href={data?.user?.website} target="_blank">
                <div className="flex items-center justify-center">
                  <div className="p-1 w-fit rounded-md border border-neutral-300">
                    <Link2 className="-rotate-45 size-4 opacity-80" />
                  </div>
                  <span className="ml-2 opacity-80">
                    {cleanUrl(data?.user?.website as string)}
                  </span>
                </div>
              </Link>
            )}
            {data?.user?.bio && (
              <div className="mt-2">
                <p className="">{data?.user?.bio} </p>
              </div>
            )}
          </div>
        </div>
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
      </div>
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
        "p-2 mb-2 bg-white w-full flex items-center justify-between border border-neutral-200   rounded-lg cursor-pointer",
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
