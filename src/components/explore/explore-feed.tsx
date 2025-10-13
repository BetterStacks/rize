"use client";
import { getExploreFeed } from "@/actions/post-actions";
import { useInViewport } from "@mantine/hooks";
import { useInfiniteQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Loader } from "lucide-react";
import { useEffect } from "react";
import PostCard from "./post-card";
import { PostCardSkeleton, PostCardSkeletonWithImage } from "./skeletons";

const ExploreFeed = () => {
  // const isDesktop = useMediaQuery("(min-width: 768px)");
  // const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  // const mounted = useMounted();
  // const session = useSession();
  // const [activeOption, setActiveOption] =
  //   useState<keyof typeof options>("latest");
  const { ref, inViewport: inView } = useInViewport();

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading: isPostsLoading,
  } = useInfiniteQuery({
    queryKey: ["explore-feed"],
    queryFn: ({ pageParam }) => getExploreFeed(pageParam),
    initialPageParam: 0,
    getNextPageParam: (lastPage, __, lastPageParam) => {
      if (lastPage?.posts?.length === 0) {
        return undefined;
      }
      return lastPageParam + 1;
    },
    getPreviousPageParam: (__, _, firstPageParam) => {
      if (firstPageParam <= 1) {
        return undefined;
      }
      return firstPageParam - 1;
    },
  });

  useEffect(() => {
    if (inView && hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [inView, hasNextPage, isFetchingNextPage, fetchNextPage]);

  const posts = data?.pages.flatMap((page) => page.posts) ?? [];
  // const options = {
  //   latest: {},
  //   trending: {},
  //   following: {},
  // };

  // const outsideRef = useClickOutside(() => {
  //   setIsDrawerOpen(false);
  // });

  // const menuOptions = [
  //   {
  //     icon: <Home className="size-5 opacity-80 " strokeWidth={1.4} />,
  //     name: "Home",
  //     href: "/",
  //     onClick: () => {},
  //   },
  //   {
  //     icon: <Compass className="size-5 opacity-80 " strokeWidth={1.4} />,
  //     name: "Explore",
  //     href: "/explore",
  //     onClick: () => {},
  //   },
  //   {
  //     icon: <Bell className="size-5 opacity-80 " strokeWidth={1.4} />,
  //     name: "Notifications",
  //     href: "/",
  //     onClick: () => {},
  //   },
  //   {
  //     icon: <Bookmark className="size-5 opacity-80 " strokeWidth={1.4} />,
  //     name: "Bookmarks",
  //     href: "/",
  //     onClick: () => {},
  //   },
  //   {
  //     icon: <User2 className="size-5 opacity-80 " strokeWidth={1.4} />,
  //     name: "Account",
  //     href: `/${(session?.data?.user as any)?.username}`,
  //     onClick: () => {},
  //   },
  // ];
  // console.log(posts)

  return (
    <div className="flex items-center flex-col w-full ">
      <div className="w-full h-20 bg-gradient-to-t from-neutral-50/60 via-neutral-50/40  dark:from-dark-bg dark:via-dark-bg/60 to-transparent fixed bottom-0 z-10" />

      {/* {mounted && !isDesktop && (
        <Button
          size={"icon"}
          className="fixed dark:bg-dark-bg drop-shadow-2xl shadow-2xl shadow-black bottom-6 size-14 z-40 rounded-full  left-4"
          variant={"outline"}
          onClick={() => setIsDrawerOpen(true)}
        >
          <Menu className="size-6 opacity-80" strokeWidth={1.6} />
        </Button>
      )}
      <AnimatePresence>
        {isDrawerOpen && (
          <motion.div
            ref={outsideRef}
            initial={{ x: "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={{ duration: 0.6, type: "spring", damping: 20 }}
            className="max-w-[60%] sm:max-w-xs md:max-w-md w-full   dark:bg-dark-bg bg-white shadow-2xl shadow-black border-r border-neutral-300 dark:border-dark-border/90 h-screen fixed top-0 bottom-0 flex flex-col pt-10 left-0 z-50"
          >
            <div className=" flex-col px-6 justify-self-end ">
              {" "}
              {menuOptions.map((option, i) => (
                <Link key={i} href={option.href}>
                  <div
                    onClick={option.onClick}
                    className="w-full cursor-pointer text-xl mt-3 relative flex items-center justify-start  gap-2"
                  >
                    {option.icon}
                    <span className="tracking-tight z-20  opacity-80">
                      {option.name}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence> */}
      <motion.div
        transition={{ duration: 0.3, type: "tween" }}
        className="columns-1 max-w-7xl md:px-4 mb-16  sm:columns-2 lg:columns-3  gap-4 space-y-4"
      >
        {isPostsLoading
          ? Array.from({ length: 12 }).map((_, i) => (
              <motion.div
                key={`post-skeleton-${i}`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: i * 0.03 }}
                className="break-inside-avoid"
              >
                {/* Mix different skeleton types for variety */}
                {i % 3 === 0 ? (
                  <PostCardSkeletonWithImage />
                ) : (
                  <PostCardSkeleton />
                )}
              </motion.div>
            ))
          : posts.map((post, i) => (
              <motion.div
                key={`post-${i}`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.2 + i * 0.02 }}
                className="break-inside-avoid"
              >
                <PostCard post={post} />
              </motion.div>
            ))}
      </motion.div>
      <div ref={ref} className="h-10" />
      {isFetchingNextPage && (
        <Loader
          strokeWidth={1.4}
          className="size-5 mb-10 opacity-80 animate-spin"
        />
      )}
    </div>
  );
};

export default ExploreFeed;
