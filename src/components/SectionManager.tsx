'use client'
import { toggleSection, updateSections } from '@/actions/general-actions'
import { useSections } from '@/lib/section-context'
import { cn } from '@/lib/utils'
import {
  closestCenter,
  DndContext,
  DragEndEvent,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core'
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { motion } from 'framer-motion'
import { AlignJustify, Loader } from 'lucide-react'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from './ui/card'
import { Checkbox } from './ui/checkbox'

// Type assertion to fix @dnd-kit/sortable compatibility issue
const SortableContextComponent = SortableContext as any

const SectionManager = () => {
  const { sections, setSections, isFetching } = useSections()
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
  )

  // const togglePayload = useMemo(() => {}, [sections]);

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event
    if (active.id !== over?.id) {
      const oldIndex = sections.findIndex((item) => item.id === active.id)
      const newIndex = sections.findIndex((item) => item.id === over?.id)
      const newSections = arrayMove(sections, oldIndex, newIndex)
      setSections(newSections)
      const slugs = newSections.map((section) => section.id)
      // const togglePayload = newSections.map((slug) => ({
      //   slug: slug.id,
      //   enabled: slug?.enabled,
      // }));
      await updateSections(slugs)
    }
  }

  const handleCheck = async (id: string) => {
    setSections((prevSections) => {
      return prevSections.map((s) =>
        s.id === id ? { ...s, enabled: !s.enabled } : s
      )
    })
    const payload = [{ slug: id }]
    await toggleSection(payload)
  }

  return (
    <div className="w-full  px-2 max-w-sm flex flex-col items-center justify-center mb-6">
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
            {isFetching ? (
              <div className="w-full flex items-center justify-center my-10">
                <Loader className="size-6 opacity-80 animate-spin  text-center " />
              </div>
            ) : (
              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
              >
                <SortableContextComponent
                  strategy={verticalListSortingStrategy}
                  items={sections?.map((item) => item.id)}
                >
                  {sections?.map((section) => (
                    <SortableItem
                      checked={
                        sections.find((s) => s.id === section.id)
                          ?.enabled as boolean
                      }
                      handleCheck={handleCheck}
                      key={section.id}
                      id={section.id}
                      name={section.name}
                    />
                  ))}
                </SortableContextComponent>
              </DndContext>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default SectionManager

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
  } = useSortable({ id, disabled: !checked })
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  return (
    <motion.div
      ref={setNodeRef}
      style={style}
      className={cn(
        'p-2 mb-2 w-full flex z-0 items-center justify-between bg-white dark:bg-dark-bg   rounded-lg cursor-pointer',
        isDragging &&
        'drop-shadow-xl z-10 shadow-black/40 border border-neutral-300/80 dark:border-dark-border'
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
  )
}
