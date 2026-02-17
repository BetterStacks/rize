import { useActiveSidebarTab } from "@/lib/context";
import { Sheet, SheetContent } from "../ui/sheet";
import { CertificateForm } from "./certificate-form";
import { useQuery } from "@tanstack/react-query";
import { getCertificateById } from "@/actions/certificate-actions";

const CertificateDrawer = () => {
    const [activeTab, setActiveTab] = useActiveSidebarTab();
    const { data: defaultValues, isLoading: isFetchingValues } = useQuery({
        queryKey: ["get-certificate-by-id", activeTab?.id],
        queryFn: () => getCertificateById(activeTab?.id as string),
        enabled: !!activeTab?.id && activeTab?.tab === "certificates",
    });

    return (
        <Sheet
            open={activeTab?.tab === "certificates"}
            onOpenChange={() => setActiveTab({ id: null, tab: "gallery" })}
        >
            <SheetContent className="dark:bg-neutral-900 overflow-y-auto p-0 dark:border-dark-border sm:max-w-2xl">
                <CertificateForm
                    defaultValues={defaultValues ?? undefined}
                    isFetchingValues={isFetchingValues}
                />
            </SheetContent>
        </Sheet>
    );
};

export default CertificateDrawer;
