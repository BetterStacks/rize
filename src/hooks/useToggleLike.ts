import { toggleLike } from "@/actions/post-actions";
import { useMutation, useQueryClient } from "@tanstack/react-query";

type ToggleLikePostOptions = {
  postId: string;
  liked: boolean; // current liked state
};

export const useToggleLikePost = ({ postId, liked }: ToggleLikePostOptions) => {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: () => toggleLike(postId, !liked),

    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: ["explore-feed"] });
      await queryClient.cancelQueries({ queryKey: ["get-post-by-id", postId] });

      const previousPosts = queryClient.getQueryData(["explore-feed"]);
      const previousPost = queryClient.getQueryData(["get-post-by-id", postId]);

      //   const delta = liked ? -1 : 1;

      queryClient.setQueryData(["get-post-by-id", postId], (old: any) => {
        if (!old) return old;
        return {
          ...old,
          liked: !liked,
          likeCount: liked
            ? Number(old.likeCount) - 1
            : Number(old.likeCount) + 1,
        };
      });

      // Optimistically update infinite posts feed
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
                    liked: !liked,
                    likeCount: liked
                      ? Number(post?.likeCount) - 1
                      : Number(post?.likeCount) + 1,
                  }
                : post
            ),
          })),
        };
      });

      return { previousPost, previousPosts };
    },

    onError: (_err, _vars, context) => {
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
      // Refetch for consistency
      queryClient.invalidateQueries({ queryKey: ["get-post-by-id", postId] });
      queryClient.invalidateQueries({ queryKey: ["explore-feed"] });
    },
  });

  return mutation;
};
