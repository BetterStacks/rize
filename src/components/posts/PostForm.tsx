"use client";

import { createPost, getTopics } from "@/actions/post-actions";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { RichTextEditor } from "@/components/ui/rich-text-editor";
import { TUploadFilesResponse } from "@/lib/types";
import { cn, isValidUrl } from "@/lib/utils";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery } from "@tanstack/react-query";
import {
  MAX_UPLOAD_BYTES,
  UPLOAD_MESSAGES,
  uploadFiles,
} from "@/lib/prepare-upload";
import Image from "next/image";
import { FC, useEffect, useMemo, useState } from "react";
import { useDropzone } from "react-dropzone";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { z } from "zod";
import {
  X,
  Image as ImageIcon,
  Check,
  ChevronsUpDown,
} from "lucide-react";
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
    if (!f.type.startsWith("image") && f.size > MAX_UPLOAD_BYTES) {
      toast.error(UPLOAD_MESSAGES.videoTooLarge);
      return;
    }
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
    // if (!hasFile && !hasLink) return contentText.length ;
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
        const [resp] = await uploadFiles([mediaFile.file], "fyp-stacks/posts");
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
      queryClient.invalidateQueries({ queryKey: ["get-user-posts"] });
      queryClient.invalidateQueries({ queryKey: ["explore-feed"] });
      onSuccess?.();
    },
    onError: (err: any) => {
      // Upload errors already carry a plain message.
      toast.error(err?.message || "Couldn't create the post. Try again.");
    },
  });

  const selectedTopicIds = form.watch("topicIds") || [];
  const linkValue = form.watch("link");

  return (
    <form
      onSubmit={form.handleSubmit((data) => mutate(data))}
      className="flex min-h-0 flex-1 flex-col"
    >
      <div
        {...getRootProps()}
        className={cn(
          "flex-1 space-y-6 overflow-y-auto px-5 pb-6 pt-4 sm:px-6",
          isDragActive && "bg-subtle",
        )}
      >
        <input {...getInputProps()} />

        <div>
          {/* The editor is a contenteditable inside ui/; the sheet title names it. */}
          <div>
            <RichTextEditor
              value={form.watch("content") || ""}
              onChange={(val) =>
                form.setValue("content", val, {
                  shouldDirty: true,
                  shouldTouch: true,
                })
              }
              placeholder="What are you working on?"
              minHeight="160px"
            />
          </div>
        </div>

        {/* One photo or video, or a link: not both */}
        <div className="space-y-3">
          {mediaFile ? (
            <div className="relative w-full overflow-hidden rounded-xl border border-hairline bg-subtle">
              <Button
                size="smallIcon"
                variant="outline"
                type="button"
                aria-label="Remove photo or video"
                className="absolute right-2 top-2 z-10 rounded-full"
                onClick={() => setMediaFile(undefined)}
              >
                <X className="size-4" aria-hidden />
              </Button>
              {mediaFile.type === "image" ? (
                <Image
                  src={mediaFile.url}
                  alt="Preview of your photo"
                  width={600}
                  height={400}
                  className="max-h-72 w-full object-contain"
                  unoptimized
                />
              ) : (
                <video
                  src={mediaFile.url}
                  className="max-h-72 w-full object-contain"
                  controls
                />
              )}
            </div>
          ) : (
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
              <Button
                type="button"
                variant="outline"
                onClick={openDropZone}
                className="gap-2"
                disabled={!!linkValue || isPending}
              >
                <ImageIcon className="size-4" aria-hidden />
                Add a photo or video
              </Button>
              <span className="text-[13px] text-ink-secondary">
                {linkValue
                  ? "Remove the link to add a photo or video."
                  : "Photos are resized for you. GIFs up to 3.5 MB, videos up to 4 MB."}
              </span>
            </div>
          )}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="post-link">Link</Label>
          <Input
            id="post-link"
            type="url"
            inputMode="url"
            aria-invalid={!!form.formState.errors.link}
            className={cn(form.formState.errors.link && "border-danger")}
            placeholder="https://"
            {...form.register("link")}
            disabled={!!mediaFile || isPending}
          />
          {form.formState.errors.link ? (
            <p className="text-[13px] text-danger">
              {form.formState.errors.link.message}
            </p>
          ) : (
            !!mediaFile && (
              <p className="text-[13px] text-ink-secondary">
                Remove the photo or video to add a link.
              </p>
            )
          )}
        </div>

        <div className="space-y-1.5">
          <Label id="post-topics-label">Topics</Label>
          <Popover>
            <PopoverTrigger asChild>
              <button
                type="button"
                aria-labelledby="post-topics-label"
                className={cn(
                  "flex min-h-11 w-full items-center justify-between gap-2 rounded-xl border border-hairline bg-surface px-3 py-2 text-left text-sm",
                  "transition-colors duration-fast ease-calm hover:border-ink/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink",
                )}
              >
                <span className={cn(selectedTopicIds.length ? "text-ink" : "text-ink-secondary")}>
                  {selectedTopicIds.length
                    ? `${selectedTopicIds.length} of 5 chosen`
                    : "Pick up to 5"}
                </span>
                <ChevronsUpDown className="size-4 shrink-0 text-ink-secondary" aria-hidden />
              </button>
            </PopoverTrigger>
            <PopoverContent
              className="max-h-[300px] w-[var(--radix-popover-trigger-width)] p-0"
              align="start"
            >
              <Command>
                <CommandInput placeholder="Search topics" />
                <CommandList className="max-h-[240px] overflow-y-auto">
                  <CommandEmpty>No topics match.</CommandEmpty>
                  <CommandGroup>
                    {isTopicsLoading ? (
                      <div className="p-3 text-sm text-ink-secondary">
                        Loading topics
                      </div>
                    ) : (
                      topics
                        .filter(
                          (topic: any) =>
                            !selectedTopicIds.includes(topic.id),
                        )
                        .map((topic: any) => (
                          <CommandItem
                            className="rounded-lg"
                            key={topic.id}
                            value={topic.name}
                            onSelect={() => {
                              const current = form.getValues("topicIds") || [];
                              if (!current.includes(topic.id)) {
                                if (current.length >= 5) {
                                  toast.error("You can pick up to 5 topics");
                                  return;
                                }
                                form.setValue("topicIds", [
                                  ...current,
                                  topic.id,
                                ]);
                              }
                            }}
                          >
                            <Check className="mr-2 size-4 opacity-0" aria-hidden />
                            {topic.name}
                          </CommandItem>
                        ))
                    )}
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
          {selectedTopicIds.length > 0 && (
            <ul className="flex flex-wrap gap-1.5 pt-1" aria-label="Chosen topics">
              {selectedTopicIds.map((topicId) => {
                const topic = topics.find((t: any) => t.id === topicId);
                return (
                  <li
                    key={topicId}
                    className="inline-flex h-8 items-center gap-1 rounded-full border border-hairline bg-surface pl-3 pr-1 text-[13px] text-ink"
                  >
                    {topic?.name}
                    <button
                      type="button"
                      aria-label={`Remove ${topic?.name ?? "topic"}`}
                      className="touch-target inline-flex size-6 items-center justify-center rounded-full text-ink-secondary hover:bg-subtle hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink"
                      onClick={() => {
                        const current = form.getValues("topicIds") || [];
                        form.setValue(
                          "topicIds",
                          current.filter((id) => id !== topicId),
                        );
                      }}
                    >
                      <X className="size-3.5" aria-hidden />
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
          {form.formState.errors.topicIds && (
            <p className="text-[13px] text-danger">
              {form.formState.errors.topicIds.message}
            </p>
          )}
        </div>
      </div>

      <div className="flex items-center justify-end gap-3 border-t border-hairline bg-ground px-5 py-4 sm:px-6">
        <Button
          type="submit"
          variant="brand"
          size="lg"
          className="w-full sm:w-auto sm:min-w-32"
          loading={isPending}
          disabled={isPending || !canPublish()}
        >
          {isPending ? "Publishing" : "Publish"}
        </Button>
      </div>
    </form>
  );
};
