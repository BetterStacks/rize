import { getExploreFeed } from "@/actions/post-actions";
import ExploreFeed from "@/components/explore/explore-feed";

const Page = async () => {
  const feed = await getExploreFeed();
  console.log({ feed });
  return (
    <div>
      <ExploreFeed posts={feed} />
    </div>
  );
};

export default Page;
