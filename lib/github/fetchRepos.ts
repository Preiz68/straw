import { Octokit } from "octokit";
import { Repo } from "@/types/repo";

export async function fetchRepos(username: string): Promise<Repo[]> {
  const octokit = new Octokit();

  const { data } = await octokit.request("GET /users/{username}/repos", {
    username,
    per_page: 100,
  });

  return data.map((repo: any) => ({
    id: repo.id.toString(),
    name: repo.name,
    url: repo.html_url,
    stars: repo.stargazers_count,
    language: repo.language,
    updatedAt: repo.updated_at,
    description: repo.description,
  }));
}
