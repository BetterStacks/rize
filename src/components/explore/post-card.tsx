import { toggleLike } from "@/actions/post-actions";
import { GetExplorePosts } from "@/lib/types";
import { cn, getUrlMetadata } from "@/lib/utils";
import { useMutation } from "@tanstack/react-query";
import moment from "moment";
import { useSession } from "next-auth/react";
import Image from "next/image";
import { FC, useState } from "react";
import { usePostDialog } from "../dialog-provider";
import PostInteractions, {
  PostAvatar,
  PostCardContainer,
  PostCardOptions,
} from "./post-interactions";

type PostCardProps = {
  post: GetExplorePosts;
  className?: string;
  mediaContainerClassName?: string;
  addDarkStyles?: boolean;
  showHeader?: boolean;
};

moment.updateLocale("en", {
  relativeTime: {
    past: "%s",
    s: "%dsec",
    ss: "%dsec",
    m: "%d min",
    mm: "%d min",
    h: "%dhrs ago",
    hh: "%d hrs ago",
    d: "%dd",
    dd: "%dd",
    w: "%d week",
    ww: "%d weeks",
    M: "%d mon",
    MM: "%d mon",
    y: "%dyr",
    yy: "%dyr",
  },
});

const PostCard: FC<PostCardProps> = ({
  post,
  className,
  addDarkStyles = true,
  mediaContainerClassName,
  showHeader = true,
}) => {
  const hasMedia = post?.media?.length > 0;
  const onlyMedia = hasMedia && !post?.content;
  const onlyContent = !hasMedia && post?.content?.length > 0;
  const hasBoth = hasMedia && post?.content?.length > 0;
  const setOpen = usePostDialog()[1];
  const [liked, setLiked] = useState(post.liked);
  const [likeCount, setLikeCount] = useState<number>(Number(post.likeCount));
  const session = useSession();
  const isMine = post?.profileId === session?.data?.user?.profileId;

  const mutation = useMutation({
    mutationFn: ({ like, postId }: { postId: string; like: boolean }) =>
      toggleLike(postId, like),
    onMutate: async ({ like, postId }) => {
      setLiked((prev) => !prev);
      setLikeCount((prev) => (liked ? Number(prev) - 1 : Number(prev) + 1));
      console.log({ like, likeCount });
    },
    onError: () => {
      setLiked((prev) => !prev);
      setLikeCount((prev) => (liked ? prev + 1 : prev - 1));
    },
  });

  const handleLikeClick = () => {
    const next = !post.liked;
    mutation.mutate({ postId: post.id, like: next });
  };

  if (post?.links?.[0]) {
    getUrlMetadata(post?.links[0].url);
  }
  if (onlyContent) {
    return (
      <OnlyContentCard
        likeCount={likeCount}
        liked={liked as boolean}
        post={post}
        handleLike={handleLikeClick}
      />
    );
  } else if (onlyMedia) {
    return (
      <OnlyMediaCard
        likeCount={likeCount}
        liked={liked as boolean}
        post={post}
        handleLike={handleLikeClick}
      />
    );
  }
  return (
    <PostCardContainer className="group">
      <div>
        <div className="">
          {post.media?.slice(0, 1).map((media) => (
            <div
              key={media.id}
              className={cn(
                "relative border-b border-neutral-300/80  w-full rounded-t-3xl overflow-hidden ",
                addDarkStyles && "dark:border-dark-border",
                mediaContainerClassName
              )}
              style={{
                aspectRatio: media.width / media.height,
                objectFit: "cover",
              }}
            >
              <div className="absolute top-2 z-[2] px-4 pt-2 w-full gap-x-2 flex items-center justify-between">
                <PostAvatar
                  avatar={post?.avatar as string}
                  name={post?.name as string}
                />
                <PostCardOptions
                  postId={post?.id}
                  profileId={post?.profileId as string}
                />
              </div>
              {media?.type === "image" ? (
                <>
                  <Image
                    fill
                    src={media.url}
                    alt="Post media"
                    loading="lazy"
                    style={{ objectFit: "cover" }}
                    draggable={false}
                    className=" select-none "
                  />
                </>
              ) : (
                <>
                  <video
                    style={{ objectFit: "cover" }}
                    className="w-full h-full select-none  "
                    src={media?.url}
                    autoPlay
                    draggable={false}
                    loop
                    muted
                    controls={false}
                  />
                </>
              )}
            </div>
          ))}
        </div>
      </div>
      <div className={cn("flex  gap-y-2 px-4 py-2 mt-4", !hasMedia && "mt-4")}>
        {!hasMedia && (
          <div
            className={cn(
              "size-10 aspect-square  rounded-full  flex relative overflow-hidden"
              // addDarkStyles && "dark:border-dark-border"
            )}
          >
            <Image
              className=" "
              src={post?.avatar as string}
              fill
              style={{
                objectFit: "cover",
              }}
              quality={100}
              priority
              alt={`${post?.name}`}
            />
          </div>
        )}
        <div className={cn(" flex flex-col items-start", !hasMedia && "ml-4")}>
          <h2
            className={cn(
              " text-sm text-black  ",
              addDarkStyles && "dark:text-white"
            )}
          >
            {post.name}
          </h2>
          <div
            className={cn(
              "flex items-center justify-start dark:text-neutral-400 text-sm font-light leading-snug text-neutral-600 "
            )}
          >
            <p className={cn("mr-1")}>@{post.username}</p>
            {"•"}
            <span className="ml-1">{moment(post?.createdAt).fromNow()}</span>
          </div>
        </div>
      </div>

      <p
        className={cn(
          "text-neutral-600 leading-snug line-clamp-[10] mb-4 font-medium  text-sm p-4  ",
          addDarkStyles && "dark:text-neutral-400 "
        )}
      >
        {post?.content?.split("\n").map((line, i) => {
          return (
            <span className={cn("")} key={i}>
              {line} <br className="" />
            </span>
          );
        })}
      </p>
      <PostInteractions
        likeCount={likeCount}
        isLiked={liked as boolean}
        handleLikeClick={handleLikeClick}
      />
    </PostCardContainer>
  );
};
type GeneralPostProps = {
  handleLike?: () => void;
  post: GetExplorePosts;
  likeCount: number;
  liked: boolean;
};

