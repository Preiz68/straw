import { matchCandidate } from "@/lib/ai/matchCandidate";
import { fetchAllProjectSummaries } from "@/lib/projects/fetchProjectSummaries";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { role, rank, resume, jd, userId } = body;

    if (!role || !rank || !resume || !jd || !userId) {
      return Response.json(
        { error: "Missing required fields: role, rank, resume, jd, userId" },
        { status: 400 },
      );
    }

    // Fetch all processed project summaries from Firestore
    const projects = await fetchAllProjectSummaries(userId);

    if (projects.length < 2) {
      return Response.json(
        {
          error:
            "Not enough processed projects found. Please go to /result and process your GitHub repos first.",
        },
        { status: 422 },
      );
    }

    const result = await matchCandidate({ role, rank, resume, jd, projects });

    return Response.json(result);
  } catch (err: any) {
    console.error("MATCH API ERROR:", err);
    return Response.json(
      { error: err.message || "Matching failed" },
      { status: 500 },
    );
  }
}
