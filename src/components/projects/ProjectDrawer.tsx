import React from "react";
import { Sheet, SheetContent } from "../ui/sheet";
import { UpdateProjectForm } from "../sidebar/forms/UpdateProjectForm";
import CreateProjectForm from "./CreateProjectForm";
import { useActiveSidebarTab } from "@/lib/context";
import { useParams } from "next/navigation";

const ProjectDrawer = () => {
  const [activeTab, setActiveTab] = useActiveSidebarTab();
  const { username } = useParams<{ username: string }>();
  return (
    <Sheet
      open={activeTab?.tab === "projects"}
      onOpenChange={() => setActiveTab({ id: null, tab: "gallery" })}
    >
      <SheetContent className="dark:bg-neutral-900 overflow-y-auto p-0 dark:border-dark-border sm:max-w-2xl">
        {activeTab?.id ? (
          <UpdateProjectForm id={activeTab?.id} username={username} />
        ) : (
          <CreateProjectForm username={username} />
        )}
      </SheetContent>
    </Sheet>
  );
};

export default ProjectDrawer;
