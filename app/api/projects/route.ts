import { fetchAllProjectSummaries } from "@/lib/projects/fetchProjectSummaries";

export async function GET() {
  try {
    const projects = await fetchAllProjectSummaries();

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
