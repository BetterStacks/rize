import { GalleryConfigProps } from "@/lib/types";
import { cn } from "@/lib/utils";
import { useLocalStorage } from "@mantine/hooks";
import { motion } from "framer-motion";
import { Plus } from "lucide-react";
import Image from "next/image";
import { FC } from "react";
import { Skeleton } from "../ui/skeleton";
import {
  mansoryGridItemVariants,
  mansoryGridVariants,
  messyGridItemVariants,
  messyGridVariants,
} from "./gallery-config";
import { useGalleryItems } from "./gallery-context";
import GalleryItem from "./gallery-item";

export const galleryLayouts = {
  "messy-grid": {
    container:
      "flex flex-wrap mt-6 -space-x-6 -space-y-6 w-full  max-w-3xl   items-center justify-center",
    item: "w-[260px] h-[260px]  aspect-square  shadow-2xl ",
    containerVariants: messyGridVariants,
    itemVariants: messyGridItemVariants,
  },
  "masonry-grid": {
    container: "w-full columns-2 md:columns-3  max-w-2xl relative",
    item: "mt-4 first:mt-0 shadow-lg ",
    containerVariants: mansoryGridVariants,
    itemVariants: mansoryGridItemVariants,
  },
};

type GalleryProps = {
  isMine: boolean;
};

const Gallery: FC<GalleryProps> = ({ isMine }) => {
  const [galleryConfig] = useLocalStorage<GalleryConfigProps>({
    defaultValue: { layout: "masonry-grid" },
    key: "gallery-config",
  });

  const { items, isLoading } = useGalleryItems();

  return (
    <div className="w-full mt-6 flex flex-col items-center justify-center">
      <h2 className="w-full max-w-2xl  text-left   text-xl font-medium mb-4">
        Highlights
      </h2>
      <div className="w-full max-w-2xl mb-4 overflow-x-auto flex space-x-3">
        {isMine && (
          <div className="w-full max-w-[170px] flex-shrink-0 aspect-[9/16] border-[2.5px]  border-dashed border-neutral-300/80 dark:border-dark-border h-full relative overflow-hidden rounded-3xl flex items-center justify-center">
            <Plus className="size-8 opacity-80" />
          </div>
        )}
        {items.slice(3, isMine ? 6 : 7).map((item) => (
          <div
            key={item.id}
            style={{ aspectRatio: 9 / 16 }}
            className="w-full max-w-[170px] flex-shrink-0 border border-neutral-200 dark:border-dark-border h-full relative overflow-hidden rounded-3xl"
          >
            {item?.type === "image" ? (
              <Image
                fill
                src={item.url}
                style={{ objectFit: "cover" }}
                alt={""}
              />
            ) : (
              <video
                src={item.url}
                className="w-full h-full object-cover"
                autoPlay
                muted
                loop
              />
            )}
          </div>
        ))}
      </div>
      <h2 className="w-full max-w-2xl  text-left   text-xl font-medium mb-4">
        Gallery
      </h2>
      <motion.div
        initial="hidden"
        animate="visible"
        className={cn(galleryLayouts["masonry-grid"].container!, "")}
        variants={galleryLayouts["masonry-grid"].containerVariants}
      >
        {isLoading
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
                    // ...(galleryConfig?.layout === "masonry-grid" && {
                    aspectRatio: item.width / item.height,
                    // }),
                  }}
                  // whileHover={{
                  //   ...(galleryConfig.layout === "messy-grid" && {
                  //     scale: 1.05,
                  //     x: -10,
                  //     y: -20,
                  //     zIndex: 20,
                  //     rotate: 0,
                  //   }),
                  // }}
                  variants={galleryLayouts["masonry-grid"].itemVariants}
                >
                  <GalleryItem isMine={isMine} item={item} index={i} />
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
