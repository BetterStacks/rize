import { useToggleLikePost } from "@/hooks/useToggleLike";
import { GetExplorePosts, TPostMedia } from "@/lib/types";
import { cn } from "@/lib/utils";
import moment from "moment";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FC } from "react";
import PostInteractions, {
  PostAvatar,
  PostCardContainer,
  PostCardOptions,
  PostLinkCard,
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
    h: "%d hr ago",
    hh: "%d hr ago",
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

const PostCard: FC<PostCardProps> = ({ post, mediaContainerClassName }) => {
  const hasMedia = post?.media;
  const onlyMedia = hasMedia && !post?.content;
  const onlyContent = !hasMedia && post?.content?.length > 0;
  const onlyLink = !post?.content && post?.link;

  const router = useRouter();

  const mutation = useToggleLikePost({
    liked: Boolean(post.liked),
    postId: post.id,
  });

  const handleLikeClick = () => {
    mutation.mutate();
  };
  const handleViewPost = () => {
    router.push(`/post/${post?.id}`);
  };

  const isValidUrl = (url?: string) => {
    if (!url) return false;
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };

  // Normalize src for next/image: must be absolute URL or start with '/'
  const normalizeSrc = (raw?: string) => {
    if (!raw) return null;
    if (isValidUrl(raw)) return raw;
    return raw.startsWith("/") ? raw : `/${raw}`;
  };
  if (onlyContent) {
    return (
      <OnlyContentCard
        handleViewPost={handleViewPost}
        likeCount={Number(post.likeCount)}
        liked={Boolean(post?.liked)}
        post={post}
        handleLike={handleLikeClick}
        commentCount={Number(post?.commentCount)}
        commented={Boolean(post?.commented)}
      />
    );
  } else if (onlyMedia) {
    return (
      <OnlyMediaCard
        handleViewPost={handleViewPost}
        likeCount={Number(post.likeCount)}
        liked={Boolean(post?.liked)}
        post={post}
        handleLike={handleLikeClick}
        commentCount={Number(post?.commentCount)}
        commented={Boolean(post?.commented)}
      />
    );
  }
  return (
    <PostCardContainer
      handlePostClick={handleViewPost}
      className="group shadow-md"
    >
      <div className="">
        {(post.media as TPostMedia) && (
          <div
            key={(post?.media as TPostMedia)?.id}
            className={cn(
              "relative border-b border-neutral-300/80  w-full rounded-t-3xl overflow-hidden ",
              "dark:border-dark-border",
              mediaContainerClassName
            )}
            style={{
              aspectRatio:
                (post?.media as TPostMedia).width /
                (post?.media as TPostMedia).height,
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
            {(post?.media as TPostMedia)?.type === "image" ? (
              <>
                {normalizeSrc((post?.media as TPostMedia).url) ? (
                  <Image
                    fill
                    src={normalizeSrc((post?.media as TPostMedia).url)!}
                    alt="Post media"
                    loading="lazy"
                    style={{ objectFit: "cover" }}
                    draggable={false}
                    className=" select-none "
                  />
                ) : (
                  // fallback to plain img when src isn't valid for next/image
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={(post?.media as TPostMedia).url}
                    alt="Post media"
                    className="w-full h-full object-cover"
                    draggable={false}
                  />
                )}
              </>
            ) : (
              <>
                <video
                  style={{ objectFit: "cover" }}
                  className="w-full h-full select-none  "
                  src={(post?.media as TPostMedia).url}
                  autoPlay
                  draggable={false}
                  loop
                  muted
                  controls={false}
                />
              </>
            )}
          </div>
        )}
      </div>
      <div className={cn("flex  gap-y-2 px-4 py-2 mt-4", !hasMedia && "mt-4")}>
        {!hasMedia && (
          <div
            className={cn(
              "size-10 aspect-square  rounded-full  flex relative overflow-hidden"
            )}
          >
            {normalizeSrc(post?.avatar as string) ? (
              <Image
                className=" "
                src={normalizeSrc(post?.avatar as string)!}
                fill
                style={{
                  objectFit: "cover",
                }}
                quality={100}
                priority
                alt={`${post?.name}`}
              />
            ) : (
              // fallback plain img when next/image can't accept the src
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={post?.avatar as string}
                alt={`${post?.name}`}
                className="w-full h-full object-cover"
                draggable={false}
              />
            )}
          </div>
        )}
        <div
          className={cn(
            " flex flex-1 flex-col items-start",
            !hasMedia && "ml-3"
          )}
        >
          <Link href={`/${post?.username}`}>
            <h2 className={cn(" text-sm text-black  ", "dark:text-white")}>
              {post.name}
            </h2>
          </Link>
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
        {onlyLink && (
          <PostCardOptions
            postId={post?.id}
            profileId={post?.profileId as string}
          />
        )}
      </div>

      {post?.content && (
        <p
          className={cn(
            "text-neutral-600 leading-snug line-clamp-[10]  font-medium  text-sm p-4  ",
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
      )}
      {post?.link && (
        <div className="mt-4">
          <PostLinkCard {...post?.link} />
        </div>
      )}

      <PostInteractions
        likeCount={Number(post.likeCount)}
        isLiked={Boolean(post?.liked)}
        handleLikeClick={handleLikeClick}
        commentCount={Number(post?.commentCount)}
        hasCommented={Boolean(post?.commented)}
        handleCommentClick={() => {}}
      />
    </PostCardContainer>
  );
};
type GeneralPostProps = {
  handleLike?: () => void;
  post: GetExplorePosts;
  likeCount: number;
  liked: boolean;
  commentCount: number;
  commented: boolean;
  handleComment?: () => void;
  handleViewPost: () => void;
};

const OnlyContentCard: FC<GeneralPostProps> = ({
  post,
  likeCount,
  liked,
  handleLike,
  commentCount,
  commented,
  handleComment,
  handleViewPost,
}) => {
  return (
    <PostCardContainer
      handlePostClick={handleViewPost}
      className="group shadow-md"
    >
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
            <Link href={`/${post?.username}`}>
              <h2 className={cn(" text-sm text-black  ", "dark:text-white")}>
                {post.name}
              </h2>
            </Link>
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
      {post?.link && <PostLinkCard {...post?.link} />}
      <PostInteractions
        likeCount={likeCount}
        isLiked={liked as boolean}
        handleLikeClick={handleLike!}
        commentCount={commentCount}
        hasCommented={post?.commented}
        handleCommentClick={handleComment!}
      />
    </PostCardContainer>
  );
};
const OnlyMediaCard: FC<GeneralPostProps> = ({
  post,
  likeCount,
  liked,
  handleLike,
  handleViewPost,
}) => {
  const media = post?.media;
  return (
    <PostCardContainer
      handlePostClick={handleViewPost}
      className=" relative group shadow-md "
    >
      <div className="bg-gradient-to-b transition-all duration-75 ease-in group-hover:opacity-100 opacity-0 w-full from-black via-black/60 to-transparent h-40 absolute z-[6] inset-0" />
      <div
        className={cn(
          "flex w-full group-hover:opacity-100 transition-all duration-75 ease-in opacity-0 absolute top-5 z-[8]   items-center justify-between   px-4 "
        )}
      >
        <div className="flex items-center justify-start">
          <PostAvatar
            avatar={post?.avatar as string}
            name={post?.name as string}
          />
          <div className={cn(" flex flex-col items-start", "ml-3")}>
            <Link href={`/${post?.username}`}>
              <h2 className={cn(" text-sm   ", "text-white")}>{post.name}</h2>
            </Link>
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
        style={{
          aspectRatio:
            (post?.media as TPostMedia).width /
            (post?.media as TPostMedia).height,
        }}
        className={cn("relative  overflow-hidden ")}
      >
        {(post?.media as TPostMedia)?.type === "image" ? (
          <>
            <Image
              fill
              src={(post?.media as TPostMedia).url}
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
              src={(post?.media as TPostMedia)?.url}
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
