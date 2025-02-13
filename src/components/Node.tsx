import {
  Divide,
  RectangleHorizontal,
  RectangleVertical,
  Square,
  Trash2,
} from "lucide-react";
import React, { FC, SetStateAction, useState } from "react";
import { Button } from "./ui/button";
import { cn } from "@/lib/utils";
import TextareaAutosize from "react-textarea-autosize";
import Image from "next/image";
import { Item } from "@/lib/types";
// import "react-grid-layout/css/styles.css";
// import "react-resizable/css/styles.css";

type TSize = "rect-vertical" | "big-square" | "square" | "rect-horizontal";

type TCellType = "image" | "link" | "text";

type CellProps = {
  id: string;
  item: Item;
  type?: TCellType;
  image?: string | null;
  link?: string | null;
  text?: string | null;
  isHovered: boolean;
  setHoveredNode: (i: string | null) => void;
  setItems: React.Dispatch<SetStateAction<any[]>>;
};

const Cell: FC<CellProps> = (props) => {
  const {
    // size,
    item,
    type,
    isHovered,
    image,
    setItems,
    link,
    text,
    setHoveredNode,
    id,
  } = props;
  const [newText, setNewText] = useState(text);

  const sizes = [
    {
      id: "sqaure-small",
      icon: <Square />,
      onClick: () => {
        setItems((prev) =>
          prev.map((i) => (i.i === id ? { ...i, w: 2, h: 2 } : i))
        );
      },
    },
    {
      id: "rect-vertical",
      icon: <RectangleVertical />,
      onClick: () => {
        setItems((prev) =>
          prev.map((i) => (i.i === id ? { ...i, w: 1, h: 2 } : i))
        );
      },
    },
    {
      id: "rect-horizontal",
      icon: <RectangleHorizontal />,
      onClick: () => {
        setItems((prev) =>
          prev.map((i) => (i.i === id ? { ...i, w: 3, h: 2 } : i))
        );
      },
    },
    {
      id: "sqaure-large",
      icon: <Square />,
      onClick: () => {
        setItems((prev) =>
          prev.map((i) => (i.i === id ? { ...i, w: 4, h: 4 } : i))
        );
      },
    },
  ];
  return (
    <div data-grid={item}>
      <div
        onMouseEnter={() => setHoveredNode(id)}
        onMouseLeave={() => setHoveredNode(null)}
        className={cn(
          " border-2 react-grid-item react-draggable select-none border-dashed relative rounded-2xl bg-neutral-100",
          isHovered && "z-40"
        )}
      >
        {id}
        {/* {type === "image" && (
        <Image
        src={image as string}
          alt="image"
          fill
          style={{ objectFit: "cover" }}
          />
          )}
          {type === "text" && (
            <div>
            <TextareaAutosize
            value={newText!}
            onChange={(e) => setNewText(e.target.value)}
            className="w-full h-full"
            />
            </div>
            )} */}
        {isHovered && (
          <>
            <button
              onClick={() => {
                setItems((prev: any[]) => prev.filter((i) => i.i !== id));
              }}
              className="p-1.5 rounded-full absolute -top-1 -right-2 bg-black"
            >
              <Trash2 strokeWidth={2.8} className="stroke-white size-4" />
            </button>
            <div className="absolute  rounded-2xl -bottom-8 scale-75 right-0 left-0 w-fit space-x-1 p-1 bg-black ">
              {sizes.map((s) => (
                <Button
                  key={s.id}
                  onClick={s.onClick}
                  size={"sm"}
                  className="rounded-xl"
                >
                  {s.icon}
                </Button>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Cell;
