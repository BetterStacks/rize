import { useActiveSidebarTab } from "@/lib/context";
import { Sheet, SheetContent } from "../ui/sheet";
import { WorkExperienceForm } from "./work-experience-form";
import { useQuery } from "@tanstack/react-query";
import { getExperienceById } from "@/actions/experience-actions";

const WorkExperienceDrawer = () => {
  const [activeTab, setActiveTab] = useActiveSidebarTab();
  const { data: defaultValues, isLoading: isFetchingValues } = useQuery({
    queryKey: ["get-experience-by-id", activeTab?.id],
    queryFn: () => getExperienceById(activeTab?.id as string),
    enabled: !!activeTab?.id,
  });

  return (
    <Sheet
      open={activeTab?.tab === "experience"}
      onOpenChange={() => setActiveTab({ id: null, tab: "gallery" })}
    >
      <SheetContent className="dark:bg-neutral-900 overflow-y-auto p-0 dark:border-dark-border sm:max-w-2xl">
        <WorkExperienceForm
          defaultValues={defaultValues ?? undefined}
          isFetchingValues={isFetchingValues}
        />
      </SheetContent>
    </Sheet>
  );
};

export default WorkExperienceDrawer;
