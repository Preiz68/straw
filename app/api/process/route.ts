import { ingestRepo } from "@/lib/gitingest/ingestRepo";
import { buildContext } from "@/lib/gitingest/buildContext";
import { saveProjectSummary } from "@/lib/projects/saveProjectSummary";
import { Repo } from "@/types/repo";
import { generateProjectSummary } from "@/lib/ai/generateProjectSummary";

export async function POST(req: Request) {
  const { selectedRepos, userId }: { selectedRepos: Repo[], userId: string } = await req.json();

  if (!userId) {
    return Response.json({ error: "Missing userId" }, { status: 400 });
  }

  for (const repo of selectedRepos) {
    const raw = await ingestRepo(repo.url);

    const context = buildContext(raw);

    const summary = await generateProjectSummary({
      name: repo.name,
      llmContext: context,
    });

    const repoId = repo.id || repo.name;
    await saveProjectSummary(repoId, summary, userId);
  }

  return Response.json({ success: true });
}
