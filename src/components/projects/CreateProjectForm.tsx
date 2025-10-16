"use client";

import { uploadMedia } from "@/actions/client-actions";
import { createProject } from "@/actions/project-actions";
import { DateRangePicker } from "@/components/sidebar/components/DateRangePicker";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { useActiveSidebarTab } from "@/lib/context";
import { toIsoString } from "@/lib/date";
import { newProjectSchema } from "@/lib/types";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Loader, Plus, X } from "lucide-react";
import Image from "next/image";
import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { z } from "zod";

export const ProjectSchema = z.object({
  name: z.string().min(1, "Project name is required"),
  tagline: z
    .string()
    .min(1, "Tagline is required")
    .max(60, "Tagline must not exceed 60 characters"),
  url: z.string().url("Invalid URL"),
  description: z.string().optional(),
  // DateRangePicker stores ISO strings; coerce strings to Date for validation
  startDate: z.preprocess(
    (v) => (v ? new Date(v as string) : undefined),
    z.date().optional()
  ),
  endDate: z.preprocess(
    (v) => (v ? new Date(v as string) : undefined),
    z.date().optional()
  ),
});

type FormData = z.infer<typeof ProjectSchema>;

type CreateProjectFormProps = {
  username: string;
};

export default function CreateProjectForm({
  username,
}: CreateProjectFormProps) {
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [attachments, setAttachments] = useState<File[]>([]);
  const queryClient = useQueryClient();
  const setActiveTab = useActiveSidebarTab()[1];
  const form = useForm<FormData>({
    resolver: zodResolver(ProjectSchema),
    defaultValues: {
      name: "",
      url: "",
      description: "",
      startDate: new Date(),
      endDate: undefined,
    },
  });

  const { getRootProps, getInputProps } = useDropzone({
    onDrop: useCallback((files: File[]) => {
      setLogoFile(files[0]);
    }, []),
    multiple: false,
    accept: { "image/*": [] },
  });

  const { getRootProps: getAttachRoot, getInputProps: getAttachInput } =
    useDropzone({
      onDrop: useCallback((files: File[]) => {
        setAttachments((prev) => [...prev, ...files].slice(0, 4));
      }, []),
      multiple: true,
      accept: { "image/*": [], "video/*": [] },
    });

  const { mutateAsync: mutateUpload, isPending } = useMutation({
    mutationFn: uploadMedia,
  });

  const { mutateAsync: mutateCreate } = useMutation({
    mutationFn: createProject,
  });

  const onSubmit = async (data: FormData) => {
    console.log("CreateProjectForm onSubmit called", data);
    try {
      // upload logo if present
      let logoUploaded = null;
      if (logoFile) {
        const fd = new FormData();
        fd.append("files", logoFile);
        fd.append("folder", "fyp-stacks/projects");
        const res = await mutateUpload(fd as any);
        logoUploaded = res?.[0];
      }

      // upload attachments
      const uploadedAttachments: any[] = [];
      for (const f of attachments) {
        const fd = new FormData();
        fd.append("files", f);
        fd.append("folder", "fyp-stacks/projects");
        const res = await mutateUpload(fd as any);
        uploadedAttachments.push(...res);
      }

      let payload: z.infer<typeof newProjectSchema> = {
        name: data.name,
        url: data.url,
        tagline: data.tagline,
        description: data.description || "",
        startDate: toIsoString(data.startDate) ?? new Date().toISOString(),
        endDate: toIsoString(data.endDate),
      };

      if (logoUploaded) {
        payload = {
          ...payload,
          logo: logoUploaded.url,
          width: String(logoUploaded.width),
          height: String(logoUploaded.height),
        };
      }

      if (uploadedAttachments.length > 0) {
        payload.media = uploadedAttachments.map((it: any) => ({
          url: it.url,
          width: it.width,
          height: it.height,
          type: it.type,
        }));
      }

      await mutateCreate(payload, {
        onSuccess: async () => {
          toast.success("Project created");
          setActiveTab({ id: null, tab: "gallery" });
          await queryClient.invalidateQueries({
            queryKey: ["get-projects", username],
          });
        },
        onError: (error) => {
          toast.error(error?.message || "Error creating project");
        },
      });
      // toast.success("Project created");
    } catch (err: any) {
      console.error(err);
      toast.error(err?.message || "Error creating project");
    }
  };

  return (
    <div className="max-w-xl mx-auto p-6">
      <h2 className="text-xl mt-8 tracking-tight font-medium ">
        Tell us more about your project.
      </h2>
      <span className=" text-neutral-700  dark:text-neutral-300 text-sm">
        We’ll need its name, tagline, links, launch tags, and description.
      </span>
      <form onSubmit={form.handleSubmit(onSubmit)} className="mt-6 space-y-4">
        <div className="mt-2 flex items-center justify-start">
          <div
            {...getRootProps()}
            className="border-2 relative border-neutral-200 dark:border-dark-border size-20 aspect-square rounded-full"
          >
            {logoFile ? (
              <>
                <Button
                  size={"smallIcon"}
                  variant={"outline"}
                  type="button"
                  className="dark:bg-dark-bg dark:hover:bg-dark-border absolute size-6 right-0 bottom-0 z-[2]"
                  onClick={() => setLogoFile(null)}
                >
                  <X className="size-3 " />
                </Button>
                <div className="relative rounded-full size-full overflow-hidden">
                  <Image
                    className="object-cover"
                    src={URL.createObjectURL(logoFile)}
                    fill
                    alt="Logo"
                  />
                </div>
              </>
            ) : (
              <>
                <Button
                  size={"smallIcon"}
                  variant={"outline"}
                  className="dark:bg-dark-bg dark:hover:bg-dark-border absolute size-6 bottom-0 right-0 z-[2]"
                  onClick={() => setLogoFile(null)}
                  type="button"
                >
                  <Plus className="size-3 " />
                </Button>
                <input {...getInputProps()} />
              </>
            )}
          </div>
          {/* <div className="space-x-2 ml-4">
            <Button className="rounded-3xl" variant={"outline"}>
              Upload
            </Button>
          </div> */}
        </div>
        <div>
          <Label className="dark:text-neutral-300 text-neutral-700">Name</Label>
          <Input {...form.register("name")} />
          {form.formState.errors.name && (
            <p className="text-sm text-red-500">
              {form.formState.errors.name.message}
            </p>
          )}
        </div>
        <div>
          <Label className="dark:text-neutral-300 text-neutral-700">
            Tagline
          </Label>
          <Input {...form.register("tagline")} />
          {form.formState.errors.tagline && (
            <p className="text-sm text-red-500">
              {form.formState.errors.tagline.message}
            </p>
          )}
        </div>

        <div>
          <Label className="dark:text-neutral-300 text-neutral-700">Link</Label>
          <Input {...form.register("url")} />
          {form.formState.errors.url && (
            <p className="text-sm text-red-500">
              {form.formState.errors.url.message}
            </p>
          )}
        </div>

        <div>
          <Separator className="my-6" />
          <Label className="dark:text-neutral-300 text-neutral-700">
            Description
          </Label>
          <Textarea rows={6} {...form.register("description")} />
        </div>
        <DateRangePicker
          control={form.control}
          startName="startDate"
          endName="endDate"
          className="mt-4 grid grid-cols-2 gap-4"
        />

        <div>
          <Separator className="my-6" />
          <div
            {...getAttachRoot()}
            className="border-dashed h-[250px] dark:bg-dark-bg dark:border-dark-border bg-neutral-50 flex flex-col items-center justify-center border-2 p-4 rounded-lg "
          >
            {/* <Button variant="outline" className="mb-2 rounded-lg">
              <Upload className="size-4 opacity-80 mr-2" /> Upload
            </Button> */}
            <h3 className="dark:text-neutral-200">
              Choose Images & Video drag & drop files here
            </h3>
            <span className="text-sm dark:text-neutral-400">
              JPG, PNG, GIF, MP4 up to 10MB each
            </span>
            <input {...getAttachInput()} />
          </div>
          <div className="w-full flex flex-row items-center justify-start gap-4 mt-4 overflow-x-auto">
            {attachments.map((f, i) => (
              <div
                key={i}
                className="relative border border-neutral-200 dark:border-dark-border overflow-hidden rounded-xl size-32"
              >
                <Button
                  size={"smallIcon"}
                  variant={"outline"}
                  type="button"
                  onClick={() => {
                    setAttachments((prev) =>
                      prev.filter((_, index) => index !== i)
                    );
                  }}
                  className="dark:bg-dark-bg dark:hover:bg-dark-border absolute size-6 right-1 top-1 z-[2]"
                >
                  <X className="size-3" />
                </Button>
                {f.type.startsWith("image/") ? (
                  <Image
                    src={URL.createObjectURL(f)}
                    alt={f.name}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <video
                    src={URL.createObjectURL(f)}
                    className="size-full object-cover"
                  />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* <div className="flex justify-end"> */}
        <Button
          type="submit"
          variant={"outline"}
          className="w-full rounded-md "
          disabled={isPending}
        >
          {isPending ? (
            <span className="flex items-center gap-2">
              <Loader className="size-4 animate-spin" /> Saving...
            </span>
          ) : (
            "Create Project"
          )}
        </Button>
        {/* </div> */}
      </form>
    </div>
  );
}
