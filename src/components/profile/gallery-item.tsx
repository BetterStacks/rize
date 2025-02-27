import React from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GalleryConfigProps, TGalleryItem } from "@/lib/types";
import Image from "next/image";
import { motion } from "framer-motion";
import { cn, isImageUrl } from "@/lib/utils";
import { useQueryState } from "nuqs";
import { useLocalStorage } from "@mantine/hooks";

function GalleryItem({
  item,
  index,
}: {
  item: typeof TGalleryItem;
  index: number;
}) {
  const [id, setId] = useQueryState("gallery");
  const [config] = useLocalStorage<GalleryConfigProps>({
    key: "gallery-config",
  });
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
      //   ref={setNodeRef}
      //   {...attributes}
      //   {...listeners}
      className={cn(
        // isDragging && "opacity-80",
        " shadow-2xl aspect-square  relative overflow-hidden  w-full  rounded-3xl bg-neutral-100 dark:bg-dark-border -m-2 cursor-grab active:cursor-grabbing",
        config?.cols == 4 && "max-w-xs h-[200px]",
        config?.cols == 3 && "w-[250px] h-[250px]",
        config?.cols == 2 && "w-[200px] h-[200px]"
      )}
      onClick={() => setId(id === item?.id ? null : item.id)}
      style={{ rotate: `${(index + 1) % 2 === 0 ? -6 : 6}deg` }}
      whileHover={{ scale: 1.05, zIndex: 20, y: -40, rotate: 0 }}
      whileTap={{ scale: 1.05, zIndex: 20 }}
      drag
      dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
    >
      {item?.url && isImageUrl(item?.url) ? (
        <Image
          draggable={false}
          src={item?.url}
          alt=""
          fill
          className="select-none "
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
          controls
        />
      )}
    </motion.div>
  );
}

export default GalleryItem;
