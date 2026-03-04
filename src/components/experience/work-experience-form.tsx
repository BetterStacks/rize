"use client";

import { upsertExperience } from "@/actions/experience-actions";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RichTextEditor } from "@/components/ui/rich-text-editor";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
// import { DateRangePicker } from "@/components/ui/calendar";
import { useActiveSidebarTab, useRightSidebar } from "@/lib/context";
import { queryClient } from "@/lib/providers";
import { EMPLOYMENT_TYPES, EmploymentType } from "@/lib/types";
import { cn } from "@/lib/utils";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { Loader } from "lucide-react";
import { useParams } from "next/navigation";
import { FC, useEffect } from "react";
import { Controller, useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { z } from "zod";
import { DateRangePicker } from "../sidebar/components/DateRangePicker";

const experienceSchema = z.object({
  id: z.string().uuid().optional(),
  title: z.string().min(1, "Job title is required"),
  company: z.string().min(1, "Company name is required"),
  location: z.string().optional(),
  employmentType: z.enum(EMPLOYMENT_TYPES, { required_error: "Employment type is required" }),
  website: z.string().url().optional().or(z.literal("")),
  description: z.string().optional(),
  startDate: z.date({ required_error: "Start date is required" }),
  endDate: z.date().optional(),
  currentlyWorking: z.boolean().default(false),
});

type WorkExperienceFormData = z.infer<typeof experienceSchema>;

type WorkExperienceFormProps = {
  defaultValues?: {
    id: string;
    createdAt: Date | null;
    updatedAt: Date;
    location: string | null;
    website: string | null;
    profileId: string;
    title: string;
    description: string | null;
    startDate: Date | null;
    endDate: Date | null;
    company: string;
    employmentType: string | null;
    currentlyWorking: boolean;
  };
  isFetchingValues?: boolean;
};

export const WorkExperienceForm: FC<WorkExperienceFormProps> = ({
  defaultValues,
  isFetchingValues,
}) => {
  console.log(defaultValues);
  const [activeTab, setActiveTab] = useActiveSidebarTab();
  const setIsRightSidebarOpen = useRightSidebar()[1];
  const { username } = useParams<{ username: string }>();

  const form = useForm<WorkExperienceFormData>({
    resolver: zodResolver(experienceSchema),
  });

  const upsertMutation = useMutation({ mutationFn: upsertExperience });
  const mutateUpsert = upsertMutation.mutateAsync;
  useEffect(() => {
    if (!defaultValues) return;
    try {
      form.reset({
        id: defaultValues.id,
        title: defaultValues.title ?? "",
        company: defaultValues.company ?? "",
        location: defaultValues.location ?? "",
        employmentType: (defaultValues.employmentType as EmploymentType) ?? undefined,
        website: defaultValues.website ?? "",
        description: defaultValues.description ?? "",
        startDate: defaultValues.startDate ?? undefined,
        endDate: defaultValues.endDate ?? undefined,
        currentlyWorking: defaultValues.currentlyWorking ?? false,
      });
    } catch (err) {
      console.error("Error populating experience form defaults", err);
    }
  }, [defaultValues, form]);
  // ── Local Storage Persistence ──────────────────────────────────────────
  useEffect(() => {
    if (!!defaultValues?.id) return; // Skip if editing
    const saved = localStorage.getItem("experience-form-draft");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.startDate) parsed.startDate = new Date(parsed.startDate);
        if (parsed.endDate) parsed.endDate = new Date(parsed.endDate);
        form.reset(parsed);
      } catch (e) {
        console.error("Error loading saved experience draft", e);
      }
    }
  }, [defaultValues, form]);

  useEffect(() => {
    if (!!defaultValues?.id) return; // Skip if editing
    const subscription = form.watch((value) => {
      localStorage.setItem("experience-form-draft", JSON.stringify(value));
    });
    return () => subscription.unsubscribe();
  }, [form, defaultValues]);

  async function onSubmit(values: WorkExperienceFormData) {
    try {
      const payload = {
        ...values,
        ...(activeTab?.id && { id: activeTab?.id as string }),
        endDate: values.currentlyWorking ? undefined : (values.endDate as Date),
      };

      await mutateUpsert(payload, {
        onSuccess: async () => {
          if (!activeTab?.id) {
            localStorage.removeItem("experience-form-draft");
          }
          setActiveTab({ id: null, tab: "gallery" });
          setIsRightSidebarOpen(false);
          await queryClient.invalidateQueries({
            queryKey: ["get-all-experience", username],
          });
          toast.success(
            activeTab?.id ? "Experience updated" : "Experience added"
          );
        },
        onError: (error) => {
          toast.error(
            error?.message ||
            `Failed to ${activeTab?.id ? "update" : "add"} experience`
          );
        },
      });
    } catch (error) {
      console.error("Error preparing experience payload", error);
    }
  }

  return (
    <div className="max-w-xl mx-auto p-6">
      <h2 className="text-xl mt-8 tracking-tight font-medium">
        {activeTab?.id ? "Edit Work Experience" : "Add Work Experience"}
      </h2>
      <span className="text-neutral-300 text-sm">
        Share where you’ve worked, your role, and what you did there.
      </span>

      {isFetchingValues ? (
        <WorkExperienceFormSkeleton />
      ) : (
        <form onSubmit={form.handleSubmit(onSubmit)} className="mt-6 space-y-4">
          <div>
            <Label className="dark:text-neutral-300 text-neutral-700">
              Job Title
            </Label>
            <Input {...form.register("title")} />
            {form.formState.errors.title && (
              <p className="text-sm text-red-500">
                {form.formState.errors.title.message}
              </p>
            )}
          </div>

          <div>
            <Label className="dark:text-neutral-300 text-neutral-700">
              Company
            </Label>
            <Input {...form.register("company")} />
            {form.formState.errors.company && (
              <p className="text-sm text-red-500">
                {form.formState.errors.company.message}
              </p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="dark:text-neutral-300 text-neutral-700">
                Location
              </Label>
              <Input {...form.register("location")} />
            </div>
            <div>
              <Label className="dark:text-neutral-300 text-neutral-700">
                Employment Type
              </Label>
              <Controller
                control={form.control}
                name="employmentType"
                render={({ field }) => (
                  <Select onValueChange={field.onChange} value={field.value}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select employment type" />
                    </SelectTrigger>
                    <SelectContent>
                      {EMPLOYMENT_TYPES.map((type) => (
                        <SelectItem key={type} value={type}>
                          {type}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </div>
          </div>

          <div>
            <Label className="dark:text-neutral-300 text-neutral-700">
              Website
            </Label>
            <Input
              placeholder="https://example.com"
              {...form.register("website")}
            />
          </div>

          <Separator className="my-6" />

          <div>
            <Label className="dark:text-neutral-300 text-neutral-700">
              Description
            </Label>
            <RichTextEditor
              value={form.watch("description") || ""}
              onChange={(val) => form.setValue("description", val, { shouldDirty: true, shouldTouch: true })}
              placeholder="Describe your responsibilities, projects, and achievements"
              minHeight="150px"
            />
          </div>

          <DateRangePicker
            control={form.control}
            startName="startDate"
            endName="endDate"
            className="mt-4 grid grid-cols-2 gap-4"
          />
          <div className="flex items-center gap-2">
            <Controller
              name="currentlyWorking"
              control={form.control}
              render={({ field }) => (
                <Checkbox
                  id="currentlyWorking"
                  checked={field.value}
                  onCheckedChange={(checked) => {
                    const isChecked = checked === true;
                    field.onChange(isChecked);
                    if (isChecked) {
                      form.setValue("endDate", undefined, {
                        shouldDirty: true,
                        shouldTouch: true,
                      });
                    }
                  }}
                />
              )}
            />
            <Label
              htmlFor="currentlyWorking"
              className="dark:text-neutral-300 text-neutral-700"
            >
              Are you currently working here?
            </Label>
          </div>

          <div className="flex justify-end">
            <Button
              type="submit"
              className="w-full rounded-md"
              variant="outline"
              disabled={upsertMutation.isPending}
            >
              {upsertMutation.isPending && (
                <Loader className="size-4 animate-spin mr-2" />
              )}
              {activeTab?.id ? "Save changes" : "Add experience"}
            </Button>
          </div>
        </form>
      )}
    </div>
  );
};

export const WorkExperienceFormSkeleton = () => (
  <>
    <Skeleton className="h-6 w-24 mb-4" />
    {[...Array(4)].map((_, i) => (
      <div key={i} className="mt-4 space-y-2">
        <Skeleton
          className={cn("h-[40px] w-full rounded-lg", i === 2 && "h-[100px]")}
        />
      </div>
    ))}
  </>
);
