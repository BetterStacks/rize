import { getGalleryItem, getPageById } from "@/lib/server-actions";
import { cn } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import { ImageIcon, Upload, X } from "lucide-react";
import Image from "next/image";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { useDropzone } from "react-dropzone";
import { Button } from "../ui/button";

type MediaFile = {
  id: string;
  url: string;
  type: "image" | "video";
  file: File;
};

const PageSidebar = () => {
  const params = useParams();
  const { data } = useQuery({
    queryKey: ["get-page-by-id", params?.id],
    queryFn: () => getPageById(params?.id as string),
  });
  const [file, setFile] = useState<MediaFile | null>(null);

  useEffect(() => {
    if (data?.data?.thumbnail) {
      setFile({
        id: data?.data?.thumbnail,
        url: data?.data?.thumbnail,
        type: "image",
        file: new File([], ""),
      });
    }
  }, []);
  const onDrop = (acceptedFiles: File[]) => {
    const newFile: MediaFile = {
      id: crypto.randomUUID(),
      url: URL.createObjectURL(acceptedFiles[0]),
      type: acceptedFiles[0].type.startsWith("image") ? "image" : "video",
      file: acceptedFiles[0],
    };
    setFile(newFile);
  };
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "image/*": [".png", ".jpg", ".jpeg", ".gif"],
      // "video/*": [".mp4", ".webm", ".mov"],
    },
  });
  return (
    <div className="w-full h-full px-4 pt-8">
      <div className="w-full mb-4">
        <h2 className="text-xl tracking-tight leading-tight ">Edit Page</h2>
      </div>
      {/* {data?.data?.thumbnail ? (
        <div className="aspect-video border-neutral-300 dark:border-dark-border border-dashed rounded-3xl overflow-hidden">
          <Image
            src={data?.data?.thumbnail}
            alt=""
            className="aspect-video rounded-3xl "
            style={{ objectFit: "contain" }}
            width={500}
            height={500}
          />
        </div>
      ) : ( */}
      <div
        {...getRootProps()}
        className={cn(
          "w-full max-w-lg p-6 border-2 flex flex-col items-center justify-center border-dashed rounded-2xl text-center cursor-pointer transition border-neutral-300 dark:border-dark-border",
          isDragActive && "border-blue-500 bg-blue-50"
        )}
      >
        <input {...getInputProps()} />
        {data?.data?.thumbnail ? (
          <Image
            src={data?.data?.thumbnail}
            alt=""
            className="aspect-video rounded-3xl "
            style={{ objectFit: "contain" }}
            width={500}
            height={500}
          />
        ) : (
          <>
            <div className="mb-2">
              <Upload className="opacity-80 size-12" strokeWidth={1.6} />
            </div>
            <p className="text-neutral-600 text-sm">
              Drag & Drop images or videos here, or click to select files
            </p>
          </>
        )}
      </div>
      {/* )} */}
      <div className="flex items-center mt-3 gap-2">
        <Button
          type="button"
          variant="outline"
          className="w-full"
          onClick={() => document.getElementById("thumbnail-upload")?.click()}
        >
          <ImageIcon className="mr-2 h-4 w-4" />
          {data?.data?.thumbnail ? "Change Thumbnail" : "Upload Thumbnail"}
        </Button>
        {data?.data?.thumbnail && (
          <Button
            type="button"
            variant="outline"
            size="icon"
            onClick={() => {}}
          >
            <X className="h-4 w-4" />
            <span className="sr-only">Remove thumbnail</span>
          </Button>
        )}
      </div>
    </div>
  );
};

export default PageSidebar;
