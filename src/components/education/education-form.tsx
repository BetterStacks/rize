"use client";

import {
  upsertEducation,
  getEducationById as getEducationByID,
} from "@/actions/education-actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { useForm } from "react-hook-form";
import { useMutation, useQuery } from "@tanstack/react-query";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useQueryState } from "nuqs";
import { queryClient } from "@/lib/providers";
import { cn } from "@/lib/utils";
import { toIsoString } from "@/lib/date";
import toast from "react-hot-toast";
import { FC, useEffect, useState } from "react";
import { Loader } from "lucide-react";
import { useActiveSidebarTab } from "@/lib/context";
import { useParams } from "next/navigation";
import { DateRangePicker } from "../sidebar/components/DateRangePicker";

// Schema (same as your server-side one)
const educationSchema = z.object({
  id: z.string().optional(),
  school: z.string().min(1, "School name is required"),
  degree: z.string().optional(),
  fieldOfStudy: z.string().optional(),
  startDate: z.date().optional(),
  endDate: z.date().optional(),
  grade: z.string().optional(),
  activities: z.string().optional(),
  description: z.string().optional(),
});

type EducationFormData = z.infer<typeof educationSchema>;

type EducationFormProps = {
  defaultValues?: {
    id: string;
    school: string;
    degree: string | null;
    fieldOfStudy: string | null;
    startDate: Date | null;
    endDate: Date | null;
    grade: string | null;
    description: string | null;
    createdAt: Date | null;
    updatedAt: Date;
    profileId: string;
  };
  isFetchingValues?: boolean;
};

export const EducationForm: FC<EducationFormProps> = ({
  defaultValues,
  isFetchingValues,
}) => {
  const [activeTab, setActiveTab] = useActiveSidebarTab();
  const id = activeTab?.id as string | undefined;
  const { username } = useParams<{ username: string }>();
  const form = useForm<EducationFormData>({
    resolver: zodResolver(educationSchema),
  });

  const upsertMutation = useMutation({ mutationFn: upsertEducation });
  const mutateUpsert = upsertMutation.mutateAsync;

  // Prefill when editing
  useEffect(() => {
    if (!defaultValues) return;
    try {
      form.reset({
        id: defaultValues.id,
        school: defaultValues.school ?? "",
        degree: defaultValues.degree ?? "",
        fieldOfStudy: defaultValues.fieldOfStudy ?? "",
        startDate: defaultValues.startDate ?? undefined,
        endDate: defaultValues.endDate ?? undefined,
        grade: defaultValues.grade ?? "",
        description: defaultValues.description ?? "",
      });
    } catch (err) {
      console.error("Error populating education form defaults", err);
    }
  }, [defaultValues, form]);

  // Submit handler
  async function onSubmit(values: EducationFormData) {
    const payload = {
      ...values,
      ...(id && { id }),
      startDate: values.startDate ? (values.startDate as Date) : undefined,
      endDate: values.endDate ? (values.endDate as Date) : undefined,
    };

    const res = await mutateUpsert(payload, {
      onSuccess: async () => {
        await queryClient.invalidateQueries({
          queryKey: ["get-education", username],
        });
        toast.success(`Education ${id ? "updated" : "added"} successfully`);
        setActiveTab({ id: null, tab: "gallery" });
      },
      onError: (error) => {
        toast.error(
          error?.message || `Failed to ${id ? "update" : "add"} education`
        );
      },
    });
  }

  return (
    <div className="max-w-xl mx-auto p-6">
      <h2 className="text-xl mt-8 tracking-tight font-medium">
        {id ? "Edit Education" : "Add Education"}
      </h2>
      <span className="text-neutral-300 text-sm">
        Add details about your academic background and achievements.
      </span>

      {isFetchingValues ? (
        <EducationFormSkeleton />
      ) : (
        <form onSubmit={form.handleSubmit(onSubmit)} className="mt-6 space-y-4">
          <div>
            <Label className="dark:text-neutral-300 text-neutral-700">
              School / University
            </Label>
            <Input {...form.register("school")} />
            {form.formState.errors.school && (
              <p className="text-sm text-red-500">
                {form.formState.errors.school.message}
              </p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="dark:text-neutral-300 text-neutral-700">
                Degree
              </Label>
              <Input
                placeholder="BCA, B.Tech, etc."
                {...form.register("degree")}
              />
            </div>
            <div>
              <Label className="dark:text-neutral-300 text-neutral-700">
                Field of Study
              </Label>
              <Input
                placeholder="Computer Science, etc."
                {...form.register("fieldOfStudy")}
              />
            </div>
          </div>

          <DateRangePicker
            control={form.control}
            startName="startDate"
            endName="endDate"
            className="mt-4 grid grid-cols-2 gap-4"
          />

          <div>
            <Label className="dark:text-neutral-300 text-neutral-700">
              Grade
            </Label>
            <Input
              placeholder="9.2 CGPA, A+, etc."
              {...form.register("grade")}
            />
          </div>

          <Separator className="my-6" />

          <div>
            <Label className="dark:text-neutral-300 text-neutral-700">
              Description
            </Label>
            <Textarea
              rows={5}
              placeholder="Describe your coursework, projects, or academic achievements."
              {...form.register("description")}
            />
          </div>

          <div className="flex justify-end">
            <Button
              type="submit"
              className="w-full rounded-md"
              variant="outline"
              disabled={upsertMutation?.isPending}
            >
              {upsertMutation.isPending && (
                <Loader className="size-4 animate-spin mr-2" />
              )}
              {id ? "Save changes" : "Add education"}
            </Button>
          </div>
        </form>
      )}
    </div>
  );
};

// Skeleton for loading state
export const EducationFormSkeleton = () => (
  <>
    <Skeleton className="h-6 w-24 mb-4" />
    {[...Array(5)].map((_, i) => (
      <div key={i} className="mt-4 space-y-2">
        <Skeleton
          className={cn("h-[40px] w-full rounded-lg", i === 3 && "h-[100px]")}
        />
      </div>
    ))}
  </>
);
