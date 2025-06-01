"use client";
import { useRightSidebar } from "@/lib/context";
import { useMediaQuery } from "@mantine/hooks";
import { FC, ReactNode } from "react";
import GalleryContextProvider from "../gallery/gallery-context";
import Navbar from "../navbar";
import RightSidebar from "../sidebar/RightSidebar";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "../ui/resizable";
import { ScrollArea } from "../ui/scroll-area";
import { Sheet, SheetContent } from "../ui/sheet";
import { cn } from "@/lib/utils";

type ProfileLayoutProps = {
  children: ReactNode;
  isMine?: boolean;
  className?: string;
};

const ProfileLayout: FC<ProfileLayoutProps> = ({
  children,
  isMine,
  className,
}) => {
  const [open, setOpen] = useRightSidebar();
  const isDesktop = useMediaQuery("(min-width: 1024px)");
  return (
    <ResizablePanelGroup
      className="w-full h-full flex items-center  justify-center"
      direction="horizontal"
    >
      <GalleryContextProvider>
        <ResizablePanel
          className={cn("w-full h-screen relative overflow-hidden", className)}
        >
          <Navbar isMine={isMine!} />
          <ScrollArea className="h-screen overflow-y-auto relative w-full ">
            <div className="w-full mt-32 mb-10 flex flex-col px-3">
              {children}
            </div>
          </ScrollArea>
        </ResizablePanel>
        {isMine && isDesktop ? (
          <>
            <ResizablePanel
              defaultSize={26}
              maxSize={26}
              className="border-l  flex flex-col items-center justify-center dark:border-dark-border"
            >
              <RightSidebar className="w-full" />
            </ResizablePanel>
          </>
        ) : (
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetContent className="max-w-[90%]  sm:max-w-md md:max-w-lg w-full h-screen p-0 bg-white dark:bg-dark-border/80 border border-neutral-200 dark:border-dark-border/60 dark:bg-dark-bg ">
              <RightSidebar />
            </SheetContent>
          </Sheet>
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
