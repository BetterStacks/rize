import PostForm from "@/components/explore/post-form";
import Sidebar from "@/components/sidebar/Sidebar";
import { ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable";
import { ScrollArea } from "@/components/ui/scroll-area";
import React, { FC } from "react";

type Props = {
  children: React.ReactNode;
};

const ExploreLayout: FC<Props> = ({ children }) => {
  return (
    <ResizablePanelGroup
      direction="horizontal"
      className="h-screen overflow-hidden w-full "
    >
      {/* <div className="h-screen w-full max-w-md flex items-center justify-end"> */}
      <Sidebar />
      {/* </div> */}
      <ResizablePanel className="h-screen overflow-hidden w-full ">
        {/* <div> */}
        <ScrollArea className="h-full w-full relative overflow-y-auto">
          <div className="w-full mb-6 flex items-center justify-center absolute bottom-0 right-0 left-0 z-50">
            <PostForm />
          </div>
          <div className="w-full relative h-full">{children}</div>
        </ScrollArea>
        {/* </div> */}
      </ResizablePanel>
      <div className="border-l hidden z-40 bg-white dark:bg-dark-bg lg:flex border-neutral-300/60 dark:border-dark-border max-w-xs w-full h-screen"></div>
    </ResizablePanelGroup>
  );
};

export default ExploreLayout;
