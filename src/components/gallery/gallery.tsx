import { getGalleryItems } from "@/actions/gallery-actions";
import { GalleryItemProps } from "@/lib/types";
import { cn } from "@/lib/utils";
import {
  closestCenter,
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useQuery } from "@tanstack/react-query";
import { motion, Variants } from "framer-motion";
import { useParams } from "next/navigation";
import { FC, useEffect, useState } from "react";
import { Skeleton } from "../ui/skeleton";
import {
  mansoryGridItemVariants,
  mansoryGridVariants,
  messyGridItemVariants,
  messyGridVariants,
} from "./gallery-config";
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
  items: GalleryItemProps[];
};

const imagesContainerVariants: Variants = {
  hidden: {
    // opacity: 0,
    spacing: -100,
  },
  visible: {
    // opacity: 1,
    spacing: -2,
    transition: {
      staggerChildren: 0.1, // Adjust the stagger duration as needed
    },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, x: 50, rotate: 0 },
  visible: (i) => ({
    opacity: 1,
    x: 0,
    rotate: i % 2 == 0 ? 6 : -6,
    transition: {
      duration: 0.25,
      type: "spring",
      stiffness: 260,
      damping: 20,
    },
  }),
};

const Gallery: FC<GalleryProps> = ({ isMine, items }) => {
  const { username } = useParams<{ username: string }>();

  const { data, isLoading } = useQuery({
    queryKey: ["get-gallery-items", username],
    initialData: items,
    queryFn: () => getGalleryItems(username!),
  });
  const [activeItem, setActiveItem] = useState<GalleryItemProps | null>(null);
  const [sortedItems, setSortedItems] = useState(data || []);

  useEffect(() => {
    setSortedItems(data);
  }, [data]);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        delay: 50, // Require 200ms press before drag starts
        tolerance: 2, // Prevent accidental drags
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (active.id !== over?.id) {
      const oldIndex = sortedItems.findIndex((item) => item.id === active.id);
      const newIndex = sortedItems.findIndex((item) => item.id === over?.id);

      setSortedItems((items) => arrayMove(items, oldIndex, newIndex));
    }
  };
  const handleDragStart = (event: DragStartEvent) => {
    const draggedItem = items.find((item) => item.id === event.active.id);
    if (draggedItem) setActiveItem(draggedItem);
  };

  return (
    <div className="w-full mt-6  flex flex-col items-center justify-center">
      <motion.div className="w-full relative max-w-3xl hidden md:flex items-center justify-center mt-10">
        {isLoading ? (
          <GallerySkeleton />
        ) : (
          // <DndContext
          //   sensors={sensors}
          //   collisionDetection={closestCenter}
          //   onDragEnd={handleDragEnd}
          //   onDragStart={handleDragStart}
          //   onDragCancel={() => setActiveItem(null)}
          // >
          //   <SortableContext
          //     disabled={!isMine}
          //     items={sortedItems?.map((item) => item.id)}
          //   >
          // activeItem && (
          //   <DragOverlay>
          //     <SortableGalleryItem
          //       index={sortedItems?.findIndex(
          //         (item) => item.id === activeItem?.id
          //       )}
          //       isMine={isMine}
          //       item={activeItem}
          //     />
          //   </DragOverlay>
          <motion.div
            variants={imagesContainerVariants}
            initial="hidden"
            animate="visible"
            className="flex items-center justify-center flex-wrap gap-2 -space-x-16 "
          >
            {sortedItems?.map((item, i) => {
              return (
                <SortableGalleryItem
                  key={i}
                  index={i}
                  isMine={isMine}
                  item={item}
                />
              );
            })}
          </motion.div>
          //   </SortableContext>
          // </DndContext>
        )}
      </motion.div>
    </div>
  );
};

const GallerySkeleton = () => {
  return (
    <div
      className={cn(
        "w-full flex items-center justify-center flex-wrap gap-2 -space-x-16 ",
        ""
      )}
    >
      {[...Array.from({ length: 4 })].map((_, i) => (
        <Skeleton
          key={i}
          style={{ borderRadius: "12%" }}
          className={cn(
            "group even:rotate-6 odd:-rotate-6  aspect-square w-full h-full  relative overflow-hidden hover:shadow-2xl  bg-neutral-100 dark:bg-dark-border animate-none shadow-2xl cursor-grab size-56 first:mt-0 active:cursor-grabbing "
          )}
        />
      ))}
    </div>
  );
};

const SortableGalleryItem: FC<{
  item: GalleryItemProps;
  index: number;
  isMine: boolean;
}> = ({ item, index, isMine }) => {
  // const {
  //   attributes,
  //   listeners,
  //   setNodeRef,
  //   transform,
  //   transition,
  //   isDragging,
  // } = useSortable({ id: item.id });

  // const style = {
  //   transform: CSS.Transform.toString(transform),
  //   transition,
  //   zIndex: isDragging ? 50 : "auto",
  // };

  return (
    <motion.div
      style={{ borderRadius: "12%" }}
      // ref={setNodeRef}
      //   {...attributes}
      //   {...listeners}
      variants={itemVariants}
      custom={index}
      whileHover={{
        scale: 1.08,
        x: -10,
        y: -20,
        zIndex: index,
      }}
      className={cn(
        "group aspect-square w-full h-full relative overflow-hidden bg-neutral-100 dark:bg-dark-border cursor-grab size-56 first:mt-0 active:cursor-grabbing"
        // isDragging && "opacity-70"
      )}
    >
      <GalleryItem index={index} isMine={isMine} item={item} />
    </motion.div>
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
