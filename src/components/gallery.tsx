"use client";

// import "react-grid-layout/css/styles.css";
// import "react-resizable/css/styles.css";
import { layout, useGridtems, useMap } from "@/lib/context";
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
import { useEffect, useMemo, useState } from "react";
import { Responsive, WidthProvider } from "react-grid-layout";
import { Button } from "./ui/button";
import { useLocalStorage } from "@mantine/hooks";

const breakpoints = {
  sm: 768,
  xs: 480,
  xxs: 0,
};

const cols = {
  md: 6,
  sm: 4,
  xs: 2,
  xxs: 2,
};

const sizes = {
  sm: {
    "square-sm": { w: 1, h: 2 },
    "square-large": { w: 2, h: 4 },
    "rectangle-horizontal": { w: 3, h: 2 },
    "rectangle-vertical": { w: 1, h: 4 },
  },
  xs: {
    "square-sm": { w: 1, h: 2 },
    "square-large": { w: 1, h: 3 },
    "rectangle-horizontal": { w: 3, h: 2 },
    "rectangle-vertical": { w: 2, h: 4 },
  },
  xxs: {
    "square-sm": { w: 1, h: 2 },
    "square-large": { w: 1, h: 3 },
    "rectangle-horizontal": { w: 3, h: 2 },
    "rectangle-vertical": { w: 2, h: 4 },
  },
};

const Gallery = () => {
  const [__, setStoredLayout] = useLocalStorage({ key: "layout" });
  const [_, setStoredMap] = useLocalStorage({ key: "map" });
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);
  const map = useMap();
  const ResponsiveReactGridLayout = useMemo(
    () => WidthProvider(Responsive),
    []
  );
  const { items, setItems } = useGridtems();

  useEffect(() => {
    if (map.map.size === 0) return;
    localStorage.setItem("map", JSON.stringify([...map.map]));

    // console.log({ map });
  }, [map]);
  useEffect(() => {
    if (items.length === 0) {
      setItems(layout);
      return;
    }
    localStorage.setItem("layout", JSON.stringify(items));
  }, [items]);

  const [activeBreakPoint, setActiveBreakPoint] =
    useState<keyof typeof breakpoints>("sm");

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

  return (
    <div className="w-full relative ">
      <ResponsiveReactGridLayout
        className="layout relative w-full "
        breakpoints={breakpoints}
        layouts={{ sm: items }}
        cols={cols}
        margin={[25, 25]}
        rowHeight={80}
        onBreakpointChange={(breakpoint) => {
          console.log({ changes: breakpoint });
          setActiveBreakPoint(breakpoint as any);
        }}
        onLayoutChange={(layout) => setItems(layout)}
        isDraggable={true}
        isResizable={true}
        useCSSTransforms={true}
      >
        {items.map((item) => {
          const itemInMap = map.get(item.i);

          return (
            <div
              onMouseEnter={() => setHoveredNode(item.i)}
              onMouseLeave={() => setHoveredNode(null)}
              key={item.i}
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
              {hoveredNode === item.i && (
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
                      <Button
                        key={key}
                        onClick={() => {
                          const size = sizes[activeBreakPoint] as Record<
                            string,
                            any
                          >;
                          console.log({ activeBreakPoint, size });

                          setItems((prev) =>
                            prev.map((i) =>
                              i.i === item.i
                                ? { ...i, ...size[key as string] }
                                : i
                            )
                          );
                        }}
                        size={"sm"}
                        className="rounded-xl"
                      >
                        {icon}
                      </Button>
                    ))}
                  </div>
                </>
              )}
              {/* {item.i} */}
            </div>
          );
        })}
      </ResponsiveReactGridLayout>
    </div>
  );
};

export default Gallery;

// const GalleryItem = ({ item }: { item: Item }) => {
//   return (
//     <div
//       className={cn(
//         " border-2  border-dashed h-[160px] rounded-2xl bg-white"
//         // isDragging && "bg-gray-600"
//       )}
//     >
//       {item.id}
//     </div>
//   );
// };
