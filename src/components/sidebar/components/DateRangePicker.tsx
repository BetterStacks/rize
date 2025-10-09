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
            <label className="text-sm mb-2">
              {startLabel}
              <span className="text-red-500 ml-1">*</span>
            </label>
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
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={field.value ? new Date(field.value) : undefined}
                  onSelect={(date) => field.onChange(date)}
                  initialFocus
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
            <label className="text-sm mb-2">
              {endLabel}

              <span className="text-red-500 ml-1">*</span>
            </label>
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
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={field.value ? new Date(field.value) : undefined}
                  onSelect={(date) => field.onChange(date)}
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
