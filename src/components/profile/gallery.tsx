import { getGalleryItems } from "@/lib/server-actions";
import { GalleryItemProps } from "@/lib/types";
import { cn } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import GalleryItem from "./gallery-item";

const Gallery = () => {
  const { data } = useQuery({
    queryKey: ["get-gallery-items"],
    queryFn: getGalleryItems,
  });

  const [items, setItems] = useState<GalleryItemProps[]>([]);

  useEffect(() => {
    if (data && data?.length !== 0) {
      setItems(data);
    }
  }, [data]);

  return (
    <div className="w-full mt-8 flex flex-col items-center justify-center">
      <h2 className="w-full max-w-2xl px-4  text-left   text-xl font-medium mb-4">
        Gallery
      </h2>
      <div
        className={cn(
          // "w-full columns-3 mt-6 relative"
          "flex flex-wrap gap-2 w-full -space-x-2 mt-6 -space-y-4 items-center justify-center"
        )}
      >
        {items &&
          items.map((item, i) => {
            return <GalleryItem key={item?.id} item={item} index={i} />;
          })}
      </div>
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
