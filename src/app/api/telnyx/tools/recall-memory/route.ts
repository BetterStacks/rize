import { NextResponse } from "next/server";
import db from "@/lib/db";
import { dailyCheckins } from "@/db/schema";
import { eq } from "drizzle-orm";
import { recallPastTopic } from "@/lib/memory";

// Live "tool" the AI assistant calls mid-conversation when the user
// references a specific past topic the rolling memory may not contain.
// Telnyx sends the call_control_id in a header; we map that back to the
// user via daily_checkins.callId (set when the call was placed).
export async function POST(req: Request) {
  const callControlId = req.headers.get("x-telnyx-call-control-id");
  if (!callControlId) {
    return NextResponse.json({ found: false, error: "missing call_control_id" }, { status: 400 });
  }

  const body = await req.json().catch(() => ({}));
  const query: string | undefined = body?.query;
  if (!query) {
    return NextResponse.json({ found: false, error: "missing query" }, { status: 400 });
  }

  const [checkin] = await db
    .select({ userId: dailyCheckins.userId })
    .from(dailyCheckins)
    .where(eq(dailyCheckins.callId, callControlId))
    .limit(1);

  if (!checkin) {
    return NextResponse.json({ found: false });
  }

  const match = await recallPastTopic(checkin.userId, query);

  if (!match) {
    return NextResponse.json({ found: false });
  }

  return NextResponse.json({ found: true, summary: match.summary, date: match.createdAt });
}
