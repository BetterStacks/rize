import { z } from "zod";

export const customFeedSchema = z
    .object({
        title: z.string().min(1, "Title is required").max(100),
        description: z.string().max(500).optional(),
        isPublic: z.boolean().default(false),
        topicIds: z.array(z.string().uuid()).optional(),
        profileIds: z.array(z.string().uuid()).optional(),
    })
    .refine(
        (d) => (d.topicIds?.length ?? 0) > 0 || (d.profileIds?.length ?? 0) > 0,
        { message: "Select at least one topic or profile" }
    );

export type CustomFeedPayload = z.infer<typeof customFeedSchema>;