const OnlyContentCard: FC<GeneralPostProps> = ({
  post,
  likeCount,
  liked,
  handleLike,
}) => {
  return (
    <PostCardContainer className="group">
      <div
        className={cn(
          "flex w-full items-center justify-between   px-4 py-2 mt-4"
        )}
      >
        <div className="flex items-center justify-start">
          <PostAvatar
            avatar={post?.avatar as string}
            name={post?.name as string}
          />
          <div className={cn(" flex flex-col items-start", "ml-3")}>
            <h2 className={cn(" text-sm text-black  ", "dark:text-white")}>
              {post.name}
            </h2>
            <div
              className={cn(
                "flex items-center justify-start dark:text-neutral-400 text-sm font-light leading-snug text-neutral-600 "
              )}
            >
              <p className={cn("mr-1")}>@{post.username}</p>
              {"•"}
              <span className="ml-1">{moment(post?.createdAt).fromNow()}</span>
            </div>
          </div>
        </div>
        <PostCardOptions
          postId={post?.id}
          profileId={post?.profileId as string}
        />
      </div>
      <p
        className={cn(
          "text-neutral-600 leading-snug line-clamp-[10] mb-2 font-medium  text-sm p-4  ",
          "dark:text-neutral-400 "
        )}
      >
        {post?.content?.split("\n").map((line, i) => {
          return (
            <span className={cn("")} key={i}>
              {line} <br className="" />
            </span>
          );
        })}
      </p>
      <PostInteractions
        likeCount={likeCount}
        isLiked={liked as boolean}
        handleLikeClick={handleLike!}
      />
    </PostCardContainer>
  );
};
const OnlyMediaCard: FC<GeneralPostProps> = ({
  post,
  likeCount,
  liked,
  handleLike,
}) => {
  const media = post?.media[0];
  return (
    <PostCardContainer className=" relative group">
      <div className="bg-gradient-to-b w-full from-black via-black/60 to-transparent h-40 absolute z-[6] inset-0" />
      <div
        className={cn(
          "flex w-full absolute top-5 z-[8]   items-center justify-between   px-4 "
        )}
      >
        <div className="flex items-center justify-start">
          <PostAvatar
            avatar={post?.avatar as string}
            name={post?.name as string}
          />
          <div className={cn(" flex flex-col items-start", "ml-3")}>
            <h2 className={cn(" text-sm   ", "text-white")}>{post.name}</h2>
            <div
              className={cn(
                "flex items-center justify-start text-neutral-400 text-sm font-light leading-snug  "
              )}
            >
              <p className={cn("mr-1")}>@{post.username}</p>
              {"•"}
              <span className="ml-1">{moment(post?.createdAt).fromNow()}</span>
            </div>
          </div>
        </div>
        <PostCardOptions
          postId={post?.id}
          profileId={post?.profileId as string}
        />
      </div>
      <div
        style={{ aspectRatio: media.width / media.height }}
        className={cn("relative  overflow-hidden ")}
      >
        {media?.type === "image" ? (
          <>
            <Image
              fill
              src={media.url}
              alt="Post media"
              draggable={false}
              loading="lazy"
              style={{ objectFit: "cover" }}
              className="select-none "
            />
          </>
        ) : (
          <>
            <video
              style={{ objectFit: "cover" }}
              className="w-full h-full select-none  "
              src={media?.url}
              autoPlay
              draggable={false}
              loop
              muted
              controls={false}
            />
          </>
        )}
      </div>

      {/* <PostInteractions
        likeCount={likeCount}
        isLiked={liked as boolean}
        handleLikeClick={handleLike!}
      /> */}
    </PostCardContainer>
  );
};

