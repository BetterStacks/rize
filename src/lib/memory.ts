import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { embed } from "ai";
import db from "@/lib/db";
import { dailyCheckins } from "@/db/schema";
import { and, cosineDistance, desc, eq, gt, isNotNull, sql } from "drizzle-orm";

const google = createGoogleGenerativeAI({ apiKey: process.env.GEMINI_API_KEY });

export async function embedText(text: string): Promise<number[]> {
  const { embedding } = await embed({
    model: google.embedding("gemini-embedding-001"),
    value: text,
    providerOptions: { google: { outputDimensionality: 768 } },
  });
  return embedding;
}

// Finds the user's past check-in whose summary is most semantically similar
// to `query` — for when the live conversation references a specific past
// topic the rolling memory may no longer contain.
export async function recallPastTopic(userId: string, query: string, minSimilarity = 0.5) {
  const queryEmbedding = await embedText(query);
  const similarity = sql<number>`1 - (${cosineDistance(dailyCheckins.embedding, queryEmbedding)})`;

  const [match] = await db
    .select({ summary: dailyCheckins.summary, createdAt: dailyCheckins.createdAt, similarity })
    .from(dailyCheckins)
    .where(and(eq(dailyCheckins.userId, userId), isNotNull(dailyCheckins.embedding), gt(similarity, minSimilarity)))
    .orderBy(desc(similarity))
    .limit(1);

  return match ?? null;
}
