import { Repo } from "@/types/repo";

export default function SelectedRepos({ repos }: { repos: Repo[] }) {
  return (
    <div>
      <h2 className="font-bold mb-4">Selected Repositories</h2>

      <div className="space-y-2">
        {repos.map((repo) => (
          <div key={repo.name} className="p-3 border rounded">
            {repo.name}
          </div>
        ))}
      </div>
    </div>
  );
}
