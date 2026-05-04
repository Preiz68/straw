"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import GitHubInput from "@/components/GithubInput";

export default function Home() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (username: string) => {
    setLoading(true);

    try {
      const reposRes = await fetch("/api/github", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username }),
      });
      const repos = await reposRes.json();

      const rankRes = await fetch("/api/rank", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ repos: repos.repos }),
      });
      const ranked = await rankRes.json();

      localStorage.setItem("repos", JSON.stringify(ranked.ranked));

      router.push("/result");
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center h-screen">
      <GitHubInput onSubmit={handleSubmit} loading={loading} />
    </div>
  );
}
