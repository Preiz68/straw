"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/app/context/AuthContext";
import { profileService } from "@/lib/profile/profileService";

export default function GithubStep() {
  const router = useRouter();
  const { user } = useAuth();
  const [username, setUsername] = useState("");
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<"idle" | "fetching" | "ranking">("idle");
  const [error, setError] = useState("");

  useEffect(() => {
    // If user logged in with GitHub, try to pre-fill the username
    const githubData = user?.providerData.find(
      (p) => p.providerId === "github.com",
    );
    if (githubData) {
      // In a real app, you'd get the actual username from the profile or token
      // For this demo/impl, let's assume it might be in the displayName or we ask for it
      // if (user.displayName) setUsername(user.displayName);
    }
  }, [user]);

  const handleConnect = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !user) return;

    setLoading(true);
    setStatus("fetching");
    setError("");

    try {
      // 1. Fetch Repos
      const reposRes = await fetch("/api/github", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username }),
      });
      if (!reposRes.ok) throw new Error("Failed to fetch GitHub repos");
      const { repos } = await reposRes.json();

      // 2. Rank Repos
      setStatus("ranking");
      const rankRes = await fetch("/api/rank", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ repos }),
      });
      if (!rankRes.ok) throw new Error("Failed to rank repos");
      const { ranked } = await rankRes.json();

      // Store in localStorage for the next step (Project Selection)
      localStorage.setItem("rankedRepos", JSON.stringify(ranked));
      localStorage.setItem("githubUsername", username);

      // Update Profile
      await profileService.updateProfile(user.uid, {
        githubUsername: username,
        currentStep: 4,
      });

      router.push("/onboarding/projects");
    } catch (err: any) {
      setError(err.message || "Connection failed");
      setStatus("idle");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-slate-900/50 backdrop-blur-xl border border-slate-800 rounded-3xl p-8 shadow-2xl">
      <div className="mb-8 text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-slate-950 rounded-full border border-slate-800 mb-6">
          <svg className="w-10 h-10 fill-white" viewBox="0 0 24 24">
            <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
          </svg>
        </div>
        <h2 className="text-2xl font-bold text-white mb-2">Connect GitHub</h2>
        <p className="text-slate-400 text-sm">
          We'll analyze your repositories to identify your technical strengths
          and best projects.
        </p>
      </div>

      <form onSubmit={handleConnect} className="space-y-6">
        <div className="space-y-2">
          <label className="text-slate-300 text-sm font-medium ml-1">
            GitHub Username
          </label>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 font-mono">
              github.com/
            </span>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="username"
              required
              className="w-full bg-slate-950 border border-slate-800 rounded-xl py-3.5 pl-26 pr-4 text-white text-sm focus:ring-2 focus:ring-indigo-600 outline-none transition-all font-mono"
            />
          </div>
        </div>

        {error && (
          <div className="p-4 bg-red-500/10 border border-red-500/50 rounded-xl text-red-400 text-sm">
            {error}
          </div>
        )}

        {loading && (
          <div className="space-y-3 py-2">
            <div className="flex justify-between text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">
              <span>
                {status === "fetching"
                  ? "Fetching repositories..."
                  : "Analyzing code quality..."}
              </span>
              <span>{status === "fetching" ? "30%" : "85%"}</span>
            </div>
            <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
              <div
                className={`h-full bg-indigo-500 transition-all duration-1000 ${status === "fetching" ? "w-[30%]" : "w-[85%]"}`}
              ></div>
            </div>
          </div>
        )}

        <div className="flex gap-4">
          <button
            type="button"
            onClick={() => router.back()}
            className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium py-4 rounded-2xl transition-all"
          >
            ← Back
          </button>
          <button
            type="submit"
            disabled={loading}
            className="flex-2 bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-900 text-white font-semibold py-4 rounded-2xl transition-all duration-200 shadow-lg shadow-indigo-900/20 flex items-center justify-center gap-2"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
            ) : (
              <>
                Analyze GitHub <span className="text-xl">→</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
