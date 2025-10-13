import { addComment, deleteComment } from "@/actions/post-actions";
import { GetExplorePosts, TAddNewComment } from "@/lib/types";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useSession } from "@/hooks/useAuth";
import toast from "react-hot-toast";
import { v4 } from "uuid";

type UseCommentProps = {
  postId: string;
  orderBy: "newest" | "oldest" | "popular";
};

export const useComment = ({ postId, orderBy }: UseCommentProps) => {
  const queryClient = useQueryClient();
  const session = useSession();

  const addCommentMutation = useMutation({
    mutationFn: (payload: Omit<TAddNewComment, "postId" | "profileId">) => {
      const profileId = session?.data?.user?.profileId as string | undefined;
      if (!profileId) {
        // Fail fast on client if profileId is missing to avoid sending an invalid payload
        return Promise.reject(new Error("Missing profileId"));
      }
      return addComment({
        ...payload,
        postId: postId,
        profileId,
      });
    },

    onMutate: async (newComment) => {
      await queryClient.cancelQueries({
        queryKey: ["get-post-by-id", postId],
      });
      await queryClient.cancelQueries({ queryKey: ["explore-top-posts"] });
      await queryClient.cancelQueries({
        queryKey: ["get-post-comments", postId, orderBy],
      });

      const previousPosts = queryClient.getQueryData(["explore-top-posts"]);
      const previousPost = queryClient.getQueryData(["get-post-by-id", postId]);
      // capture cached comments for this specific order variant for rollback
      const previousComments = queryClient.getQueryData([
        "get-post-comments",
        postId,
        orderBy,
      ]);

      // Optimistically update post detail
      queryClient.setQueryData(["get-post-by-id", postId], (old: any) => {
        if (!old) return old;
        return {
          ...old,
          commentCount: Number(old.commentCount) + 1,
          commented: true,
        };
      });

      // Optimistically update explore feed (infinite pages)
      queryClient.setQueryData(["explore-top-posts"], (old: any) => {
        if (!old) return old;
        return {
          ...old,
          pages: old.pages.map((page: any) => ({
            ...page,
            posts: page.posts.map((post: any) =>
              post.id === postId
                ? {
                    ...post,
                    commentCount: Number(post.commentCount) + 1,
                    commented: true,
                  }
                : post
            ),
          })),
        };
      });

      // Build an optimistic comment object using session info and mutation payload
      const optimisticComment = {
        id: `temp-${v4()}`,
        postId,
        profileId: session?.data?.user?.profileId as string,
        displayName:
          (session?.data?.user as any)?.displayName ||
          (session?.data?.user as any)?.name ||
          "",
        profileImage:
          (session?.data?.user as any)?.profileImage ||
          (session?.data?.user as any)?.image ||
          null,
        content: newComment?.content || null,
        media: newComment?.media || null,
        data: newComment?.data || null,
        createdAt: new Date().toISOString(),
      } as any;

      // Optimistically update the cached comments for this specific order variant
      queryClient.setQueryData(
        ["get-post-comments", postId, orderBy],
        (old: any) => {
          if (!old) {
            // If there's no cached data, create a new array with the optimistic comment
            return [optimisticComment];
          }

          // If the cached data is a flat array of comments
          if (Array.isArray(old)) {
            if (orderBy === "oldest") {
              return [...old, optimisticComment];
            }
            // newest or default -> prepend
            return [optimisticComment, ...old];
          }

          // If the cached data has pages (paginated)
          if (old.pages && Array.isArray(old.pages)) {
            return {
              ...old,
              pages: old.pages.map((page: any, idx: number) => {
                if (orderBy === "oldest") {
                  return {
                    ...page,
                    comments: [...(page.comments || []), optimisticComment],
                  };
                }
                // default -> add to first page
                if (idx === 0) {
                  return {
                    ...page,
                    comments: [optimisticComment, ...(page.comments || [])],
                  };
                }
                return page;
              }),
            };
          }

          return old;
        }
      );

      return { previousPost, previousPosts, previousComments };
    },

    onError: (_err, _vars, context) => {
      toast.error(_err.message || "Failed to add comment");
      if (context?.previousPost) {
        queryClient.setQueryData(
          ["get-post-by-id", postId],
          context.previousPost
        );
      }
      if (context?.previousPosts) {
        queryClient.setQueryData(["explore-feed"], context.previousPosts);
      }
      if (context?.previousComments) {
        // previousComments is the cached data for the specific key
        queryClient.setQueryData(
          ["get-post-comments", postId, orderBy],
          context.previousComments
        );
      }
      queryClient.invalidateQueries({
        queryKey: ["get-post-comments", postId, orderBy],
      });
    },

    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["get-post-by-id", postId] });
      queryClient.invalidateQueries({ queryKey: ["explore-feed"] });
      queryClient.invalidateQueries({
        queryKey: ["get-post-comments", postId, orderBy],
      });
    },
  });

  const removeCommentMutation = useMutation({
    mutationFn: deleteComment,

    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: ["get-post-by-id", postId] });
      await queryClient.cancelQueries({ queryKey: ["explore-top-posts"] });

      const previousPost = queryClient.getQueryData(["get-post-by-id", postId]);
      const previousPosts = queryClient.getQueryData(["explore-top-posts"]);

      // Optimistic update
      queryClient.setQueryData(["get-post-by-id", postId], (old: any) => {
        if (!old) return old;
        const newCount = Math.max(Number(old.commentCount) - 1, 0);
        return {
          ...old,
          commentCount: newCount,
          commented: newCount > 0, // only true if at least one comment remains
        };
      });

      queryClient.setQueryData(["explore-top-posts"], (old: any) => {
        if (!old) return old;
        return (old as GetExplorePosts[]).map((post) => {
          post.id === postId
            ? {
                ...post,
                commentCount: Math.max(Number(post.commentCount) - 1, 0),
                commented: Math.max(Number(post.commentCount) - 1, 0) > 0,
              }
            : post;
        });
      });

      return { previousPost, previousPosts };
    },

    onError: (_err, _vars, ctx) => {
      if (ctx?.previousPost)
        queryClient.setQueryData(["get-post-by-id", postId], ctx.previousPost);
      if (ctx?.previousPosts)
        queryClient.setQueryData(["explore-top-posts"], ctx.previousPosts);
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["get-post-comments", postId, orderBy],
      });
    },

    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["get-post-by-id", postId] });
      queryClient.invalidateQueries({ queryKey: ["explore-feed"] });
      queryClient.invalidateQueries({
        queryKey: ["get-post-comments", postId, orderBy],
      });
    },
  });

  return { addCommentMutation, removeCommentMutation };
};
