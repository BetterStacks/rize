"use client";
import { createPage, getAllPages } from "@/actions/page-actions";
import { GetAllWritings } from "@/lib/types";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { FileText, Plus } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import toast from "react-hot-toast";
import { Button } from "../ui/button";
import { Skeleton } from "../ui/skeleton";
import WritingCard from "./writing-card";

type WritingsProps = {
  isMine: boolean;
  writings: GetAllWritings[];
};

const Writings = ({ isMine, writings }: WritingsProps) => {
  const router = useRouter();

  const { username } = useParams<{ username: string }>();
  const { data, isFetching } = useQuery({
    queryKey: ["get-writings", username],
    initialData: writings,
    queryFn: () => getAllPages(username),
    refetchOnWindowFocus: false,
    refetchOnMount: false,
  });

  const createNewPage = async () => {
    const page = await createPage();
    if (page?.error) {
      toast.error(page.error);
      return;
    }
    toast.success("Page created");
    router.push(`/page/${page?.data?.id}`);
  };
  return (
    <div
      id="writings"
      className="w-full my-12 px-2 md:px-4 flex flex-col items-center justify-start"
    >
      <div className="max-w-2xl w-full flex mb-2 md:mb-4 items-center justify-between">
        <h2 className="text-xl font-medium ">Writings</h2>
        {isMine && (
          <Button
            className="  rounded-lg scale-90 text-sm"
            onClick={createNewPage}
            size={"sm"}
            variant={"outline"}
          >
            <Plus className="opacity-80 mr-2 size-4" />
            New Page
          </Button>
        )}
      </div>
      <div className="w-full max-w-2xl mt-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-1 gap-6 ">
        {isFetching ? (
          [...Array.from({ length: 4 })].map((_, i) => (
            <Skeleton
              key={i}
              className="w-full h-[140px] mt-3 rounded-xl animate-pulse bg-neutral-200 dark:bg-dark-border"
            />
          ))
        ) : data?.length === 0 ? (
          <EmptyWritingState onCreateNew={createNewPage} />
        ) : (
          data?.map((writing, i) => {
            return (
              <motion.div key={i} custom={i}>
                <WritingCard data={writing} />
              </motion.div>
            );
          })
        )}
      </div>
    </div>
  );
};

interface EmptyWritingStateProps {
  title?: string;
  description?: string;
  ctaText?: string;
  onCreateNew?: () => void;
}

export function EmptyWritingState({
  title = "Start Your Writing Journey",
  description = "Your ideas deserve to be shared. Create your first piece and let your words flow.",
  ctaText = "Create New Document",
  onCreateNew = () => {},
}: EmptyWritingStateProps) {
  const [isHovering, setIsHovering] = useState(false);

  return (
    <div className="flex h-full min-h-[400px] border-2 border-neutral-300/60 dark:border-dark-border/80 rounded-3xl border-dashed w-full items-center justify-center">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex max-w-md flex-col items-center text-center"
      >
        <div className="mb-6 flex size-16 items-center justify-center rounded-full bg-gradient-to-br from-violet-100 to-indigo-100 dark:from-violet-900/20 dark:to-indigo-900/20">
          <motion.div
            animate={{ rotate: isHovering ? 15 : 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 15 }}
          >
            <div className="relative">
              <FileText
                className="size-6 text-violet-500 dark:text-violet-400"
                strokeWidth={1.5}
              />
              {/* <motion.div
                initial={{ opacity: 0, x: 5, y: 5 }}
                animate={{ opacity: 1, x: 0, y: 0 }}
                transition={{ delay: 0.3, duration: 0.5 }}
                className="absolute -right-1 -top-1"
              >
                <PenLine
                  className="h-5 w-5 text-indigo-500 dark:text-indigo-400"
                  strokeWidth={1.5}
                />
              </motion.div> */}
            </div>
          </motion.div>
        </div>
        <h3 className="mb-2 text-xl font-medium tracking-tight">{title}</h3>
        <p className="mb-6 opacity-80 leading-tight px-6">{description}</p>
        <Button
          size="sm"
          className="gap-2 bg-gradient-to-r from-violet-500 to-indigo-500 text-white hover:from-violet-600 hover:to-indigo-600 dark:from-violet-600 dark:to-indigo-600 dark:hover:from-violet-700 dark:hover:to-indigo-700 rounded-lg scale-90"
          onMouseEnter={() => setIsHovering(true)}
          onMouseLeave={() => setIsHovering(false)}
          onClick={onCreateNew}
        >
          <Plus className="h-4 w-4" />
          {ctaText}
        </Button>
      </motion.div>
    </div>
  );
}

export default Writings;
