import PageLayout from "@/components/layout/PageLayout";
import React, { ReactNode } from "react";

const Layout = ({ children }: { children: ReactNode }) => {
  return <PageLayout> {children}</PageLayout>;
};

export default Layout;
