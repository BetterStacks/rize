import { bulkInsertSections } from "@/actions/general-actions";
import { profile, users } from "@/db/schema";
import db from "@/lib/db";
import { v2 as cloudinary } from "cloudinary";
import { desc, eq, not } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

cloudinary.config({
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
});

type TProfilePayload = {
  displayName: string;
  username: string;
  userId: string;
};

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as TProfilePayload;
    console.log({ body });
    const [newProfile] = await db
      .insert(profile)
      .values({
        ...body,
        userId: body.userId,
      })
      .returning();

    if (!newProfile) {
      throw new Error("Profile creation failed");
    }

    // Ensure we pass a real profile id to bulkInsertSections
    await bulkInsertSections(newProfile.id);

    await db
      .update(users)
      .set({ isOnboarded: true })
      .where(eq(users.id, body.userId));

    return NextResponse.json(
      {
        data: { ...newProfile },
        error: null,
      },
      {
        status: 200,
      }
    );
    // }
  } catch (error) {
    console.error("Error signing up user:", error);
    return NextResponse.json(
      { data: null, error: (error as Error)?.message || "Failed to Signup " }
      // { status: 500 }
    );
  }
}

const PAGE_SIZE = 10;

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const pageParam = searchParams.get("page") || "1";
    // normalize page to a positive integer (defaults to 1)
    const parsed = parseInt(pageParam, 10);
    const page = Number.isFinite(parsed) && parsed > 0 ? parsed : 1;
    const offset = Math.max(0, (page - 1) * PAGE_SIZE);
    const profileId = searchParams.get("profileId");

    const query = await db
      .select()
      .from(profile)
      .orderBy(desc(profile.createdAt))
      .limit(PAGE_SIZE)
      .offset(offset);
    console.log(query);
    const nextPage = query.length === PAGE_SIZE ? page + 1 : null;
    return NextResponse.json(
      {
        data: { profiles: query, nextPage },
        error: null,
      },
      {
        status: 200,
      }
    );
    // }
  } catch (error) {
    console.error("Error signing up user:", error);
    return NextResponse.json(
      { data: null, error: (error as Error)?.message || "Failed to Signup " }
      // { status: 500 }
    );
  }
}
