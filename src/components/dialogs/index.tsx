"use client";

import PostForm from "../explore/post-form";
import ExperienceDialog from "./ExperienceDialog";
import PostDialog from "./PostDialog";
import SearchDialog from "./SearchDialog";
import { ProfileUpdateDialog } from "./UpdateProfileDialog";

const Dialogs = () => {
  return (
    <>
      <ProfileUpdateDialog />
      <SearchDialog />
      <ExperienceDialog />
      <PostForm />
      <PostDialog />
    </>
  );
};

export default Dialogs;
