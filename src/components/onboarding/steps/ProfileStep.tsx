import { updateProfile } from "@/actions/profile-actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn, fileToBase64 } from "@/lib/utils";
import { useMutation } from "@tanstack/react-query";
import { Edit3, Loader } from "lucide-react";
import { useSession } from "next-auth/react";
import Image from "next/image";
import React from "react";
import toast from "react-hot-toast";

const MAX_FILE_SIZE = 2 * 1024 * 1024; // 5MB
const ACCEPTED_IMAGE_TYPES = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
];

const ProfileStep = ({
  onNext,
  isPending,
  formData,
}: {
  formData: {
    profileImage: string;
    displayName: string;
  };
  isPending: boolean;
  onNext: ({
    displayName,
    profileImage,
  }: {
    displayName: string;
    profileImage: string;
  }) => void;
}) => {
  const { data } = useSession();
  const [displayName, setDisplayName] = React.useState(data?.user?.name || "");
  const [file, setFile] = React.useState<File | null>(null);
  const [profileImage, setProfileImage] = React.useState(
    data?.user?.image || ""
  );

  const handleChange = (e: any) => {
    const file = e.target.files[0];
    if (!file) {
      toast.error("Please select a file");
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
    setProfileImage(URL.createObjectURL(file));
    // setIsOpen(true);
  };

  return (
    <div className="p-8 w-full ">
      <h2 className="text-xl tracking-tight mb-2 font-semibold ">
        Profile Details
      </h2>
      <p className="leading-snug text-sm opacity-80 mb-4">
        Add profile details to help others recognize you. You can change these
        later.
      </p>
      <div className="flex flex-col items-start justify-center">
        <div className="flex space-x-4 items-center justify-center">
          <div
            className={cn(
              "relative group border border-neutral-300/60 dark:border-dark-border ring-4 ring-neutral-300 dark:ring-dark-border  rounded-full size-28  aspect-square "
            )}
          >
            <input
              onChange={handleChange}
              type="file"
              className="hidden"
              id="profile-input"
            />
            {profileImage && (
              <Image
                src={profileImage}
                alt=" "
                style={{ objectFit: "cover" }}
                className="rounded-full "
                fill
              />
            )}
            <button
              className={cn(
                "absolute z-10  transition-all duration-100 ease-in border border-neutral-300 dark:border-dark-border  bg-white dark:bg-[#363636] p-1.5 rounded-full left-0 bottom-0 drop-shadow-lg shadow-black/80 "
                // profileImage && "hidden"
              )}
            >
              <label htmlFor="profile-input">
                <Edit3 className="size-5 dark:opacity-70" />
              </label>
            </button>
          </div>
        </div>
        <Label htmlFor="displayName" className="mb-2 mt-6">
          Name
        </Label>
        <Input
          type="text"
          id="displayName"
          value={displayName}
          className="md:text-lg w-full  dark:text-opacity-80 border border-neutral-300 dark:border-dark-border flex items-center justify-center overflow-hidden px-3 py-1.5 rounded-md bg-transparent dark:placeholder:text-neutral-500 focus-visible:outline-none"
          onChange={(e) => {
            setDisplayName(e.target.value);
          }}
        />

        <Button
          variant={"secondary"}
          disabled={!displayName || isPending}
          onClick={async () => {
            if (file) {
              const url = await fileToBase64(file!);
              if (!url) {
                toast.error("Error uploading image");
                return;
              }
              onNext({
                displayName,
                profileImage: url as string,
              });
              return;
            }
            onNext({
              displayName,
              profileImage: profileImage,
            });
          }}
          className="w-full mt-4"
        >
          {isPending && <Loader className="animate-spin size-4 mr-2" />} Next
        </Button>
      </div>
    </div>
  );
};

export default ProfileStep;
