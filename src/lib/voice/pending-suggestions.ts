import { voiceCalls } from "@/db/schema";
import db from "@/lib/db";
import { and, desc, eq, isNotNull, isNull } from "drizzle-orm";

// The person's latest onboarding call whose suggestions they haven't reviewed.
// Always filtered by the owner.
export async function findPendingOnboardingSuggestions(userId: string) {
  const [row] = await db
    .select({
      id: voiceCalls.id,
      createdAt: voiceCalls.createdAt,
      suggestions: voiceCalls.profileSuggestions,
    })
    .from(voiceCalls)
    .where(
      and(
        eq(voiceCalls.userId, userId),
        eq(voiceCalls.kind, "onboarding"),
        isNotNull(voiceCalls.profileSuggestions),
        isNull(voiceCalls.suggestionsReviewedAt)
      )
    )
    .orderBy(desc(voiceCalls.createdAt))
    .limit(1);
  return row?.suggestions ? { ...row, suggestions: row.suggestions } : null;
}
