"use client";
import { queryClient } from "@/lib/providers";
import {
  addGalleryItem,
  getGalleryItem,
  uploadFilesToCloudinary,
} from "@/lib/server-actions";
import { GalleryConfigProps } from "@/lib/types";
import { cn, isImageUrl, isVideoUrl } from "@/lib/utils";
import { useLocalStorage } from "@mantine/hooks";
import { Upload, X } from "lucide-react";
import { useQueryState } from "nuqs";
import { useMemo, useState } from "react";
import { useDropzone } from "react-dropzone";
import toast from "react-hot-toast";
import { Button } from "./ui/button";
import { Label } from "./ui/label";
import { ScrollArea } from "./ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { useQuery } from "@tanstack/react-query";
import Image from "next/image";

const RightSidebar = () => {
  const [galleryItem] = useQueryState("gallery");
  return (
    <div className="h-screen w-full">
      {!galleryItem && <EditGallery />}
      {galleryItem && <EditGalleryItem id={galleryItem} />}
    </div>
  );
};
type MediaFile = {
  id: string;
  url: string;
  type: "image" | "video";
  file: File;
};

function EditGallery() {
  const [files, setFiles] = useState<MediaFile[]>([]);
  const [config, setConfig] = useLocalStorage<GalleryConfigProps>({
    key: "gallery-config",
  });

  // Handle dropped files
  const onDrop = (acceptedFiles: File[]) => {
    const newFiles = acceptedFiles.map((file) => ({
      id: crypto.randomUUID(),
      url: URL.createObjectURL(file),
      type: file.type.startsWith("image") ? "image" : "video",
      file: file,
    }));
    setFiles((prev) => [...prev, ...(newFiles as MediaFile[])]);
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    multiple: true,
    accept: {
      "image/*": [".png", ".jpg", ".jpeg"],
      "video/*": [".mp4", ".webm", ".mov"],
    },
  });

  const removeFile = (id: string) => {
    setFiles((prev) => prev.filter((file) => file.id !== id));
  };
  const handleAddItems = async () => {
    const formData = new FormData();
    files.forEach((file) => {
      formData.append("files", file.file);
      formData.append("type", file.type);
    });
    try {
      const result = await uploadFilesToCloudinary(formData);
      console.log(result);
      if (result.error && !result.success) {
        throw new Error(result.error);
      }
      for (const url of result.data!) {
        const item = await addGalleryItem(url);
        console.log(item);
        if (!item) {
          throw new Error("Error adding gallery item");
        }
      }
      queryClient.invalidateQueries({ queryKey: ["get-gallery-items"] });
    } catch (error) {
      console.error(error);
      toast.error((error as Error)?.message);
    }
  };

  return (
    <div className="h-screen overflow-hidden  w-full pt-6">
      <div className="flex flex-col">
        <h3 className="text-xl px-4 leading-tight tracking-tight mb-3">
          Edit Gallery
        </h3>
        {/* <div className="w-full h-[200px] border-[3px] border-neutral-300 dark:border-dark-border rounded-3xl bg-neutral-100 dark:bg-[#242424] border-dashed flex items-center justify-center">
        <div className="flex flex-col items-center justify-center">
          <Download className="opacity-80" size={38} strokeWidth={2} />
          <div className="mt-3 flex flex-col items-center justify-center">
          <span className="opacity-80">Choose Images & Videos</span>
          <Button variant={"outline"}>Choose</Button>
          </div>
          </div>
      </div> */}
        <div className="p-4 flex flex-col">
          <Label id="cols-select-menu" className="mb-2">
            Columns
          </Label>
          <Select
            value={String(config?.cols)}
            onValueChange={(v) =>
              setConfig((prev) => ({ ...prev, cols: v as any }))
            }
          >
            <SelectTrigger
              id="cols-select-menu"
              className="w-full rounded-xl mb-4 dark:border-dark-border"
            >
              <SelectValue placeholder="Select No of Columns" />
            </SelectTrigger>
            <SelectContent defaultValue={String(config?.cols)}>
              <SelectItem value="2">2</SelectItem>
              <SelectItem value="3">3</SelectItem>
              <SelectItem value="4">4</SelectItem>
            </SelectContent>
          </Select>
          <div
            {...getRootProps()}
            className={cn(
              "w-full max-w-lg p-6 border-2 flex flex-col items-center justify-center border-dashed rounded-2xl text-center cursor-pointer transition border-neutral-300 dark:border-dark-border",
              isDragActive && "border-blue-500 bg-blue-50"
            )}
          >
            <input {...getInputProps()} />
            <div className="mb-2">
              <Upload className="opacity-80 size-16" strokeWidth={1.6} />
            </div>
            <p className="text-neutral-600 text-sm">
              Drag & Drop images or videos here, or click to select files
            </p>
          </div>
        </div>
        <div className="w-full h-full px-4 pt-2">
          <Button
            disabled={files.length === 0}
            onClick={handleAddItems}
            className="w-full"
          >
            Add Media
          </Button>
          <ScrollArea className="h-full w-full flex flex-col items-start justify-start ">
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
          </ScrollArea>
        </div>
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