export default PostCard;

// if (onlyMedia) {
//   return (
//     <div
//       className={cn(
//         " first:mt-0 mt-4 relative bg-white w-full border  overflow-hidden break-inside-avoid  border-neutral-300/80  rounded-3xl ",
//         addDarkStyles && "dark:bg-neutral-800 dark:border-dark-border",
//         className
//       )}
//     >
//       {showHeader && (
//         <>
//           {" "}
//           <div className="bg-gradient-to-b w-full from-black via-black/60 to-transparent h-36 absolute z-[6] inset-0"></div>
//           <div className="absolute top-2 z-[8] px-4 pt-2 w-full gap-x-2 flex items-center justify-between">
//             {" "}
//             <div className="flex items-center justify-start">
//               <PostAvatar
//                 avatar={post?.avatar as string}
//                 name={post?.name as string}
//               />
//               <div className={cn(" flex items-start flex-col ml-2")}>
//                 <h2 className={cn(" text-sm text-white")}>{post.name}</h2>
//                 <div
//                   className={cn(
//                     "flex items-center justify-center dark:text-neutral-400 text-sm font-light leading-snug text-neutral-400 "
//                   )}
//                 >
//                   <p
//                     className={
//                       cn("mr-1")
//                       // "text-sm font-light leading-tight text-neutral-600 ",
//                       // addDarkStyles && "dark:text-neutral-400"
//                     }
//                   >
//                     @{post.username}
//                   </p>
//                   {"•"}
//                   <span className="ml-1">
//                     {moment(post?.createdAt).fromNow()}
//                   </span>
//                 </div>
//               </div>
//             </div>
//             <DropdownMenu>
//               <DropdownMenuTrigger asChild>
//                 <Button
//                   size={"smallIcon"}
//                   className="rounded-full"
//                   variant={"outline"}
//                 >
//                   <MoreHorizontal
//                     className={cn(
//                       "text-neutral-500 size-4 dark:text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-300"
//                     )}
//                   />
//                 </Button>
//               </DropdownMenuTrigger>
//               <DropdownMenuContent className="rounded-xl dark:bg-dark-bg border dark:border-dark-border border-neutral-300/60 bg-white p-0">
//                 <DropdownMenuItem className="px-4 py-1.5 ">
//                   <Link2 className="opacity-80 -rotate-45 size-4" />
//                   <span>Copy Link</span>
//                 </DropdownMenuItem>
//                 <DropdownMenuItem className="px-4 py-1.5 border-t border-neutral-300/60 dark:border-dark-border">
//                   <Bookmark className="opacity-80  size-4" />
//                   <span>Save</span>
//                 </DropdownMenuItem>
//                 {isMine && (
//                   <DropdownMenuItem
//                     onClick={() => handleDeletePost(post?.id)}
//                     className="px-4 py-1.5 border-t border-neutral-300/60 dark:border-dark-border"
//                   >
//                     {isDeleting ? (
//                       <Loader className="opacity-80 size-4 animate-spin" />
//                     ) : (
//                       <Trash2 className="opacity-80 size-4" />
//                     )}
//                     <span>Delete</span>
//                   </DropdownMenuItem>
//                 )}
//               </DropdownMenuContent>
//             </DropdownMenu>
//           </div>
//         </>
//       )}
//       <PostMediaContainer
//         mediaContainerClassName={mediaContainerClassName}
//         media={post?.media}
//       />
//     </div>
//   );
// }
