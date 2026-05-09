import { Repo } from "@/types/repo";

export function rankRepos(repos: Repo[], preferredStack: string[] = []): Repo[] {
  return repos
    .map((repo) => {
      // 1. Star Power (Logarithmic to handle high variance)
      const starScore = Math.log10(repo.stars + 1) * 15;

      // 2. Recency & Activity (Decay function)
      const lastUpdate = new Date(repo.updatedAt).getTime();
      const now = Date.now();
      const monthsSinceUpdate = (now - lastUpdate) / (1000 * 60 * 60 * 24 * 30);
      const activityScore = Math.max(0, 20 - monthsSinceUpdate * 2);

      // 3. Tech Stack Relevance
      let relevanceScore = 0;
      if (preferredStack.length > 0 && repo.language) {
        const matches = preferredStack.some(tech => 
          repo.language?.toLowerCase().includes(tech.toLowerCase()) ||
          repo.name.toLowerCase().includes(tech.toLowerCase())
        );
        if (matches) relevanceScore += 25;
      }

      // 4. Documentation & Completeness Signals
      let qualityScore = 0;
      if (repo.description && repo.description.length > 50) qualityScore += 10;
      if (repo.description && repo.description.length > 100) qualityScore += 5;
      
      // Bonus for typical project names that imply substance
      const substanceKeywords = ["dashboard", "api", "platform", "engine", "service", "app"];
      if (substanceKeywords.some(kw => repo.name.toLowerCase().includes(kw))) {
        qualityScore += 5;
      }

      const totalScore = starScore + activityScore + relevanceScore + qualityScore;

      return {
        ...repo,
        score: parseFloat(totalScore.toFixed(2)),
      };
    })
    .sort((a, b) => (b.score || 0) - (a.score || 0));
}
