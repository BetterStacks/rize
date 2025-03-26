"use client";
import { updateUserImage } from "@/lib/server-actions";
import { getBase64Image, getCroppedImg } from "@/lib/utils";
import { useSession } from "next-auth/react";
import React, { FC, useEffect, useState } from "react";
import Cropper, { Area } from "react-easy-crop";
import toast from "react-hot-toast";
import { useAvatarDialog } from "../dialog-provider";
import { Button } from "../ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog";
import { Loader } from "lucide-react";
import { queryClient } from "@/lib/providers";

type ChangeAvatarDialogProps = {
  file: File | null;
  setFile: (file: File | null) => void;
};

const ChangeAvatarDialog: FC<ChangeAvatarDialogProps> = ({ file, setFile }) => {
  const [isOpen, setIsOpen] = useAvatarDialog();
  const { update, data: session } = useSession();
  const [image, setImage] = React.useState<string | null>(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [rotation, setRotation] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);
  const [croppedImage, setCroppedImage] = useState<string | null>(null);

  const onCropComplete = (croppedArea: Area, croppedAreaPixels: Area) => {
    setCroppedAreaPixels(croppedAreaPixels);
  };

  useEffect(() => {
    if (!file) return;

    setImage(URL.createObjectURL(file));
  }, [file]);

  useEffect(() => {
    if (!file || !image) {
      console.log("file or image not selecterd");
      return;
    }
    const showCroppedImage = async () => {
      try {
        const croppedImage = await getCroppedImg(
          image as string,
          croppedAreaPixels as Area,
          rotation
        );
        console.log("donee", { croppedImage });
        setCroppedImage(croppedImage as string);
      } catch (e) {
        console.error(e);
      }
    };
    showCroppedImage();
  }, [croppedAreaPixels, rotation, image, file]);

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) {
          setFile(null);
          setImage(null);
        }
        setIsOpen(open);
      }}
    >
      <DialogContent className="sm:rounded-3xl p-0 max-w-md">
        <DialogHeader className="mt-6 px-5 mb-3">
          <DialogTitle className="text-xl font-semibold">
            Change your Profile Picture
          </DialogTitle>
        </DialogHeader>
        <div className="flex flex-col px-5 pb-2 ">
          <div className="aspect-square border-[3px] border-dashed border-neutral-300 dark:border-dark-border/60 relative rounded-2xl w-full p-6">
            <Cropper
              classes={{
                containerClassName: "rounded-3xl ",
                mediaClassName: "aspect-square w-full object-contain",
              }}
              image={image as string}
              crop={crop}
              zoom={zoom}
              aspect={1}
              cropShape="round"
              showGrid={false}
              onCropChange={setCrop}
              onRotationChange={setRotation}
              onCropComplete={onCropComplete}
              onZoomChange={setZoom}
            />
          </div>
        </div>
        <div className="border-t px-5 pb-5 pt-5 border-neutral-300 dark:border-dark-border/60 flex  gap-x-3 items-center justify-between">
          <Button
            onClick={async () => {
              setIsUploading(true);
              const url = await getBase64Image(
                file as File,
                croppedImage as string
              );

              const formData = new FormData();
              formData.append("file", url as string);
              formData.append("type", "avatar");

              const res = await fetch("/api/upload", {
                method: "POST",
                body: formData,
              });
              const data = await res.json();

              if (!res.ok) {
                setIsUploading(false);
                toast.error(`Failed to upload image: ${data.error}`);
                return;
              }
              const resp = await updateUserImage(data?.url as string);

              if (!resp?.success && resp.error) {
                setIsUploading(false);
                toast.error(resp?.error);
              }
              await update();
              await queryClient.invalidateQueries({
                queryKey: ["get-profile-by-username", session?.user?.username],
              });
              toast.success("Profile picture updated successfully");
              setIsOpen(false);
            }}
            className="rounded-lg w-full"
          >
            {isUploading && <Loader className="w-4 h-4 animate-spin" />}
            Save Changes
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ChangeAvatarDialog;
// const showCroppedImage = async () => {
//   try {
//     const croppedImage = await getCroppedImg(
//       image as string,
//       croppedAreaPixels as Area,
//       rotation
//     );
//     console.log("donee", { croppedImage });
//     setCroppedImage(croppedImage as any);
//   } catch (e) {
//     console.error(e);
//   }
// };
