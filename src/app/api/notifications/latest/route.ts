import { getServerSession } from "@/lib/auth";
import { latestNotificationAt } from "@/lib/notifications";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

// The time of the newest notification for the signed-in person, for the
// unread dot. Read-only; the browser caches it for a minute.
export async function GET() {
  const session = await getServerSession();
  const profileId = session?.user?.profileId;
  const userId = session?.user?.id;

  if (!profileId || !userId) {
    return NextResponse.json(
      { latest: null },
      { headers: { "Cache-Control": "private, no-store" } },
    );
  }

  try {
    const latest = await latestNotificationAt({ profileId, userId });
    return NextResponse.json(
      { latest: latest ? latest.toISOString() : null },
      { headers: { "Cache-Control": "private, max-age=60" } },
    );
  } catch (error) {
    console.error("Failed to load latest notification time:", error);
    return NextResponse.json(
      { latest: null },
      { status: 500, headers: { "Cache-Control": "private, no-store" } },
    );
  }
}
