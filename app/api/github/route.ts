import { fetchRepos } from "@/lib/github/fetchRepos";

export async function POST(req: Request) {
  const { username }: { username: string } = await req.json();

  const repos = await fetchRepos(username);

  return Response.json({ repos });
}
