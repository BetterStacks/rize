"use client";

import { createPost, getTopics } from "@/actions/post-actions";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { RichTextEditor } from "@/components/ui/rich-text-editor";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { TUploadFilesResponse } from "@/lib/types";
import { cn, isValidUrl } from "@/lib/utils";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery } from "@tanstack/react-query";
import axios from "axios";
import Image from "next/image";
import { FC, useEffect, useMemo, useState } from "react";
import { useDropzone } from "react-dropzone";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { z } from "zod";
import { X, Loader, Image as ImageIcon, Hash } from "lucide-react";
import { queryClient } from "@/lib/providers";

const PostSchema = z.object({
  content: z.string().max(5000).optional(),
  link: z.string().url("Invalid URL").optional().or(z.literal("")),
  topicIds: z.array(z.string().uuid()).max(5).optional(),
});

type PostFormData = z.infer<typeof PostSchema>;

type MediaFile = {
  id: string;
  url: string;
  type: "image" | "video";
  file: File;
};

type PostFormProps = {
  onSuccess?: () => void;
};

const stripHtml = (html: string) => html.replace(/<[^>]+>/g, "").trim();

export const PostForm: FC<PostFormProps> = ({ onSuccess }) => {
  const [mediaFile, setMediaFile] = useState<MediaFile | undefined>();
  const [showTopics, setShowTopics] = useState(false);

  const { data: topicsData, isLoading: isTopicsLoading } = useQuery({
    queryKey: ["topics"],
    queryFn: getTopics,
    staleTime: Infinity,
  });
  const topics = topicsData ?? [];

  const form = useForm<PostFormData>({
    resolver: zodResolver(PostSchema),
    defaultValues: {
      content: "",
      link: "",
      topicIds: [],
    },
  });

  useEffect(() => {
    const saved = localStorage.getItem("post-form-draft");
    if (!saved) return;
    try {
      const parsed = JSON.parse(saved);
      form.reset(parsed);
    } catch {
      // ignore
    }
  }, [form]);

  useEffect(() => {
    const subscription = form.watch((value) => {
      localStorage.setItem("post-form-draft", JSON.stringify(value));
    });
    return () => subscription.unsubscribe();
  }, [form]);

  const onDrop = (acceptedFiles: File[]) => {
    if (!acceptedFiles[0]) return;
    const f = acceptedFiles[0];
    setMediaFile({
      id: crypto.randomUUID(),
      url: URL.createObjectURL(f),
      type: f.type.startsWith("image") ? "image" : "video",
      file: f,
    });
  };

  const {
    getRootProps,
    getInputProps,
    open: openDropZone,
    isDragActive,
  } = useDropzone({
    onDrop,
    multiple: false,
    noClick: true,
    noKeyboard: true,
    disabled: !!form.watch("link"),
    accept: {
      "image/*": [".png", ".jpg", ".jpeg", ".gif", ".webp"],
      "video/*": [".mp4", ".webm", ".mov"],
    },
  });

  const contentText = useMemo(
    () => stripHtml(form.watch("content") || ""),
    [form],
  );

  const canPublish = () => {
    const hasFile = !!mediaFile;
    const hasLink = !!form.watch("link");
    if (hasFile && hasLink) return false;
    if (!hasFile && !hasLink) return contentText.length > 5;
    return true;
  };

  const { mutate, isPending } = useMutation({
    mutationFn: async (data: PostFormData) => {
      const link = data.link?.trim() || undefined;
      const content = data.content?.trim() || undefined;
      const topicIds = data.topicIds?.length ? data.topicIds : undefined;

      if (link && !isValidUrl(link)) {
        throw new Error("Invalid URL");
      }
      if (link && mediaFile) {
        throw new Error("Remove link or media to continue");
      }

      let uploadedMedia: TUploadFilesResponse | undefined;
      if (mediaFile) {
        const fd = new FormData();
        fd.append("files", mediaFile.file);
        fd.append("folder", "fyp-stacks/posts");
        const res = await axios.post("/api/upload/files", fd);
        if (res.status !== 200) throw new Error("Upload failed");
        const [resp] = res.data?.data as TUploadFilesResponse[];
        uploadedMedia = {
          url: resp.url,
          height: resp.height,
          width: resp.width,
        };
      }

      await createPost({
        content,
        link,
        file: uploadedMedia,
        topicIds,
      });
    },
    onSuccess: () => {
      toast.success("Post created");
      localStorage.removeItem("post-form-draft");
      form.reset({ content: "", link: "", topicIds: [] });
      setMediaFile(undefined);
      setShowTopics(false);
      queryClient.invalidateQueries({ queryKey: ["get-user-posts"] });
      queryClient.invalidateQueries({ queryKey: ["explore-feed"] });
      onSuccess?.();
    },
    onError: (err: any) => {
      toast.error(err?.message || "Error creating post");
    },
  });

  return (
    <div className="w-full mx-auto p-6">
      <h2 className="text-xl mt-2 tracking-tight font-medium">Create Post</h2>
      <span className="text-neutral-700 dark:text-neutral-300 text-sm">
        Share an update, media, or a link.
      </span>

      <form
        onSubmit={form.handleSubmit((data) => mutate(data))}
        className="mt-6 space-y-4"
      >
        <div>
          <Label className="dark:text-neutral-300 text-neutral-700">
            Content
          </Label>
          <RichTextEditor
            value={form.watch("content") || ""}
            onChange={(val) =>
              form.setValue("content", val, {
                shouldDirty: true,
                shouldTouch: true,
              })
            }
            placeholder="What's on your mind?"
            minHeight="160px"
          />
        </div>

        <div>
          <Label className="dark:text-neutral-300 text-neutral-700">Link</Label>
          <input
            type="url"
            className={cn(
              "mt-1 w-full rounded-md border border-neutral-200 dark:border-dark-border bg-transparent px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-main-yellow",
              form.formState.errors.link && "border-red-500",
            )}
            placeholder="https://example.com"
            {...form.register("link")}
            disabled={!!mediaFile || isPending}
          />
          {!!mediaFile && (
            <p className="text-xs text-neutral-400 mt-1">
              Remove media to add a link.
            </p>
          )}
        </div>

        <Separator className="my-6" />

        <div {...getRootProps()}>
          <div
            className={cn(
              "border-dashed h-[220px] dark:bg-dark-bg dark:border-dark-border bg-neutral-50 border-neutral-200 flex flex-col items-center justify-center border-2 p-4 rounded-lg",
              isDragActive && "border-main-yellow/70 bg-yellow-50/30",
              form.watch("link") && "opacity-50 pointer-events-none",
            )}
          >
            <ImageIcon className="size-6 opacity-70" />
            <h3 className="mt-2 dark:text-neutral-200">
              Add an image or video
            </h3>
            <span className="text-sm text-neutral-700 dark:text-neutral-400">
              JPG, PNG, GIF, MP4 up to 10MB
            </span>
            <input {...getInputProps()} />
          </div>
        </div>

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
              <video
                src={mediaFile.url}
                className="w-full max-h-64 object-cover"
                controls
              />
            )}
          </div>
        )}

        <div className="flex items-center justify-between">
          <Button
            type="button"
            variant={showTopics ? "default" : "outline"}
            onClick={() => setShowTopics((v) => !v)}
            className="rounded-full"
          >
            <Hash className="size-4 mr-2" /> Topics
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={openDropZone}
            className="rounded-full"
            disabled={!!form.watch("link")}
          >
            <ImageIcon className="size-4 mr-2" /> Add Media
          </Button>
        </div>

        {showTopics && (
          <div className="mt-2">
            <p className="text-xs text-neutral-400 mb-2">Add up to 5 topics</p>
            {isTopicsLoading ? (
              <PostFormSkeleton />
            ) : (
              <div className="flex flex-wrap gap-2">
                {topics.map((t: any) => {
                  const active =
                    form.watch("topicIds")?.includes(t.id) ?? false;
                  return (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => {
                        const current = form.getValues("topicIds") || [];
                        if (active) {
                          form.setValue(
                            "topicIds",
                            current.filter((id) => id !== t.id),
                          );
                          return;
                        }
                        if (current.length >= 5) return;
                        form.setValue("topicIds", [...current, t.id]);
                      }}
                      className={cn(
                        "flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium border transition-all",
                        active
                          ? "bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 border-neutral-900 dark:border-white"
                          : "border-neutral-200 dark:border-dark-border text-neutral-600 dark:text-neutral-400 hover:border-neutral-400",
                      )}
                    >
                      {t.emoji && <span>{t.emoji}</span>}
                      {t.name}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        )}

        <Button
          type="submit"
          variant="outline"
          className="w-full rounded-md"
          disabled={isPending || !canPublish()}
        >
          {isPending ? (
            <span className="flex items-center gap-2">
              <Loader className="size-4 animate-spin" /> Publishing...
            </span>
          ) : (
            "Publish"
          )}
        </Button>
      </form>
    </div>
  );
};

const PostFormSkeleton = () => (
  <div className="space-y-2">
    {[...Array(4)].map((_, i) => (
      <Skeleton key={i} className="h-6 w-24 rounded-lg" />
    ))}
  </div>
);
