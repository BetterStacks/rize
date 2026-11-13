import ExploreRedesigned from "@/components/explore/explore-redesigned";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { getNewFaces, getPopularPosts } from "@/lib/explore-data";

// Rendered per request so the lists are never baked into the build, but both
// come from a shared one-minute cache, so most requests touch no database.
export const dynamic = "force-dynamic";

const Page = async () => {
  const [profiles, posts] = await Promise.all([
    getNewFaces(8),
    getPopularPosts(),
  ]);

  return (
    <DashboardLayout variant="explore">
      <ExploreRedesigned profiles={profiles} posts={posts} />
    </DashboardLayout>
  );
};

export default Page;
