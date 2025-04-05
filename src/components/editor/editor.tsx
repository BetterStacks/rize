"use client";
import { updatePage } from "@/actions/page-actions";
import { ImageElement, TPage, TProfile, VideoElement } from "@/lib/types";
import { cn } from "@/lib/utils";
import { useWindowEvent } from "@mantine/hooks";
import { Dot, Loader, Trash2 } from "lucide-react";
import { useSession } from "next-auth/react";
import Image from "next/image";
import { useParams } from "next/navigation";
import { FC, useCallback, useMemo, useState } from "react";
import toast from "react-hot-toast";
import TextAreaAutosize from "react-textarea-autosize";
import readingTime from "reading-time";
import { createEditor, Editor, Node, Transforms } from "slate";
import { withHistory } from "slate-history";
import {
  Editable,
  ReactEditor,
  useFocused,
  useSelected,
  useSlateStatic,
  withReact,
} from "slate-react";
import { Button } from "../ui/button";
import { Skeleton } from "../ui/skeleton";
import { useEditorState } from "./editor-context";
import { withImages } from "./utils";

type EditorProps = {
  author: Partial<TProfile & { name: string; email: string }>;
};

const RichTextExample = ({ author }: EditorProps) => {
  const session = useSession();
  const { state, setState } = useEditorState();
  const isMyPage = state?.profileId === session?.data?.user?.profileId;
  const params = useParams();
  const [isSaving, setIsSaving] = useState(false);
  const renderElement = useCallback((props: any) => <Element {...props} />, []);
  const renderLeaf = useCallback((props: any) => <Leaf {...props} />, []);
  const editor = useMemo(
    () => withImages(withHistory(withReact(createEditor()))),
    []
  );
  const time = useMemo(() => {
    const editorContent = JSON.parse(state?.content!);
    const stringifiedContent = editorContent
      .map((node: Node) => Node.string(node))
      .join("\n");
    return readingTime(stringifiedContent);
  }, [state?.content]);

  const onSave = async () => {
    const p: typeof TPage = {
      id: params.id as string,
      title: state?.title!,
      content: state?.content!,
    };
    setIsSaving(true);
    const { error, ok } = await updatePage(p);
    if (!ok && error) {
      toast.error(error);
      setIsSaving(false);
      return;
    }
    setIsSaving(false);
    toast.success("Saved successfully");
  };

  const deleteSelectedElement = (editor: Editor) => {
    if (!editor.selection) return; // No selection, nothing to delete

    const [match] = Editor.nodes(editor, {
      match: (n) => Editor.isVoid(editor, n as any), // Find the block element
    });

    if (match) {
      Transforms.removeNodes(editor, { at: editor.selection });
    }
  };

  useWindowEvent("keydown", (event) => {
    if (event?.ctrlKey && event.key === "s") {
      event.preventDefault();
      console.log("saving...");
      onSave();
    }
  });

  return (
    <div className="px-4 ">
      <div className="w-full flex items-center justify-between mb-4">
        <div className="flex items-center justify-start">
          {!author ? (
            <div className="aspect-square size-[60px] rounded-full animate-pulse bg-neutral-300  dark:bg-dark-border" />
          ) : (
            <Image
              src={author?.profileImage as string}
              alt="image"
              width={50}
              height={50}
              className="aspect-square rounded-full"
            />
          )}
          <div className="ml-3 flex flex-col items-start justify-start ">
            {!author ? (
              <>
                <Skeleton className="h-6 w-full rounded-xl animate-pulse bg-neutral-300 dark:bg-dark-border" />
                <Skeleton className="h-4 mt-2 w-full rounded-xl animate-pulse bg-neutral-300 dark:bg-dark-border" />
              </>
            ) : (
              <>
                <h3 className=" text-lg font-medium leading-tight">
                  {author?.displayName}
                </h3>
                <span className="opacity-70  leading-tight">
                  @{author?.username}
                </span>
              </>
            )}
          </div>
        </div>
        {isMyPage && (
          <div className="mb-2">
            <Button variant={"outline"} onClick={onSave}>
              {isSaving && <Loader className="mr-2 animate-spin" />} Save
            </Button>
          </div>
        )}
      </div>
      <TextAreaAutosize
        className="appearance-none bg-transparent text-2xl md:text-3xl tracking-tight font-medium w-full  focus-visible:outline-none resize-none"
        value={state?.title}
        onChange={(e) => setState({ ...state, title: e?.target?.value })}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.preventDefault();
            console.log("called");
            if (editor.children.length === 0) return;
            Transforms.select(editor, {
              anchor: { path: [0, 0], offset: 0 },
              focus: { path: [0, 0], offset: 0 },
            });
            ReactEditor.focus(editor);
          }
        }}
      />
      <div className="mt-2">
        <div className="flex items-center justify-start ">
          <span className="font-medium opacity-80">
            {new Date(state?.createdAt!).toLocaleString("en-US", {
              day: "2-digit",
              year: "numeric",
              month: "long",
            })}
          </span>
          <Dot className="leading-none size-6" />
          <span className="opacity-80">{time!.text}</span>
        </div>
      </div>
      <Editable
        readOnly={!isMyPage}
        renderElement={renderElement}
        renderLeaf={renderLeaf}
        className=" focus-visible:outline-none mt-4 pb-8"
        placeholder="Enter some rich text…"
      />
    </div>
  );
};

