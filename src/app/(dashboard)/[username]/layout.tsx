import ProfileLayout from "@/components/layout/UserProfileLayout";
import React, { ReactNode } from "react";

const Layout = ({ children }: { children: ReactNode }) => {
  return <ProfileLayout>{children}</ProfileLayout>;
};

export default Layout;
