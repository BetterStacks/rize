"use client";
import { getAllPages } from "@/lib/server-actions";
import { useQuery } from "@tanstack/react-query";
import { usePageDialog } from "../dialog-provider";
import WritingCard from "./writing-card";

const Writings = () => {
  const [_, setIsOpen] = usePageDialog();
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
        <div>
          <h2 className="text-xl font-medium mb-4">Writings</h2>
        </div>
        {data?.map((writing, i) => {
          return <WritingCard key={i} data={writing} />;
        })}
      </div>
    </div>
  );
};

export default Writings;
