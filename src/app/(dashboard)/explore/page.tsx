import ExploreRedesigned from "@/components/explore/explore-redesigned";
import DashboardLayout from "@/components/layout/DashboardLayout";

const Page = async () => {
  return (
    <DashboardLayout variant="explore" >
      <ExploreRedesigned />
    </DashboardLayout>
  );
};

export default Page;
