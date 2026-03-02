"use client";

import { createPost } from "@/actions/post-actions";
import { queryClient } from "@/lib/providers";
import { TUploadFilesResponse } from "@/lib/types";
import { cn, isValidUrl } from "@/lib/utils";
import { useMutation } from "@tanstack/react-query";
import axios from "axios";
import {
    Bold,
    Italic,
    Link2,
    List,
    ListOrdered,
    Loader,
    X,
    Image as ImageIcon,
} from "lucide-react";
import { useSession } from "@/hooks/useAuth";
import Image from "next/image";
import React, { useCallback, useEffect, useState } from "react";
import { useDropzone } from "react-dropzone";
import { toast } from "react-hot-toast";
import { v4 } from "uuid";
import { usePostsDialog } from "../dialog-provider";
import { Button } from "../ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "../ui/sheet";
import { CreativeAvatar } from "../ui/creative-avatar";
import { Separator } from "../ui/separator";

// ── Tiptap ────────────────────────────────────────────────────────────────
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";
import Placeholder from "@tiptap/extension-placeholder";

// ── Types ─────────────────────────────────────────────────────────────────
type MediaFile = {
    id: string;
    url: string;
    type: "image" | "video";
    file: File;
};

// ── Editor Toolbar ────────────────────────────────────────────────────────
const Toolbar = ({ editor }: { editor: ReturnType<typeof useEditor> }) => {
    const [linkModal, setLinkModal] = useState(false);
    const [linkUrl, setLinkUrl] = useState("");

    if (!editor) return null;

    const applyLink = () => {
        if (!isValidUrl(linkUrl)) {
            toast.error("Invalid URL");
            return;
        }
        editor.chain().focus().extendMarkRange("link").setLink({ href: linkUrl }).run();
        setLinkModal(false);
        setLinkUrl("");
    };

    return (
        <div className="flex items-center gap-1 flex-wrap relative">
            <Button
                type="button"
                size="smallIcon"
                variant={editor.isActive("bold") ? "default" : "ghost"}
                onClick={() => editor.chain().focus().toggleBold().run()}
                title="Bold"
            >
                <Bold className="size-3.5" />
            </Button>
            <Button
                type="button"
                size="smallIcon"
                variant={editor.isActive("italic") ? "default" : "ghost"}
                onClick={() => editor.chain().focus().toggleItalic().run()}
                title="Italic"
            >
                <Italic className="size-3.5" />
            </Button>
            <Button
                type="button"
                size="smallIcon"
                variant={editor.isActive("bulletList") ? "default" : "ghost"}
                onClick={() => editor.chain().focus().toggleBulletList().run()}
                title="Bullet List"
            >
                <List className="size-3.5" />
            </Button>
            <Button
                type="button"
                size="smallIcon"
                variant={editor.isActive("orderedList") ? "default" : "ghost"}
                onClick={() => editor.chain().focus().toggleOrderedList().run()}
                title="Ordered List"
            >
                <ListOrdered className="size-3.5" />
            </Button>
            <Button
                type="button"
                size="smallIcon"
                variant={editor.isActive("link") ? "default" : "ghost"}
                onClick={() => setLinkModal((v) => !v)}
                title="Link"
            >
                <Link2 className="size-3.5 -rotate-45" />
            </Button>
            {editor.isActive("link") && (
                <Button
                    type="button"
                    size="smallIcon"
                    variant="ghost"
                    onClick={() => editor.chain().focus().unsetLink().run()}
                    title="Remove Link"
                >
                    <X className="size-3.5" />
                </Button>
            )}

            {linkModal && (
                <div className="absolute top-8 left-0 z-50 flex gap-2 items-center bg-white dark:bg-dark-bg border border-neutral-200 dark:border-dark-border rounded-xl shadow-lg p-2">
                    <input
                        autoFocus
                        type="url"
                        value={linkUrl}
                        onChange={(e) => setLinkUrl(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && applyLink()}
                        placeholder="https://..."
                        className="text-sm px-2 py-1 bg-transparent border border-neutral-200 dark:border-dark-border rounded-lg focus:outline-none w-52"
                    />
                    <Button size="sm" type="button" onClick={applyLink}>Add</Button>
                    <Button size="sm" type="button" variant="ghost" onClick={() => setLinkModal(false)}>
                        <X className="size-3" />
                    </Button>
                </div>
            )}
        </div>
    );
};

// ── Main Component ────────────────────────────────────────────────────────
const PostDrawer = () => {
    const [open, setOpen] = usePostsDialog();
    const session = useSession();
    const data = session?.data?.user;
    const [mediaFile, setMediaFile] = useState<MediaFile | undefined>();

    const editor = useEditor({
        immediatelyRender: false,
        extensions: [
            StarterKit,
            Link.configure({ openOnClick: false, autolink: true }),
            Placeholder.configure({ placeholder: "What's on your mind?" }),
        ],
        editorProps: {
            attributes: {
                class:
                    "prose prose-sm dark:prose-invert max-w-none min-h-[140px] focus:outline-none px-1",
            },
        },
    });

    // Reset on open
    useEffect(() => {
        if (open) {
            editor?.commands.clearContent();
            setMediaFile(undefined);
        }
    }, [open, editor]);

    const onDrop = useCallback((acceptedFiles: File[]) => {
        const f = acceptedFiles[0];
        if (!f) return;
        setMediaFile({
            id: v4(),
            url: URL.createObjectURL(f),
            type: f.type.startsWith("image") ? "image" : "video",
            file: f,
        });
    }, []);

    const { getRootProps, getInputProps, open: openDropZone } = useDropzone({
        onDrop,
        multiple: false,
        noClick: true,
        noKeyboard: true,
        accept: {
            "image/*": [".png", ".jpg", ".jpeg", ".gif", ".webp"],
            "video/*": [".mp4", ".webm", ".mov"],
        },
    });

    const handlePost = async () => {
        const html = editor?.getHTML() ?? "";
        // strip tags to get plain text length
        const textOnly = html.replace(/<[^>]+>/g, "").trim();

        let uploadedMedia: TUploadFilesResponse | undefined;
        if (mediaFile) {
            const fd = new FormData();
            fd.append("files", mediaFile.file);
            fd.append("folder", "fyp-stacks/posts");
            const res = await axios.post("/api/upload/files", fd);
            if (res.status !== 200) throw new Error("Upload failed");
            const [resp] = res.data?.data as TUploadFilesResponse[];
            uploadedMedia = { url: resp.url, height: resp.height, width: resp.width };
        }

        await createPost({
            content: textOnly.length > 0 ? html : undefined,
            file: uploadedMedia,
        });
    };

    const canPublish = () => {
        const html = editor?.getHTML() ?? "";
        const textOnly = html.replace(/<[^>]+>/g, "").trim();
        return textOnly.length > 5 || !!mediaFile;
    };

    const { isPending, mutate } = useMutation({
        mutationFn: handlePost,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["get-user-posts"] });
            queryClient.invalidateQueries({ queryKey: ["explore-feed"] });
            toast.success("Post published!");
            setOpen(false);
        },
        onError: () => toast.error("Error creating post"),
        mutationKey: ["create-post"],
    });

    return (
        <Sheet open={open} onOpenChange={setOpen}>
            <SheetContent
                side="right"
                className="w-full sm:max-w-lg flex flex-col p-0 dark:bg-dark-bg bg-white border-l border-neutral-200 dark:border-dark-border [&>button:first-of-type]:hidden"
            >
                {/* Header */}
                <SheetHeader className="px-6 pt-6 pb-4 border-b border-neutral-100 dark:border-dark-border">
                    <div className="flex items-center justify-between">
                        <SheetTitle className="text-base font-semibold tracking-tight">
                            Create Post
                        </SheetTitle>
                        <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => setOpen(false)}
                            className="rounded-full"
                        >
                            <X className="size-4" />
                        </Button>
                    </div>
                </SheetHeader>

                {/* Body */}
                <div {...getRootProps()} className="flex-1 overflow-y-auto px-6 py-4 flex flex-col gap-4">
                    <input {...getInputProps()} />

                    {/* Author row */}
                    <div className="flex items-center gap-3">
                        <CreativeAvatar
                            src={(data as any)?.profileImage || data?.image}
                            name={data?.name || "You"}
                            size="sm"
                            variant="auto"
                            showHoverEffect={false}
                        />
                        <div className="flex flex-col leading-tight">
                            <span className="text-sm font-medium">{data?.name}</span>
                            <span className="text-xs text-neutral-400">@{(data as any)?.username}</span>
                        </div>
                    </div>

                    <Separator className="dark:bg-dark-border" />

                    {/* Toolbar */}
                    <Toolbar editor={editor} />

                    {/* Editor */}
                    <div className="rounded-xl border border-neutral-200 dark:border-dark-border bg-neutral-50 dark:bg-dark-border/30 px-3 py-2 min-h-[160px] cursor-text"
                        onClick={() => editor?.commands.focus()}
                    >
                        <EditorContent editor={editor} />
                    </div>

                    {/* Media preview */}
                    {mediaFile && (
                        <div className="relative w-full rounded-xl overflow-hidden border border-neutral-200 dark:border-dark-border group">
                            <Button
                                size="smallIcon"
                                variant="outline"
                                type="button"
                                className="absolute top-2 right-2 z-10 dark:bg-dark-bg opacity-0 group-hover:opacity-100 transition-opacity"
                                onClick={() => setMediaFile(undefined)}
                            >
                                <X className="size-3" />
                            </Button>
                            {mediaFile.type === "image" ? (
                                <Image
                                    src={mediaFile.url}
                                    alt="Preview"
                                    width={600}
                                    height={400}
                                    className="w-full max-h-64 object-cover"
                                    unoptimized
                                />
                            ) : (
                                <video src={mediaFile.url} className="w-full max-h-64 object-cover" controls />
                            )}
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="px-6 py-4 border-t border-neutral-100 dark:border-dark-border flex items-center justify-between gap-2">
                    <Button
                        size="icon"
                        variant="ghost"
                        className="rounded-full"
                        disabled={isPending}
                        onClick={openDropZone}
                        title="Add media"
                    >
                        <ImageIcon strokeWidth={1.4} className="size-5 opacity-80" />
                    </Button>

                    <div className="flex items-center gap-2">
                        <Button size="sm" variant="ghost" className="rounded-full px-4" onClick={() => setOpen(false)}>
                            Cancel
                        </Button>
                        <Button
                            size="sm"
                            className="rounded-full px-5"
                            disabled={isPending || !canPublish()}
                            onClick={() => mutate()}
                        >
                            {isPending && <Loader className="size-3.5 mr-1.5 animate-spin" />}
                            Publish
                        </Button>
                    </div>
                </div>
            </SheetContent>
        </Sheet>
    );
};

export default PostDrawer;
