import { toggleProjectBookmark } from "@/actions/project-actions";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useParams } from "next/navigation";

type ToggleProjectBookmarkOptions = {
    projectId: string;
    isBookmarked: boolean;
};

export const useToggleProjectBookmark = ({ projectId, isBookmarked }: ToggleProjectBookmarkOptions) => {
    const queryClient = useQueryClient();
    const { username } = useParams<{ username: string }>();

    const mutation = useMutation({
        mutationFn: () => toggleProjectBookmark(projectId, !isBookmarked),

        onMutate: async () => {
            await queryClient.cancelQueries({ queryKey: ["get-projects", username] });
            await queryClient.cancelQueries({ queryKey: ["get-project-by-id", projectId] });

            const previousProjects = queryClient.getQueryData(["get-projects", username]);
            const previousProject = queryClient.getQueryData(["get-project-by-id", projectId]);

            const updateProject = (project: any) => {
                if (!project || project.id !== projectId) return project;
                return {
                    ...project,
                    bookmarked: !isBookmarked,
                };
            };

            queryClient.setQueryData(["get-project-by-id", projectId], (old: any) => updateProject(old));

            queryClient.setQueryData(["get-projects"], (old: any) => {
                if (!old) return old;
                return (old as any[]).map(updateProject);
            });

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
