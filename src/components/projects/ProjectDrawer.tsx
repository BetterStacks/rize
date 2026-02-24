import React from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "../ui/sheet";
import { ProjectForm } from "./ProjectForm";
import { useActiveSidebarTab } from "@/lib/context";
import * as VisuallyHidden from "@radix-ui/react-visually-hidden";

const ProjectDrawer = () => {
  const [activeTab, setActiveTab] = useActiveSidebarTab();
  const title = activeTab?.id ? "Update Project" : "Create Project";

  return (
    <Sheet
      open={activeTab?.tab === "projects"}
      onOpenChange={() => setActiveTab({ id: null, tab: "gallery" })}
    >
      <SheetContent
        className="dark:bg-neutral-900 overflow-y-auto p-0 dark:border-dark-border sm:max-w-2xl"
        onPointerDownOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
      >
        <VisuallyHidden.Root>
          <SheetHeader>
            <SheetTitle>{title}</SheetTitle>
            <SheetDescription>Form to {activeTab?.id ? "update" : "create"} project details</SheetDescription>
          </SheetHeader>
        </VisuallyHidden.Root>
        <ProjectForm id={activeTab?.id ?? null} />
      </SheetContent>
    </Sheet>
  );
};

export default ProjectDrawer;
