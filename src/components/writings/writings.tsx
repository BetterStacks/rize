"use client";
import { createPage, getAllPages } from "@/lib/server-actions";
import { useQuery } from "@tanstack/react-query";
import { Plus } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { Button } from "../ui/button";
import WritingCard from "./writing-card";
import { Skeleton } from "../ui/skeleton";

type WritingsProps = {
  isMine: boolean;
};

const Writings = ({ isMine }: WritingsProps) => {
  const router = useRouter();

  const { username } = useParams<{ username: string }>();
  const { data, isFetching } = useQuery({
    enabled: !!username,
    queryKey: ["get-writings", username],
    queryFn: () => getAllPages(username),
    refetchOnWindowFocus: false,
  });
  if (data?.length === 0) return;
  return (
    <div
      id="writings"
      className="w-full my-12 px-4 flex flex-col items-center justify-start"
    >
      <div className="w-full flex flex-col max-w-2xl gap-y-5 ">
        <div className="w-full flex items-center justify-between">
          <h2 className="text-xl font-medium mb-4">Writings</h2>
          {isMine && (
            <Button
              className="size-8 p-1 rounded-full "
              onClick={async () => {
                const page = await createPage();
                if (page?.error) {
                  toast.error(page.error);
                  return;
                }
                toast.success("Page created");
                router.push(`/page/${page?.data?.id}`);
              }}
            >
              <Plus className="opacity-80  size-4" />
            </Button>
          )}
        </div>
        {isFetching
          ? [...Array.from({ length: 4 })].map((_, i) => (
              <Skeleton
                key={i}
                className="w-full h-28 rounded-xl animate-pulse bg-neutral-200 dark:bg-dark-border"
              />
            ))
          : data?.map((writing, i) => {
              return <WritingCard key={i} data={writing} />;
            })}
      </div>
    </div>
  );
};

export default Writings;
