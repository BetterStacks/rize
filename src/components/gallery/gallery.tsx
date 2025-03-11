import { getGalleryItems } from "@/lib/server-actions";
import { GalleryConfigProps, GalleryItemProps } from "@/lib/types";
import { cn } from "@/lib/utils";
import { useLocalStorage } from "@mantine/hooks";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import {
  mansoryGridItemVariants,
  mansoryGridVariants,
  messyGridItemVariants,
  messyGridVariants,
} from "./gallery-config";
import GalleryItem from "./gallery-item";
import { useParams } from "next/navigation";
import { Skeleton } from "../ui/skeleton";

export const galleryLayouts = {
  "messy-grid": {
    container:
      "flex flex-wrap mt-6 -space-x-6 -space-y-6 w-full  max-w-3xl   items-center justify-center",
    item: "w-[240px] h-[240px]  aspect-square  shadow-2xl ",
    containerVariants: messyGridVariants,
    itemVariants: messyGridItemVariants,
  },
  "masonry-grid": {
    container: "w-full columns-2 md:columns-3  max-w-2xl relative",
    item: "mt-4 first:mt-0 shadow-lg",
    containerVariants: mansoryGridVariants,
    itemVariants: mansoryGridItemVariants,
  },
};

const Gallery = () => {
  const { username } = useParams<{ username: string }>();
  const { data, isFetching } = useQuery({
    queryKey: ["get-gallery-items", username],
    queryFn: () => getGalleryItems(username),
    refetchOnWindowFocus: false,
  });
  const [galleryConfig] = useLocalStorage<GalleryConfigProps>({
    defaultValue: { layout: "messy-grid" },
    key: "gallery-config",
  });

  const [items, setItems] = useState<GalleryItemProps[]>([]);

  useEffect(() => {
    if (data && data?.length !== 0) {
      setItems(data);
    }
  }, [data]);

  return (
    <div className="w-full mt-6 flex flex-col items-center justify-center">
      <h2 className="w-full max-w-2xl  text-left   text-xl font-medium mb-4">
        Gallery
      </h2>
      <motion.div
        initial="hidden"
        animate="visible"
        className={cn(galleryLayouts[galleryConfig.layout].container, "")}
        variants={galleryLayouts[galleryConfig.layout].containerVariants}
      >
        {isFetching
          ? [...Array.from({ length: 6 })].map((_, i) => (
              <motion.div
                key={i}
                custom={i}
                // style={{ aspectRatio: 1 / 2 }}
                className="aspect-square w-full h-f"
                variants={galleryLayouts[galleryConfig.layout].itemVariants}
              >
                <Skeleton
                  className={cn(
                    galleryLayouts[galleryConfig.layout].item,
                    " rounded-3xl bg-neutral-100 dark:bg-dark-border shadow-2xl opacity-100 animate-pulse"
                  )}
                />
              </motion.div>
            ))
          : items.map((item, i) => {
              return (
                <motion.div
                  key={i}
                  custom={i}
                  style={{
                    ...(galleryConfig?.layout === "masonry-grid" && {
                      aspectRatio: item.width / item.height,
                    }),
                  }}
                  whileHover={{
                    ...(galleryConfig.layout === "messy-grid" && {
                      scale: 1.05,
                      x: -10,
                      y: -20,
                      zIndex: 20,
                      rotate: 0,
                    }),
                  }}
                  variants={galleryLayouts[galleryConfig.layout].itemVariants}
                >
                  <GalleryItem item={item} index={i} />
                </motion.div>
              );
            })}
      </motion.div>
    </div>
  );
};

export default Gallery;
// function handleDragEnd(event: DragEndEvent) {
//   const { active, over } = event;
//   if (active.id !== over?.id) {
//     const oldIndex = items.findIndex((item) => item.id === active.id);
//     const newIndex = items.findIndex((item) => item.id === over?.id);
//     setItems(arrayMove(items, oldIndex, newIndex));
//     setActiveItem(null);
//   }
// }
// const handleDragStart = (event: any) => {
//   const draggedItem = items.find((item) => item.id === event.active.id);
//   if (draggedItem)
//     setActiveItem({ item: draggedItem, index: items.indexOf(draggedItem) });
// };
// const sensors = useSensors(
//   useSensor(PointerSensor, {
//     activationConstraint: {
//       delay: 150, // Require 200ms press before drag starts
//       tolerance: 2, // Prevent accidental drags
//     },
//   }),
//   useSensor(KeyboardSensor, {
//     coordinateGetter: sortableKeyboardCoordinates,
//   })
// );

{
  /* </div> */
}
{
  /* <DndContext
  sensors={sensors}
  collisionDetection={closestCenter}
  onDragEnd={handleDragEnd}
  onDragStart={handleDragStart}
>
  <SortableContext items={items} strategy={horizontalListSortingStrategy}> */
}

{
  /* </SortableContext>
  <DragOverlay>
    {activeItem ? <GalleryItem {...activeItem} /> : null}
  </DragOverlay>
</DndContext> */
}
