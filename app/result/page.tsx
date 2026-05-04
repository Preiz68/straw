"use client";

import { useEffect, useState } from "react";
import RepoList from "@/components/RepoList";
import SelectedRepos from "@/components/SelectedRepos";
import { processRepos } from "@/lib/repos/processRepos";
import { Repo } from "@/types/repo";

export default function ResultsPage() {
  const [repos, setRepos] = useState([]);
  const [selected, setSelected] = useState<Repo[]>([]);

  useEffect(() => {
    const data = JSON.parse(localStorage.getItem("repos") || "[]");

    setRepos(data);
    setSelected(data.slice(0, 5)); // default top 5
  }, []);

  const toggleRepo = (repo: Repo) => {
    const exists = selected.find((r: Repo) => r.name === repo.name);

    if (exists) {
      setSelected(selected.filter((r: Repo) => r.name !== repo.name));
    } else {
      setSelected([...selected, repo]);
    }
  };

  const handleProcess = async () => {
    await processRepos(selected);
    alert("Processing started!");
  };

  return (
    <div className="p-10 grid grid-cols-2 gap-10">
      {/* LEFT: ALL REPOS */}
      <RepoList repos={repos} selected={selected} toggleRepo={toggleRepo} />

      {/* RIGHT: SELECTED */}
      <div className="flex flex-col gap-4">
        <SelectedRepos repos={selected} />

        <button
          className="bg-green-600 text-white p-3 rounded"
          onClick={handleProcess}
        >
          Process Selected Repos
        </button>
      </div>
    </div>
  );
}
