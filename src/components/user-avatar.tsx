"use client";
import { cn } from "@/lib/utils";
import { Edit3 } from "lucide-react";
import Image from "next/image";
import { useState } from "react";
import { useAvatarDialog } from "./dialog-provider";
import ChangeAvatarDialog from "./dialogs/ChangeAvatarDialog";

type UserAvatarProps = {
  data: {
    image: string;
    name: string;
  };
  isLoading: boolean;
  isMyProfile: boolean;
};

const UserAvatar = ({ data, isLoading, isMyProfile }: UserAvatarProps) => {
  const [file, setFile] = useState<File | null>(null);
  const setIsOpen = useAvatarDialog()[1];

  const handleChange = (e: any) => {
    const files = e.target.files;
    if (Array(files).length === 0) return;
    setFile(files[0]);
    setIsOpen(true);
  };

  return (
    <>
      <div
        className={cn(
          "relative group border-2  border-neutral-300 dark:border-dark-border rounded-full size-24 md:size-24 lg:size-28  aspect-square ",
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
            <button className="absolute z-10 group-hover:opacity-100 opacity-0 transition-all duration-100 ease-in border border-neutral-300 dark:border-dark-border  bg-white dark:bg-[#363636] p-1.5 rounded-full left-1 bottom-1 drop-shadow-lg shadow-black/80 ">
              <label htmlFor="profile-input">
                <Edit3 className="size-5 dark:opacity-70" />
              </label>
            </button>
          </>
        )}
        {data?.image && (
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
