import { useSections } from "@/lib/context";
import { cn } from "@/lib/utils";
import {
  closestCenter,
  DndContext,
  DragEndEvent,
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
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { motion } from "framer-motion";
import { AlignJustify } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { Checkbox } from "./ui/checkbox";
import { useEffect, useState } from "react";
import { bulkInsertProfileSections } from "@/actions/profile-actions";
import { TSection } from "@/lib/types";

const SectionManager = () => {
  const { sections, setSections } = useSections();
  const [initialSections, setInitialSections] = useState<TSection[] | null>(
    null
  );

  useEffect(() => {
    if (sections.length > 0 && initialSections === null) {
      setInitialSections(sections);
    }
  }, [sections, initialSections]);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        delay: 50,
        tolerance: 2,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (active.id !== over?.id) {
      const oldIndex = sections.findIndex((item) => item.id === active.id);
      const newIndex = sections.findIndex((item) => item.id === over?.id);

      setSections((items) => arrayMove(items, oldIndex, newIndex));
    }
  };

  return (
    <div className="w-full  px-4 flex flex-col items-center justify-center mb-6">
      <Card className="bg-white w-full mt-4 shadow-xl overflow-hidden dark:bg-dark-bg border border-neutral-300/60 dark:border-dark-border/80 rounded-3xl">
        <CardContent>
          <CardHeader className="pb-4 px-0">
            <CardTitle className="text-xl font-medium dark:text-white">
              Manage Sections
            </CardTitle>
            <CardDescription>
              Select the sections you want to display on your profile.You can
              also order them to your liking.
            </CardDescription>
          </CardHeader>
          <div className="mt-3">
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <SortableContext
                strategy={verticalListSortingStrategy}
                items={sections?.map((item) => item.id)}
              >
                {sections?.map((section) => (
                  <SortableItem
                    checked={
                      sections.find((s) => s.id === section.id)
                        ?.enabled as boolean
                    }
                    handleCheck={(id) => {
                      setSections((prevSections) =>
                        prevSections.map((s) =>
                          s.id === id ? { ...s, enabled: !s.enabled } : s
                        )
                      );
                    }}
                    key={section.id}
                    id={section.id}
                    name={section.name}
                  />
                ))}
              </SortableContext>
            </DndContext>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SectionManager;

function SortableItem({
  id,
  name,
  checked,
  handleCheck,
}: {
  id: string;
  name: string;
  checked: boolean;
  handleCheck: (id: string) => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id, disabled: !checked });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <motion.div
      ref={setNodeRef}
      style={style}
      className={cn(
        "p-2 mb-2 w-full flex z-0 items-center justify-between bg-white dark:bg-dark-bg   rounded-lg cursor-pointer",
        isDragging &&
          "drop-shadow-xl z-10 shadow-black/40 border border-neutral-300/80 dark:border-dark-border"
      )}
    >
      <div className="flex items-center justify-center">
        <Checkbox
          className="peer data-[state=checked]:bg-green-400 dark:data-[state=checked]:bg-green-600 dark:data-[state=checked]:text-white/60 rounded-full size-6 border border-neutral-300/80  dark:border-dark-border"
          checked={checked}
          onCheckedChange={() => handleCheck(id)}
        />
        <span className="ml-2 peer-data-[state=unchecked]:line-through select-none peer-data-[state=unchecked]:opacity-70 opacity-80">
          {name}
        </span>
      </div>
      <button {...attributes} {...listeners}>
        <AlignJustify strokeWidth={1.4} className="size-4" />
      </button>
    </motion.div>
  );
}
