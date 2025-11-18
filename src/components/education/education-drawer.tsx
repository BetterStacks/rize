import { getEducationById } from "@/actions/education-actions";
import { useActiveSidebarTab } from "@/lib/context";
import { useQuery } from "@tanstack/react-query";
import { Sheet, SheetContent } from "../ui/sheet";
import { EducationForm } from "./education-form";

const EducationDrawer = () => {
  const [activeTab, setActiveTab] = useActiveSidebarTab();
  const { data: defaultValues, isLoading: isFetchingValues } = useQuery({
    queryKey: ["get-education-by-id", activeTab?.id],
    queryFn: () => getEducationById(activeTab?.id as string),
    enabled: !!activeTab?.id,
  });

  return (
    <Sheet
      open={activeTab?.tab === "education"}
      onOpenChange={() => setActiveTab({ id: null, tab: "gallery" })}
    >
      <SheetContent className="dark:bg-neutral-900 overflow-y-auto p-0 dark:border-dark-border sm:max-w-2xl">
        <EducationForm
          defaultValues={defaultValues ?? undefined}
          isFetchingValues={isFetchingValues}
        />
      </SheetContent>
    </Sheet>
  );
};

export default EducationDrawer;
