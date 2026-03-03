import { votePost } from "@/actions/post-actions";
import { useMutation, useQueryClient } from "@tanstack/react-query";

type VotePostOptions = {
    postId: string;
    userVote: number | null; // current vote state (1, -1, or null)
};

export const useVotePost = ({ postId, userVote }: VotePostOptions) => {
    const queryClient = useQueryClient();

    const mutation = useMutation({
        mutationFn: (value: number) => {
            // If clicking the same button, remove the vote (set to 0)
            const newValue = value === userVote ? 0 : value;
            return votePost(postId, newValue);
        },

        onMutate: async (newValue: number) => {
            await queryClient.cancelQueries({ queryKey: ["explore-top-posts"] });
            await queryClient.cancelQueries({ queryKey: ["explore-feed"] });
            await queryClient.cancelQueries({ queryKey: ["get-post-by-id", postId] });

            const previousPosts = queryClient.getQueryData(["explore-top-posts"]);
            const previousExploreFeed = queryClient.getQueryData(["explore-feed"]);
            const previousPost = queryClient.getQueryData(["get-post-by-id", postId]);

            // Handle the logic for optimistic update
            const voteValue = newValue === userVote ? 0 : newValue;

            const updatePost = (post: any) => {
                if (!post || post.id !== postId) return post;

                let upDelta = 0;
                let downDelta = 0;

                // Remove old vote
                if (userVote === 1) upDelta -= 1;
                if (userVote === -1) downDelta -= 1;

                // Apply new vote
                if (voteValue === 1) upDelta += 1;
                if (voteValue === -1) downDelta += 1;

                return {
                    ...post,
                    userVote: voteValue === 0 ? null : voteValue,
                    upvoteCount: Number(post.upvoteCount || 0) + upDelta,
                    downvoteCount: Number(post.downvoteCount || 0) + downDelta,
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
