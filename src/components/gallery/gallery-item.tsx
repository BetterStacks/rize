import { removeGalleryItem } from "@/actions/gallery-actions";
import { queryClient } from "@/lib/providers";
import { GalleryConfigProps, GalleryItemProps } from "@/lib/types";
import { cn, isImageUrl } from "@/lib/utils";
import { useLocalStorage } from "@mantine/hooks";
import { motion, Variants } from "framer-motion";
import { Trash2, X } from "lucide-react";
import { useSession } from "next-auth/react";
import Image from "next/image";
import toast from "react-hot-toast";
import { Button } from "../ui/button";
import { galleryLayouts } from "./gallery";

type TGalleryItemProps = {
  item: GalleryItemProps;
  index: number;
  isMine: boolean;
};

function GalleryItem({ item, isMine }: TGalleryItemProps) {
  const removeItemFromGallery = async () => {
    if (!item.id) {
      throw new Error("Item not found in gallery");
    }
    try {
      const res = await removeGalleryItem(item.id);
      if (!res) {
        throw new Error("Failed to remove item from gallery");
      }
      toast.success("Item removed from gallery");
      queryClient.invalidateQueries({ queryKey: ["get-gallery-items"] });
    } catch (error) {
      toast.error((error as Error).message);
    }
  };

  return (
    <>
      {isMine && (
        <Button
          onClick={removeItemFromGallery}
          className={cn(
            "rounded-full absolute group-hover:opacity-100 opacity-0 z-20 top-2 right-2 p-1 "
          )}
          size={"icon"}
        >
          <Trash2 className="size-4 " />
        </Button>
      )}
      {item?.url && isImageUrl(item?.url) ? (
        <Image
          draggable={false}
          src={item?.url}
          alt=""
          fill
          className="select-none z-10"
          style={{ objectFit: "cover" }}
        />
      ) : (
        <video
          style={{ objectFit: "cover" }}
          className="w-full h-full "
          src={item?.url}
          autoPlay
          loop
          muted
          controls={false}
        />
      )}
    </>
  );
}

export default GalleryItem;
