import { updateProfile } from '@/actions/profile-actions';
import { education, experience, projects, storyElements } from '@/db/schema';
import db from '@/lib/db';
import {
    addEducationSchema,
    addExperienceSchema,
    addProjectSchema,
    addStoryElementSchema,
    deleteEducationSchema,
    deleteExperienceSchema,
    deleteProjectSchema,
    updateBasicInfoSchema,
    updateEducationSchema,
    updateExperienceSchema,
    updateProjectSchema,
    addGalleryItemSchema,
    deleteGalleryItemSchema,
    ChatMessage,
    TUploadFilesResponse
} from '@/lib/types';
import { addGalleryItem, removeGalleryItem } from '@/actions/gallery-actions';
import { uploadBase64ToS3 } from '@/lib/s3';
import { FileUIPart, InferUITools, ToolSet, tool } from 'ai';
import { and, eq } from 'drizzle-orm';
import { revalidatePageOnClient } from '@/lib/server-actions';


// Profile Tools Factory
export const getProfileTools = (profileId: string | undefined, username: string, messages: ChatMessage[]) => {
    const profileTools = {
        updateBasicInfo: tool({
            description: 'Update the user basic profile information like bio, location, mission, etc.',
            inputSchema: updateBasicInfoSchema,
            execute: async (args) => {
                await updateProfile(args);
                await revalidatePageOnClient(`/${username}`);
                return { success: true };
            },
        }),
        addExperience: tool({
            description: 'Add a work experience or internship to the user profile.',
            inputSchema: addExperienceSchema,
            execute: async (args) => {
                if (!profileId) return { success: false, error: 'No profile found' };
                const [newExperience] = await db.insert(experience).values({
                    profileId,
                    ...args,
                    startDate: args.startDate ? new Date(args.startDate) : null,
                    endDate: args.endDate ? new Date(args.endDate) : null,
                }).returning();
                await revalidatePageOnClient(`/${username}`);
                return { success: true, output: newExperience };
            },
        }),
        updateExperience: tool({
            description: 'Update an existing work experience entry.',
            inputSchema: updateExperienceSchema,
            execute: async (args) => {
                if (!profileId) return { success: false, error: 'No profile found' };
                const { id, ...data } = args;
                console.log("Updateing Work XP:", args)

                const [updatedExperience] = await db.update(experience)
                    .set({
                        ...data,
                        startDate: data.startDate ? new Date(data.startDate) : undefined,
                        endDate: data.endDate ? new Date(data.endDate) : undefined,
                    })
                    .where(and(eq(experience.id, id), eq(experience.profileId, profileId))).returning();

                if (!updatedExperience) return { success: false, error: 'Experience not found' };

                const output = Object.keys(args).reduce((acc, key) => {
                    acc[key] = updatedExperience[key as keyof typeof updatedExperience];
                    return acc;
                }, {} as any);
                console.log({ output })

                await revalidatePageOnClient(`/${username}`);
                return { success: true, output };
            },
        }),
        deleteExperience: tool({
            description: 'Delete a work experience entry. Should only be called when the user explicitly asks to remove an experience.',
            inputSchema: deleteExperienceSchema,
            needsApproval: true,
            execute: async ({ id, title, company }) => {
                if (!profileId) return { success: false, error: 'No profile found' };
                console.log(`[TOOLS] Deleting experience: ${title} at ${company} (ID: ${id})`);
                await db.delete(experience)
                    .where(and(eq(experience.id, id), eq(experience.profileId, profileId)));
                await revalidatePageOnClient(`/${username}`);
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
                await revalidatePageOnClient(`/${username}`);
                return { success: true };
            },
        }),
        updateEducation: tool({
            description: 'Update an existing education entry.',
            inputSchema: updateEducationSchema,
            execute: async (args) => {
                if (!profileId) return { success: false, error: 'No profile found' };
                const { id, ...data } = args;
                await db.update(education)
                    .set({
                        ...data,
                        startDate: data.startDate ? new Date(data.startDate) : undefined,
                        endDate: data.endDate ? new Date(data.endDate) : undefined,
                    })
                    .where(and(eq(education.id, id), eq(education.profileId, profileId)));
                await revalidatePageOnClient(`/${username}`);
                return { success: true };
            },
        }),
        deleteEducation: tool({
            description: 'Delete an education entry. Should only be called when the user explicitly asks to remove it.',
            inputSchema: deleteEducationSchema,
            needsApproval: true,
            execute: async ({ id, school }) => {
                if (!profileId) return { success: false, error: 'No profile found' };
                console.log(`[TOOLS] Deleting school: ${school} (ID: ${id})`);
                const deleted = await db.delete(education)
                    .where(and(eq(education.id, id), eq(education.profileId, profileId))).returning();


                if (deleted?.length === 0) return { success: false, error: 'No education found' };

                await revalidatePageOnClient(`/${username}`);

                return { success: true, error: null };
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
                await revalidatePageOnClient(`/${username}`);
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
                    startDate: args.startDate ? new Date(args.startDate) : null,
                    endDate: args.endDate ? new Date(args.endDate) : null,
                });
                await revalidatePageOnClient(`/${username}`);
                return { success: true };
            },
        }),
        updateProject: tool({
            description: 'Update an existing project.',
            inputSchema: updateProjectSchema,
            execute: async (args) => {
                if (!profileId) return { success: false, error: 'No profile found' };
                const { id, ...data } = args;
                await db.update(projects)
                    .set({
                        ...data,
                        startDate: data.startDate ? new Date(data.startDate) : undefined,
                        endDate: data.endDate ? new Date(data.endDate) : undefined,
                    })
                    .where(and(eq(projects.id, id), eq(projects.profileId, profileId)));
                await revalidatePageOnClient(`/${username}`);
                return { success: true };
            },
        }),
        deleteProject: tool({
            description: 'Delete a project. Should only be called when the user explicitly asks to remove it.',
            inputSchema: deleteProjectSchema,
            needsApproval: true,
            execute: async ({ id, name }) => {
                if (!profileId) return { success: false, error: 'No profile found' };
                console.log(`[TOOLS] Deleting project: ${name} (ID: ${id})`);
                await db.delete(projects)
                    .where(and(eq(projects.id, id), eq(projects.profileId, profileId)));

                await revalidatePageOnClient(`/${username}`);
                return { success: true };
            },
        }),
        addGalleryItem: tool({
            description: 'Add media items (images or videos) from the user message attachments to the user gallery.',
            inputSchema: addGalleryItemSchema,
            execute: async (args) => {
                const lastMessage = messages.at(-1);
                const attachments: FileUIPart[] = lastMessage?.parts.filter(p => p.type === 'file') || [];

                if (!attachments || attachments.length === 0) return { success: false, error: 'No attachments found', output: [] };
                const results = [];

                for (const attachment of attachments) {

                    if (attachment && attachment.url) {
                        try {
                            let finalUrl = attachment.url;
                            let finalWidth = 500;
                            let finalHeight = 500;

                            // If it's a data URL, upload to S3
                            if (attachment.url.startsWith('data:')) {
                                const uploadResult = await uploadBase64ToS3(attachment.url, {
                                    folder: 'gallery',
                                    contentType: attachment.mediaType
                                });
                                finalUrl = uploadResult.url;
                                finalWidth = uploadResult.width || 500;
                                finalHeight = uploadResult.height || 500;
                            }

                            const payload: TUploadFilesResponse = {
                                url: finalUrl,
                                width: finalWidth,
                                height: finalHeight,
                                type: attachment.mediaType?.startsWith('video') ? 'video' : 'image',
                            };
                            await addGalleryItem(payload);
                            results.push({ id: attachments.indexOf(attachment), data: payload, success: true, error: null });
                        } catch (error) {
                            console.error(`Failed to process attachment ${attachments.indexOf(attachment)}:`, error);
                            results.push({ id: attachments.indexOf(attachment), data: null, success: false, error: 'Upload failed' });
                        }
                    } else {
                        results.push({ id: attachments.indexOf(attachment), data: null, success: false, error: 'Attachment not found' });
                    }
                }

                await revalidatePageOnClient(`/${username}`);
                return { success: true, output: results, error: null };
            },
        }),
        deleteGalleryItem: tool({
            description: 'Delete one or more media items from the user gallery.',
            inputSchema: deleteGalleryItemSchema,
            needsApproval: true,
            execute: async ({ ids }) => {
                for (const id of ids) {
                    await removeGalleryItem(id);
                }
                await revalidatePageOnClient(`/${username}`);
                return { success: true, count: ids.length };
            },
        }),



    } satisfies ToolSet;

    return profileTools;
};

// Custom ProfileTools type
export type ProfileTools = InferUITools<ReturnType<typeof getProfileTools>>;
