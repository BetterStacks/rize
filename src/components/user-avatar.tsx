"use client";
import { cn, isImageUrl } from "@/lib/utils";
import { Edit3 } from "lucide-react";
import Image from "next/image";
import { useState } from "react";
import toast from "react-hot-toast";
import { useAvatarDialog } from "./dialog-provider";
import ChangeAvatarDialog from "./dialogs/ChangeAvatarDialog";

type UserAvatarProps = {
  data: {
    image: string;
    name: string;
  };
  isLoading: boolean;
  isMyProfile: boolean;
  className?: string;
};

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ACCEPTED_IMAGE_TYPES = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
];

const UserAvatar = ({
  data,
  isLoading,
  isMyProfile,
  className,
}: UserAvatarProps) => {
  const [file, setFile] = useState<File | null>(null);
  const setIsOpen = useAvatarDialog()[1];

  const handleChange = (e: any) => {
    const file = e.target.files[0];
    if (!file) {
      // toast.error("Please select a file");
      return;
    }
    if (file.size > MAX_FILE_SIZE) {
      toast.error("File size is too large");
      return;
    }
    if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) {
      toast.error("Invalid file type");
      return;
    }
    setFile(file);
    setIsOpen(true);
  };

  return (
    <>
      <div
        className={cn(
          "relative group ring-2    ring-neutral-300 dark:ring-dark-border  rounded-full size-24 md:size-24 lg:size-28   aspect-square ",
          className,
          isLoading &&
            "animate-pulse bg-neutral-300  dark:bg-dark-border rounded-full"
        )}
      >
        {isMyProfile && (
          <>
            <input
              onChange={handleChange}
              type="file"
              className="hidden"
              id="profile-input"
            />
            <button className="absolute z-10 group-hover:opacity-100 opacity-0 transition-all duration-100 ease-in border border-neutral-300 dark:border-dark-border  bg-white dark:bg-[#363636] p-1.5 rounded-full left-0 bottom-0 drop-shadow-lg shadow-black/80 ">
              <label htmlFor="profile-input">
                <Edit3 className="size-5 dark:opacity-70" />
              </label>
            </button>
          </>
        )}
        {data?.image && isImageUrl(data?.image) && (
          <Image
            className=" rounded-full w-full aspect-square"
            src={data?.image as string}
            fill
            style={{
              objectFit: "cover",
            }}
            quality={100}
            priority
            alt={`${data?.name}`}
          />
        )}{" "}
      </div>
      <ChangeAvatarDialog file={file} setFile={setFile} />
    </>
  );
};

export default UserAvatar;
