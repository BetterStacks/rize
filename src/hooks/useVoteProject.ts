import { voteProject } from "@/actions/project-actions";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useParams } from "next/navigation";

type VoteProjectOptions = {
    projectId: string;
    userVote: number | null; // current vote state (1, -1, or null)
};

export const useVoteProject = ({ projectId, userVote }: VoteProjectOptions) => {
    const queryClient = useQueryClient();
    const { username } = useParams<{ username: string }>();

    const mutation = useMutation({
        mutationFn: (value: number) => {
            const newValue = value === userVote ? 0 : value;
            return voteProject(projectId, newValue);
        },

        onMutate: async (newValue: number) => {
            await queryClient.cancelQueries({ queryKey: ["get-projects", username] });
            await queryClient.cancelQueries({ queryKey: ["get-project-by-id", projectId] });

            const previousProjects = queryClient.getQueryData(["get-projects", username]);
            const previousProject = queryClient.getQueryData(["get-project-by-id", projectId]);

            const voteValue = newValue === userVote ? 0 : newValue;

            const updateProject = (project: any) => {
                if (!project || project.id !== projectId) return project;

                let upDelta = 0;
                let downDelta = 0;

                if (userVote === 1) upDelta -= 1;
                if (userVote === -1) downDelta -= 1;

                if (voteValue === 1) upDelta += 1;
                if (voteValue === -1) downDelta += 1;

                return {
                    ...project,
                    userVote: voteValue === 0 ? null : voteValue,
                    upvoteCount: Number(project.upvoteCount || 0) + upDelta,
                    downvoteCount: Number(project.downvoteCount || 0) + downDelta,
                };
            };

            queryClient.setQueryData(["get-projects", username], (old: any) => {
                if (!old) return old;
                return (old as any[]).map(updateProject);
            });

            queryClient.setQueryData(["get-project-by-id", projectId], (old: any) => updateProject(old));

            return { previousProject, previousProjects };
        },

        onError: (_err, _vars, context) => {
            if (context?.previousProject) {
                queryClient.setQueryData(["get-project-by-id", projectId], context.previousProject);
            }
            if (context?.previousProjects) {
                queryClient.setQueryData(["get-projects", username], context.previousProjects);
            }
        },

        onSettled: () => {
            queryClient.invalidateQueries({ queryKey: ["get-projects", username] });
            queryClient.invalidateQueries({ queryKey: ["get-project-by-id", projectId] });
        },
    });

    return mutation;
};
