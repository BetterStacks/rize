import axios from "axios";
import { NextRequest, NextResponse } from "next/server";
import urlMetadata from "url-metadata";

export async function GET(req: NextRequest) {
  try {
    const url = req.nextUrl.searchParams.get("url");
    console.log({ url });
    if (url == null) {
      return NextResponse.json({ error: "No URL found" }, { status: 404 });
    }

    const metadata = await urlMetadata(url);
    console.log({ metadata });
    return NextResponse.json({ metadata }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { error: (error as Error)?.message },
      { status: 500 }
    );
  }
}
