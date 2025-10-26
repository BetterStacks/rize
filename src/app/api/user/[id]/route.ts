import { profile, users } from "@/db/schema";
import db from "@/lib/db";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const userId = (await params)?.id;

    if (!userId) {
      return NextResponse.json(
        { data: null, error: "User ID is required" },
        { status: 400 }
      );
    }
    const userData = await db
      .select({
        isOnboarded: users.isOnboarded,
        username: profile.username,
        profileId: profile.id,
        profileImage: profile.profileImage,
        displayName: profile.displayName,
        hasCompletedWalkthrough: profile.hasCompletedWalkthrough,
      })
      .from(users)
      .leftJoin(profile, eq(profile.userId, users.id))
      .where(eq(users.id, userId))
      .limit(1);

    const userInfo = userData[0] || {};
    console.log({ userInfo });
    return NextResponse.json({ data: userInfo, error: null }, { status: 200 });
  } catch (error) {
    console.error("Error Getting User:", error);
    return NextResponse.json(
      { data: null, error: (error as Error)?.message || "Failed to Get User" },
      { status: 500 }
    );
  }
}
