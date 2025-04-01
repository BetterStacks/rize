"use client";
import { FC, ReactNode } from "react";
import GalleryContextProvider from "../gallery/gallery-context";
import RightSidebar from "../sidebar/RightSidebar";
import Sidebar from "../sidebar/Sidebar";
import { ResizablePanel, ResizablePanelGroup } from "../ui/resizable";
import { ScrollArea } from "../ui/scroll-area";
import { Edit3, Moon, Sun } from "lucide-react";
import { useProfileDialog } from "../dialog-provider";
import { useTheme } from "next-themes";

type ProfileLayoutProps = {
  children: ReactNode;
  isMine?: boolean;
};

const ProfileLayout: FC<ProfileLayoutProps> = ({ children, isMine }) => {
  const setOpen = useProfileDialog()[1];
  const { theme, setTheme } = useTheme();
  return (
    <ResizablePanelGroup
      className="w-full h-full flex items-center  justify-center"
      direction="horizontal"
    >
      <GalleryContextProvider>
        <Sidebar />

        <ResizablePanel className="w-full h-screen   relative">
          <div className="absolute flex space-x-3 z-50 top-4 right-4">
            <button
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="p-3 rounded-full cursor-pointer bg-neutral-100 dark:bg-dark-border justify-center flex items-center gap-2"
            >
              {theme === "dark" ? (
                <Sun strokeWidth={1.5} className="size-5 opacity-80" />
              ) : (
                <Moon strokeWidth={1.5} className="size-5 opacity-80" />
              )}
            </button>
            {isMine && (
              <button
                onClick={() => setOpen(true)}
                className="p-3 rounded-full cursor-pointer bg-neutral-100 dark:bg-dark-border flex items-center gap-2"
              >
                <Edit3 strokeWidth={1.5} className="size-5 opacity-80" />
              </button>
            )}
          </div>
          <ScrollArea className="h-screen overflow-y-auto relative w-full ">
            <div className="w-full mt-28 mb-10 flex flex-col px-3">
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
