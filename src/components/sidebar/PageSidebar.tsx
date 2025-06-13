import {
  getPageById,
  removePageThumbnail,
  updatePageThumbnail,
} from "@/actions/page-actions";
import { queryClient } from "@/lib/providers";
import { TUploadFilesResponse } from "@/lib/types";
import { cn } from "@/lib/utils";
import { useMutation, useQuery } from "@tanstack/react-query";
import axios from "axios";
import { Loader, Trash2, Upload } from "lucide-react";
import Image from "next/image";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { FileRejection, useDropzone } from "react-dropzone";
import toast from "react-hot-toast";
import { Button } from "../ui/button";

const PageSidebar = () => {
  const params = useParams();
  const { data } = useQuery({
    queryKey: ["get-page-by-id", params?.id],
    queryFn: () => getPageById(params?.id as string),
  });
  const [file, setFile] = useState<{ url: string; file: File } | null>(null);
  useEffect(() => {
    if (data?.thumbnail) {
      setFile({
        url: data?.thumbnail,
        file: new File([], data?.thumbnail),
      });
    }
  }, [data?.thumbnail]);

  const onDrop = (acceptedFiles: File[], rejectedFiles: FileRejection[]) => {
    if (rejectedFiles && rejectedFiles[0]?.errors) {
      rejectedFiles[0]?.errors?.map((err) => toast.error(err?.message));

      return;
    }
    const file = acceptedFiles[0];
    const path = URL.createObjectURL(file);
    setFile({ url: path, file });
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    maxFiles: 1,
    maxSize: 2 * 1024 * 1024,
    accept: {
      "image/*": [".png", ".jpg", ".jpeg", ".gif"],
    },
    onError(err) {
      toast.error(err.message);
    },
  });

  const { mutate: handleThumbnailUpload, isPending } = useMutation({
    mutationFn: () => {
      const formData = new FormData();
      formData.append("files", file?.file as File);
      formData.append("folder", "fyp-stacks/pages");
      return axios.post("/api/upload/files", formData);
    },
    onSuccess: async (res) => {
      const response = res?.data;
      const fileData = response?.data[0] as TUploadFilesResponse;
      await updatePageThumbnail({
        ...fileData,
        pageId: params?.id as string,
      });
      toast.success("Thumbnail updated successfully");
      queryClient.invalidateQueries({
        queryKey: ["get-writings"],
      });
      queryClient.invalidateQueries({
        queryKey: ["get-page-by-id", params?.id],
      });
    },
    onError: (err) => {
      console.error(err);
      toast.error((err as Error)?.message || "Error uploading thumbnail");
    },
  });

  const { mutate: deleteThumbnail, isPending: isDeleting } = useMutation({
    mutationFn: removePageThumbnail,
    onSuccess: async () => {
      toast.success("Thumbnail removed successfully");
      setFile(null);
      queryClient.invalidateQueries({
        queryKey: ["get-page-by-id", params?.id],
      });
    },
    onError: (err) => {
      console.error(err);
      toast.error((err as Error)?.message || "Error removing thumbnail");
    },
  });

  return (
    <div className="w-full h-full px-4 pt-8">
      <div className="w-full mb-4">
        <h2 className="text-xl font-medium tracking-tight leading-tight ">
          Edit Page
        </h2>
      </div>
      <div className="w-full flex flex-col items-center justify-center h-full">
        <div className="w-full h-full">
          <div
            className={cn(
              "w-full overflow-hidden rounded-2xl group dark:border-dark-border relative  flex flex-col items-center justify-center group h-[200px] border-2  border-neutral-300/60",
              !file && "border-dashed",
              isDragActive && "border-blue-500 bg-blue-50"
            )}
          >
            {data?.thumbnail && (
              <div className="absolute opacity-0 group-hover:opacity-100 top-2 right-2 z-50">
                <Button
                  disabled={isDeleting}
                  onClick={() =>
                    deleteThumbnail({ pageId: params?.id as string })
                  }
                  variant={"outline"}
                  size={"icon"}
                  className="rounded-2xl z-50"
                >
                  <Trash2 className="size-4 opacity-80" strokeWidth={1.7} />
                </Button>
              </div>
            )}
            <div {...getRootProps()} className="w-full h-full relative">
              <input {...getInputProps()} />
              {file ? (
                <Image
                  src={file?.url}
                  fill
                  alt="Thumbnail"
                  quality={100}
                  className="-z-10"
                  style={{ objectFit: "cover" }}
                />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center">
                  <div className="mb-2">
                    <Upload className="opacity-70 size-12" strokeWidth={1.6} />
                  </div>
                  <p className="text-neutral-600 dark:text-neutral-400 max-w-[200px] text-center text-sm">
                    Drag & Drop images or videos here, or click to select files
                  </p>
                </div>
              )}
            </div>
          </div>
          {file && (
            <div className="w-full mt-4 flex flex-col items-center justify-center gap-2">
              {data?.thumbnail !== file?.url && (
                <Button
                  type="button"
                  variant="outline"
                  disabled={isPending}
                  className="w-full flex items-center justify-center gap-2"
                  onClick={() => handleThumbnailUpload()}
                >
                  {isPending ? (
                    <Loader className="size-4 animate-spin" />
                  ) : (
                    <>
                      {data?.thumbnail
                        ? "Change Thumbnail"
                        : "Upload Thumbnail"}
                    </>
                  )}
                </Button>
              )}

              <Button
                type="button"
                variant="outline"
                className="w-full"
                disabled={isPending || isDeleting}
                onClick={() => setFile(null)}
              >
                Remove Thumbnail
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
    // <div className="w-full h-full px-4 pt-8">
    //   <div className="w-full mb-4">
    //     <h2 className="text-xl tracking-tight leading-tight ">Edit Page</h2>
    //   </div>

    //   <div
    //     {...getRootProps()}
    //     className={cn(
    //       "w-full max-w-lg p-6 border-2 flex flex-col items-center justify-center border-dashed rounded-2xl text-center cursor-pointer transition border-neutral-300 dark:border-dark-border",
    //       isDragActive && "border-blue-500 bg-blue-50"
    //     )}
    //   >
    //     <input {...getInputProps()} />
    //     {data?.data?.thumbnail ? (
    //       <Image
    //         src={data?.data?.thumbnail}
    //         alt=""
    //         className="aspect-video rounded-3xl "
    //         style={{ objectFit: "contain" }}
    //         width={500}
    //         height={500}
    //       />
    //     ) : (
    //       <>
    //         <div className="mb-2">
    //           <Upload className="opacity-80 size-12" strokeWidth={1.6} />
    //         </div>
    //         <p className="text-neutral-600 text-sm">
    //           Drag & Drop images or videos here, or click to select files
    //         </p>
    //       </>
    //     )}
    //   </div>
    //   {/* )} */}
    //   <div className="flex items-center mt-3 gap-2">
    //     <Button
    //       type="button"
    //       variant="outline"
    //       className="w-full"
    //       onClick={() => document.getElementById("thumbnail-upload")?.click()}
    //     >
    //       <ImageIcon className="mr-2 h-4 w-4" />
    //       {data?.data?.thumbnail ? "Change Thumbnail" : "Upload Thumbnail"}
    //     </Button>
    //     {data?.data?.thumbnail && (
    //       <Button
    //         type="button"
    //         variant="outline"
    //         size="icon"
    //         onClick={() => {}}
    //       >
    //         <X className="h-4 w-4" />
    //         <span className="sr-only">Remove thumbnail</span>
    //       </Button>
    //     )}
    //   </div>
    // </div>
  );
};

export default PageSidebar;
