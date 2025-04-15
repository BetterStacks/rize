"use client";
import React, { ReactNode } from "react";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "../ui/resizable";
import { ScrollArea } from "../ui/scroll-area";
import PageSidebar from "../sidebar/PageSidebar";
import Toolbar from "../editor/toolbar";

const PageLayout = ({
  children,
  isMyPage,
}: {
  children: ReactNode;
  isMyPage: boolean;
}) => {
  return (
    <ResizablePanelGroup
      direction="horizontal"
      className="w-full overflow-hidden h-screen"
    >
      <ResizablePanel className="w-full h-full  ">
        <ScrollArea className="h-screen overflow-y-auto relative w-full ">
          <div className="w-full mt-28 mb-10 flex flex-col ">
            {isMyPage && (
              <div className="absolute right-0 left-0  flex items-center justify-center w-full">
                <div className="fixed bottom-4 z-50">
                  <Toolbar />
                </div>
              </div>
            )}
            {children}
          </div>
        </ScrollArea>
      </ResizablePanel>
      {isMyPage && (
        <>
          <ResizableHandle
            withHandle
            className="border border-neutral-300/60 dark:border-dark-border/50"
          />
          <ResizablePanel
            id="page-sidebar"
            className="hidden md:flex "
            maxSize={25}
            collapsible={true}
            collapsedSize={0}
          >
            <PageSidebar />
          </ResizablePanel>
        </>
      )}
    </ResizablePanelGroup>
  );
};

export default PageLayout;
