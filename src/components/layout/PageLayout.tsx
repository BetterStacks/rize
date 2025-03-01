"use client";
import React, { ReactNode } from "react";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "../ui/resizable";
import { ScrollArea } from "../ui/scroll-area";
import PageSidebar from "../sidebar/PageSidebar";

const PageLayout = ({ children }: { children: ReactNode }) => {
  return (
    <ResizablePanelGroup
      direction="horizontal"
      className="w-full overflow-hidden h-screen"
    >
      <ResizablePanel className="w-full h-full  ">
        <ScrollArea className="h-screen overflow-y-auto relative w-full ">
          <div className="w-full mt-28 mb-10 flex flex-col ">{children}</div>
        </ScrollArea>
      </ResizablePanel>
      <ResizableHandle withHandle />
      <ResizablePanel
        id="page-sidebar"
        className="hidden md:flex "
        maxSize={25}
        collapsible={true}
        collapsedSize={0}
      >
        <PageSidebar />
      </ResizablePanel>
    </ResizablePanelGroup>
  );
};

export default PageLayout;
