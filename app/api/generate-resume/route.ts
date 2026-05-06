import { generateTailoredResume } from "@/lib/ai/generateTailoredResume";
import { fetchAllProjectSummaries } from "@/lib/projects/fetchProjectSummaries";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { resume, jd, role, rank, selectedProjectIds } = body;

    if (!resume || !jd || !role || !rank || !selectedProjectIds?.length) {
      return Response.json(
        { error: "Missing required fields: resume, jd, role, rank, selectedProjectIds" },
        { status: 400 },
      );
    }

    // Fetch the full project summaries for the AI-selected IDs from Firestore
    const allProjects = await fetchAllProjectSummaries();
    const selectedProjects = allProjects
      .filter((p) => selectedProjectIds.includes(p.id))
      .map((p) => ({ id: p.id, name: p.summary.name, summary: p.summary }));

    if (selectedProjects.length === 0) {
      return Response.json(
        { error: "Selected projects could not be found in Firestore. Ensure repos have been processed." },
        { status: 422 },
      );
    }

    const generatedResume = await generateTailoredResume({
      resume,
      jd,
      role,
      rank,
      selectedProjects,
    });

    return Response.json(generatedResume);
  } catch (err: any) {
    console.error("GENERATE-RESUME API ERROR:", err);
    return Response.json(
      { error: err.message || "Resume generation failed" },
      { status: 500 },
    );
  }
}
