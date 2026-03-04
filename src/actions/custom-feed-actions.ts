"use server";

import { customFeeds, customFeedTopics, customFeedProfiles } from "@/db/schema";
import { requireProfile } from "@/lib/auth";
import db from "@/lib/db";
import { customFeedSchema, type CustomFeedPayload } from "@/lib/schemas/custom-feed";
import { and, eq } from "drizzle-orm";

export const createCustomFeed = async (payload: CustomFeedPayload) => {
    const profileId = await requireProfile();
    const { success, data, error } = customFeedSchema.safeParse(payload);
    if (!success) throw new Error(error.message);

    await db.transaction(async (tx) => {
        const [feed] = await tx
            .insert(customFeeds)
            .values({
                profileId,
                title: data.title,
                description: data.description ?? null,
                isPublic: data.isPublic,
            })
            .returning({ id: customFeeds.id });

        if (data.topicIds?.length) {
            await tx.insert(customFeedTopics).values(
                data.topicIds.map((topicId) => ({ feedId: feed.id, topicId }))
            );
        }
        if (data.profileIds?.length) {
            await tx.insert(customFeedProfiles).values(
                data.profileIds.map((profileId) => ({ feedId: feed.id, profileId }))
            );
        }
    });
};

export const getMyCustomFeeds = async () => {
    const profileId = await requireProfile();
    const feeds = await db.query.customFeeds.findMany({
        where: eq(customFeeds.profileId, profileId),
        with: {
            topics: { with: { topic: true } },
            profiles: { with: { profile: true } },
        },
        orderBy: (f, { desc }) => [desc(f.createdAt)],
    });
    return feeds;
};
export const deleteCustomFeed = async (id: string) => {
    const profileId = await requireProfile();
    await db.delete(customFeeds).where(and(eq(customFeeds.id, id), eq(customFeeds.profileId, profileId)));
};

export const updateCustomFeed = async (id: string, payload: CustomFeedPayload) => {
    const profileId = await requireProfile();
    const { success, data, error } = customFeedSchema.safeParse(payload);
    if (!success) throw new Error(error.message);

    await db.transaction(async (tx) => {
        await tx
            .update(customFeeds)
            .set({
                title: data.title,
                description: data.description ?? null,
                isPublic: data.isPublic,
                updatedAt: new Date(),
            })
            .where(and(eq(customFeeds.id, id), eq(customFeeds.profileId, profileId)));

        // Topics
        await tx.delete(customFeedTopics).where(eq(customFeedTopics.feedId, id));
        if (data.topicIds?.length) {
            await tx.insert(customFeedTopics).values(
                data.topicIds.map((topicId) => ({ feedId: id, topicId }))
            );
        }

        // Profiles
        await tx.delete(customFeedProfiles).where(eq(customFeedProfiles.feedId, id));
        if (data.profileIds?.length) {
            await tx.insert(customFeedProfiles).values(
                data.profileIds.map((profileId) => ({ feedId: id, profileId }))
            );
        }
    });
};
