"use client";

import ExperienceDialog from "./ExperienceDialog";
import SearchDialog from "./SearchDialog";
import { ProfileUpdateDialog } from "./UpdateProfileDialog";

const Dialogs = () => {
  return (
    <>
      <ProfileUpdateDialog />
      <SearchDialog />
      <ExperienceDialog />
    </>
  );
};

export default Dialogs;
