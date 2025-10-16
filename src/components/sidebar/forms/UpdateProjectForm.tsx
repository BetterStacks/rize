"use client";

import { getProjectByID, updateProject } from "@/actions/project-actions";
import { uploadMedia } from "@/actions/client-actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { newProjectSchema } from "@/lib/types";
import { cn } from "@/lib/utils";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient } from "@/lib/providers";
import { Plus, X, Loader } from "lucide-react";
import toast from "react-hot-toast";
import Image from "next/image";
import { FC, useCallback, useEffect, useState, useRef } from "react";
import { useDropzone } from "react-dropzone";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { DateRangePicker } from "../components/DateRangePicker";
import { toIsoString } from "@/lib/date";
import { useQueryState } from "nuqs";
import { useActiveSidebarTab } from "@/lib/context";

type TUpdateProjectForm = z.infer<typeof newProjectSchema>;

interface ProjectFormProps {
  username: string;
  id: string;
}

export const UpdateProjectForm: FC<ProjectFormProps> = ({ username, id }) => {
  const [logoFile, setLogoFile] = useState<File | undefined>();
  const projectId = Array.isArray(id) ? id[0] : id;
  const setActiveTab = useActiveSidebarTab()[1];
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
  const { data: defaultValues, isLoading: isFetchingValues } = useQuery<any>({
    queryKey: ["get-project-by-id", projectId],
    enabled: Boolean(projectId),
    queryFn: () => getProjectByID(projectId as string),
  });
  // Helpful debug logs when troubleshooting why defaultValues can be undefined.
  console.log("project param:", id, "normalized projectId:", projectId);
  console.log(
    "project fetch loading:",
    isFetchingValues,
    "defaultValues:",
    defaultValues
  );

  const form = useForm<TUpdateProjectForm>({
    resolver: zodResolver(newProjectSchema),
  });

  // watch existing logo value from fetched project (remote URL)
  const existingLogo = form.watch("logo");

  // handle submit: upload new media and call updateProject
  async function onSubmit(values: TUpdateProjectForm) {
    try {
      // disable double submits handled via button disabled state

      // 1) upload logo file if present
      let logoUrl: string | undefined = undefined;
      if (logoFile) {
        const fd = new FormData();
        fd.append("files", logoFile);
        fd.append("folder", "fyp-stacks/projects");
        const res = await mutateUpload(fd as any);
        if (res && res.length > 0) {
          logoUrl = res[0].url;
        }
      }

      // 2) upload attachments
      const uploaded: Array<{
        url: string;
        width: number;
        height: number;
        type: string;
      }> = [];
      for (const f of attachments) {
        const fd = new FormData();
        fd.append("files", f);
        fd.append("folder", "fyp-stacks/projects");
        const res = await mutateUpload(fd as any);
        if (res && res.length > 0) {
          uploaded.push(...res);
        }
      }

      // build payload for updateProject
      const payload: any = {
        id: projectId,
        name: values.name,
        tagline: values.tagline || "",
        description: values.description || "",
        url: values.url,
        startDate: values.startDate,
        endDate: values.endDate,
      };

      if (logoUrl) {
        payload.logo = logoUrl;
        payload.width = String((logoFile as any)?.width ?? 0);
        payload.height = String((logoFile as any)?.height ?? 0);
      }

      if (uploaded.length > 0) {
        payload.media = uploaded.map((it) => ({
          url: it.url,
          width: it.width,
          height: it.height,
          type: it.type,
        }));
      }

      if (removeMediaIds.length > 0) {
        payload.removeMediaPayload = [...removeMediaIds];
      }

      setIsUpdating(true);
      const res = await mutateUpdate(payload as any);
      setIsUpdating(false);

      if (res?.ok) {
        toast.success("Project updated");
        // // ensure we refresh the canonical project data and project lists
        queryClient.invalidateQueries({
          queryKey: ["get-project-by-id", projectId],
        });
        queryClient.invalidateQueries({ queryKey: ["get-projects", username] });
        setActiveTab({ id: null, tab: "gallery" });
      } else {
        throw new Error(res?.error || "Update failed");
      }
    } catch (err: any) {
      console.error(err);
      toast.error(err?.message || "Error updating project");
    }
  }

  // Initialize the form defaults only once per project load.
  // Prevents the form from resetting while the user is editing if React Query
  // refetches the same data or updates slightly.
  const initializedRef = useRef(false);
  const lastProjectIdRef = useRef<string | undefined>(undefined);

  useEffect(() => {
    if (!defaultValues) return;

    // If project changed (navigated to a different project id), re-initialize
    if (lastProjectIdRef.current !== projectId) {
      try {
        form.reset({
          name: defaultValues.name ?? "",
          // DB may use tagLine (camelCase) while schema uses 'tagline'
          tagline: defaultValues.tagline ?? "",
          url: defaultValues.url ?? "",
          description: defaultValues.description ?? "",
          logo: defaultValues.logo ?? "",
          startDate: toIsoString(defaultValues.startDate),
          endDate: toIsoString(defaultValues.endDate),
        } as any);

        // populate existing attachments (query returns `attachments`)
        setExistingAttachments((defaultValues.attachments as any) ?? []);
      } catch (err) {
        console.error("Error populating project form defaults", err);
      }

      initializedRef.current = true;
      lastProjectIdRef.current = projectId;
      return;
    }

    // Otherwise, if we haven't initialized yet (first successful fetch), do it once
    if (!initializedRef.current) {
      try {
        form.reset({
          name: defaultValues.name ?? "",
          tagline: defaultValues.tagline ?? "",
          url: defaultValues.url ?? "",
          description: defaultValues.description ?? "",
          logo: defaultValues.logo ?? "",
          startDate: toIsoString(defaultValues.startDate),
          endDate: toIsoString(defaultValues.endDate),
        } as any);
        setExistingAttachments((defaultValues.attachments as any) ?? []);
      } catch (err) {
        console.error("Error populating project form defaults", err);
      }

      initializedRef.current = true;
    }
  }, [defaultValues, projectId, form]);

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

  // upload helper and update mutation
  const uploadMutation = useMutation({ mutationFn: uploadMedia });
  const updateMutation = useMutation({ mutationFn: updateProject });
  const mutateUpload = uploadMutation.mutateAsync;
  const mutateUpdate = updateMutation.mutateAsync;
  const [isUploading, setIsUploading] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  return (
    <div className="max-w-xl mx-auto p-6">
      <h2 className="text-xl mt-8 tracking-tight font-medium ">Edit Project</h2>
      <span className=" text-neutral-700 dark:text-neutral-300 text-sm">
        Update your project details below.
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
                  // onClick={() => setLogoFile(null)}
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
            ) : existingLogo ? (
              <>
                <Button
                  size={"smallIcon"}
                  variant={"outline"}
                  className="dark:bg-dark-bg dark:hover:bg-dark-border absolute size-6 bottom-0 right-0 z-[2]"
                  type="button"
                >
                  <Plus className="size-3 " />
                </Button>
                <div className="relative rounded-full size-full overflow-hidden">
                  <Image
                    className="object-cover"
                    src={existingLogo}
                    fill
                    alt="Logo"
                    unoptimized
                  />
                </div>
                {/* keep the hidden input present so clicking the area opens file picker */}
                <input {...getInputProps()} />
              </>
            ) : (
              <>
                <Button
                  size={"smallIcon"}
                  variant={"outline"}
                  className="dark:bg-dark-bg dark:hover:bg-dark-border absolute size-6 bottom-0 right-0 z-[2]"
                  // onClick={() => setLogoFile(null)}
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
          {existingAttachments.length <= 4 && (
            <div
              {...getAttachRoot()}
              className="border-dashed h-[250px] dark:bg-dark-bg dark:border-dark-border bg-neutral-50 border-neutral-200 flex flex-col items-center justify-center border-2 p-4 rounded-lg "
            >
              {/* <Button variant="outline" className="mb-2 rounded-lg">
                  <Upload className="size-4 opacity-80 mr-2" /> Upload
                </Button> */}
              <h3 className="dark:text-neutral-200">
                Choose Images & Video drag & drop files here
              </h3>
              <span className="text-sm text-neutral-700 dark:text-neutral-400">
                JPG, PNG, GIF, MP4 up to 10MB each
              </span>
              <input {...getAttachInput()} />
            </div>
          )}
          <div className="w-full flex flex-row items-center justify-start gap-4 mt-4 overflow-x-auto">
            {existingAttachments.map((f, i) => (
              <div
                key={`existing-${f.id}`}
                className="relative border border-neutral-200 dark:border-dark-border overflow-hidden rounded-xl size-32"
              >
                <Button
                  size={"smallIcon"}
                  variant={"outline"}
                  type="button"
                  onClick={() => {
                    setRemoveMediaIds((prev) => [
                      ...prev,
                      { id: f.id, url: f.url },
                    ]);
                    // also remove from existingAttachments preview
                    setExistingAttachments((prev) =>
                      prev.filter((it) => it.id !== f.id)
                    );
                  }}
                  className="dark:bg-dark-bg dark:hover:bg-dark-border absolute size-6 right-1 top-1 z-[2]"
                >
                  <X className="size-3" />
                </Button>
                {f.type === "image" ? (
                  <Image
                    src={f.url}
                    alt={f.url}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <video src={f.url} className="size-full object-cover" />
                )}
              </div>
            ))}
            {/* Render newly added attachments from local `attachments` state */}
            {attachments.map((file, idx) => (
              <div
                key={`new-${idx}`}
                className="relative border border-neutral-200 dark:border-dark-border overflow-hidden rounded-xl size-32"
              >
                <Button
                  size={"smallIcon"}
                  variant={"outline"}
                  type="button"
                  onClick={() => {
                    setAttachments((prev) => prev.filter((_, i) => i !== idx));
                  }}
                  className="dark:bg-dark-bg dark:hover:bg-dark-border absolute size-6 right-1 top-1 z-[2]"
                >
                  <X className="size-3" />
                </Button>
                {file.type.startsWith("image") ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={URL.createObjectURL(file)}
                    alt={file.name}
                    className="object-cover size-full"
                  />
                ) : (
                  <video
                    src={URL.createObjectURL(file)}
                    className="size-full object-cover"
                  />
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="flex justify-end">
          <Button
            type="submit"
            className="w-full rounded-md"
            variant={"outline"}
            disabled={isUploading || isUpdating}
          >
            {isUpdating || isUploading ? (
              <span className="flex items-center gap-2">
                <Loader className="size-4 animate-spin" /> Saving...
              </span>
            ) : (
              "Save changes"
            )}
          </Button>
        </div>
      </form>
    </div>
    // <FormCard title={title} description={description}>
    //   <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col">
    //     {isFetchingValues ? (
    //       <ProjectFormSkeleton />
    //     ) : (
    //       <>
    //         {/* Logo Upload */}
    //         <div className="flex gap-3 items-start mb-4">
    //           <div
    //             {...getRootProps()}
    //             className={cn(
    //               !logo && "border-dashed p-0",
    //               "size-20 border-2 rounded-full flex items-center justify-center border-neutral-300/60 dark:border-dark-border relative p-2 cursor-pointer"
    //             )}
    //           >
    //             {logo ? (
    //               <>
    //                 <Image
    //                   unoptimized
    //                   src={logo}
    //                   alt="Project logo"
    //                   className="rounded-full object-cover"
    //                   fill
    //                 />
    //                 {mode === "edit" && (
    //                   <Button
    //                     type="button"
    //                     onClick={(e) => {
    //                       e.stopPropagation();
    //                       setLogoFile(undefined);
    //                       form.setValue("logo", "");
    //                     }}
    //                     size="smallIcon"
    //                     className="absolute rounded-full -bottom-1 -left-1"
    //                   >
    //                     <X className="size-4 opacity-80" />
    //                   </Button>
    //                 )}
    //               </>
    //             ) : (
    //               <>
    //                 <input {...getInputProps()} />
    //                 <Label className="cursor-pointer">
    //                   <Upload strokeWidth={1.6} className="size-8 opacity-80" />
    //                 </Label>
    //               </>
    //             )}
    //           </div>
    //         </div>

    //         {/* Form Fields */}
    //         <div className="space-y-4">
    //           <div className="flex flex-col">
    //             <label htmlFor="name" className="text-sm mb-2">
    //               Project Name <span className="text-red-500">*</span>
    //             </label>
    //             <Input
    //               id="name"
    //               placeholder="Awesome Project"
    //               {...form.register("name")}
    //             />
    //             {form.formState.errors.name && (
    //               <span className="text-red-500 text-xs">
    //                 {form.formState.errors.name.message}
    //               </span>
    //             )}
    //           </div>

    //           <div className="flex flex-col">
    //             <label htmlFor="url" className="text-sm mb-2">
    //               Project URL <span className="text-red-500">*</span>
    //             </label>
    //             <Input
    //               id="url"
    //               placeholder="https://example.com"
    //               {...form.register("url")}
    //             />
    //             {form.formState.errors.url && (
    //               <span className="text-red-500 text-xs">
    //                 {form.formState.errors.url.message}
    //               </span>
    //             )}
    //           </div>

    //           <div className="flex flex-col">
    //             <label htmlFor="description" className="text-sm mb-2">
    //               Description
    //               <span className="text-red-500 ml-0.5">*</span>
    //             </label>
    //             <Textarea
    //               id="description"
    //               placeholder="Describe your project..."
    //               {...form.register("description")}
    //             />
    //           </div>

    //           <DateRangePicker
    //             control={form.control}
    //             startName="startDate"
    //             endName="endDate"
    //             className="mt-4"
    //           />
    //           <div className="w-full">
    //             <label {...getAttachRoot()} className="w-full">
    //               <input {...getAttachInput()} />
    //               <Button
    //                 variant={"outline"}
    //                 type="button"
    //                 className="rounded-md w-full "
    //               >
    //                 <Upload className="mr-2 size-4" />
    //                 <span>Add Media</span>
    //               </Button>
    //             </label>
    //             {/* existing attachments in edit mode */}
    //             {mode === "edit" && existingAttachments.length > 0 && (
    //               <div className="mt-3 flex flex-col gap-2">
    //                 {existingAttachments.map((att) => (
    //                   <div
    //                     key={att.id}
    //                     className="p-2 flex items-center justify-between rounded-md overflow-hidden border border-neutral-200"
    //                   >
    //                     <div className="flex items-center gap-2">
    //                       <img
    //                         src={att.url}
    //                         alt={att.id}
    //                         className="object-cover size-6 rounded-md"
    //                       />
    //                       <span className="w-full">Untitled</span>
    //                     </div>
    //                     <div className="flex items-center gap-2">
    //                       <Button
    //                         size="smallIcon"
    //                         type="button"
    //                         onClick={() => {
    //                           if (
    //                             removeMediaIds.some((rm) => rm.id === att.id)
    //                           ) {
    //                             setRemoveMediaIds((prev) =>
    //                               prev.filter((rm) => rm.id !== att.id)
    //                             );
    //                           } else {
    //                             setRemoveMediaIds((prev) => [
    //                               ...prev,
    //                               { id: att.id, url: att.url },
    //                             ]);
    //                             setExistingAttachments((prev) =>
    //                               prev.filter((a) => a.id !== att.id)
    //                             );
    //                           }
    //                         }}
    //                       >
    //                         <X className="size-4" />
    //                       </Button>
    //                     </div>
    //                   </div>
    //                 ))}
    //               </div>
    //             )}

    //             {mode !== "edit" && attachments.length > 0 && (
    //               <div className="mt-3 flex flex-col gap-2">
    //                 {attachments.map((file, idx) => (
    //                   <div
    //                     key={idx}
    //                     className="p-2 flex items-center justify-center h-10  rounded-md overflow-hidden border dark:border-neutral-800 border-neutral-200"
    //                   >
    //                     {file.type.startsWith("image") && (
    //                       // show image preview
    //                       // eslint-disable-next-line @next/next/no-img-element
    //                       <img
    //                         src={URL.createObjectURL(file)}
    //                         alt={file.name}
    //                         className="object-cover border dark:border-neutral-800 border-neutral-200 size-6 rounded-md"
    //                       />
    //                     )}
    //                     <div className="px-2 flex-1">
    //                       <span className="w-[150px] text-sm  truncate line-clamp-1 ">
    //                         {file.name}
    //                       </span>
    //                     </div>
    //                     <Button
    //                       size="smallIcon"
    //                       type="button"
    //                       className="rounded-md size-6"
    //                       onClick={(e) => {
    //                         e.stopPropagation();
    //                         setAttachments((prev) =>
    //                           prev.filter((_, i) => i !== idx)
    //                         );
    //                       }}
    //                     >
    //                       <X className="size-4" />
    //                     </Button>
    //                   </div>
    //                 ))}
    //               </div>
    //             )}
    //           </div>
    //         </div>
    //       </>
    //     )}

    //     <Button
    //       disabled={isPending || isFetchingValues}
    //       variant="secondary"
    //       className="mt-6 w-full"
    //       type="submit"
    //     >
    //       {isPending && (
    //         <Loader className="size-4 animate-spin opacity-80 mr-2" />
    //       )}
    //       {mode === "edit" ? "Update Project" : "Create Project"}
    //     </Button>
    //   </form>
    // </FormCard>
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
