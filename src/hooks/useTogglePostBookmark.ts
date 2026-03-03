import { toggleBookmark } from "@/actions/post-actions";
import { useMutation, useQueryClient } from "@tanstack/react-query";

type TogglePostBookmarkOptions = {
    postId: string;
    isBookmarked: boolean;
};

export const useTogglePostBookmark = ({ postId, isBookmarked }: TogglePostBookmarkOptions) => {
    const queryClient = useQueryClient();

    const mutation = useMutation({
        mutationFn: () => toggleBookmark(postId, !isBookmarked),

        onMutate: async () => {
            await queryClient.cancelQueries({ queryKey: ["explore-top-posts"] });
            await queryClient.cancelQueries({ queryKey: ["explore-feed"] });
            await queryClient.cancelQueries({ queryKey: ["get-post-by-id", postId] });

            const previousPosts = queryClient.getQueryData(["explore-top-posts"]);
            const previousExploreFeed = queryClient.getQueryData(["explore-feed"]);
            const previousPost = queryClient.getQueryData(["get-post-by-id", postId]);

            const updatePost = (post: any) => {
                if (!post || post.id !== postId) return post;
                return {
                    ...post,
                    bookmarked: !isBookmarked,
                };
            };

            queryClient.setQueryData(["get-post-by-id", postId], (old: any) => updatePost(old));

            queryClient.setQueriesData({ queryKey: ["explore-top-posts"] }, (old: any) => {
                if (!old) return old;
                return Array.isArray(old) ? old.map(updatePost) : old;
            });

            queryClient.setQueriesData({ queryKey: ["explore-feed"] }, (old: any) => {
                if (!old || !old.pages) return old;
                return {
                    ...old,
                    pages: old.pages.map((page: any) => ({
                        ...page,
                        posts: page.posts.map(updatePost),
                    })),
                };
            });

            return { previousPost, previousPosts, previousExploreFeed };
        },

        onError: (_err, _vars, context) => {
            if (context?.previousPost) {
                queryClient.setQueryData(["get-post-by-id", postId], context.previousPost);
            }
            if (context?.previousPosts) {
                queryClient.setQueryData(["explore-top-posts"], context.previousPosts);
            }
            if (context?.previousExploreFeed) {
                queryClient.setQueryData(["explore-feed"], context.previousExploreFeed);
            }
        },

        onSettled: () => {
            queryClient.invalidateQueries({ queryKey: ["get-post-by-id", postId] });
            queryClient.invalidateQueries({ queryKey: ["explore-top-posts"] });
            queryClient.invalidateQueries({ queryKey: ["explore-feed"] });
        },
    });

    return mutation;
};
