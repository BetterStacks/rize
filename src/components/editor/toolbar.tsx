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
    { icon: <Bold className="size-6" />, format: "bold" },
    { icon: <Underline className="size-6" />, format: "underline" },
    { icon: <Italic className="size-6" />, format: "italic" },
    { icon: <Code2 className="size-6" />, format: "code" },
  ];
  const alignOptions = [
    { name: "Text", icon: <Type className="size-6" />, format: "paragraph" },
    {
      name: "Heading 1",
      icon: <Heading1 className="size-6" />,
      format: "heading",
    },
    {
      name: "Heading 2",
      icon: <Heading2 className="size-6" />,
      format: "heading-two",
    },
    {
      name: "Numbered List",
      icon: <ListOrdered className="size-6" />,
      format: "numbered-list",
    },
    {
      name: "Bullet Points",
      icon: <List className="size-6" />,
      format: "bulleted-list",
    },
    {
      name: "",
      icon: <AlignLeft className="size-6" />,
      format: "left",
    },
    {
      name: "",
      icon: <AlignCenter className="size-6" />,
      format: "center",
    },
    {
      name: "",
      icon: <AlignRight className="size-6" />,
      format: "right",
    },
  ];

  return (
    <div className="w-fit border shadow-xl bg-white/80 dark:bg-[#181818a1] dark:border-dark-border backdrop-blur border-neutral-300 flex items-center justify-center py-1 rounded-lg">
      {/* <div>
        <Select onValueChange={setValue} value={value}>
          <SelectTrigger>
            <SelectValue>{value}</SelectValue>
          </SelectTrigger>
          <SelectContent>
            {listOptions.map((list, i) => {
              const isActive = isBlockActive(
                editor,
                list?.format,
                TEXT_ALIGN_TYPES.includes(list?.format) ? "align" : "type"
              );
              return (
                <div key={i} onClick={() => toggleBlock(editor, list.format)}>
                  <SelectItem
                    className="w-full flex items-center justify-start text-lg"
                    value={list?.format}
                  >
                    {list.name}
                  </SelectItem>
                </div>
              );
            })}
          </SelectContent>
        </Select>
      </div> */}
      <div className="flex items-center justify-center ">
        {leafs.map((leaf, i) => {
          const isActive = isMarkActive(editor, leaf?.format);
          return (
            // <div
            // className="border-l first:border-none px-1.5 border-neutral-400/80"
            // >
            <Button
              key={i}
              variant={"ghost"}
              size={"icon"}
              className={cn(isActive && "bg-neutral-200 dark:bg-dark-border")}
              onClick={() => toggleMark(editor, leaf.format)}
            >
              {leaf.icon}
            </Button>
            // </div>
          );
        })}
      </div>
      <div>
        <Button
          variant={"ghost"}
          size={"icon"}
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
          className={cn(
            isBlockActive(editor, "image") &&
              "bg-neutral-200 dark:bg-dark-border"
          )}
        >
          <Image className="size-6" />
        </Button>
        <Button
          variant={"ghost"}
          size={"icon"}
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
          <Video className="size-6" />
        </Button>
      </div>
      <div className="flex items-center justify-center  ">
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
              size={"icon"}
              className={cn(isActive && "bg-neutral-200 dark:bg-dark-border")}
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
