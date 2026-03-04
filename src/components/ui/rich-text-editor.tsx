"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";
import Placeholder from "@tiptap/extension-placeholder";
import Underline from "@tiptap/extension-underline";
import {
    Bold,
    Italic,
    Underline as UnderlineIcon,
    List,
    ListOrdered,
    Link as LinkIcon,
    Unlink
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useCallback, useEffect } from "react";
import { Popover, PopoverContent, PopoverTrigger } from "./popover";
import { Button } from "./button";
import { Input } from "./input";
import { Label } from "./label";
import { useState } from "react";

interface RichTextEditorProps {
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    className?: string; // This will now be applied to the editor content area
    containerClassName?: string; // This applies to the outer wrapper
    minHeight?: string;
    hideToolbar?: boolean;
}

const RichTextEditor = ({
    value,
    onChange,
    placeholder = "Write something...",
    className,
    containerClassName,
    minHeight = "150px",
    hideToolbar = false,
}: RichTextEditorProps) => {
    const [linkUrl, setLinkUrl] = useState("");

    const editor = useEditor({
        extensions: [
            StarterKit.configure({
                heading: false,
            }),
            Underline,
            Link.configure({
                openOnClick: false,
                HTMLAttributes: {
                    class: "text-main-yellow underline cursor-pointer",
                },
            }),
            Placeholder.configure({
                placeholder,
            }),
        ],
        content: value,
        onUpdate: ({ editor }) => {
            onChange(editor.getHTML());
        },
        editorProps: {
            attributes: {
                class: cn(
                    "prose prose-sm dark:prose-invert max-w-none focus:outline-none",
                    className
                ),
                style: `min-height: ${minHeight}`,
            },
        },
        immediatelyRender: false,
    });

    const setLink = useCallback(() => {
        if (linkUrl === "") {
            editor?.chain().focus().extendMarkRange("link").unsetLink().run();
            return;
        }

        editor?.chain().focus().extendMarkRange("link").setLink({ href: linkUrl }).run();
        setLinkUrl("");
    }, [editor, linkUrl]);

    useEffect(() => {
        if (!editor) return;
        const next = value ?? "";
        if (editor.getHTML() !== next) {
            editor.commands.setContent(next);
        }
    }, [editor, value]);

    if (!editor) {
        return null;
    }

    const ToolbarButton = ({
        isActive,
        onClick,
        children,
        label
    }: {
        isActive?: boolean;
        onClick: () => void;
        children: React.ReactNode;
        label: string;
    }) => (
        <Button
            variant="ghost"
            size="sm"
            type="button"
            className={cn(
                "size-8 p-0",
                isActive && "bg-neutral-200 dark:bg-dark-border text-main-yellow"
            )}
            onClick={onClick}
            title={label}
        >
            {children}
        </Button>
    );

    return (
        <div className={cn(
            "w-full rounded-xl overflow-hidden bg-white dark:bg-dark-bg transition-colors group",
            (!containerClassName || !containerClassName.includes('border-none')) && "border border-neutral-200 dark:border-dark-border focus-within:border-main-yellow",
            containerClassName
        )}>
            {!hideToolbar && (
                <div className="flex items-center gap-1 p-1 border-b border-neutral-200 dark:border-dark-border bg-neutral-50/50 dark:bg-dark-bg/50">
                    <ToolbarButton
                        isActive={editor.isActive("bold")}
                        onClick={() => editor.chain().focus().toggleBold().run()}
                        label="Bold"
                    >
                        <Bold className="size-4" />
                    </ToolbarButton>
                    <ToolbarButton
                        isActive={editor.isActive("italic")}
                        onClick={() => editor.chain().focus().toggleItalic().run()}
                        label="Italic"
                    >
                        <Italic className="size-4" />
                    </ToolbarButton>
                    <ToolbarButton
                        isActive={editor.isActive("underline")}
                        onClick={() => editor.chain().focus().toggleUnderline().run()}
                        label="Underline"
                    >
                        <UnderlineIcon className="size-4" />
                    </ToolbarButton>

                    <div className="w-px h-4 bg-neutral-200 dark:bg-dark-border mx-1" />

                    <ToolbarButton
                        isActive={editor.isActive("bulletList")}
                        onClick={() => editor.chain().focus().toggleBulletList().run()}
                        label="Bullet List"
                    >
                        <List className="size-4" />
                    </ToolbarButton>
                    <ToolbarButton
                        isActive={editor.isActive("orderedList")}
                        onClick={() => editor.chain().focus().toggleOrderedList().run()}
                        label="Ordered List"
                    >
                        <ListOrdered className="size-4" />
                    </ToolbarButton>

                    <div className="w-px h-4 bg-neutral-200 dark:bg-dark-border mx-1" />

                    <Popover>
                        <PopoverTrigger asChild>
                            <Button
                                variant="ghost"
                                size="sm"
                                type="button"
                                className={cn(
                                    "size-8 p-0",
                                    editor.isActive("link") && "bg-neutral-200 dark:bg-dark-border text-main-yellow"
                                )}
                            >
                                <LinkIcon className="size-4" />
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-72 p-3 dark:bg-dark-bg dark:border-dark-border" side="bottom" align="start">
                            <div className="flex flex-col gap-2">
                                <Label className="text-xs font-semibold">Add Link</Label>
                                <div className="flex gap-2">
                                    <Input
                                        placeholder="https://example.com"
                                        value={linkUrl}
                                        onChange={(e) => setLinkUrl(e.target.value)}
                                        className="h-8 text-xs dark:bg-dark-bg dark:border-dark-border"
                                        onKeyDown={(e) => e.key === "Enter" && setLink()}
                                    />
                                    <Button size="sm" className="h-8 px-2 text-xs" onClick={setLink}>
                                        Add
                                    </Button>
                                </div>
                                {editor.isActive("link") && (
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="text-xs text-red-500 font-medium hover:text-red-600 self-start p-0 h-auto"
                                        onClick={() => editor.chain().focus().unsetLink().run()}
                                    >
                                        <Unlink className="size-3 mr-1" /> Remove Link
                                    </Button>
                                )}
                            </div>
                        </PopoverContent>
                    </Popover>
                </div>
            )}
            <EditorContent editor={editor} className={cn("p-4", className?.includes('p-') && "p-0")} />
        </div>
    );
};

export { RichTextEditor };
