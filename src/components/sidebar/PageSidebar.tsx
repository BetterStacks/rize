import { getPageById, updatePageThumbnail } from "@/lib/server-actions";
import { cn, toBase64 } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import { Loader, Loader2, Upload } from "lucide-react";
import Image from "next/image";
import { useParams } from "next/navigation";
import { useEffect, useState, useActionState } from "react";
import { FileRejection, useDropzone } from "react-dropzone";
import toast from "react-hot-toast";
import { Button } from "../ui/button";
import axios from "axios";
import { TUploadFilesResponse } from "@/lib/types";
import { queryClient } from "@/lib/providers";

const PageSidebar = () => {
  const params = useParams();
  const { data } = useQuery({
    queryKey: ["get-page-by-id", params?.id],
    queryFn: () => getPageById(params?.id as string),
  });
  const [file, setFile] = useState<{ url: string; file: File } | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  useEffect(() => {
    if (data?.data?.thumbnail) {
      setFile({
        url: data?.data?.thumbnail,
        file: new File([], data?.data?.thumbnail),
      });
    }
  }, [data?.data?.thumbnail]);

  const onDrop = (acceptedFiles: File[], rejectedFiles: FileRejection[]) => {
    console.log("dropped", { rejectedFiles, acceptedFiles });
    if (rejectedFiles && rejectedFiles[0]?.errors) {
      rejectedFiles[0]?.errors?.map((err) => toast.error(err?.message));

      return;
    }
    const file = acceptedFiles[0];
    const path = URL.createObjectURL(file);
    setFile({ url: path, file });
  };

  const { getRootProps, getInputProps, isDragActive, acceptedFiles } =
    useDropzone({
      onDrop,
      maxFiles: 1,
      // validator: sizeValidator
      maxSize: 2 * 1024 * 1024,
      accept: {
        "image/*": [".png", ".jpg", ".jpeg", ".gif"],
      },
      onError(err) {
        console.log({ err });
        toast.error(err.message);
      },
    });

  const handleUpload = async () => {
    try {
      const formData = new FormData();
      formData.append("files", file?.file!);
      formData.append("folder", "fyp-stacks/pages");
      setIsUploading(true);
      const res = await axios.post("/api/upload/files", formData);
      // console.log({ res });

      if (!res?.data?.status && res?.data?.error) {
        // console.log({ res });
        throw new Error(res?.data?.error);
      }
      const fileData = res?.data?.data[0] as TUploadFilesResponse;
      await updatePageThumbnail({
        ...fileData,
        pageId: params?.id as string,
      });
      setIsUploading(false);
      toast.success("Thumbnail updated successfully");
      queryClient.invalidateQueries({
        queryKey: ["get-writings"],
      });
    } catch (error) {
      console.error(error);
      toast.error((error as Error)?.message || "Error uploading thumbnail");
      setIsUploading(false);
    }
  };

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
            {...getRootProps()}
            className={cn(
              "w-full overflow-hidden rounded-2xl dark:border-dark-border relative  flex flex-col items-center justify-center group h-[200px] border-2  border-neutral-300",
              !file && "border-dashed",
              isDragActive && "border-blue-500 bg-blue-50"
            )}
          >
            <input {...getInputProps()} />
            {file ? (
              <Image
                src={file?.url}
                fill
                alt="Thumbnail"
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
          {file && (
            <div className="w-full mt-4 flex flex-col items-center justify-center gap-2">
              {data?.data?.thumbnail !== file?.url && (
                <Button
                  type="button"
                  variant="outline"
                  className="w-full flex items-center justify-center gap-2"
                  onClick={handleUpload}
                >
                  {isUploading ? (
                    <Loader className="size-4 animate-spin" />
                  ) : (
                    <>
                      {data?.data?.thumbnail
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
