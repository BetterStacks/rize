import { createProject, getProjectByID } from "@/actions/project-actions";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Textarea } from "@/components/ui/textarea";
import { queryClient } from "@/lib/providers";
import { cn } from "@/lib/utils";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery } from "@tanstack/react-query";
import axios from "axios";
import { format } from "date-fns";
import { Calendar as CalendarIcon, Loader, Trash2, Upload } from "lucide-react";
import Image from "next/image";
import React, { useState } from "react";
import { useDropzone } from "react-dropzone";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { z } from "zod";
import { useProjectsDialog } from "../dialog-provider";
import { TNewProject } from "@/lib/types";
import { useParams } from "next/navigation";

interface ProjectDialogProps {
  initialProject?: string;
  mode?: "create" | "edit";
}

const ProjectSchema = z.object({
  name: z.string().min(1, "Project name is required"),
  url: z.string().url("Invalid URL"),
  description: z.string().optional(),
});

const ProjectDialog: React.FC<ProjectDialogProps> = ({
  initialProject,
  mode,
}) => {
  const { username } = useParams<{ username: string }>();
  const { data: project, isFetching } = useQuery({
    queryKey: ["get-projects-by-id", username, initialProject!],
    enabled: !!initialProject,
    queryFn: () => getProjectByID(username, initialProject!),
  });
  console.log({ project });
  const [open, setOpen] = useProjectsDialog();
  const [startDate, setStartDate] = useState<Date | undefined>(
    project?.startDate || new Date()
  );
  const [endDate, setEndDate] = useState<Date | undefined>(
    project?.endDate || new Date()
  );
  const [logoPreview, setLogoPreview] = useState<string | undefined>(
    project?.logo || undefined
  );
  const [logoFile, setLogoFile] = useState<File | undefined>(undefined);

  const onDrop = (acceptedFiles: File[]) => {
    setLogoFile(acceptedFiles[0]);
    setLogoPreview(URL.createObjectURL(acceptedFiles[0]));
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    multiple: false,
    accept: {
      "image/*": [".png", ".jpg", ".jpeg", ".heic", ".webp", ".gif"],
    },
  });
  const uploadMedia = async (formData: FormData) => {
    const res = await axios.post("/api/upload/files", formData);
    if (res.status !== 200) throw new Error("Upload failed");
    return res.data?.data;
  };

  const { register, getValues } = useForm<z.infer<typeof ProjectSchema>>({
    resolver: zodResolver(ProjectSchema),
    values: {
      name: project?.name || "",
      url: project?.url || "",
      description: project?.description || "",
    },
  });

  const { mutate: handleUpload, isPending } = useMutation({
    mutationFn: uploadMedia,
    onSuccess: async (data) => {
      const uploadedLogo = data[0];
      console.log({ uploadedLogo });
      const newProject = {
        description: getValues("description"),
        endDate: endDate,
        logo: uploadedLogo?.url,
        name: getValues("name"),
        startDate: startDate,
        url: getValues("url"),
      } as TNewProject;

      const res = await createProject({
        ...newProject,
        ...{ width: uploadedLogo?.width, height: uploadedLogo?.height },
      });
      console.log(res);
      queryClient.invalidateQueries({ queryKey: ["get-gallery-items"] });
    },
    onError: (error) => {
      toast.error(error?.message);
    },
  });

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="max-w-xl sm:rounded-3xl dark:bg-dark-bg">
        <DialogHeader>
          <DialogTitle>Add New Project</DialogTitle>
          <DialogDescription>
            Enter the details of your project below
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-5 py-4">
          <div className="flex flex-col gap-3 items-start">
            <div
              {...getRootProps()}
              className={cn(
                !logoPreview && "border-2 border-dashed rounded-2xl",
                " flex relative  items-center justify-center  border-neutral-300 dark:border-dark-border size-20"
              )}
            >
              {logoPreview ? (
                <>
                  <Button
                    variant={"secondary"}
                    size={"icon"}
                    className="absolute shadow-lg z-10 size-8 p-1 rounded-full -top-2 -right-2"
                    onClick={() => {
                      setLogoFile(undefined);
                      setLogoPreview(undefined);
                    }}
                  >
                    <Trash2 className="opacity-70" strokeWidth={1.7} />
                  </Button>
                  <Image fill src={logoPreview} alt="" />
                </>
              ) : (
                <>
                  <input {...getInputProps()} className="hidden" type="file" />
                  <label htmlFor="logo-input" className="cursor-pointer">
                    <Upload
                      className="opacity-50"
                      strokeWidth={1.4}
                      size={32}
                    />
                  </label>
                </>
              )}
            </div>
            {/* <div className="w-24 h-24  rounded-lg flex items-center justify-center overflow-hidden">
              {logoPreview ? (
                <img
                  src={logoPreview}
                  alt="Project logo"
                  className="w-full h-full rounded-3xl border border-neutral-300 object-cover"
                />
              ) : (
                <Upload className="text-gray-400" size={32} />
              )}
            </div> */}
          </div>
          <div className="w-full grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="name">
                Project Name <span className="text-red-500">*</span>
              </Label>
              <Input {...register("name")} placeholder="My Awesome Project" />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="url">Project URL</Label>
              <Input {...register("url")} placeholder="https://dub.sh/ai" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label>Start Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="justify-start text-left font-normal"
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {startDate ? format(startDate, "PPP") : "Pick a date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={startDate}
                    onSelect={setStartDate}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
            <div className="grid gap-2">
              <Label>End Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="justify-start text-left font-normal"
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {endDate ? format(endDate, "PPP") : "Pick a date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={endDate}
                    onSelect={setEndDate}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              {...register("description")}
              placeholder="A brief description of what this project does"
              className="resize-none min-h-[80px]"
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button
            disabled={isPending}
            onClick={() => {
              if (mode === "edit") {
                return;
              }
              if (!logoFile) {
                toast.error("Please upload a project logo");
                return;
              }
              const formData = new FormData();
              formData.append("files", logoFile);
              formData.append("folder", "fyp-stacks/projects");
              handleUpload(formData);
            }}
          >
            {isPending && <Loader className="size-4 opacity-80 mr-2" />}
            {mode === "edit" ? "Edit Project" : "Create Project"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ProjectDialog;
