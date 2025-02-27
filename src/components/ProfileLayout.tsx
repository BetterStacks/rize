"use client";
import { FC, ReactNode, useEffect, useRef } from "react";
import Dock from "./dock";
import Sidebar from "./Sidebar";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "./ui/resizable";
import { ScrollArea } from "./ui/scroll-area";
import RightSidebar from "./RightSidebar";
import { useQueryState } from "nuqs";
import { ImperativePanelHandle } from "react-resizable-panels";

type ProfileLayoutProps = {
  children: ReactNode;
};

const ProfileLayout: FC<ProfileLayoutProps> = ({ children }) => {
  const [item] = useQueryState("gallery");
  const ref = useRef<ImperativePanelHandle>(null);
  useEffect(() => {
    const sidebarRef = ref.current;
    if (!item) {
      sidebarRef?.collapse();
      return;
    }
    sidebarRef?.expand();
  }, [item]);
  return (
    <ResizablePanelGroup className="w-full h-full" direction="horizontal">
      <Sidebar />

      <ResizablePanel className="w-full h-screen  ">
        <ScrollArea className="h-screen overflow-y-auto relative w-full ">
          <div className="w-full mt-28 mb-10 flex flex-col ">{children}</div>
        </ScrollArea>
      </ResizablePanel>
      <ResizableHandle withHandle />
      <ResizablePanel
        id="right-sidebar"
        className="hidden md:flex "
        maxSize={25}
        ref={ref}
        collapsible={true}
        collapsedSize={0}
      >
        <RightSidebar />
      </ResizablePanel>
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
