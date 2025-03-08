"use client";
import { createPage, getAllPages } from "@/lib/server-actions";
import { useQuery } from "@tanstack/react-query";
import { Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { Button } from "../ui/button";
import WritingCard from "./writing-card";

const Writings = () => {
  const router = useRouter();
  const { data } = useQuery({
    queryKey: ["get-writings"],
    queryFn: getAllPages,
  });
  return (
    <div
      id="writings"
      className="w-full mt-12 px-4 flex flex-col items-center justify-start"
    >
      <div className="w-full flex flex-col max-w-2xl gap-y-5 ">
        <div className="w-full flex items-center justify-between">
          <h2 className="text-xl font-medium mb-4">Writings</h2>
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
        </div>
        {data?.map((writing, i) => {
          return <WritingCard key={i} data={writing} />;
        })}
      </div>
    </div>
  );
};

export default Writings;
