import ProfileLayout from "@/components/ProfileLayout";
import React, { ReactNode } from "react";

const Layout = ({ children }: { children: ReactNode }) => {
  return <ProfileLayout>{children}</ProfileLayout>;
};

export default Layout;
