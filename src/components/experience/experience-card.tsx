import { TExperience } from "@/lib/types";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { CalendarIcon, Dot, Edit2, Loader, Trash } from "lucide-react";
import { useQueryState } from "nuqs";
import React, { FC } from "react";
import { Button } from "../ui/button";
import { deleteExperience } from "@/actions/experience-actions";
import { useMutation } from "@tanstack/react-query";
import { queryClient } from "@/lib/providers";
import toast from "react-hot-toast";
import { useSession } from "next-auth/react";
import { useActiveSidebarTab } from "@/lib/context";

type ExperienceCardProps = {
  experience: TExperience;
  isMine: boolean;
};

const ExperienceCard: FC<ExperienceCardProps> = ({ experience, isMine }) => {
  const session = useSession();
  const [activeTab, setActiveTab] = useActiveSidebarTab();
  const formatDate = (date?: string) =>
    date
      ? new Date(date).toLocaleDateString(undefined, {
          year: "numeric",
          month: "short",
        })
      : "—";
  const { mutate: handleDeleteExperience, isPending } = useMutation({
    mutationFn: deleteExperience,
    onSuccess() {
      queryClient.invalidateQueries({
        queryKey: ["get-all-experience", session?.data?.user?.username],
      });
      toast.success("Experience deleted successfully");
    },
    onError() {
      toast.error("Failed to delete experience");
    },
  });
  return (
    <motion.div
      className={cn(
        "flex flex-col w-full bg-neutral-100 dark:bg-neutral-800 transition-all  rounded-2xl border border-neutral-300/60 dark:border-dark-border p-4 md:p-6 ",
        activeTab?.id === experience?.id &&
          "dark:bg-indigo-400/10 border-2 border-dashed bg-indigo-400/15 border-indigo-400/30 dark:border-indigo-400/20"
      )}
    >
      <div>
        <div className="flex justify-between group relative items-center ">
          <h3 className="md:text-lg font-medium tracking-tight">
            {experience?.title}
          </h3>
          {isMine && (
            <div className="space-x-2 group-hover:opacity-100 opacity-0 absolute right-0 flex items-center justify-center">
              <Button
                variant={"outline"}
                className="rounded-lg  text-sm"
                size={"smallIcon"}
                onClick={() => {
                  setActiveTab((prev) => ({
                    id: prev?.id === experience.id ? null : experience.id,
                    tab: "work-experience",
                  }));
                }}
              >
                <Edit2 className="size-4 opacity-80" />
              </Button>
              <Button
                variant={"outline"}
                className="rounded-lg  text-sm"
                size={"smallIcon"}
                onClick={() => handleDeleteExperience(experience.id)}
                disabled={isPending}
              >
                {isPending ? (
                  <Loader className="size-4 opacity-80 animate-spin" />
                ) : (
                  <Trash className="size-4 opacity-80" />
                )}
              </Button>
            </div>
          )}
        </div>
        <div className="inline-flex mt-1 text-sm md:text-base font-medium -space-x-0.5 opacity-80  items-center ">
          <div className=" ">
            <span>
              {" "}
              {formatDate(experience?.startDate?.toString())} –{" "}
              {experience?.currentlyWorking
                ? "Present"
                : formatDate(experience?.endDate?.toString())}
            </span>
          </div>
          <Dot className="leading-none" />
          <span className="">{experience?.company}</span>
          <Dot className="leading-none" />
          <span className="">{experience?.location}</span>
          <Dot className="leading-none" />
          <span className="">{experience?.employmentType}</span>
        </div>
      </div>
    </motion.div>
  );
};

export default ExperienceCard;
