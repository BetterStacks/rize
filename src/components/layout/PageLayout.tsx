"use client";
import { usePageSidebar } from "@/lib/context";
import { useMediaQuery } from "@mantine/hooks";
import { Sidebar } from "lucide-react";
import { ReactNode } from "react";
import Toolbar from "../editor/toolbar";
import PageSidebar from "../sidebar/PageSidebar";
import { Button } from "../ui/button";
import { ResizablePanel, ResizablePanelGroup } from "../ui/resizable";
import { ScrollArea } from "../ui/scroll-area";
import { Sheet, SheetContent } from "../ui/sheet";

const PageLayout = ({
  children,
  isMyPage,
}: {
  children: ReactNode;
  isMyPage: boolean;
}) => {
  const isDesktop = useMediaQuery("(min-width: 1024px)");
  const [open, setOpen] = usePageSidebar();

  return (
    <ResizablePanelGroup
      direction="horizontal"
      className="w-full overflow-hidden h-screen"
    >
      <ResizablePanel className="w-full h-full  ">
        <ScrollArea className="h-screen overflow-y-auto relative w-full ">
          {isMyPage && !isDesktop && (
            <div className="absolute right-4 top-4 z-50">
              <Button
                variant={"outline"}
                size={"icon"}
                className=" size-10 ml-1 p-2"
                onClick={() => setOpen(true)}
              >
                <Sidebar strokeWidth={1.5} className="size-5 opacity-70" />
              </Button>
            </div>
          )}
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
      {isMyPage && isDesktop ? (
        <>
          <div className="w-full  hidden lg:flex items-center justify-end h-screen max-w-md border-l border-neutral-200  dark:border-dark-border/60">
            <PageSidebar />
          </div>
        </>
      ) : (
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetContent className="w-[80%] h-screen p-0 bg-white dark:bg-dark-border/80 border border-neutral-200 dark:border-dark-border/60 dark:bg-dark-bg">
            <PageSidebar />
          </SheetContent>
        </Sheet>
      )}
    </ResizablePanelGroup>
  );
};

export default PageLayout;

{
  /* <ResizableHandle
  withHandle
  className="border border-neutral-200 dark:border-dark-border/30"
/>
<ResizablePanel
  id="page-sidebar"
  className="hidden md:flex "
  maxSize={30}
  collapsible={true}
  collapsedSize={0}
> */
}
{
  /* </ResizablePanel> */
}
