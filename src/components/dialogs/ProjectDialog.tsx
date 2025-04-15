import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { format } from "date-fns";
import { Calendar as CalendarIcon, Trash2, Upload } from "lucide-react";
import toast from "react-hot-toast";
import { TNewProject } from "@/lib/types";
import { useProjectsDialog } from "../dialog-provider";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { cn } from "@/lib/utils";
import Image from "next/image";

interface ProjectDialogProps {
  // open: boolean;
  // onOpenChange: (open: boolean) => void;
  initialProject?: TNewProject;
  mode?: "create" | "edit";
}

const ProjectSchema = z.object({
  name: z.string().min(1, "Project name is required"),
  url: z.string().url("Invalid URL"),
  description: z.string().optional(),
});

const ProjectDialog: React.FC<ProjectDialogProps> = ({
  // open,
  // onOpenChange,
  initialProject,
  mode = "create",
}) => {
  const [open, setOpen] = useProjectsDialog();
  const [project, setProject] = useState<TNewProject>();
  const [startDate, setStartDate] = useState<Date | undefined>(
    initialProject?.startDate || new Date()
  );
  const [endDate, setEndDate] = useState<Date | undefined>(
    initialProject?.endDate || new Date()
  );
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | undefined>(
    initialProject?.logo
  );

  const { register, getValues, setValue } = useForm<
    z.infer<typeof ProjectSchema>
  >({
    resolver: zodResolver(ProjectSchema),
    defaultValues: {
      name: initialProject?.name || "",
      url: initialProject?.url || "",
      description: initialProject?.description || "",
    },
  });
  const values = getValues();

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    // setProject((prev) => ({ ...prev, [name]: value }));
  };

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setLogoFile(file);

      // Create a preview URL
      const reader = new FileReader();
      reader.onloadend = () => {
        const preview = reader.result as string;
        setLogoPreview(preview);
        // setProject((prev) => ({ ...prev, logo: preview }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = () => {
    // if (!project.name) {
    //   toast.error("Project name is required");
    //   return;
    // }

    if (mode === "edit" && initialProject?.id) {
      //   updateProject(initialProject.id, {
      //     ...project,
      //     date: date?.toISOString() || new Date().toISOString(),
      //   });
      toast.success("Project updated successfully");
    } else {
      //   addProject({
      //     ...project,
      //     date: date?.toISOString() || new Date().toISOString(),
      //   });
      toast.success("Project added successfully");
    }
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="max-w-xl sm:rounded-3xl dark:bg-dark-bg">
        <DialogHeader>
          <DialogTitle>
            {mode === "create" ? "Add New Project" : "Edit Project"}
          </DialogTitle>
          <DialogDescription>
            Enter the details of your project below
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-5 py-4">
          <div className="flex flex-col gap-3 items-start">
            <div
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
                      setLogoFile(null);
                      setLogoPreview(undefined);
                    }}
                  >
                    <Trash2 className="opacity-70" strokeWidth={1.7} />
                  </Button>
                  <Image fill src={logoPreview} alt="" />
                </>
              ) : (
                <>
                  <input
                    id="logo-input"
                    className="hidden"
                    onChange={handleLogoChange}
                    type="file"
                  />
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
              id="description"
              name="description"
              //   value={project.description || ""}
              onChange={handleInputChange}
              placeholder="A brief description of what this project does"
              className="resize-none min-h-[80px]"
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave}>
            {mode === "create" ? "Create Project" : "Save Changes"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ProjectDialog;
