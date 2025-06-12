import { searchProfiles } from "@/actions/profile-actions";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get("query") || "";

  try {
    const results = await searchProfiles(query);
    console.log({ results });
    return Response.json(results, { status: 200 });
  } catch (error) {
    console.error("Error searching profiles:", error);
    return Response.json(
      { error: "Failed to search profiles" },
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}
