"use client";

import ExperienceDialog from "./ExperienceDialog";
import ProjectDialog from "./ProjectDialog";
import SearchDialog from "./SearchDialog";
import { ProfileUpdateDialog } from "./UpdateProfileDialog";

const Dialogs = () => {
  return (
    <>
      <ProfileUpdateDialog />
      <ProjectDialog />
      <SearchDialog />
      <ExperienceDialog />
    </>
  );
};

export default Dialogs;
