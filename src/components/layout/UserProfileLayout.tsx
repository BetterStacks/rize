"use client";
import { FC, ReactNode } from "react";
import GalleryContextProvider from "../gallery/gallery-context";
import Navbar from "../navbar";
import RightSidebar from "../sidebar/RightSidebar";
import Sidebar from "../sidebar/Sidebar";
import { ResizablePanel, ResizablePanelGroup } from "../ui/resizable";
import { ScrollArea } from "../ui/scroll-area";

type ProfileLayoutProps = {
  children: ReactNode;
  isMine?: boolean;
};

const ProfileLayout: FC<ProfileLayoutProps> = ({ children, isMine }) => {
  return (
    <ResizablePanelGroup
      className="w-full h-full flex items-center  justify-center"
      direction="horizontal"
    >
      <GalleryContextProvider>
        <Sidebar />
        <ResizablePanel className="w-full h-screen   relative">
          <Navbar isMine={isMine!} />
          <ScrollArea className="h-screen overflow-y-auto relative w-full ">
            <div className="w-full mt-32 mb-10 flex flex-col px-3">
              {children}
            </div>
          </ScrollArea>
        </ResizablePanel>

        {isMine && (
          <div className="w-full  hidden lg:flex items-center justify-end h-full max-w-md border-l border-neutral-200  dark:border-dark-border/60">
            <RightSidebar />
          </div>
        )}
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
