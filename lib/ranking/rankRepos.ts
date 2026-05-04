import { Repo } from "@/types/repo";

export function rankRepos(repos: Repo[]): Repo[] {
  return repos
    .map((repo) => {
      const starScore = Math.log(repo.stars + 1) * 2;

      const recencyScore =
        (new Date(repo.updatedAt).getTime() / Date.now()) * 5;

      const languageBoost = ["JavaScript", "TypeScript", "Python"].includes(
        repo.language!,
      )
        ? 3
        : 0;

      const descriptionBoost = repo.description ? 2 : 0;

      return {
        ...repo,
        score: starScore + recencyScore + languageBoost + descriptionBoost,
      };
    })
    .sort((a, b) => b.score - a.score);
}
