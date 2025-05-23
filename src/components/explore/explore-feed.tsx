"use client";
import { GetExplorePosts } from "@/lib/types";
import { FC, useState } from "react";
import PostCard from "./post-card";
import { useClickOutside, useMediaQuery } from "@mantine/hooks";
import { Button } from "../ui/button";
import { Menu } from "lucide-react";
import { capitalizeFirstLetter, cn } from "@/lib/utils";
import { AnimatePresence, motion } from "framer-motion";
import { Sheet, SheetContent, SheetOverlay, SheetTrigger } from "../ui/sheet";
import Link from "next/link";

type ExploreFeedProps = {
  posts: GetExplorePosts[];
};

const ExploreFeed: FC<ExploreFeedProps> = ({ posts }) => {
  const isDesktop = useMediaQuery("(min-width: 768px)");
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const options = {
    latest: {},
    trending: {},
    following: {},
  };
  const [activeOption, setActiveOption] =
    useState<keyof typeof options>("latest");

  const menuOptions = [
    { name: "Home", href: "/", onClick: () => {} },
    { name: "Explore", href: "/", onClick: () => {} },
    { name: "Notifications", href: "/", onClick: () => {} },
    { name: "Bookmarks", href: "/", onClick: () => {} },
    { name: "Account", href: "/", onClick: () => {} },
  ];

  const ref = useClickOutside(() => {
    setIsDrawerOpen(false);
  });
  return (
    <div className="flex items-center flex-col w-full ">
      <div className="w-full h-28 bg-gradient-to-t from-neutral-50/60 via-neutral-50/40  dark:from-dark-bg dark:via-dark-bg/60 to-transparent fixed bottom-0 z-10" />

      {/* </div> */}
      {!isDesktop && (
        // <Sheet>
        //   <SheetTrigger asChild>
        <Button
          size={"icon"}
          className="fixed drop-shadow-2xl shadow-2xl shadow-black bottom-4 size-14 z-40 rounded-full  left-4"
          variant={"outline"}
          onClick={() => setIsDrawerOpen(true)}
        >
          <Menu className="size-6 opacity-80" strokeWidth={1.6} />
        </Button>
      )}
      <AnimatePresence>
        {isDrawerOpen && (
          <motion.div
            ref={ref}
            initial={{ x: "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={{ duration: 0.3, ease: "linear", type: "tween" }}
            className="max-w-xs sm:max-w-sm md:max-w-md w-full  dark:bg-dark-bg bg-white shadow-2xl shadow-black border-r border-neutral-300 dark:border-dark-border/90 h-screen fixed top-0 bottom-0 left-0 z-30"
          >
            <div>
              {" "}
              {menuOptions.map((option, i) => (
                <Link key={i} href={option.href}>
                  <div
                    onClick={option.onClick}
                    className="w-full  cursor-pointer relative flex items-center justify-start p-2 pt-4 gap-2"
                  >
                    <span className="text-sm z-20 font-medium opacity-80">
                      {option.name}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      <motion.div
        animate={{ x: isDrawerOpen ? 100 : 0 }}
        transition={{ duration: 0.3, type: "tween" }}
        className="columns-1 sm:columns-2 xl:columns-3 mt-6 mb-10 px-6 md:px-4 gap-4 space-y-4"
      >
        <motion.div
          layout
          className="w-fit max-w-xs p-1  border border-neutral-300/60 bg-neutral-100 dark:bg-dark-bg dark:dark:border-dark-border rounded-3xl flex items-center justify-center   mb-4"
        >
          {Object.entries(options).map(([key, value]) => (
            <div
              className={cn(
                "flex items-center cursor-pointer opacity-60 relative px-4 py-1.5 justify-between w-full",
                key === activeOption && "drop-shadow-2xl opacity-100"
              )}
              key={key}
              onClick={() => {
                setActiveOption(key as keyof typeof options);
              }}
            >
              <span className="text-sm z-20 font-medium opacity-80">
                {capitalizeFirstLetter(key)}
              </span>
              {key === activeOption && (
                <motion.div
                  layoutId="menu-option"
                  transition={{ duration: 0.2, type: "tween" }}
                  className="absolute bg-white border border-neutral-300/60 dark:border-neutral-700 dark:bg-dark-border rounded-3xl inset-0 z-10 "
                />
              )}
            </div>
          ))}
        </motion.div>
        {posts?.map((post, i) => {
          return <PostCard key={i} post={post} />;
        })}
      </motion.div>
    </div>
  );
};

export default ExploreFeed;
