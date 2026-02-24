import React from "react";
import { Sheet, SheetContent } from "../ui/sheet";
import { ProjectForm } from "./ProjectForm";
import { useActiveSidebarTab } from "@/lib/context";

const ProjectDrawer = () => {
  const [activeTab, setActiveTab] = useActiveSidebarTab();
  return (
    <Sheet
      open={activeTab?.tab === "projects"}
      onOpenChange={() => setActiveTab({ id: null, tab: "gallery" })}
    >
      <SheetContent className="dark:bg-neutral-900 overflow-y-auto p-0 dark:border-dark-border sm:max-w-2xl">
        <ProjectForm id={activeTab?.id ?? null} />
      </SheetContent>
    </Sheet>
  );
};

export default ProjectDrawer;
