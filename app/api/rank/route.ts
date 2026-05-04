import { rankRepos } from "@/lib/ranking/rankRepos";
import { saveRepos } from "@/lib/repos/saveRepos";
import { Repo } from "@/types/repo";

export async function POST(req: Request) {
  const { repos }: { repos: Repo[] } = await req.json();

  const ranked = rankRepos(repos);

  const userId = "user123";
  await saveRepos(userId, ranked);

  return Response.json({ ranked });
}
