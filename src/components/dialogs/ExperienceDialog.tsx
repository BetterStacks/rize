import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog";
import { useExperienceDialog } from "../dialog-provider";
import { Input } from "../ui/input";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Label } from "../ui/label";

const ExperienceSchema = z.object({
  companyName: z.string().max(25),
  website: z.string().url(),
  position: z.string(),
  startDate: z.date().nullable(),
  endDate: z.date().nullable(),
});

const ExperienceDialog = () => {
  const [open, setOpen] = useExperienceDialog();
  const { register } = useForm<z.infer<typeof ExperienceSchema>>({
    resolver: zodResolver(ExperienceSchema),
  });
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent>
        <DialogHeader className="">
          <DialogTitle>Add Experience</DialogTitle>
        </DialogHeader>
        <div>
          <form>
            <div className="w-full flex items-center justify-center gap-x-6">
              <div className="w-full">
                <Label>Company Name</Label>
                <Input {...register("companyName")} />
              </div>
              <div className="w-full">
                <Label>Position</Label>
                <Input {...register("position")} />
              </div>
            </div>
            <div className="w-full ">
              <Label>Website</Label>
              <Input {...register("website")} />
            </div>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ExperienceDialog;
