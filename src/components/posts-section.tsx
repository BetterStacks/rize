import { GetExplorePosts } from "@/lib/types";
import React, { FC, useState } from "react";
import { Button } from "./ui/button";
import { Mail, Plus } from "lucide-react";
import { motion } from "framer-motion";
import PostCard from "./explore/post-card";
import { getUserPosts } from "@/actions/post-actions";
import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { usePostsDialog } from "./dialog-provider";

type Props = {
  posts: GetExplorePosts[];
  isMine: boolean;
};

const PostSection: FC<Props> = ({ posts, isMine }) => {
  const { username } = useParams<{ username: string }>();
  const setOpen = usePostsDialog()[1];
  const { data, isFetching } = useQuery({
    queryKey: ["get-user-posts", username],
    initialData: posts,
    queryFn: () => getUserPosts(username),
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    staleTime: Infinity,
  });
  return (
    <div
      id="posts"
      className="w-full my-12  px-2  flex flex-col items-center justify-start"
    >
      <div className="w-full max-w-2xl mb-4 flex items-center justify-between">
        <h2 className="text-lg md:text-xl font-medium ">Popular Posts</h2>
        {isMine && (
          <Button
            variant={"outline"}
            className="  rounded-lg scale-90 text-sm"
            size={"sm"}
            onClick={() => {
              setOpen(true);
            }}
          >
            <Plus className="opacity-80 mr-2 size-4" />
            New Post
          </Button>
        )}
      </div>
      <div className=" max-w-2xl w-full">
        {isFetching ? (
          <>Loading..</>
        ) : data?.length === 0 ? (
          <EmptyWritingState onCreateNew={() => setOpen(true)} />
        ) : (
          <div className="w-full columns-1 md:columns-2 gap-y-8 md:gap-4 ">
            {data?.map((post, i) => (
              <PostCard
                // mediaContainerClassName="h-[350px]"
                // className="max-w-[360px]"
                key={i}
                post={post}
                showHeader={false}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

interface EmptyPostsStateProps {
  title?: string;
  description?: string;
  ctaText?: string;
  onCreateNew?: () => void;
}

export function EmptyWritingState({
  title = "Tell your stories & experiences via posts",
  description = "Your ideas deserve to be shared. Create your first piece and let your words flow.",
  ctaText = "Add New Post",
  onCreateNew = () => {},
}: EmptyPostsStateProps) {
  const [isHovering, setIsHovering] = useState(false);

  return (
    <div className="flex h-full min-h-[400px] border-2 border-neutral-300/60 dark:border-dark-border/80 rounded-3xl border-dashed w-full items-center justify-center">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex max-w-md flex-col items-center text-center"
      >
        <div className="mb-6 flex size-16 items-center justify-center rounded-full bg-gradient-to-br from-violet-100 to-indigo-100 dark:from-violet-900/20 dark:to-indigo-900/20">
          <motion.div
            animate={{ rotate: isHovering ? 15 : 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 15 }}
          >
            <div className="relative">
              <Mail
                className="size-6 text-violet-500 dark:text-violet-400"
                strokeWidth={1.5}
              />
              {/* <motion.div
                initial={{ opacity: 0, x: 5, y: 5 }}
                animate={{ opacity: 1, x: 0, y: 0 }}
                transition={{ delay: 0.3, duration: 0.5 }}
                className="absolute -right-1 -top-1"
              >
                <PenLine
                  className="h-5 w-5 text-indigo-500 dark:text-indigo-400"
                  strokeWidth={1.5}
                />
              </motion.div> */}
            </div>
          </motion.div>
        </div>
        <h3 className="mb-2 md:text-xl font-medium tracking-tight">{title}</h3>
        <p className="mb-6 text-sm md:text-base opacity-80 leading-tight px-6">
          {description}
        </p>
        <Button
          size="sm"
          className="gap-2 bg-gradient-to-r from-violet-500 to-indigo-500 text-white hover:from-violet-600 hover:to-indigo-600 dark:from-violet-600 dark:to-indigo-600 dark:hover:from-violet-700 dark:hover:to-indigo-700 rounded-lg scale-90"
          onMouseEnter={() => setIsHovering(true)}
          onMouseLeave={() => setIsHovering(false)}
          onClick={onCreateNew}
        >
          <Plus className="h-4 w-4" />
          {ctaText}
        </Button>
      </motion.div>
    </div>
  );
}

export default PostSection;
