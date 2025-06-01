import { getExploreFeed } from "@/actions/post-actions";
import ExploreFeed from "@/components/explore/explore-feed";

const Page = async () => {
  // const feed = await getExploreFeed();
  return (
    <div>
      <ExploreFeed />
    </div>
  );
};

export default Page;