const Element = (props: any) => {
  const { attributes, children, element } = props;
  const style = { textAlign: element.align };
  switch (element.type) {
    case "code-block":
      return (
        <pre
          style={style}
          className="border border-neutral-300 dark:border-dark-border"
          {...attributes}
        >
          <code>{children}</code>
        </pre>
      );
    case "title":
      return (
        <h1
          style={style}
          className="text-4xl font-semibold tracking-tight leading-tight mb-2"
          {...attributes}
        >
          {children}
        </h1>
      );
    case "block-quote":
      return (
        <blockquote style={style} {...attributes}>
          {children}
        </blockquote>
      );
    case "bulleted-list":
      return (
        <ul style={style} className="list-inside list-disc" {...attributes}>
          {children}
        </ul>
      );
    case "image":
      return <SlateImage {...props} style={style} />;
    case "video":
      return <SlateVideo {...props} />;
    case "heading":
      return (
        <h1
          style={style}
          className="text-3xl tracking-tight font-semibold opacity-90"
          {...attributes}
        >
          {children}
        </h1>
      );
    case "heading-two":
      return (
        <h2
          style={style}
          className="text-2xl tracking-tight font-medium opacity-90"
          {...attributes}
        >
          {children}
        </h2>
      );
    case "list-item":
      return (
        <li style={style} className="opacity-80" {...attributes}>
          {children}
        </li>
      );
    case "numbered-list":
      return (
        <ol style={style} className="list-inside list-decimal " {...attributes}>
          {children}
        </ol>
      );
    default:
      return (
        <p style={style} {...attributes} className="opacity-80">
          {children}
        </p>
      );
  }
};

const Leaf = ({ attributes, children, leaf }: any) => {
  if (leaf.bold) {
    children = <strong>{children}</strong>;
  }

  if (leaf.code) {
    children = <code>{children}</code>;
  }

  if (leaf.italic) {
    children = <em>{children}</em>;
  }

  if (leaf.underline) {
    children = <u>{children}</u>;
  }

  return <span {...attributes}>{children}</span>;
};

// const BlockButton = ({ format, icon }: any) => {
//   const editor = useSlate();
//   return (
//     <Button
//       variant={"outline"}
//       size={"icon"}
//       className={cn(
//         "",
//         isBlockActive(
//           editor,
//           format,
//           TEXT_ALIGN_TYPES.includes(format) ? "align" : "type"
//         )
//       )}
//       onMouseDown={(event) => {
//         event.preventDefault();
//         toggleBlock(editor, format);
//       }}
//     >
//       {icon}
//     </Button>
//   );
// };

