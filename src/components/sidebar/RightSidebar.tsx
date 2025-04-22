"use client";
import { addGalleryItem, getGalleryItem } from "@/actions/gallery-actions";
import { queryClient } from "@/lib/providers";
import { cn, isImageUrl, isVideoUrl, MAX_GALLERY_ITEMS } from "@/lib/utils";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useMutation, useQuery } from "@tanstack/react-query";
import axios from "axios";
import { AlignJustify, Loader, Upload, X } from "lucide-react";
import Image from "next/image";
import { useEffect, useState } from "react";
import { useDropzone } from "react-dropzone";
import toast from "react-hot-toast";
import { v4 } from "uuid";
import { useGalleryItems } from "../gallery/gallery-context";
import GalleryLimit from "../GalleryLimit";
import SectionManager from "../SectionManager";
import SocialLinksManager from "../SocialLinksManager";
import { Button } from "../ui/button";
import { ScrollArea } from "../ui/scroll-area";

const RightSidebar = () => {
  return (
    <div className="h-screen w-full  flex flex-col items-start justify-between ">
      <ScrollArea className="h-full w-full overflow-y-auto flex flex-col ">
        <div className="mb-10">
          <EditGallery />
          <SocialLinksManager />
          <SectionManager />
        </div>
      </ScrollArea>
    </div>
  );
};

function SortableItem({ id, name }: { [key: string]: string }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "p-2 mb-2 w-full flex items-center justify-between    rounded-lg cursor-pointer",
        isDragging && "drop-shadow-xl z-10 shadow-black/40 "
      )}
    >
      <span className="ml-2 opacity-80">{name}</span>
      <button {...attributes} {...listeners}>
        <AlignJustify strokeWidth={1.4} className="size-4" />
      </button>
    </div>
  );
}

type MediaFile = {
  id: string;
  url: string;
  type: "image" | "video";
  file: File;
};

function EditGallery() {
  const [files, setFiles] = useState<MediaFile[]>([]);
  const { items } = useGalleryItems();
  const [isDisabled, setIsDisabled] = useState(false);

  useEffect(() => {
    if (items.length === 0 || files.length === 0) return;
    const count = items.length;
    const limit = MAX_GALLERY_ITEMS;
    console.log("items", items, files);

    const total = count + files.length;

    if (total >= limit) {
      setIsDisabled(true);

      setFiles((prev) => prev.slice(0, limit - count));
    } else {
      setIsDisabled(false);
    }
  }, [files, items]);

  const onDrop = (acceptedFiles: File[]) => {
    const newFiles = acceptedFiles.map((file) => ({
      id: v4(),
      url: URL.createObjectURL(file),
      type: file.type.startsWith("image") ? "image" : "video",
      file: file,
    }));
    setFiles((prev) => [...prev, ...(newFiles as MediaFile[])]);
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    multiple: true,
    disabled: isDisabled,
    accept: {
      "image/*": [".png", ".jpg", ".jpeg"],
      "video/*": [".mp4", ".webm", ".mov"],
    },
  });

  const removeFile = (id: string) => {
    setFiles((prev) => prev.filter((file) => file.id !== id));
  };
  const uploadMedia = async (formData: FormData) => {
    const res = await axios.post("/api/upload/files", formData);
    if (res.status !== 200) throw new Error("Upload failed");
    return res.data?.data;
  };

  const { mutate: handleUpload, isPending } = useMutation({
    mutationFn: uploadMedia,
    onSuccess: async (data) => {
      setFiles([]);
      await Promise.all(
        data.map(async (result: any) => {
          const item = await addGalleryItem(result);
          return item;
        })
      );
      queryClient.invalidateQueries({ queryKey: ["get-gallery-items"] });
    },
    onError: (error) => {
      toast.error(error?.message);
    },
  });

  const handleAddItems = () => {
    const formData = new FormData();
    files.forEach((file) => formData.append("files", file?.file));
    formData.append("folder", "fyp-stacks/gallery");

    handleUpload(formData);
  };

  const limit = Math.floor((items.length / MAX_GALLERY_ITEMS) * 100);

  return (
    <div className="h-full overflow-hidden  w-full pt-6">
      {limit !== 100 && (
        <div className="flex flex-col">
          <h3 className="text-xl px-4 leading-tight tracking-tight mb-3">
            Add To Gallery
          </h3>
          <div className="p-4 flex flex-col">
            <div
              {...getRootProps()}
              className={cn(
                "w-full max-w-lg p-6 border-2 flex flex-col items-center justify-center border-dashed rounded-2xl text-center cursor-pointer transition border-neutral-300 dark:border-dark-border",
                isDragActive && "border-blue-500 bg-blue-50"
              )}
            >
              <input {...getInputProps()} />
              <div className="w-full h-full flex flex-col items-center justify-center">
                <div className="mb-2">
                  <Upload className="opacity-70 size-12" strokeWidth={1.6} />
                </div>
                <p className="text-neutral-600 dark:text-neutral-400 max-w-[200px] text-center text-sm">
                  Drag & Drop images or videos here, or click to select files
                </p>
              </div>{" "}
            </div>
          </div>
          <div className="w-full h-full px-4 pt-2 mb-4">
            <Button
              disabled={files.length === 0}
              onClick={handleAddItems}
              className="w-full"
              variant="outline"
            >
              {isPending && (
                <Loader className="opacity-80 animate-spin size-4 mr-2" />
              )}{" "}
              Add Media
            </Button>
            <div className="w-full flex flex-wrap gap-2 mt-4">
              {files.map((file) => (
                <div
                  key={file.id}
                  className="w-fit flex items-center justify-center gap-x-2 border border-neutral-300/60 dark:border-dark-border/80 rounded-xl relative group p-1 "
                >
                  <div className="size-8 relative rounded-lg overflow-hidden">
                    {file.type === "image" ? (
                      <Image
                        fill
                        src={file.url}
                        alt="Preview"
                        className="w-full aspect-square object-cover "
                      />
                    ) : (
                      <video
                        src={file.url}
                        className="w-full aspect-square object-cover"
                      />
                    )}
                  </div>
                  <div className="max-w-[80px] line-clamp-1">
                    <span className="opacity-90">{file?.file?.name}</span>
                  </div>
                  <Button
                    onClick={() => removeFile(file?.id)}
                    variant={"outline"}
                    size={"smallIcon"}
                    className="size-6"
                    // className="absolute top-2 z-10 right-2"
                  >
                    <X className="size-3" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
      <div className="px-4">
        <GalleryLimit itemCount={items?.length} />
      </div>
    </div>
  );
}

type GalleryItemProps = {
  id: string;
};

// function EditGalleryItem({ id }: GalleryItemProps) {
//   const { data } = useQuery({
//     queryKey: ["get-gallery-item", id],
//     queryFn: () => getGalleryItem(id),
//   });
//   console.log(data);
//   return (
//     <div className="">
//       <div className="mt-6 px-4 pt-3">
//         {data && isImageUrl(data?.url) && (
//           <Image
//             src={data?.url}
//             className="rounded-3xl aspect-square"
//             style={{ objectFit: "cover" }}
//             width={500}
//             height={500}
//             alt=""
//           />
//         )}
//         {data && isVideoUrl(data?.url) && (
//           <video
//             className="rounded-3xl aspect-square"
//             style={{ objectFit: "cover" }}
//             width={500}
//             height={500}
//             muted
//             src={data?.url}
//             controls
//           />
//         )}
//       </div>
//     </div>
//   );
// }

export default RightSidebar;
