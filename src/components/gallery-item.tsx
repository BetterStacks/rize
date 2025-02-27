import { useGridtems, useMap } from "@/lib/context";
import { Item } from "@/lib/types";
import { cn } from "@/lib/utils";
import {
  Link2,
  RectangleHorizontal,
  RectangleVertical,
  Square,
  Trash2,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { forwardRef, RefObject, useMemo, useState } from "react";
import { Button } from "./ui/button";
// import { sizes } from "./gallery";

interface GalleryItemProps extends React.HTMLAttributes<HTMLDivElement> {
  item: Item;
  activeBreakPoint: string;
}

const itemSizes = {
  "square-sm": {
    icon: <Square className="size-2" />,
  },
  "rectangle-horizontal": {
    icon: <RectangleHorizontal size={20} />,
  },
  "rectangle-vertical": {
    icon: <RectangleVertical size={20} />,
  },
  "square-large": {
    icon: <Square size={20} />,
  },
};

const GalleryItem = forwardRef<HTMLDivElement, GalleryItemProps>(
  (
    {
      style,
      className,
      onMouseDown,
      onMouseUp,
      onTouchEnd,
      children,
      ...props
    },
    ref
  ) => {
    const { item, activeBreakPoint } = props;
    const map = useMap();
    const { setItems } = useGridtems();
    const [hoveredNode, setHoveredNode] = useState<string | null>(null);
    const itemInMap = useMemo(() => map.get(item.i), [item?.i]);

    return (
      <div
        style={{ ...style }}
        ref={ref}
        onMouseDown={onMouseDown}
        onMouseUp={onMouseUp}
        onTouchEnd={onTouchEnd}
        onMouseEnter={() => setHoveredNode(item.i)}
        onMouseLeave={() => setHoveredNode(null)}
        className={cn(
          " border-2 select-none p-3 relative rounded-3xl  bg-white",
          hoveredNode === item.i && "z-40",
          itemInMap?.type === "link" && "cursor-pointer",
          itemInMap?.type === "image" && "cursor-pointer p-0"
        )}
      >
        {itemInMap?.type === "link" && (
          <>
            <Link target="_blank" href={itemInMap?.url as string}>
              <div className="p-2 w-fit rounded-xl border border-neutral-300">
                <Link2 className="-rotate-45 size-4 opacity-80" />
              </div>
            </Link>
            <h3 className="mt-2 font-medium tracking-tight leading-tight">
              {itemInMap?.title}
            </h3>
          </>
        )}
        {itemInMap?.type === "image" && (
          <div className="w-full  h-full relative overflow-hidden rounded-3xl ">
            <Image
              draggable={false}
              src={itemInMap.url!}
              className="select-none"
              style={{ objectFit: "fill" }}
              fill
              alt=""
            />
          </div>
        )}
        {itemInMap?.type === "text" && (
          <div className="w-full h-full py-3">
            <span className="font-medium text-lg tracking-tight leading-tight">
              {itemInMap.text}
            </span>
          </div>
        )}
        {hoveredNode === item.i && !item.static && (
          <>
            <button
              onClick={() => {
                const id = item.i;
                setItems((prev) => prev.filter((i) => i.i !== item.i));
                map.remove(id);
              }}
              className="p-1.5 rounded-full absolute  -top-1 -right-2 bg-black"
            >
              <Trash2 strokeWidth={2.8} className="stroke-white size-4" />
            </button>
            <div className="absolute  rounded-2xl -bottom-8 scale- right-0 left-0 w-fit space-x-1 p-1 bg-black ">
              {Object.entries(itemSizes).map(([key, { icon }]) => (
                <Button key={key} size={"sm"} className="rounded-xl">
                  {icon}
                </Button>
              ))}
            </div>
          </>
        )}
        {/* {item.i} */}
      </div>
    );
  }
);

export default GalleryItem;
