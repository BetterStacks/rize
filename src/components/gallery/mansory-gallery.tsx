import { getGalleryItems } from "@/actions/gallery-actions";
import { GalleryItemProps } from "@/lib/types";
import { useQuery } from "@tanstack/react-query";
import { motion, Variants } from "framer-motion";
import { useParams } from "next/navigation";
import React, { FC } from "react";
import { Skeleton } from "../ui/skeleton";
import { cn } from "@/lib/utils";
import GalleryItem from "./gallery-item";

type GalleryProps = {
  isMine: boolean;
  items: GalleryItemProps[];
};

const MansoryGallery: FC<GalleryProps> = ({ isMine, items }) => {
  const { username } = useParams<{ username: string }>();

  const { data, isLoading } = useQuery({
    queryKey: ["get-gallery-items", username],
    initialData: items,
    queryFn: () => getGalleryItems(username!),
  });

  return (
    <div className="w-full mt-6 md:hidden flex flex-col items-center justify-center">
      <motion.div className=" w-full ">
        {isLoading ? (
          <GallerySkeleton />
        ) : (
          <motion.div className="columns-2 md:columns-3 space-1 relative w-full">
            {data?.map((item, i) => {
              return (
                <motion.div
                  style={{
                    aspectRatio: item.width / item.height,
                  }}
                  key={i}
                  className="flex relative first:mt-0 mt-3 overflow-hidden rounded-3xl"
                >
                  <GalleryItem index={i} isMine={isMine} item={item} />
                </motion.div>
              );
            })}
          </motion.div>
        )}
      </motion.div>
    </div>
  );
};

const GallerySkeleton = () => {
  return (
    <div className={cn("w-full columns-2 md:columns-3 gap-2 relative", "")}>
      {[...Array.from({ length: 4 })].map((_, i) => (
        <Skeleton
          key={i}
          className={cn(
            " h-[250px] aspect-auto w-full bg-neutral-200 dark:bg-dark-border rounded-3xl cursor-grab  first:mt-0 mt-3 active:cursor-grabbing "
          )}
        />
      ))}
    </div>
  );
};

export default MansoryGallery;
