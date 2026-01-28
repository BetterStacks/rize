"use client";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { Control, Controller, FieldPath, FieldValues } from "react-hook-form";

interface DateRangePickerProps<T extends FieldValues> {
  control: Control<T>;
  startName: FieldPath<T>;
  endName: FieldPath<T>;
  startLabel?: string;
  endLabel?: string;
  className?: string;
}

export function DateRangePicker<T extends FieldValues>({
  control,
  startName,
  endName,
  startLabel = "Start Date",
  endLabel = "End Date",
  className,
}: DateRangePickerProps<T>) {
  return (
    <div className={cn("flex flex-col", className)}>
      <Controller
        control={control}
        name={startName}
        render={({ field }) => (
          <div className="flex flex-col mb-2">
            <Label className="mb-1 dark:text-neutral-300 text-neutral-700">
              {startLabel}
              {/* <span className="text-red-500 ml-1">*</span> */}
            </Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "justify-start text-left rounded-md font-normal",
                    !field.value && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 opacity-80 h-4 w-4" />
                  <span className="text-sm text-neutral-800 dark:text-neutral-300">
                    {field.value ? (
                      format(new Date(field.value), "PPP")
                    ) : (
                      <span>Select date</span>
                    )}
                  </span>
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-2 dark:bg-dark-bg dark:border-dark-border rounded-2xl mt-2 border-neutral-200">
                <Calendar
                  {...({
                    className: "dark:bg-dark",
                    mode: "single",
                    selected: field.value ? new Date(field.value) : undefined,
                    onSelect: (date: Date | undefined) => field.onChange(date),
                    initialFocus: true,
                  } as any)}
                />
              </PopoverContent>
            </Popover>
          </div>
        )}
      />

      <Controller
        control={control}
        name={endName}
        render={({ field, fieldState }) => (
          <div className="flex flex-col ">
            <Label className="mb-1 dark:text-neutral-300 text-neutral-700">
              {endLabel}
            </Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "justify-start text-left rounded-md font-normal",
                    !field.value && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 opacity-80 h-4 w-4" />
                  <span className="text-sm text-neutral-800 dark:text-neutral-300">
                    {field.value ? (
                      format(new Date(field.value), "PPP")
                    ) : (
                      <span>Select date</span>
                    )}
                  </span>
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-2 dark:bg-dark-bg dark:border-dark-border rounded-2xl mt-2 border-neutral-200">
                <Calendar
                  {...({
                    mode: "single",
                    selected: field.value ? new Date(field.value) : undefined,
                    onSelect: (date: Date | undefined) => field.onChange(date),
                  } as any)}
                />
              </PopoverContent>
            </Popover>
            {fieldState.error && (
              <span className="text-red-500 text-xs">
                {fieldState.error.message}
              </span>
            )}
          </div>
        )}
      />
    </div>
  );
}
