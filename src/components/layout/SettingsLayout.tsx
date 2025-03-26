import { ResizablePanel, ResizablePanelGroup } from "../ui/resizable";
import { ReactNode } from "react";
import { ScrollArea } from "../ui/scroll-area";
import Sidebar from "../sidebar/Sidebar";
import RightSidebar from "../sidebar/RightSidebar";

type SettingsLayoutProps = {
  children: ReactNode;
};
const SettingsLayout = ({ children }: SettingsLayoutProps) => {
  return (
    <ResizablePanelGroup
      direction="horizontal"
      className="h-screen w-full overflow-hidden "
    >
      {/* <ResizablePanel className="border-r bg-white border-neutral-200  dark:border-dark-border/60"> */}
      {/* </ResizablePanel> */}
      <Sidebar />
      <ResizablePanel className="w-full h-screen overflow-hidden">
        <ScrollArea className="h-screen overflow-y-auto mt-28 relative w-full ">
          {children}
        </ScrollArea>
      </ResizablePanel>
      <ResizablePanel
        maxSize={24}
        className="border-l border-neutral-200  dark:border-dark-border/60  overflow-hidden"
      >
        <RightSidebar />
      </ResizablePanel>
    </ResizablePanelGroup>
  );
};

export default SettingsLayout;
