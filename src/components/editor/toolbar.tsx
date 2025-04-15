import { cn, isImageUrl, isVideoUrl } from "@/lib/utils";
import {
  AlignCenter,
  AlignLeft,
  AlignRight,
  Bold,
  Code2,
  Heading1,
  Heading2,
  Image,
  Italic,
  List,
  ListOrdered,
  Type,
  Underline,
  Video,
} from "lucide-react";
import React from "react";
import { Editor, Element, Transforms } from "slate";
import { useSlate } from "slate-react";
import { Button } from "../ui/button";
import {
  insertVideo,
  isBlockActive,
  isMarkActive,
  TEXT_ALIGN_TYPES,
  toggleBlock,
  toggleMark,
} from "./utils";
import { ImageElement, VideoElement } from "@/lib/types";
import { Separator } from "../ui/separator";

const Toolbar = () => {
  const editor = useSlate();
  const [value, setValue] = React.useState("paragraph");
  function getActiveBlock() {
    if (!editor.selection) return null;

    const [match] = Editor.nodes(editor, {
      match: (n) => Element.isElement(n) && Editor.isBlock(editor, n),
    });

    return match ? match[0] : null;
  }
  // const e = getActiveBlock();
  // console.log({ e });

  const leafs = [
    {
      icon: <Bold strokeWidth={1.7} className="size-4 opacity-80" />,
      format: "bold",
    },
    {
      icon: <Underline strokeWidth={1.7} className="size-4 opacity-80" />,
      format: "underline",
    },
    {
      icon: <Italic strokeWidth={1.7} className="size-4 opacity-80" />,
      format: "italic",
    },
    {
      icon: <Code2 strokeWidth={1.7} className="size-4 opacity-80" />,
      format: "code",
    },
  ];
  const alignOptions = [
    {
      name: "Text",
      icon: <Type strokeWidth={1.7} className="size-4 opacity-80" />,
      format: "paragraph",
    },
    {
      name: "Heading 1",
      icon: <Heading1 strokeWidth={1.7} className="size-4 opacity-80" />,
      format: "heading",
    },
    {
      name: "Heading 2",
      icon: <Heading2 strokeWidth={1.7} className="size-4 opacity-80" />,
      format: "heading-two",
    },
    {
      name: "Numbered List",
      icon: <ListOrdered strokeWidth={1.7} className="size-4 opacity-80" />,
      format: "numbered-list",
    },
    {
      name: "Bullet Points",
      icon: <List strokeWidth={1.7} className="size-4 opacity-80" />,
      format: "bulleted-list",
    },
    {
      name: "",
      icon: <AlignLeft strokeWidth={1.7} className="size-4 opacity-80" />,
      format: "left",
    },
    {
      name: "",
      icon: <AlignCenter strokeWidth={1.7} className="size-4 opacity-80" />,
      format: "center",
    },
    {
      name: "",
      icon: <AlignRight strokeWidth={1.7} className="size-4 opacity-80" />,
      format: "right",
    },
  ];

  return (
    <div className="w-fit border shadow-xl bg-white/80 dark:bg-[#181818a1] dark:border-dark-border backdrop-blur border-neutral-300 flex items-center justify-center py-1.5 px-2 rounded-lg">
      <div className="flex  gap-x-1 items-center justify-center ">
        {leafs.map((leaf, i) => {
          const isActive = isMarkActive(editor, leaf?.format);
          return (
            <Button
              key={i}
              variant={"ghost"}
              size={"smallIcon"}
              className={cn(
                isActive && "bg-neutral-200 dark:bg-dark-border",
                "rounded-lg"
              )}
              onClick={() => toggleMark(editor, leaf.format)}
            >
              {leaf.icon}
            </Button>
          );
        })}
      </div>
      <div className="flex gap-x-1 items-center justify-center  ">
        <Button
          onClick={() => {
            const url = prompt("Enter the URL");
            if (!url || !isImageUrl(url)) {
              alert("Invalid URL");
              return;
            }
            const text = { text: "" };
            const image: ImageElement = {
              type: "image",
              url,
              children: [text],
            };
            console.log(image);
            Transforms.insertNodes(editor, image);
            Transforms.insertNodes(editor, {
              type: "paragraph",
              children: [{ text: "" }],
            });
          }}
          variant={"ghost"}
          size={"smallIcon"}
          className={cn(
            isBlockActive(editor, "image") &&
              "bg-neutral-200 dark:bg-dark-border",
            "rounded-lg"
          )}
        >
          <Image strokeWidth={1.7} className="size-4 opacity-80" />
        </Button>
        <Button
          variant={"ghost"}
          size={"smallIcon"}
          onClick={() => {
            const url = prompt("Enter the URL");
            if (!url || !isVideoUrl(url)) {
              alert("Invalid URL");
              return;
            }
            insertVideo(editor, url);
            Transforms.insertNodes(editor, {
              type: "paragraph",
              children: [{ text: "" }],
            });
          }}
          className={cn(
            isBlockActive(editor, "video") &&
              "bg-neutral-200 dark:bg-dark-border"
          )}
        >
          <Video strokeWidth={1.7} className="size-4 opacity-80" />
        </Button>
      </div>
      <Separator orientation="vertical" className="w-0.5 h-6 mx-1 " />
      <div className="flex gap-x-1 items-center justify-center  ">
        {alignOptions.map((align, i) => {
          const isActive = isBlockActive(
            editor,
            align?.format,
            TEXT_ALIGN_TYPES.includes(align?.format) ? "align" : "type"
          );
          return (
            // <div className="first:border-l px-1.5  border-neutral-300">
            <Button
              key={i}
              variant={"ghost"}
              size={"smallIcon"}
              className={cn(
                isActive && "bg-neutral-200 dark:bg-dark-border",
                "rounded-lg"
              )}
              onClick={() => toggleBlock(editor, align.format)}
            >
              {align.icon}
            </Button>
            // </div>
          );
        })}
      </div>
    </div>
  );
};

export default Toolbar;
