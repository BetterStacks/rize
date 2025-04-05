import { removeGalleryItem } from "@/actions/gallery-actions";
import { queryClient } from "@/lib/providers";
import { GalleryConfigProps, GalleryItemProps } from "@/lib/types";
import { cn, isImageUrl } from "@/lib/utils";
import { useLocalStorage } from "@mantine/hooks";
import { motion } from "framer-motion";
import { X } from "lucide-react";
import { useSession } from "next-auth/react";
import Image from "next/image";
import toast from "react-hot-toast";
import { Button } from "../ui/button";
import { galleryLayouts } from "./gallery";

type TGalleryItemProps = {
  item: GalleryItemProps;
  index: number;
  isMine: boolean;
};

function GalleryItem({ item, isMine }: TGalleryItemProps) {
  const session = useSession();

  const [config] = useLocalStorage<GalleryConfigProps>({
    key: "gallery-config",
    defaultValue: { layout: "masonry-grid" },
  });
  const removeItemFromGallery = async () => {
    if (!item.id) {
      throw new Error("Item not found in gallery");
    }
    try {
      const res = await removeGalleryItem(item.id);
      if (!res) {
        throw new Error("Failed to remove item from gallery");
      }
      toast.success("Item removed from gallery");
      queryClient.invalidateQueries({ queryKey: ["get-gallery-items"] });
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

        " group  aspect-auto w-full h-full  relative overflow-hidden  border border-neutral-200 dark:border-dark-border rounded-3xl bg-neutral-100 dark:bg-dark-border cursor-grab  first:mt-0 active:cursor-grabbing ",
        "min-h-[180px]",
        galleryLayouts["masonry-grid"].item
      )}
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
      // drag
      // dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
      // whileHover={{ scale: 1.05, zIndex: 20, y: -40, rotate: 0 }}
      // whileTap={{ scale: 1.05, zIndex: 20 }}
      // initial="initial"
      // animate="animate"
      //   ref={setNodeRef}
      //   {...attributes}
      //   {...listeners}
    >
      {isMine && (
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
