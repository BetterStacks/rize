"use client";
import { useQueryState } from "nuqs";
import { FC, ReactNode, useEffect, useRef } from "react";
import { ImperativePanelHandle } from "react-resizable-panels";
import GalleryContextProvider from "../gallery/gallery-context";
import RightSidebar from "../sidebar/RightSidebar";
import Sidebar from "../sidebar/Sidebar";
import { ResizablePanel, ResizablePanelGroup } from "../ui/resizable";
import { ScrollArea } from "../ui/scroll-area";

type ProfileLayoutProps = {
  children: ReactNode;
};

const ProfileLayout: FC<ProfileLayoutProps> = ({ children }) => {
  return (
    <ResizablePanelGroup
      className="w-full h-full flex items-center justify-center"
      direction="horizontal"
    >
      <GalleryContextProvider>
        <Sidebar />

        <ResizablePanel className="w-full h-screen   ">
          <ScrollArea className="h-screen overflow-y-auto relative w-full ">
            <div className="w-full mt-28 mb-10 flex flex-col px-3">
              {children}
            </div>
          </ScrollArea>
        </ResizablePanel>

        <div className="w-full  hidden lg:flex items-center justify-end h-full max-w-sm border-l border-neutral-200  dark:border-dark-border/60">
          <RightSidebar />
        </div>
      </GalleryContextProvider>
    </ResizablePanelGroup>
  );
};

export default ProfileLayout;

{
  /* <div className="absolute right-0 left-0  flex items-center justify-center w-full">
  <div className="fixed bottom-4 z-50">
    <Dock />
  </div>
</div> */
}
