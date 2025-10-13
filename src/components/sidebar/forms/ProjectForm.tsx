"use client";

import { uploadMedia } from "@/actions/client-actions";
import {
  createProject,
  getProjectByID,
  updateProject,
} from "@/actions/project-actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { useActiveSidebarTab } from "@/lib/context";
import { queryClient } from "@/lib/providers";
import { cn, isEqual } from "@/lib/utils";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Loader, Paperclip, Upload, X } from "lucide-react";
import { useSession } from "@/lib/auth-client";
import Image from "next/image";
import { FC, useCallback, useEffect, useMemo, useState } from "react";
import { useDropzone } from "react-dropzone";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { z } from "zod";
import { DateRangePicker } from "../components/DateRangePicker";
import { FormCard } from "../components/FormCard";

const ProjectSchema = z.object({
  name: z.string().min(1, "Project name is required"),
  url: z.string().url("Invalid URL"),
  description: z.string().optional(),
  // logo is optional now
  logo: z.string().optional(),
  startDate: z.date().optional(),
  endDate: z.date().optional(),
});

type ProjectFormData = z.infer<typeof ProjectSchema>;

interface ProjectFormProps {
  id: string | null;
}

export const ProjectForm: FC<ProjectFormProps> = ({ id }) => {
  const session = useSession();
  const tab = useActiveSidebarTab()[0];
  const mode = id ? "edit" : "create";

  const [logoFile, setLogoFile] = useState<File | undefined>();
  const [attachments, setAttachments] = useState<File[]>([]);
  const [existingAttachments, setExistingAttachments] = useState<
    Array<{
      id: string;
      url: string;
      type: string;
      width: number;
      height: number;
    }>
  >([]);
  const [removeMediaIds, setRemoveMediaIds] = useState<
    { id: string; url: string }[]
  >([]);

  // Fetch existing project data
  const { data: defaultValues, isLoading: isFetchingValues } = useQuery({
    queryKey: ["get-project-by-id", id],
    enabled: !!id,
    queryFn: () => getProjectByID(id as string),
  });

  const form = useForm<ProjectFormData>({
    resolver: zodResolver(ProjectSchema),
  });

  const logo = form.watch("logo");
  const startDate = form.watch("startDate");

  // Reset form when data changes
  useEffect(() => {
    if (mode === "edit" && defaultValues) {
      // populate existing attachments and clear removals
      // setExistingAttachments(defaultValues?.attachments || []);
      setRemoveMediaIds([]);
      form.reset({
        name: defaultValues.name,
        url: defaultValues.url as string,
        description: defaultValues.description || "",
        endDate: defaultValues.endDate
          ? new Date(defaultValues.endDate)
          : undefined,
        startDate: defaultValues.startDate
          ? new Date(defaultValues.startDate)
          : undefined,
        logo: defaultValues.logo || "",
      });
    } else if (mode === "create") {
      form.reset({
        name: "",
        url: "",
        description: "",
        endDate: new Date(),
        startDate: new Date(),
        logo: "",
      });
    }
  }, [defaultValues, mode, form]);

  // File upload handlers
  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      const file = acceptedFiles[0];
      setLogoFile(file);
      form.setValue("logo", URL.createObjectURL(file));
    },
    [form]
  );

  const { getRootProps, getInputProps } = useDropzone({
    onDrop,
    multiple: false,
    accept: {
      "image/*": [".png", ".jpg", ".jpeg", ".heic", ".webp", ".gif"],
    },
  });

  // Attachments dropzone (up to 4 images/videos)
  const onDropAttachments = useCallback(
    (acceptedFiles: File[]) => {
      // limit to 4 total (existing kept + new)
      setAttachments((prev) => {
        const keptExisting = existingAttachments.filter(
          (a) => !removeMediaIds.some((rm) => rm.id === a.id)
        );
        const space = Math.max(0, 4 - keptExisting.length - prev.length);
        const toAdd = acceptedFiles.slice(0, space);
        return [...prev, ...toAdd];
      });
    },
    [existingAttachments, removeMediaIds]
  );

  const { getRootProps: getAttachRoot, getInputProps: getAttachInput } =
    useDropzone({
      onDrop: onDropAttachments,
      multiple: true,
      accept: {
        "image/*": [".png", ".jpg", ".jpeg", ".heic", ".webp", ".gif"],
        "video/*": [".mp4", ".mov", ".webm"],
      },
      disabled:
        existingAttachments.filter(
          (a) => !removeMediaIds.some((rm) => rm.id === a.id)
        ).length +
          attachments.length >=
        4,
    });

  // Upload mutation
  const { mutate: handleUpload, isPending } = useMutation({
    mutationFn: uploadMedia,
    onSuccess: async (data) => {
      const uploadedLogo = data[0];
      const payload = form.getValues();

      const newProject = {
        name: payload.name,
        url: payload.url,
        description: payload.description || "",
        startDate: payload.startDate?.toISOString() || "",
        endDate: payload.endDate?.toISOString() || "",
        logo: uploadedLogo?.url as string,
        width: String(uploadedLogo?.width),
        height: String(uploadedLogo?.height),
      };

      await createProject(newProject);
      toast.success("Project created successfully");
      queryClient.invalidateQueries({ queryKey: ["get-projects"] });
      resetForm();
    },
    onError: (error) => {
      toast.error(error?.message || "Upload failed");
    },
  });

  // Update project handler
  const handleUpdateProject = useCallback(
    async (values: ProjectFormData) => {
      try {
        const updatedFields: Record<string, any> = {};
        const isLogoUpdated = logo !== defaultValues?.logo && logoFile;
        const attachmentsChanged =
          (attachments && attachments.length > 0) ||
          (removeMediaIds && removeMediaIds.length > 0);

        // Compare fields to detect changes
        Object.entries(values).forEach(([key, value]) => {
          if (!isEqual(value, (defaultValues as any)?.[key])) {
            updatedFields[key] = value;
          }
        });

        if (
          Object.keys(updatedFields).length === 0 &&
          !isLogoUpdated &&
          !attachmentsChanged
        ) {
          toast.error("No changes made");
          return;
        }

        let uploadedLogo = null;
        if (isLogoUpdated && logoFile) {
          const formData = new FormData();
          formData.append("files", logoFile);
          formData.append("folder", "fyp-stacks/projects");
          const [data] = await uploadMedia(formData);
          uploadedLogo = data
            ? { url: data.url, width: data.width, height: data.height }
            : null;
        }

        // upload any new attachments when editing
        let uploadedAttachments: Array<{
          url: string;
          width: number;
          height: number;
          type?: string;
        }> = [];
        if (attachments && attachments.length > 0) {
          const uploads = attachments.map((file) => {
            const fd = new FormData();
            fd.append("files", file);
            fd.append("folder", "fyp-stacks/projects");
            return uploadMedia(fd);
          });
          try {
            const results = await Promise.all(uploads);
            uploadedAttachments = results.flat().map((it: any) => ({
              url: it.url,
              width: it.width,
              height: it.height,
              type: it.type,
            }));
          } catch (err) {
            console.error(err);
            toast.error("Failed to upload attachments");
          }
        }

        const res = await updateProject({
          id: tab?.id as string,
          ...updatedFields,
          ...(uploadedLogo && {
            logo: uploadedLogo.url,
            width: uploadedLogo.width,
            height: uploadedLogo.height,
          }),
          ...(uploadedAttachments &&
            uploadedAttachments.length > 0 && { media: uploadedAttachments }),
          ...(removeMediaIds &&
            removeMediaIds.length > 0 && {
              removeMediaPayload: removeMediaIds,
            }),
        });

        if (res.ok && !res.error) {
          toast.success("Project updated successfully");
          resetForm();
          queryClient.invalidateQueries({ queryKey: ["get-projects"] });
          queryClient.invalidateQueries({ queryKey: ["get-projects-by-id"] });
        } else {
          toast.error(res.error || "Failed to update project");
        }
      } catch (err) {
        console.error(err);
        toast.error("An unexpected error occurred");
      }
    },
    [logo, defaultValues, logoFile, tab?.id, attachments, removeMediaIds]
  );

  const resetForm = useCallback(() => {
    form.reset({
      name: "",
      url: "",
      description: "",
      startDate: new Date(),
      endDate: new Date(),
      logo: "",
    });
    setLogoFile(undefined);
    setAttachments([]);
    setExistingAttachments([]);
    setRemoveMediaIds([]);
  }, [form]);

  const onSubmit = useCallback(
    (data: ProjectFormData) => {
      if (mode === "edit" && tab?.id) {
        handleUpdateProject(data);
      } else {
        // Upload logo (if provided) and attachments, then create project with returned urls
        const uploads: Promise<any>[] = [];

        // optionally upload logo
        if (logoFile) {
          const formData = new FormData();
          formData.append("files", logoFile);
          formData.append("folder", "fyp-stacks/projects");
          uploads.push(uploadMedia(formData));
        }

        // attachments
        for (const file of attachments) {
          const fd = new FormData();
          fd.append("files", file);
          fd.append("folder", "fyp-stacks/projects");
          uploads.push(uploadMedia(fd));
        }

        Promise.all(uploads)
          .then(async (results) => {
            // results is array of arrays (uploadMedia returns res.data.data)
            const flattened = results.flat();

            let logoUploaded: any = null;
            let mediaItems: any[] = [];

            if (logoFile) {
              logoUploaded = flattened[0];
              mediaItems = flattened.slice(1).map((it: any) => ({
                url: it.url,
                width: it.width,
                height: it.height,
                type: it.type,
              }));
            } else {
              mediaItems = flattened.map((it: any) => ({
                url: it.url,
                width: it.width,
                height: it.height,
                type: it.type,
              }));
            }

            const payload = form.getValues();
            const newProject: Record<string, any> = {
              name: payload.name,
              url: payload.url,
              description: payload.description || "",
              startDate: payload.startDate?.toISOString() || "",
              endDate: payload.endDate?.toISOString() || "",
            };

            if (logoUploaded) {
              newProject.logo = logoUploaded?.url as string;
              newProject.width = String(logoUploaded?.width);
              newProject.height = String(logoUploaded?.height);
            }

            if (mediaItems && mediaItems.length > 0) {
              newProject.media = mediaItems;
            }

            await createProject(newProject as any);
            toast.success("Project created successfully");
            queryClient.invalidateQueries({ queryKey: ["get-projects"] });
            resetForm();
          })

          .catch((err) => {
            console.error(err);
            toast.error(err?.message || "Upload failed");
          });
      }
    },
    [mode, tab?.id, logoFile, handleUpdateProject, handleUpload]
  );

  const title = mode === "edit" ? "Edit Project" : "Add Project";
  const description =
    "Share your projects with the world. Showcase your work and skills.";

  return (
    <FormCard title={title} description={description}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col">
        {isFetchingValues ? (
          <ProjectFormSkeleton />
        ) : (
          <>
            {/* Logo Upload */}
            <div className="flex gap-3 items-start mb-4">
              <div
                {...getRootProps()}
                className={cn(
                  !logo && "border-dashed p-0",
                  "size-20 border-2 rounded-full flex items-center justify-center border-neutral-300/60 dark:border-dark-border relative p-2 cursor-pointer"
                )}
              >
                {logo ? (
                  <>
                    <Image
                      unoptimized
                      src={logo}
                      alt="Project logo"
                      className="rounded-full object-cover"
                      fill
                    />
                    {mode === "edit" && (
                      <Button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setLogoFile(undefined);
                          form.setValue("logo", "");
                        }}
                        size="smallIcon"
                        className="absolute rounded-full -bottom-1 -left-1"
                      >
                        <X className="size-4 opacity-80" />
                      </Button>
                    )}
                  </>
                ) : (
                  <>
                    <input {...getInputProps()} />
                    <Label className="cursor-pointer">
                      <Upload strokeWidth={1.6} className="size-8 opacity-80" />
                    </Label>
                  </>
                )}
              </div>
            </div>

            {/* Form Fields */}
            <div className="space-y-4">
              <div className="flex flex-col">
                <label htmlFor="name" className="text-sm mb-2">
                  Project Name <span className="text-red-500">*</span>
                </label>
                <Input
                  id="name"
                  placeholder="Awesome Project"
                  {...form.register("name")}
                />
                {form.formState.errors.name && (
                  <span className="text-red-500 text-xs">
                    {form.formState.errors.name.message}
                  </span>
                )}
              </div>

              <div className="flex flex-col">
                <label htmlFor="url" className="text-sm mb-2">
                  Project URL <span className="text-red-500">*</span>
                </label>
                <Input
                  id="url"
                  placeholder="https://example.com"
                  {...form.register("url")}
                />
                {form.formState.errors.url && (
                  <span className="text-red-500 text-xs">
                    {form.formState.errors.url.message}
                  </span>
                )}
              </div>

              <div className="flex flex-col">
                <label htmlFor="description" className="text-sm mb-2">
                  Description
                  <span className="text-red-500 ml-0.5">*</span>
                </label>
                <Textarea
                  id="description"
                  placeholder="Describe your project..."
                  {...form.register("description")}
                />
              </div>

              <DateRangePicker
                control={form.control}
                startName="startDate"
                endName="endDate"
                className="mt-4"
              />
              <div className="w-full">
                <label {...getAttachRoot()} className="w-full">
                  <input {...getAttachInput()} />
                  <Button
                    variant={"outline"}
                    type="button"
                    className="rounded-md w-full "
                  >
                    <Upload className="mr-2 size-4" />
                    <span>Add Media</span>
                  </Button>
                </label>
                {/* existing attachments in edit mode */}
                {mode === "edit" && existingAttachments.length > 0 && (
                  <div className="mt-3 flex flex-col gap-2">
                    {existingAttachments.map((att) => (
                      <div
                        key={att.id}
                        className="p-2 flex items-center justify-between rounded-md overflow-hidden border border-neutral-200"
                      >
                        <div className="flex items-center gap-2">
                          <img
                            src={att.url}
                            alt={att.id}
                            className="object-cover size-6 rounded-md"
                          />
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            size="smallIcon"
                            type="button"
                            onClick={() => {
                              if (
                                removeMediaIds.some((rm) => rm.id === att.id)
                              ) {
                                setRemoveMediaIds((prev) =>
                                  prev.filter((rm) => rm.id !== att.id)
                                );
                              } else {
                                setRemoveMediaIds((prev) => [
                                  ...prev,
                                  { id: att.id, url: att.url },
                                ]);
                                setExistingAttachments((prev) =>
                                  prev.filter((a) => a.id !== att.id)
                                );
                              }
                            }}
                          >
                            <X className="size-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {attachments.length > 0 && (
                  <div className="mt-3 flex flex-col gap-2">
                    {attachments.map((file, idx) => (
                      <div
                        key={idx}
                        className="p-2 flex items-center justify-center h-10  rounded-md overflow-hidden border dark:border-neutral-800 border-neutral-200"
                      >
                        {file.type.startsWith("image") && (
                          // show image preview
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={URL.createObjectURL(file)}
                            alt={file.name}
                            className="object-cover border dark:border-neutral-800 border-neutral-200 size-6 rounded-md"
                          />
                        )}
                        {/* <div className="px-2 flex-1">
                          <span className="w-[50px] text-sm  truncate line-clamp-1 ">
                            {file.name}
                          </span>
                        </div> */}
                        <Button
                          size="smallIcon"
                          type="button"
                          className="rounded-md size-6"
                          onClick={(e) => {
                            e.stopPropagation();
                            setAttachments((prev) =>
                              prev.filter((_, i) => i !== idx)
                            );
                          }}
                        >
                          <X className="size-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </>
        )}

        <Button
          disabled={isPending || isFetchingValues}
          variant="secondary"
          className="mt-6 w-full"
          type="submit"
        >
          {isPending && (
            <Loader className="size-4 animate-spin opacity-80 mr-2" />
          )}
          {mode === "edit" ? "Update Project" : "Create Project"}
        </Button>
      </form>
    </FormCard>
  );
};

// Skeleton loading component
const ProjectFormSkeleton = () => (
  <>
    <Skeleton className="size-20 rounded-full mb-4" />
    {[...Array(4)].map((_, i) => (
      <div key={i} className="mt-4 space-y-2">
        <Skeleton
          className={cn("h-[40px] w-full rounded-lg", i === 2 && "h-[100px]")}
        />
      </div>
    ))}
  </>
);
