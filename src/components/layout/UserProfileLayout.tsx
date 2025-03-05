"use client";
import { FC, ReactNode, useEffect, useRef } from "react";
import Dock from "../dock";
import Sidebar from "../sidebar/Sidebar";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "../ui/resizable";
import { ScrollArea } from "../ui/scroll-area";
import RightSidebar from "../sidebar/RightSidebar";
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
    <ResizablePanelGroup
      className="w-full h-full flex items-center justify-center"
      direction="horizontal"
    >
      {/* <div className="xl:w-full hidden lg:flex items-center justify-end h-full w-fit xl:max-w-sm border-r border-neutral-200  dark:border-dark-border/60"> */}
      <Sidebar />
      {/* </div> */}

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
