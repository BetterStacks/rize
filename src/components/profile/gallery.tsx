import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import { useQuery } from "@tanstack/react-query";
import { getGalleryItems } from "@/lib/server-actions";
import { cn, isImageUrl } from "@/lib/utils";
import { useQueryState } from "nuqs";
import {
  closestCenter,
  DndContext,
  DragEndEvent,
  DragOverlay,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  arrayMove,
  horizontalListSortingStrategy,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { set } from "zod";
import { GalleryConfigProps, TGalleryItem } from "@/lib/types";
import GalleryItem from "./gallery-item";
import { useLocalStorage, useMediaQuery } from "@mantine/hooks";

type GalleryItemProps = typeof TGalleryItem & { profileId: string };

const Gallery = () => {
  const [config, setConfig] = useLocalStorage<GalleryConfigProps>({
    key: "gallery-config",
    defaultValue: { cols: 4, length: 8 },
  });
  const { data } = useQuery({
    queryKey: ["get-gallery-items"],
    queryFn: getGalleryItems,
  });
  const matches = useMediaQuery("(min-width: 768px)");
  useEffect(() => {
    if (matches) {
      setConfig({ cols: 4, length: 8 });
    } else {
      setConfig({ cols: 2, length: 8 });
    }
  }, [matches]);
  // console.log({ config });
  const [items, setItems] = useState<GalleryItemProps[]>([]);
  const [activeItem, setActiveItem] = useState<{
    index: number;
    item: typeof TGalleryItem;
  } | null>(null);
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
  useEffect(() => {
    if (data && data?.length !== 0) {
      setItems(data);
    }
  }, [data]);
  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (active.id !== over?.id) {
      const oldIndex = items.findIndex((item) => item.id === active.id);
      const newIndex = items.findIndex((item) => item.id === over?.id);
      setItems(arrayMove(items, oldIndex, newIndex));
      setActiveItem(null);
    }
  }
  const handleDragStart = (event: any) => {
    const draggedItem = items.find((item) => item.id === event.active.id);
    if (draggedItem)
      setActiveItem({ item: draggedItem, index: items.indexOf(draggedItem) });
  };

  return (
    <div className="w-full mt-8 flex flex-col items-center justify-center">
      <h2 className="w-full max-w-2xl  text-left   text-xl font-medium mb-4">
        Gallery
      </h2>
      {/* </div> */}
      {/* <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
        onDragStart={handleDragStart}
      >
        <SortableContext items={items} strategy={horizontalListSortingStrategy}> */}
      <div
        className={cn(
          "w-full grid   mt-6 relative",
          config?.cols == 2
            ? "grid-cols-2  max-w-2xl items-center justify-center"
            : config?.cols == 3
            ? "grid-cols-3 max-w-3xl"
            : "grid-cols-4  max-w-4xl"
        )}
      >
        {items &&
          items.map((item, i) => {
            return <GalleryItem key={item?.id} item={item} index={i} />;
          })}
      </div>
      {/* </SortableContext>
        <DragOverlay>
          {activeItem ? <GalleryItem {...activeItem} /> : null}
        </DragOverlay>
      </DndContext> */}
    </div>
  );
};

export default Gallery;

{
  /* {Array.from({ length: 8 }).map((_, i) => {
  return (
    <motion.div
      // onDrop={(e) => {
      //   e.preventDefault();
      //   const text = e.dataTransfer.getData("text");
      //   const { files } = e.dataTransfer;
      //   console.log({ text, files });
      // }}
      key={i}
      style={{
        rotate:
          // i > 4
          //   ? `${(i + 1) % 2 === 0 ? 6 : -6}deg`
          //   :
          `${(i + 1) % 2 === 0 ? -6 : 6}deg`,
      }}
      transition={{ duration: 0.05, type: "spring", stiffness: 100 }}
      whileHover={{ scale: 1.05, zIndex: 20, y: -40, rotate: 0 }}
      className="max-w-xs shadow-2xl aspect-square  relative overflow-hidden  w-full h-[200px] rounded-3xl bg-neutral-100 dark:bg-dark-border -m-2"
    >
      {imgs[i] && (
        <Image
          src={imgs[i]}
          alt=""
          fill
          style={{ objectFit: "cover" }}
        />
      )}
    </motion.div>
  );
})} */
}
