import { isUsernameAvailable } from "@/actions/profile-actions";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ username: string }> }
) {
  try {
    const { username } = await params;
    if (!username) {
      return NextResponse.json(
        { data: null, error: "Username is required" },
        { status: 400 }
      );
    }
    const exists = await isUsernameAvailable(username);
    console.log(exists);
    return NextResponse.json(
      { data: exists?.available, error: null },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching user profile:", error);
    return NextResponse.json(
      {
        data: null,
        error: (error as Error)?.message || "Internal Server Error",
      },
      { status: 500 }
    );
  }
}