// const MarkButton = ({ format, icon }: any) => {
//   const editor = useSlate();
//   return (
//     <Button
//       variant={"outline"}
//       size={"icon"}
//       className={cn(isMarkActive(editor, format))}
//       onMouseDown={(event) => {
//         event.preventDefault();
//         toggleMark(editor, format);
//       }}
//     >
//       {icon}
//     </Button>
//   );
// };

const SlateImage = (props: any) => {
  const { element, attributes, children, style } = props;
  const editor = useSlateStatic();
  const selected = useSelected();
  const [size, setSize] = useState({ width: 500, height: 450 });
  const focused = useFocused();
  const path = useMemo(
    () => ReactEditor.findPath(editor, element),
    [editor, element]
  );
  const handleRemove = () => {
    Transforms.select(editor, path);
    ReactEditor.focus(editor);
    const [match] = Editor.nodes(editor, {
      match: (n) =>
        Editor.isBlock(editor, n as ImageElement) &&
        (n as ImageElement).type === "image",
    });

    console.log("outside", Array.from(match));
    if (match) {
      console.log("inside", Array.from(match));
      Transforms.removeNodes(editor, { at: path });
    }
  };
  return (
    <div
      {...attributes}
      contentEditable={false}
      className={cn(
        selected && focused && "border-dashed border-[3px] border-indigo-700",
        "rounded-2xl group my-2 transition-all select-none border border-neutral-300 dark:border-dark-border flex relative aspect-auto w-fit h-fit"
      )}
    >
      <Button
        onClick={handleRemove}
        size={"icon"}
        className="absolute group-hover:opacity-100 opacity-0 transition-all cursor-pointer z-10 top-3 left-3 rounded-full"
      >
        <Trash2 />
      </Button>
      <Image
        src={element.url as string}
        width={size.width}
        height={size.height}
        quality={100}
        className="rounded-2xl aspect-auto"
        style={{ objectFit: "cover" }}
        alt=""
      />
    </div>
  );
};
const SlateVideo = (props: any) => {
  const { element, attributes, children, style } = props;
  const editor = useSlateStatic();
  const path = ReactEditor.findPath(editor, element);
  const selected = useSelected();
  const focused = useFocused();

  const handleRemove = () => {
    Transforms.select(editor, path);
    ReactEditor.focus(editor);
    const [match] = Editor.nodes(editor, {
      match: (n) =>
        Editor.isBlock(editor, n as VideoElement) &&
        (n as VideoElement).type === "video",
    });

    console.log("outside", Array.from(match));
    if (match) {
      console.log("inside", Array.from(match));
      Transforms.removeNodes(editor, { at: path });
    }
  };
  return (
    <div
      contentEditable={false}
      style={style}
      {...attributes}
      className={cn(
        selected && focused && "border-dashed border-[3px] border-indigo-700",
        "rounded-2xl group my-2 w-fit aspect-auto  border border-neutral-300 dark:border-dark-border flex cursor-pointer  overflow-hidden relative"
      )}
    >
      <Button
        onClick={handleRemove}
        size={"icon"}
        className="absolute group-hover:opacity-100 opacity-0 transition-all cursor-pointer z-10 top-3 left-3 rounded-full"
      >
        <Trash2 />
      </Button>
      <video
        controls={selected || focused}
        // autoPlay
        className="aspect-auto"
        // style={{ objectFit: "cover" }}
        loop
        width={500}
        muted
      >
        <source
          className="aspect-auto"
          // style={{ objectFit: "cover" }}
          src={element?.url}
        />
        Your browser does not support the video tag.
      </video>
      {children}
    </div>
  );
};

export default RichTextExample;
