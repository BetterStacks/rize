"use client";
import { useSections } from "@/lib/context";
import { queryClient } from "@/lib/providers";
import { addGalleryItem, getGalleryItem } from "@/lib/server-actions";
import { cn, isImageUrl, isVideoUrl } from "@/lib/utils";
import { arrayMove, useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useLocalStorage } from "@mantine/hooks";
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
import SocialLinksManager from "../SocialLinksManager";
import { Button } from "../ui/button";
import { ScrollArea } from "../ui/scroll-area";

const RightSidebar = () => {
  const { sections, setSections } = useSections();

  const tabs = {
    gallery: {
      name: "Gallery",
    },
    "social-links": {
      name: "Social Links",
    },
  };
  const [activeTab, setActiveTab] = useLocalStorage<keyof typeof tabs | null>({
    key: "active-tab",
    defaultValue: null,
  });

  const handleDragEnd = (event: any) => {
    const { active, over } = event;
    if (active.id !== over.id) {
      const oldIndex = sections.findIndex((s) => s.id === active.id);
      const newIndex = sections.findIndex((s) => s.id === over.id);
      setSections(arrayMove(sections, oldIndex, newIndex));
    }
  };

  return (
    <div className="h-screen w-full  flex flex-col items-start justify-between">
      <ScrollArea className="h-full w-full overflow-y-auto flex flex-col  ">
        <EditGallery />
        <SocialLinksManager />
      </ScrollArea>
      {/* {!galleryItem && <EditGallery />} */}
      {/* <div className="pt-10 w-full flex flex-col items-center justify-start px-4">
        <DndContext
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={sections.map((s) => s.id)}
            strategy={verticalListSortingStrategy}
          >
            {sections.map((section) => (
              <SortableItem
                key={section.id}
                id={section.id}
                name={section.name}
              />
            ))}
          </SortableContext>
        </DndContext>
        {/* </div> */}
      {/* {galleryItem && <EditGalleryItem id={galleryItem} />} */}
      {/* </div> */}
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
  const { items, addItem } = useGalleryItems();
  const [isDisabled, setIsDisabled] = useState(false);

  useEffect(() => {
    if (items.length === 0 || files.length === 0) return;
    const count = items.length;
    const limit = 10;
    console.log("items", items, files);

    const total = count + files.length;

    if (total >= limit) {
      setIsDisabled(true);
      // toast.error(
      //   `You can only add ${limit} items to the gallery. Please remove some items before adding new ones.`
      // );
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
    setFiles([]); // Clear file input
  };

  // const handleAddItems = async () => {
  //   const formData = new FormData();
  //   files.forEach((file) => {
  //     formData.append("files", file.file);
  //   });
  //   formData.append("folder", "fyp-stacks/gallery");
  //   try {
  //     setIsUploading(true);

  //     const res = await axios.post("/api/upload/files", formData);
  //     // const result = await uploadFilesToCloudinary(formData);
  //     // console.log(result);
  //     // if (result.error && !result.success) {
  //     //   setIsUploading(false);
  //     //   throw new Error(result.error);
  //     // }
  //     console.log(res);
  //     if (res.status !== 200) {
  //       setIsUploading(false);
  //       throw new Error("Error uploading files", res.data?.error);
  //     }
  //     for (const result of res.data?.data!) {
  //       const item = await addGalleryItem(result);
  //       console.log(item);
  //       if (!item) {
  //         setIsUploading(false);
  //         throw new Error("Error adding gallery item");
  //       }
  //     }
  //     setIsUploading(false);
  //     toast.success("Media added to gallery");
  //     setFiles([]);
  //     queryClient.invalidateQueries({ queryKey: ["get-gallery-items"] });
  //   } catch (error) {
  //     console.error(error);
  //     toast.error((error as Error)?.message);
  //   }
  // };
  const limit = Math.floor((items.length / 10) * 100);

  return (
    <div className="h-full overflow-hidden  w-full pt-6">
      {limit !== 100 && (
        <div className="flex flex-col">
          <h3 className="text-xl px-4 leading-tight tracking-tight mb-3">
            Edit Gallery
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
          <div className="w-full h-full px-4 pt-2 mb-10">
            <Button
              disabled={files.length === 0}
              onClick={handleAddItems}
              className="w-full"
            >
              {isPending && (
                <Loader className="opacity-80 animate-spin size-4" />
              )}{" "}
              Add Media
            </Button>
            {files.map((file) => (
              <div key={file.id} className="relative group mt-3">
                <Button
                  onClick={() => removeFile(file?.id)}
                  variant={"outline"}
                  size={"icon"}
                  className="absolute top-2 z-10 right-2"
                >
                  <X className="size-5" />
                </Button>
                {file.type === "image" ? (
                  <img
                    src={file.url}
                    alt="Preview"
                    className="w-full h-[300px] object-cover rounded-md shadow-md"
                  />
                ) : (
                  <video
                    src={file.url}
                    controls
                    className="w-full h-[300px] rounded-md shadow-md"
                  />
                )}
              </div>
            ))}
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

function EditGalleryItem({ id }: GalleryItemProps) {
  const { data } = useQuery({
    queryKey: ["get-gallery-item", id],
    queryFn: () => getGalleryItem(id),
  });
  console.log(data);
  return (
    <div className="">
      <div className="mt-6 px-4 pt-3">
        {data && isImageUrl(data?.url) && (
          <Image
            src={data?.url}
            className="rounded-3xl aspect-square"
            style={{ objectFit: "cover" }}
            width={500}
            height={500}
            alt=""
          />
        )}
        {data && isVideoUrl(data?.url) && (
          <video
            className="rounded-3xl aspect-square"
            style={{ objectFit: "cover" }}
            width={500}
            height={500}
            muted
            src={data?.url}
            controls
          />
        )}
      </div>
    </div>
  );
}

export default RightSidebar;
