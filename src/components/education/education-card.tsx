import { deleteEducation } from "@/actions/education-actions";
import { useActiveSidebarTab, useRightSidebar } from "@/lib/context";
import { queryClient } from "@/lib/providers";
import { TEducation } from "@/lib/types";
import { cn } from "@/lib/utils";
import { useMutation } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Dot, Edit2, Loader, Trash } from "lucide-react";
import { useSession } from "next-auth/react";
import { FC } from "react";
import toast from "react-hot-toast";
import { Button } from "../ui/button";
import { useMediaQuery } from "@mantine/hooks";

type EducationCardProps = {
  education: TEducation;
  isMine: boolean;
};

const EducationCard: FC<EducationCardProps> = ({ education, isMine }) => {
  const [tab, setTab] = useActiveSidebarTab();
  const session = useSession();
  const isDesktop = useMediaQuery("(min-width: 1024px)");
  const setOpen = useRightSidebar()[1];
  const formatDate = (date?: string) =>
    date
      ? new Date(date).toLocaleDateString(undefined, {
          year: "numeric",
          month: "short",
        })
      : "—";
  const { mutate: handleDeleteEducation, isPending } = useMutation({
    mutationFn: deleteEducation,
    onSuccess() {
      queryClient.invalidateQueries({
        queryKey: ["get-education", session?.data?.user?.username],
      });
      toast.success("Education deleted successfully");
    },
    onError() {
      toast.error("Failed to delete Education");
    },
  });
  return (
    <motion.div
      className={cn(
        "flex flex-col w-full bg-neutral-100 dark:bg-neutral-800 transition-all  rounded-2xl border border-neutral-300/60 dark:border-dark-border p-4 md:p-6 ",
        tab?.id === education?.id &&
          "dark:bg-indigo-400/10 border-2 border-dashed bg-indigo-400/15 border-indigo-400/30 dark:border-indigo-400/20"
      )}
    >
      <div>
        <div className="flex justify-between group relative items-center ">
          <h3 className="md:text-lg font-medium tracking-tight">
            {education?.fieldOfStudy}
          </h3>
          {isMine && (
            <div className="space-x-2 group-hover:opacity-100 opacity-0 absolute right-0 flex items-center justify-center">
              <Button
                variant={"outline"}
                className="rounded-lg  text-sm"
                size={"smallIcon"}
                onClick={() => {
                  setTab((prev) => ({
                    id: prev?.id === education?.id ? null : education?.id,
                    tab: "education",
                  }));
                  if (!isDesktop) {
                    setOpen(true);
                  }
                }}
              >
                <Edit2 className="size-4 opacity-80" />
              </Button>
              <Button
                variant={"outline"}
                className="rounded-lg  text-sm"
                size={"smallIcon"}
                onClick={() => handleDeleteEducation(education.id)}
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
          <span className="">{education?.school}</span>
          <Dot className="leading-none" />
          <span className="">{education?.degree}</span>
          <Dot className="leading-none" />
          <span>
            {" "}
            {formatDate(education?.startDate?.toString())} –{" "}
            {formatDate(education?.endDate?.toString())}
          </span>
        </div>
      </div>
    </motion.div>
  );
};

export default EducationCard;
