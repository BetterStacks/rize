import { z } from 'zod';
import { InferUITools, ToolSet, tool } from 'ai';
import { updateProfile } from '@/actions/profile-actions';
import db from '@/lib/db';
import { experience, education, storyElements, projects } from '@/db/schema';
import {
    updateBasicInfoSchema,
    addExperienceSchema,
    addEducationSchema,
    addStoryElementSchema,
    addProjectSchema
} from '@/lib/types';

// Profile Tools Factory
export const getProfileTools = (profileId: string | undefined) => {
    const profileTools = {
        updateBasicInfo: tool({
            description: 'Update the user basic profile information like bio, location, mission, etc.',
            inputSchema: updateBasicInfoSchema,
            execute: async (args) => {
                await updateProfile(args);
                return { success: true };
            },
        }),
        addExperience: tool({
            description: 'Add a work experience or internship to the user profile.',
            inputSchema: addExperienceSchema,
            execute: async (args) => {
                if (!profileId) return { success: false, error: 'No profile found' };

                await db.insert(experience).values({
                    profileId,
                    ...args,
                    startDate: args.startDate ? new Date(args.startDate) : null,
                    endDate: args.endDate ? new Date(args.endDate) : null,
                });
                return { success: true };
            },
        }),
        addEducation: tool({
            description: 'Add education information to the user profile.',
            inputSchema: addEducationSchema,
            execute: async (args) => {
                if (!profileId) return { success: false, error: 'No profile found' };

                await db.insert(education).values({
                    profileId,
                    ...args,
                    startDate: args.startDate ? new Date(args.startDate) : null,
                    endDate: args.endDate ? new Date(args.endDate) : null,
                });
                return { success: true };
            },
        }),
        addStoryElement: tool({
            description: 'Add a story element like a skill, milestone, or dream.',
            inputSchema: addStoryElementSchema,
            execute: async (args) => {
                if (!profileId) return { success: false, error: 'No profile found' };

                await db.insert(storyElements).values({
                    profileId,
                    ...args,
                    order: 0,
                });
                return { success: true };
            },
        }),
        addProject: tool({
            description: 'Add a project to the user profile.',
            inputSchema: addProjectSchema,
            execute: async (args) => {
                if (!profileId) return { success: false, error: 'No profile found' };

                await db.insert(projects).values({
                    profileId,
                    ...args,
                });
                return { success: true };
            },
        }),
    } satisfies ToolSet;

    return profileTools;
};

// Custom ProfileTools type
export type ProfileTools = InferUITools<ReturnType<typeof getProfileTools>>;
