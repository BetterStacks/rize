import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Edit3, Loader } from "lucide-react";
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
  formData: any;
  isPending: boolean;
  onNext: ({
    displayName,
    profileImage,
  }: {
    displayName: string;
    profileImage: string;
  }) => void;
}) => {
  const [displayName, setDisplayName] = React.useState("");
  const [file, setFile] = React.useState<File | null>(null);
  const [profileImage, setProfileImage] = React.useState("");

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
    // setIsOpen(true);
  };
  return (
    <div className="p-8">
      <h2 className="text-2xl tracking-tight mb-2 font-semibold ">
        Profile Details
      </h2>
      <p className="leading-snug text-sm opacity-80 mb-4">
        Add profile details to help others recognize you. You can change these
        later.
      </p>
      <div className="space-y-4">
        <div className="flex space-x-4 items-center">
          <div
            className={cn(
              "relative group  ring-4    ring-neutral-300 dark:ring-dark-border  rounded-full size-24 md:size-24   aspect-square "
            )}
          >
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
          </div>

          <div>
            <h2 className="text-lg font-semibold dark:text-white">
              Profile Picture
            </h2>
            <p className="text-xs leading-tight opacity-80 dark:text-neutral-400">
              Upload a profile picture to help others recognize you.
            </p>
            <div>
              <button>Choose a file</button>
              <button>Remove file</button>
            </div>
          </div>
        </div>
        <input
          type="text"
          placeholder="Jon Doe"
          value={displayName}
          className="text-lg w-full dark:text-opacity-80 border border-neutral-300 dark:border-dark-border flex items-center justify-center overflow-hidden px-3 py-1.5 rounded-md bg-transparent dark:placeholder:text-neutral-500 focus-visible:outline-none"
          onChange={(e) => {
            setDisplayName(e.target.value);
            // handleCheck(e.target.value);
          }}
        />

        <Button
          //   onClick={() => onNext(username)}
          //   disabled={!username || !isAvailable || isPending}
          className="w-full bg-green-600 disabled:bg-green-700 dark:bg-green-500 dark:text-white hover:bg-green-700 dark:hover:bg-green-600 dark:disabled:bg-green-600"
        >
          {isPending && <Loader className="animate-spin size-4" />} Next
        </Button>
      </div>
    </div>
  );
};

export default ProfileStep;
