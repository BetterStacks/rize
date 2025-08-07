import { NextRequest, NextResponse } from "next/server";
import { seedProfiles } from "@/scripts/seed-profiles";

export async function POST(request: NextRequest) {
  try {
    // Only allow in development
    if (process.env.NODE_ENV !== 'development') {
      return NextResponse.json(
        { error: "Seeding only allowed in development" }, 
        { status: 403 }
      );
    }

    const { count = 50 } = await request.json();

    if (count > 200) {
      return NextResponse.json(
        { error: "Maximum 200 profiles allowed per request" }, 
        { status: 400 }
      );
    }

    console.log(`Starting to seed ${count} profiles...`);
    const result = await seedProfiles(count);

    if (result.success) {
      return NextResponse.json({
        success: true,
        message: `Successfully seeded ${count} profiles`,
        count: result.count
      });
    } else {
      return NextResponse.json(
        { error: "Failed to seed profiles", details: result.error }, 
        { status: 500 }
      );
    }

  } catch (error) {
    console.error("Seed API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}