import { fetchAllProjectSummaries } from "@/lib/projects/fetchProjectSummaries";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return Response.json({ error: "Missing userId" }, { status: 400 });
    }

    const projects = await fetchAllProjectSummaries(userId);

    // Return a slimmed version for the UI
    const lite = projects.map((p) => ({
      id: p.id,
      name: p.summary.name,
      description: p.summary.description,
      techStack: p.summary.techStack,
      complexity: p.summary.complexity,
      roleRelevance: p.summary.roleRelevance,
    }));

    return Response.json(lite);
  } catch (err: any) {
    console.error("PROJECTS API ERROR:", err);
    return Response.json({ error: err.message }, { status: 500 });
  }
}
