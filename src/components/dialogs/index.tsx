"use client";

import PostForm from "../explore/post-form";
import ExperienceDialog from "./ExperienceDialog";
import PostDialog from "./PostDialog";
import SearchDialog from "./SearchDialog";
import AuthDialog from "./SignInDialog";
import { ProfileUpdateDialog } from "./UpdateProfileDialog";

const Dialogs = () => {
  return (
    <>
      <ProfileUpdateDialog />
      <SearchDialog />
      <ExperienceDialog />
      <PostForm />
      <PostDialog />
      <AuthDialog />
    </>
  );
};

export default Dialogs;
