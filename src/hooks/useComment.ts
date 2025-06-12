import { addComment, deleteComment } from "@/actions/post-actions";
import { TAddNewComment } from "@/lib/types";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import toast from "react-hot-toast";

type UseCommentProps = {
  postId: string;
};

export const useComment = ({ postId }: UseCommentProps) => {
  const queryClient = useQueryClient();
  const session = useSession();
  const addCommentMutation = useMutation({
    mutationFn: (payload: Omit<TAddNewComment, "postId" | "profileId">) =>
      addComment({
        ...payload,
        postId: postId,
        profileId: session?.data?.user?.profileId as string,
      }),

    onMutate: async () => {
      await queryClient.cancelQueries({
        queryKey: ["get-post-by-id", postId],
      });
      await queryClient.cancelQueries({ queryKey: ["explore-feed"] });

      const previousPosts = queryClient.getQueryData(["explore-feed"]);
      const previousPost = queryClient.getQueryData(["get-post-by-id", postId]);

      // Optimistically update post detail
      queryClient.setQueryData(["get-post-by-id", postId], (old: any) => {
        if (!old) return old;
        return {
          ...old,
          commentCount: Number(old.commentCount) + 1,
          commented: true,
        };
      });

      // Optimistically update explore feed
      queryClient.setQueryData(["explore-feed"], (old: any) => {
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

      return { previousPost, previousPosts };
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
    },

    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["get-post-by-id", postId] });
      queryClient.invalidateQueries({ queryKey: ["explore-feed"] });
    },
  });

  const removeCommentMutation = useMutation({
    mutationFn: deleteComment,

    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: ["get-post-by-id", postId] });
      await queryClient.cancelQueries({ queryKey: ["explore-feed"] });

      const previousPost = queryClient.getQueryData(["get-post-by-id", postId]);
      const previousPosts = queryClient.getQueryData(["explore-feed"]);

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

      queryClient.setQueryData(["explore-feed"], (old: any) => {
        if (!old) return old;
        return {
          ...old,
          pages: old.pages.map((page: any) => ({
            ...page,
            posts: page.posts.map((post: any) =>
              post.id === postId
                ? {
                    ...post,
                    commentCount: Math.max(Number(post.commentCount) - 1, 0),
                    commented: Math.max(Number(post.commentCount) - 1, 0) > 0,
                  }
                : post
            ),
          })),
        };
      });

      return { previousPost, previousPosts };
    },

    onError: (_err, _vars, ctx) => {
      if (ctx?.previousPost)
        queryClient.setQueryData(["get-post-by-id", postId], ctx.previousPost);
      if (ctx?.previousPosts)
        queryClient.setQueryData(["explore-feed"], ctx.previousPosts);
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["get-post-comments", postId],
      });
    },

    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["get-post-by-id", postId] });
      queryClient.invalidateQueries({ queryKey: ["explore-feed"] });
    },
  });

  return { addCommentMutation, removeCommentMutation };
};
