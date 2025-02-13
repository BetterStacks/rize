"use client";
import { useSession } from "next-auth/react";
import { useState } from "react";
import { useAvatarDialog } from "../dialog-provider";
import ChangeAvatarDialog from "../dialogs/ChangeAvatarDialog";
import Gallery from "../gallery";

const UserProfile = () => {
  const { data, status } = useSession();
  const [_, setIsOpen] = useAvatarDialog();
  const [activeTab, setActiveTab] = useState<keyof typeof tabs>("gallery");
  const [file, setFile] = useState<File | null>(null);

  const handleChange = (e: any) => {
    const files = e.target.files;
    if (Array(files).length === 0) return;
    setFile(files[0]);
    setIsOpen(true);
  };
  const tabs = {
    gallery: {
      title: "Gallery",
      content: <Gallery />,
    },
    skills: {
      title: "Skills",
      content: <div>Skills</div>,
    },
    projects: {
      title: "Projects",
      content: <div>Projects</div>,
    },
    experiences: {
      title: "Experiences",
      content: <div>Experiences</div>,
    },
    adventures: {
      title: "Adventures",
      content: <div>Adventures</div>,
    },
  };
  return (
    <div className="w-full max-w-4xl flex flex-col">
      <div>
        <Gallery />
      </div>
    </div>
  );
};

export default UserProfile;
