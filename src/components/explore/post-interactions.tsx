import { deletePost } from "@/actions/post-actions";
import { TPostMedia } from "@/lib/types";
import { cn } from "@/lib/utils";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Bookmark,
  Globe,
  Heart,
  Link2,
  Loader,
  MessageCircle,
  MoreHorizontalIcon,
  Trash2,
  X,
} from "lucide-react";
import moment from "moment";
import { useSession } from "next-auth/react";
import Image from "next/image";
import Link from "next/link";
import { FC } from "react";
import toast from "react-hot-toast";
import { Result } from "url-metadata";
import { useAlertDialog, useAuthDialog } from "../dialog-provider";
import { Button } from "../ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";

type PostInteractionsProps = {
  likeCount: number;
  isLiked: boolean;
  handleLikeClick: () => void;
};

const PostInteractions: FC<PostInteractionsProps> = ({
  isLiked,
  likeCount,
  handleLikeClick,
}) => {
  const [open, setOpen] = useAuthDialog();
  const session = useSession();
  return (
    <div className=" mb-4 flex justify-start w-full gap-x-2 p-4">
      <div
        onClick={() => {
          if (!session?.data) {
            setOpen(true);
            return;
          }
          handleLikeClick();
        }}
        className="flex border dark:border-dark-border text-neutral-500 dark:text-neutral-400 hover:dark:bg-dark-border hover:bg-neutral-100 cursor-pointer border-neutral-300/80 py-1.5 px-3 rounded-3xl items-center justify-center gap-x-2"
      >
        <Heart
          strokeWidth={1.2}
          fill={isLiked ? "red" : "none"}
          className={cn(
            "size-4 ",
            isLiked
              ? "stroke-red-600"
              : "stroke-neutral-500 dark:stroke-neutral-400"
          )}
        />
        <span className="text-sm text-neutral-500 dark:text-neutral-400">
          {likeCount}
        </span>
      </div>

      <div
        onClick={() => {
          // handleLikeClick();
        }}
        className="flex border dark:border-dark-border text-neutral-500 dark:text-neutral-400 hover:dark:bg-dark-border hover:bg-neutral-100 cursor-pointer border-neutral-300/80 py-1 px-3 rounded-3xl items-center justify-center gap-x-2"
      >
        <MessageCircle
          strokeWidth={1.4}
          className={cn(
            "size-4 "
            // isLiked ? "" : "stroke-neutral-500 dark:stroke-neutral-400"
          )}
        />
        {/* <span className="text-sm text-neutral-500 dark:text-neutral-400">
          {likeCount}
        </span> */}
      </div>
    </div>
  );
};

type PostMediaContainerProps = {
  media: TPostMedia[];
  mediaContainerClassName?: string;
  hasContentAndMedia?: boolean;
  onlyMedia?: boolean;
};

type PostaAvatarProps = {
  avatar: string;
  name: string;
  className?: string;
};
export const PostAvatar: FC<PostaAvatarProps> = ({
  avatar,
  name,
  className,
}) => {
  return (
    <div
      className={cn(
        "size-10 aspect-square  rounded-full  flex relative overflow-hidden",
        className
      )}
    >
      <Image
        className=" rounded-full w-full aspect-square"
        src={avatar as string}
        fill
        style={{
          objectFit: "cover",
        }}
        quality={100}
        priority
        alt={`${name} - Avatar`}
      />
    </div>
  );
};

type PostCardHeaderProps = {
  avatar: string;
  name: string;
  onlyContent?: boolean;
  hasContentAndMedia?: boolean;
  onlyMedia?: boolean;
  createdAt: Date;
  username: string;
};

export const PostCardHeader: FC<PostCardHeaderProps> = ({
  avatar,
  createdAt,
  hasContentAndMedia,
  onlyContent,
  onlyMedia,
  name,
  username,
}) => {
  return (
    <div
      className={cn(
        "flex items-center text-white px-4 justify-between w-full",
        hasContentAndMedia && "absolute   top-3 z-[2]",
        onlyMedia && "absolute   top-3 z-[8]"
      )}
    >
      <PostAvatar avatar={avatar} name={name} />
      <div className={cn(" flex flex-col", onlyContent && "ml-4")}>
        <h2
        // className={cn(
        //   " text-sm text-black  ",
        //   addDarkStyles && "dark:text-white"
        // )}
        >
          {name}
        </h2>
        <div
          className={cn(
            "flex items-center justify-center dark:text-neutral-400 text-sm font-light leading-snug text-neutral-400 "
          )}
        >
          <p
            className={
              cn("mr-1")
              // "text-sm font-light leading-tight text-neutral-600 ",
              // addDarkStyles && "dark:text-neutral-400"
            }
          >
            @{username}
          </p>
          {"•"}
          <span className="ml-1">{moment(createdAt).fromNow()}</span>
        </div>
      </div>
    </div>
  );
};

