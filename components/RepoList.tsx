import { Repo } from "@/types/repo";

export default function RepoList({
  repos,
  selected,
  toggleRepo,
}: {
  repos: Repo[];
  selected: Repo[];
  toggleRepo: (repo: Repo) => void;
}) {
  return (
    <div>
      <h2 className="font-bold mb-4">All Repositories</h2>

      <div className="space-y-2">
        {repos.map((repo) => {
          const isSelected = selected.find((r) => r.name === repo.name);

          return (
            <div
              key={repo.name}
              className={`p-3 border rounded flex justify-between ${
                isSelected ? "bg-gray-200" : ""
              }`}
            >
              <div>
                <p className="font-medium">{repo.name}</p>
                <p className="text-sm text-gray-500">
                  ⭐ {repo.stars} • {repo.language}
                </p>
              </div>

              <button onClick={() => toggleRepo(repo)}>
                {isSelected ? "Remove" : "Add"}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
