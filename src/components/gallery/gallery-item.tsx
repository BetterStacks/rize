import React, { useState } from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  GalleryConfigProps,
  GalleryItemProps,
  TGalleryItem,
  TMedia,
} from "@/lib/types";
import Image from "next/image";
import { motion, Variants } from "framer-motion";
import { cn, isImageUrl } from "@/lib/utils";
import { useQueryState } from "nuqs";
import { useLocalStorage } from "@mantine/hooks";
import { useSession } from "next-auth/react";
import { Button } from "../ui/button";
import { X } from "lucide-react";
import { removeGalleryItem } from "@/lib/server-actions";
import toast from "react-hot-toast";
import { queryClient } from "@/lib/providers";
import { galleryLayouts } from "./gallery";

function GalleryItem({
  item,
  index,
}: {
  item: GalleryItemProps;
  index: number;
}) {
  const session = useSession();
  const [id, setId] = useQueryState("gallery");
  const [hovered, setHovered] = useState(false);
  const [config] = useLocalStorage<GalleryConfigProps>({
    key: "gallery-config",
    defaultValue: { layout: "messy-grid" },
  });
  const isUser = session.data?.user?.profileId === item.profileId;
  const removeItemFromGallery = async () => {
    if (!item.galleryMediaId) {
      toast.error("Item not found in gallery");
      return;
    }
    try {
      const res = await removeGalleryItem(item.galleryMediaId);
      if (!res) {
        throw new Error("Failed to remove item from gallery");
      }
      toast.success("Item removed from gallery");
      queryClient.invalidateQueries({ queryKey: ["get-gallery-items"] });
      setId(null);
    } catch (error) {
      toast.error((error as Error).message);
    }
  };
  //   const {
  //     attributes,
  //     listeners,
  //     setNodeRef,
  //     transform,
  //     transition,
  //     isDragging,
  //     isOver,
  //   } = useSortable({
  //     id: item.id,
  //     transition: {
  //       duration: 200, // Smooth transition
  //       easing: "ease-out",
  //     },
  //     animateLayoutChanges: () => false,
  //   });

  //   const style = {
  //     transform: CSS.Transform.toString(transform),
  //     transition,
  //   };
  //   if (isDragging) {
  //     return (
  //       <div
  //         style={{ rotate: `${(index + 1) % 2 === 0 ? -6 : 6}deg` }}
  //         className="max-w-xs shadow-2xl aspect-square  relative overflow-hidden  w-full h-[200px] rounded-3xl bg-neutral-100 dark:bg-dark-border -m-2 cursor-grab active:cursor-grabbing"
  //       ></div>
  //     );
  //   }

  return (
    <motion.div
      className={cn(
        // isDragging && "opacity-80",

        " group  aspect-auto w-full h-full  relative overflow-hidden   rounded-3xl bg-neutral-100 dark:bg-dark-border cursor-grab  first:mt-0 active:cursor-grabbing ",
        galleryLayouts[config.layout].item
      )}
      onClick={() =>
        setId(id === item?.galleryMediaId ? null : item.galleryMediaId)
      }
      // style={
      //   config.layout === "masonry-grid"
      //     ? {
      //         // scale: 0.5,
      //         aspectRatio: item.width / item.height,
      //       }
      //     : {
      //         rotate: `${(index + 1) % 2 === 0 ? -6 : 6}deg`,
      //         aspectRatio: item.width / item.height,
      //       }
      // }
      drag
      dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
      // whileHover={{ scale: 1.05, zIndex: 20, y: -40, rotate: 0 }}
      // whileTap={{ scale: 1.05, zIndex: 20 }}
      // initial="initial"
      // animate="animate"
      //   ref={setNodeRef}
      //   {...attributes}
      //   {...listeners}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {isUser && (
        <Button
          onClick={removeItemFromGallery}
          className={cn(
            "rounded-full absolute group-hover:opacity-100 opacity-0 z-20 top-2 right-2 p-1 "
          )}
          size={"icon"}
        >
          <X className="size-5 " />
        </Button>
      )}
      {item?.url && isImageUrl(item?.url) ? (
        <Image
          draggable={false}
          src={item?.url}
          alt=""
          fill
          className="select-none z-10"
          style={{ objectFit: "cover" }}
        />
      ) : (
        <video
          style={{ objectFit: "cover" }}
          className="w-full h-full "
          src={item?.url}
          autoPlay
          loop
          muted
          controls={false}
        />
      )}
    </motion.div>
  );
}

export default GalleryItem;
