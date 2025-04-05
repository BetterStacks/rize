import React, { FC } from "react";
import { Skeleton } from "./ui/skeleton";
import { ScrollArea, ScrollBar } from "./ui/scroll-area";
import { Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import Image from "next/image";
import { GalleryItemProps } from "@/lib/types";

type HighlightsProps = {
  // isLoading: boolean;
  isMine: boolean;
  data: GalleryItemProps[];
};

const Highlights: FC<HighlightsProps> = ({ isMine, data }) => {
  return (
    <div className="w-full flex mt-4  items-start justify-center">
      <div className="max-w-2xl w-full flex flex-col">
        <h2 className="w-full max-w-2xl  text-left   text-xl font-medium mb-4">
          Highlights
        </h2>
        <ScrollArea className="relative whitespace-nowrap w-full max-w-2xl  overflow-x-auto  ">
          <ScrollBar className="" orientation="horizontal" />
          <div className="w-full space-x-3 flex mb-6  ">
            {data?.length !== 0 && isMine && (
              <div className="w-full max-w-[170px] shrink-0 aspect-[9/16] border-[2.5px]  border-dashed border-neutral-300/80 dark:border-dark-border h-full relative overflow-hidden rounded-3xl flex items-center justify-center">
                <Plus className="size-8 opacity-60" />
              </div>
            )}
            {data.slice(3, isMine ? 6 : 7).map((item) => (
              <div
                key={item.id}
                style={{ aspectRatio: 9 / 16 }}
                className="w-full max-w-[170px] shrink-0 border border-neutral-200 dark:border-dark-border h-full relative overflow-hidden rounded-3xl"
              >
                {item?.type === "image" ? (
                  <Image
                    fill
                    src={item.url}
                    style={{ objectFit: "cover" }}
                    alt={""}
                  />
                ) : (
                  <video
                    src={item.url}
                    // className="w-full h-full "
                    style={{
                      objectFit: "cover",
                      width: "100%",
                      height: "100%",
                    }}
                    autoPlay
                    muted
                    loop
                  />
                )}
              </div>
            ))}
          </div>
        </ScrollArea>
      </div>
    </div>
  );
};

export default Highlights;
