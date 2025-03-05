"use client";

import ExperienceDialog from "./ExperienceDialog";
import SocialLinksDialog from "./SocialLinksDialog";
import { ProfileUpdateDialog } from "./UpdateProfileDialog";

const Dialogs = () => {
  return (
    <>
      <ProfileUpdateDialog />
      {/* <CreatePageDialog /> */}
      <SocialLinksDialog />
      <ExperienceDialog />
    </>
  );
};

export default Dialogs;
