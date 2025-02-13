"use client";
import { getBase64Image, getCroppedImg, toBase64 } from "@/lib/utils";
import React, { FC, useEffect, useState } from "react";
import Cropper, { Area } from "react-easy-crop";
import { useAvatarDialog } from "../dialog-provider";
import { Button } from "../ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog";
import { useSession } from "next-auth/react";
import toast from "react-hot-toast";
import { Session } from "next-auth";

type ChangeAvatarDialogProps = {
  file: File | null;
  setFile: (file: File | null) => void;
};

const ChangeAvatarDialog: FC<ChangeAvatarDialogProps> = ({ file, setFile }) => {
  const [isOpen, setIsOpen] = useAvatarDialog();
  const { data: session, update } = useSession();
  const [image, setImage] = React.useState<string | null>(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [rotation, setRotation] = useState(0);
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
  }, [croppedAreaPixels, rotation, image]);

  return (
    <Dialog open={isOpen} onOpenChange={() => setIsOpen(!isOpen)}>
      <DialogContent className="sm:rounded-3xl p-0 max-w-md">
        <DialogHeader className="pt-4 px-4 mb-3">
          <DialogTitle className="text-xl font-semibold">
            Change your Profile Picture
          </DialogTitle>
        </DialogHeader>
        <div className="flex flex-col px-4 pb-2 ">
          <div className="aspect-square border-[3px] border-dashed border-neutral-300  relative rounded-2xl w-full">
            <Cropper
              classes={{
                containerClassName: "rounded-2xl",
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
        <div className="border-t px-4 pb-4 pt-2 border-neutral-300 flex items-center justify-between">
          <Button
            onClick={() => {
              setFile(null);
              setImage(null);
              setIsOpen(false);
            }}
            size={"sm"}
            variant={"outline"}
            className="rounded-xl"
          >
            Remove Image
          </Button>
          <Button
            onClick={async () => {
              const url = await getBase64Image(
                file as File,
                croppedImage as string
              );
              console.log({ url });
              const formData = new FormData();
              formData.append("file", url as string);

              const res = await fetch("/api/upload", {
                method: "POST",
                body: formData,
              });
              const data = await res.json();
              console.log({ data });
              if (!res.ok) {
                toast.error(`Failed to upload image: ${data.error}`);
                return;
              }
              const newSession = {
                ...session!.user,
                image: data?.url as string,
              };
              await update(newSession);
              // console.log({ data, newSession });
              toast.success("Profile picture updated successfully");
              setIsOpen(false);
            }}
            size={"sm"}
            className="rounded-xl"
          >
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
