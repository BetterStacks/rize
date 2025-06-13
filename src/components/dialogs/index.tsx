"use client";

import PostForm from "../explore/post-form";
import CommentDialog from "./CommentDialog";
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
      <PostForm />
      <AuthDialog />
      <CommentDialog />
      {/* <ExperienceDialog /> */}
      {/* <PostDialog /> */}
    </>
  );
};

export default Dialogs;
