import { FC, ReactNode } from "react";
import Dock from "./dock";
import Sidebar from "./Sidebar";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "./ui/resizable";
import { ScrollArea } from "./ui/scroll-area";

type ProfileLayoutProps = {
  children: ReactNode;
};

const ProfileLayout: FC<ProfileLayoutProps> = ({ children }) => {
  return (
    <ResizablePanelGroup className="w-full h-full" direction="horizontal">
      <ResizablePanel maxSize={28} defaultSize={28}>
        <Sidebar />
      </ResizablePanel>
      <ResizablePanel className="w-full h-screen  ">
        <ScrollArea className="h-screen overflow-y-auto relative w-full ">
          <div className="w-full mt-28 mb-10 flex flex-col ">{children}</div>
          <div className="absolute right-0 left-0  flex items-center justify-center w-full">
            <div className="fixed bottom-4 z-50">
              <Dock />
            </div>
          </div>
        </ScrollArea>
      </ResizablePanel>
      {/* <ResizableHandle withHandle /> */}
      {/* <ResizablePanel className="" maxSize={20} defaultSize={20}>
        <div className="h-full w-full px-4 pb-5 flex flex-col items-center justify-end">
          <UpgradeCard />
        </div>
      </ResizablePanel> */}
    </ResizablePanelGroup>
  );
};

export default ProfileLayout;
