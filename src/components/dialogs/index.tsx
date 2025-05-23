"use client";

import PostForm from "../explore/post-form";
import ExperienceDialog from "./ExperienceDialog";
import SearchDialog from "./SearchDialog";
import { ProfileUpdateDialog } from "./UpdateProfileDialog";

const Dialogs = () => {
  return (
    <>
      <ProfileUpdateDialog />
      <SearchDialog />
      <ExperienceDialog />
      <PostForm />
    </>
  );
};

export default Dialogs;