type PostCardOptionsProps = {
  profileId: string;
  postId: string;
};

export const PostCardOptions: FC<PostCardOptionsProps> = ({
  postId,
  profileId,
}) => {
  const queryClient = useQueryClient();
  const session = useSession();
  const isMine = session?.data?.user?.profileId === profileId;
  const { mutate, isPending } = useMutation({
    mutationFn: deletePost,
    onSuccess: () => {
      toast.success("Post deleted successfully");
      queryClient.invalidateQueries({ queryKey: ["explore-feed"] });
      queryClient.invalidateQueries({ queryKey: ["get-user-posts"] });
    },
    onError: (error) => {
      console.error("Error deleting post:", error);
    },
  });
  const [open, setOpen] = useAlertDialog();

  return (
    <>
      {/* <AuthGuardDialog
        title="Are you sure about Deleting this post?"
        onClose={() => {}}
        onContinue={() => {
          mutate(postId);
          setOpen(false);
        }}
      /> */}
      <DropdownMenu>
        <DropdownMenuTrigger
          asChild
          className="group-hover:opacity-100 opacity-0 transition-all duration-200 ease-in"
        >
          <Button
            size={"smallIcon"}
            className="rounded-full "
            variant={"outline"}
          >
            <MoreHorizontalIcon
              className={cn(
                "text-neutral-500 size-4 dark:text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-300"
              )}
            />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="shadow-2xl shadow-black/40 dark:shadow-black rounded-xl dark:bg-dark-bg border dark:border-dark-border border-neutral-300/60 bg-white p-0">
          <DropdownMenuItem className="px-4 py-1.5 ">
            <Link2 className="opacity-80 -rotate-45 size-4" />
            <span>Copy Link</span>
          </DropdownMenuItem>
          <DropdownMenuItem className="px-4 py-1.5 border-t border-neutral-300/60 dark:border-dark-border">
            <Bookmark className="opacity-80  size-4" />
            <span>Save</span>
          </DropdownMenuItem>
          {isMine && (
            <DropdownMenuItem
              onClick={() => mutate(postId)}
              className="px-4 py-1.5 border-t border-neutral-300/60 dark:border-dark-border"
            >
              {isPending ? (
                <Loader className="opacity-80 size-4 animate-spin" />
              ) : (
                <Trash2 className="opacity-80 size-4" />
              )}
              <span>Delete</span>
            </DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );
};

type PostCardContainerProps = {
  children: React.ReactNode;
  className?: string;
  addDarkStyles?: boolean;
};

export const PostCardContainer: FC<PostCardContainerProps> = ({
  children,
  className,
}) => {
  return (
    <div
      // onClick={handlePostClick}
      className={cn(
        " first:mt-0 mt-4 bg-white w-full border   overflow-hidden break-inside-avoid  border-neutral-300/60   rounded-3xl ",
        "dark:bg-neutral-800 dark:border-dark-border",
        className
      )}
    >
      {children}
    </div>
  );
};

type PostLinkCardProps = {
  data: Result;
  onRemove?: () => void;
  hasRemove?: boolean;
  className?: string;
};

export const PostLinkCard: FC<PostLinkCardProps> = ({
  data,
  onRemove,
  hasRemove,
}) => {
  return (
    <div
      className={cn(
        !hasRemove && "mx-4",
        hasRemove && "max-w-xs",
        " mt-4 rounded-2xl relative overflow-hidden  border border-neutral-300/80 dark:border-dark-border"
      )}
    >
      <div className="relative overflow-hidden w-full h-fit aspect-video">
        {hasRemove && (
          <button
            onClick={onRemove}
            className="border border-neutral-200 dark:bg-dark-bg bg-white dark:border-dark-border rounded-full  absolute top-2 right-2 p-2"
          >
            <X className="size-4 opacity-80  " />
          </button>
        )}
        {data["og:image"] ? (
          <Image
            alt={data?.title}
            fill
            style={{ objectFit: "cover" }}
            src={data["og:image"]}
            draggable={false}
            loading="lazy"
          />
        ) : (
          <div className="h-[180px]  w-full flex items-center justify-center">
            <Globe strokeWidth={1.2} className="opacity-80 size-10" />
          </div>
        )}
      </div>
      <div className="px-4 pt-4 mb-6  border-t border-neutral-300/80 dark:border-dark-border">
        <Link href={data?.url} target="_blank" className="w-full ">
          <h4 className="font-medium dark:text-neutral-300 text-neutral-600 leading-tight tracking-tight">
            {data?.title}
          </h4>
        </Link>
      </div>
    </div>
  );
};

export default PostInteractions;
