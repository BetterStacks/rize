import { voiceCalls } from "@/db/schema";
import { getServerSession } from "@/lib/auth";
import db from "@/lib/db";
import { getRecordingUrl } from "@/lib/voice/r2";
import { and, eq } from "drizzle-orm";
import { NextResponse } from "next/server";

// Redirects the owner to a short-lived signed R2 URL for their recording.
export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession();
  if (!session?.user?.id) return new NextResponse("Unauthorized", { status: 401 });

  const { id } = await params;
  const call = await db.query.voiceCalls.findFirst({
    where: and(eq(voiceCalls.id, id), eq(voiceCalls.userId, session.user.id)),
    columns: { recordingKey: true, recordingExpiresAt: true },
  });
  if (!call?.recordingKey || (call.recordingExpiresAt && call.recordingExpiresAt < new Date())) {
    return new NextResponse("Recording not available", { status: 404 });
  }

  return NextResponse.redirect(await getRecordingUrl(call.recordingKey, 600));
}
