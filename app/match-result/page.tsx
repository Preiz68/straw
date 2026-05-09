"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/app/context/AuthContext";
import type { MatchResult } from "@/types/match";

type ProjectSummaryLite = {
  id: string;
  name: string;
  description: string;
  techStack: string[];
  complexity: "low" | "medium" | "high";
};

export default function MatchResultPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [result, setResult] = useState<MatchResult | null>(null);
  const [role, setRole] = useState("");
  const [rank, setRank] = useState("");
  const [allProjects, setAllProjects] = useState<ProjectSummaryLite[]>([]);
  const [selectedProjects, setSelectedProjects] = useState<
    ProjectSummaryLite[]
  >([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    const raw = localStorage.getItem("matchResult");
    const storedRole = localStorage.getItem("role") ?? "";
    const storedRank = localStorage.getItem("rank") ?? "";

    if (!raw) {
      router.replace("/dashboard");
      return;
    }

    const parsed: MatchResult = JSON.parse(raw);
    setResult(parsed);
    setRole(storedRole);
    setRank(storedRank);

    // Fetch the project summaries from Firestore to display details
    fetch(`/api/projects?userId=${user.uid}`)
      .then((r) => r.json())
      .then((projects: ProjectSummaryLite[]) => {
        setAllProjects(projects);
        const chosen = projects.filter((p) =>
          parsed.selectedProjectIds?.includes(p.id),
        );
        setSelectedProjects(chosen || []);
      })
      .catch(() => {
        // Projects may not load; non-fatal
      })
      .finally(() => setLoading(false));
  }, [router]);

  if (loading || !result) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-slate-400 text-sm">Loading your results...</p>
        </div>
      </div>
    );
  }

  const percentage = result.matchPercentage || 0;
  const color =
    percentage >= 75
      ? {
          ring: "#22c55e",
          text: "text-green-400",
          bg: "bg-green-950/40 border-green-800/40",
        }
      : percentage >= 50
        ? {
            ring: "#eab308",
            text: "text-yellow-400",
            bg: "bg-yellow-950/40 border-yellow-800/40",
          }
        : {
            ring: "#ef4444",
            text: "text-red-400",
            bg: "bg-red-950/40 border-red-800/40",
          };

  const circumference = 2 * Math.PI * 44;
  const offset = circumference - (percentage / 100) * circumference;

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-950 via-slate-900 to-indigo-950 p-6">
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Back */}
        <button
          onClick={() => router.push("/")}
          className="text-slate-500 hover:text-slate-300 text-sm flex items-center gap-1.5 transition-colors"
        >
          ← Start Over
        </button>

        {/* Header */}
        <div className="text-center pt-2">
          <h1 className="text-3xl font-bold text-white">Match Result</h1>
          <p className="text-slate-400 text-sm mt-1">
            {rank} · {role}
          </p>
        </div>

        {/* Score Card */}
        <div className="bg-slate-900/80 backdrop-blur border border-slate-800 rounded-2xl p-8 flex flex-col items-center gap-6 shadow-2xl">
          {/* Circular Progress */}
          <div className="relative w-36 h-36">
            <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
              <circle
                cx="50"
                cy="50"
                r="44"
                fill="none"
                stroke="rgb(30 41 59)"
                strokeWidth="8"
              />
              <circle
                cx="50"
                cy="50"
                r="44"
                fill="none"
                stroke={color.ring}
                strokeWidth="8"
                strokeLinecap="round"
                strokeDasharray={circumference}
                strokeDashoffset={offset}
                style={{ transition: "stroke-dashoffset 1s ease" }}
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className={`text-4xl font-bold ${color.text}`}>
                {percentage}%
              </span>
              <span className="text-slate-500 text-xs">match</span>
            </div>
          </div>

          {/* Reasoning */}
          <p className="text-slate-300 text-sm text-center max-w-lg leading-relaxed">
            {result.reasoning}
          </p>
        </div>

        {/* Strengths & Gaps */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <InfoCard
            title="💪 Strengths"
            items={result.strengths}
            itemClass="text-green-300"
          />
          <InfoCard
            title="📍 Gaps to Address"
            items={result.gaps}
            itemClass="text-amber-300"
          />
        </div>

        {/* Selected Projects */}
        <div className="bg-slate-900/80 backdrop-blur border border-slate-800 rounded-2xl p-6 shadow-xl">
          <h2 className="text-white font-semibold text-lg mb-4">
            🚀 AI-Selected Projects for This Role
          </h2>

          {selectedProjects.length > 0 ? (
            <div className="space-y-4">
              {selectedProjects.map((proj) => (
                <ProjectCard key={proj.id} project={proj} />
              ))}
            </div>
          ) : (
            <div className="space-y-2">
              <p className="text-slate-400 text-sm mb-3">
                Project IDs selected by AI:
              </p>
              <div className="flex flex-wrap gap-2">
                {result.selectedProjectIds?.map((id) => (
                  <div
                    key={id}
                    className="font-mono text-xs text-indigo-400 bg-indigo-950/40 border border-indigo-900/50 rounded-lg px-3 py-2"
                  >
                    {id}
                  </div>
                )) || <p className="text-slate-500 text-xs italic">No projects selected.</p>}
              </div>
              <p className="text-slate-600 text-xs mt-2">
                (Full project details could not be loaded. Ensure projects have
                been processed via the dashboard.)
              </p>
            </div>
          )}
        </div>

        {/* CTA */}
        <div className="flex gap-4">
          <button
            onClick={() => router.push("/result")}
            className="flex-1 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 font-medium rounded-xl py-3 text-sm transition-all duration-200"
          >
            Manage GitHub Projects
          </button>
          <button
            onClick={() => router.push("/generated-resume")}
            className="flex-1 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-xl py-3 text-sm transition-all duration-200 shadow-lg shadow-indigo-900/40"
          >
            Generate Tailored Resume →
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Sub-components ────────────────────────────────────────────────────────────

function InfoCard({
  title,
  items,
  itemClass,
}: {
  title: string;
  items: string[];
  itemClass: string;
}) {
  return (
    <div className="bg-slate-900/80 backdrop-blur border border-slate-800 rounded-2xl p-5 shadow-xl">
      <h3 className="text-white font-semibold text-sm mb-3">{title}</h3>
      <ul className="space-y-2">
        {items?.map((item, i) => (
          <li key={i} className={`text-sm flex gap-2 ${itemClass}`}>
            <span className="opacity-50 mt-0.5">•</span>
            <span className="text-slate-300">{item}</span>
          </li>
        )) || <li className="text-slate-500 text-xs italic">No items found.</li>}
      </ul>
    </div>
  );
}

function ProjectCard({ project }: { project: ProjectSummaryLite }) {
  const complexityColors: Record<string, string> = {
    low: "text-green-400 bg-green-950/40 border-green-800/50",
    medium: "text-yellow-400 bg-yellow-950/40 border-yellow-800/50",
    high: "text-red-400 bg-red-950/40 border-red-800/50",
  };

  return (
    <div className="bg-slate-800/60 border border-slate-700/60 rounded-xl p-5 space-y-3">
      <div className="flex items-start justify-between gap-3">
        <h3 className="text-white font-semibold">{project.name}</h3>
        <span
          className={`text-xs font-medium border rounded-full px-2.5 py-0.5 shrink-0 ${
            complexityColors[project.complexity]
          }`}
        >
          {project.complexity}
        </span>
      </div>
      <p className="text-slate-400 text-sm leading-relaxed">
        {project.description}
      </p>
      <div className="flex flex-wrap gap-1.5">
        {project.techStack.slice(0, 8).map((tech) => (
          <span
            key={tech}
            className="text-xs text-indigo-300 bg-indigo-950/50 border border-indigo-900/50 rounded-md px-2 py-0.5"
          >
            {tech}
          </span>
        ))}
        {project.techStack.length > 8 && (
          <span className="text-xs text-slate-500">
            +{project.techStack.length - 8} more
          </span>
        )}
      </div>
    </div>
  );
}
