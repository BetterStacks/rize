import { GetExplorePosts } from "@/lib/types";
import { cn } from "@/lib/utils";
import Image from "next/image";
import { FC } from "react";
import moment from "moment";
import { Bookmark, Heart, MessageCircle, Share2 } from "lucide-react";

type PostCardProps = {
  post: GetExplorePosts;
  className?: string;
  mediaContainerClassName?: string;
  addDarkStyles?: boolean;
};

// moment.updateLocale("en", {
//   relativeTime: {
//     past: "%s",
//     s: "%dsec",
//     ss: "%dsec",
//     m: "%d min",
//     mm: "%d min",
//     h: "%dhrs ago",
//     hh: "%d hrs ago",
//     d: "%dd",
//     dd: "%dd",
//     w: "%d week",
//     ww: "%d weeks",
//     M: "%d mon",
//     MM: "%d mon",
//     y: "%dyr",
//     yy: "%dyr",
//   },
// });

const PostCard: FC<PostCardProps> = ({
  post,
  className,
  addDarkStyles = true,
  mediaContainerClassName,
}) => {
  const hasMedia = post?.media?.length > 0;
  return (
    <div
      key={post.id}
      className={cn(
        " first:mt-0 mt-4 w-full border bg-white overflow-hidden break-inside-avoid  border-neutral-300/80  rounded-3xl shadow-md",
        addDarkStyles && "dark:bg-neutral-800 dark:border-dark-border",
        className
      )}
    >
      <div>
        {hasMedia && (
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
                <div className="absolute top-2 left-2 z-20 p-2 flex items-center gap-x-2">
                  <div className="size-10 aspect-square flex drop-shadow-lg relative overflow-hidden">
                    <Image
                      className=" rounded-full w-full aspect-square"
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
                </div>
                {media?.type === "image" ? (
                  <>
                    <Image
                      fill
                      src={media.url}
                      alt="Post media"
                      className="object-cover "
                    />
                  </>
                ) : (
                  <>
                    <video
                      style={{ objectFit: "cover" }}
                      className="w-full h-full "
                      src={media?.url}
                      autoPlay
                      loop
                      muted
                      controls={false}
                    />
                  </>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
      <div className={cn("flex  gap-y-2 px-4 py-2 mt-4", !hasMedia && "mt-4")}>
        {!hasMedia && (
          <div
            className={cn(
              "size-10 aspect-square border rounded-full border-neutral-300/80  flex relative overflow-hidden",
              addDarkStyles && "dark:border-dark-border"
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
        <div className={cn(" flex flex-col", !hasMedia && "ml-4")}>
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
              "flex items-center justify-center dark:text-neutral-400 text-sm font-light leading-snug text-neutral-600 "
            )}
          >
            <p
              className={
                cn("mr-1")
                // "text-sm font-light leading-tight text-neutral-600 ",
                // addDarkStyles && "dark:text-neutral-400"
              }
            >
              @{post.username}
            </p>
            {"•"}
            <span className="ml-1">{moment(post?.createdAt).fromNow()}</span>
          </div>
        </div>
      </div>

      <p
        className={cn(
          "text-neutral-700 mb-8 leading-snug line-clamp-[10]  text-sm p-4  ",
          addDarkStyles && "dark:text-neutral-300/90"
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
      {/* <div className=" mt-4 flex justify-evenly p-4">
        <div className="flex items-center justify-center gap-x-2">
          <Heart className="text-neutral-500 dark:text-neutral-400" size={20} />
          <span className="text-sm text-neutral-500 dark:text-neutral-400">
            0
          </span>
        </div>
        <div className="flex items-center justify-center gap-x-2">
          <MessageCircle
            className="text-neutral-500 dark:text-neutral-400"
            size={20}
          />
          <span className="text-sm text-neutral-500 dark:text-neutral-400">
            0
          </span>
        </div>
        <div className="flex items-center justify-center gap-x-2">
          <Bookmark
            className="text-neutral-500 dark:text-neutral-400"
            size={20}
          />
          <span className="text-sm text-neutral-500 dark:text-neutral-400">
            15
          </span>
        </div>
        <div className="flex items-center justify-center gap-x-2">
          <Share2
            className="text-neutral-500 dark:text-neutral-400"
            size={20}
          />
        </div>
      </div> */}
    </div>
  );
};

export default PostCard;
{
  /* <div className="mb-2 p-2 flex items-center gap-x-2">
        <div className="size-10 aspect-square flex relative overflow-hidden">
          <Image
            className=" rounded-full w-full aspect-square"
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
        <div className="ml-2 flex flex-col">
          <h2 className=" font-semibold">{post.name}</h2>
          <p className="text-sm leading-tight text-neutral-500 dark:text-neutral-400">
            @{post.username}
          </p>
        </div>
      </div>
      <p className="text-neutral-700 leading-snug dark:text-neutral-300/90 text-sm px-2 mt-4 mb-6">
        {post?.content?.split("\n").map((line, i) => {
          return (
            <span className={cn("")} key={i}>
              {line} <br className="" />
            </span>
          );
        })}
      </p>
      <>
        {post?.media?.length > 0 && (
          <div className="mt-2">
            {post.media?.slice(0, 1).map((media) => (
              <div
                key={media.id}
                className="relative border border-neutral-300/80 dark:border-dark-border w-full rounded-xl overflow-hidden mb-2"
                style={{
                  aspectRatio: media.width / media.height,
                  objectFit: "cover",
                }}
              >
                {media?.type === "image" ? (
                  <>
                    <Image
                      fill
                      src={media.url}
                      alt="Post media"
                      className="object-cover "
                    />
                  </>
                ) : (
                  <>
                    <video
                      style={{ objectFit: "cover" }}
                      className="w-full h-full "
                      src={media?.url}
                      autoPlay
                      loop
                      muted
                      controls={false}
                    />
                  </>
                )}
              </div>
            ))}
          </div>
        )}
      </> */
}

//  Create a Hero secion for my web app called "rize" that lets user's create profile where they can add posts education work xp skills,social cotntact share experiences using blogs and pictures.The hero section should have a gradient background with heading that says "Own your story not just your resume" and a appropriate subheading along side a claim username input also give it mockup section to add an image of the app implment apple's human inteface guidelines with cleam minimalistic elements and careful typography use a indigo and blues
