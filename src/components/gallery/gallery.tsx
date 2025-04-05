import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { Plus } from "lucide-react";
import Image from "next/image";
import { FC } from "react";
import { ScrollArea, ScrollBar } from "../ui/scroll-area";
import { Skeleton } from "../ui/skeleton";
import {
  mansoryGridItemVariants,
  mansoryGridVariants,
  messyGridItemVariants,
  messyGridVariants,
} from "./gallery-config";
import GalleryItem from "./gallery-item";
import { GalleryItemProps } from "@/lib/types";
import { getGalleryItems } from "@/actions/gallery-actions";
import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";

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
  items: GalleryItemProps[];
};

const Gallery: FC<GalleryProps> = ({ isMine, items }) => {
  const { username } = useParams<{ username: string }>();

  const { data, isLoading } = useQuery({
    queryKey: ["get-gallery-items", username],
    initialData: items,
    queryFn: () => getGalleryItems(username!),
  });

  return (
    <div className="w-full mt-6 flex flex-col items-center justify-center">
      <h2 className="w-full max-w-2xl  text-left   text-xl font-medium mb-4">
        Gallery
      </h2>

      {isLoading ? (
        <GallerySkeleton />
      ) : (
        <motion.div
          initial="hidden"
          animate="visible"
          className={cn(galleryLayouts["masonry-grid"].container!, "")}
          variants={galleryLayouts["masonry-grid"].containerVariants}
        >
          {data.map((item, i) => {
            return (
              <motion.div
                key={i}
                custom={i}
                style={{
                  // ...(galleryConfig?.layout === "masonry-grid" && {
                  aspectRatio: item.width / item.height,
                  // }),
                }}
                variants={galleryLayouts["masonry-grid"].itemVariants}
              >
                <GalleryItem isMine={isMine} item={item} index={i} />
              </motion.div>
            );
          })}
        </motion.div>
      )}
    </div>
  );
};

const GallerySkeleton = () => {
  const ratios = [9 / 16, 1 / 1, 4 / 5, 2 / 3];
  return (
    <div
      className={cn(
        "w-full columns-2 md:columns-3 h-full  max-w-2xl relative",
        ""
      )}
    >
      {[...Array.from({ length: 10 })].map((_, i) => (
        <Skeleton
          key={i}
          style={{
            marginTop: i === 0 ? 0 : 16,
            aspectRatio: ratios[Math.floor(Math.random() * ratios.length)],
          }}
          className={cn(
            galleryLayouts["masonry-grid"].item,
            " rounded-3xl bg-neutral-200 dark:bg-dark-border animate-pulse"
          )}
        />
      ))}
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
