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
      await queryClient.cancelQueries({ queryKey: ["explore-top-posts"] });
      await queryClient.cancelQueries({ queryKey: ["explore-feed"] });
      await queryClient.cancelQueries({ queryKey: ["get-post-by-id", postId] });

      const previousPosts = queryClient.getQueryData(["explore-top-posts"]);
      const previousExploreFeed = queryClient.getQueryData(["explore-feed"]);
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

      // Optimistically update explore-top-posts which returns a flat array of posts
      queryClient.setQueryData(["explore-top-posts"], (old: any) => {
        if (!old) return old;
        // old is expected to be an array of post objects
        return (old as any[]).map((post: any) =>
          post.id === postId
            ? {
                ...post,
                liked: !liked,
                likeCount: liked
                  ? Number(post?.likeCount) - 1
                  : Number(post?.likeCount) + 1,
              }
            : post
        );
      });

      // Optimistically update explore-feed which uses useInfiniteQuery (pages -> posts)
      queryClient.setQueryData(["explore-feed"], (old: any) => {
        if (!old) return old;
        try {
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
        } catch (e) {
          // If the structure is unexpected, don't crash the optimistic update
          return old;
        }
      });

      return { previousPost, previousPosts, previousExploreFeed };
    },

    onError: (_err, _vars, context) => {
      if (context?.previousPost) {
        queryClient.setQueryData(
          ["get-post-by-id", postId],
          context.previousPost
        );
      }
      if (context?.previousPosts) {
        queryClient.setQueryData(["explore-top-posts"], context.previousPosts);
      }
      if (context?.previousExploreFeed) {
        queryClient.setQueryData(["explore-feed"], context.previousExploreFeed);
      }
    },

    onSettled: () => {
      // Refetch for consistency
      queryClient.invalidateQueries({ queryKey: ["get-post-by-id", postId] });
      queryClient.invalidateQueries({ queryKey: ["explore-top-posts"] });
      queryClient.invalidateQueries({ queryKey: ["explore-feed"] });
    },
  });

  return mutation;
};
