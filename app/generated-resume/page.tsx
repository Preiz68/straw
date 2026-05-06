"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import type { GeneratedResume } from "@/lib/ai/generateTailoredResume";

// Dynamically import the PDF viewer — must be client-only (no SSR)
const PDFPreviewClient = dynamic(
  () =>
    import("@/components/resume/PDFPreviewClient").then(
      (m) => m.PDFPreviewClient,
    ),
  {
    ssr: false,
    loading: () => (
      <div className="flex items-center justify-center h-64 text-slate-500 text-sm">
        <svg
          className="animate-spin h-5 w-5 mr-2"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8v8z"
          />
        </svg>
        Loading PDF renderer…
      </div>
    ),
  },
);

type PageState =
  | { status: "idle" }
  | { status: "generating" }
  | { status: "done"; data: GeneratedResume }
  | { status: "error"; message: string };

export default function GeneratedResumePage() {
  const router = useRouter();
  const [state, setState] = useState<PageState>({ status: "idle" });
  const [dots, setDots] = useState(".");

  // Animated dots for loading state
  useEffect(() => {
    if (state.status !== "generating") return;
    const iv = setInterval(
      () => setDots((d) => (d.length >= 3 ? "." : d + ".")),
      500,
    );
    return () => clearInterval(iv);
  }, [state.status]);

  useEffect(() => {
    // Check if already generated (back-navigation)
    const cached = localStorage.getItem("generatedResume");
    if (cached) {
      setState({ status: "done", data: JSON.parse(cached) });
      return;
    }

    const resume = JSON.parse(localStorage.getItem("parsedResume") || "null");
    const jd = JSON.parse(localStorage.getItem("parsedJD") || "null");
    const matchResult = JSON.parse(
      localStorage.getItem("matchResult") || "null",
    );
    const role = localStorage.getItem("role");
    const rank = localStorage.getItem("rank");

    if (!resume || !jd || !matchResult || !role || !rank) {
      router.replace("/");
      return;
    }

    generateResume(resume, jd, role, rank, matchResult.selectedProjectIds);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function generateResume(
    resume: any,
    jd: any,
    role: string,
    rank: string,
    selectedProjectIds: string[],
  ) {
    setState({ status: "generating" });

    try {
      const res = await fetch("/api/generate-resume", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ resume, jd, role, rank, selectedProjectIds }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Generation failed");
      }

      const data: GeneratedResume = await res.json();
      localStorage.setItem("generatedResume", JSON.stringify(data));
      setState({ status: "done", data });
    } catch (err: any) {
      setState({ status: "error", message: err.message });
    }
  }

  function handleRegenerate() {
    localStorage.removeItem("generatedResume");
    const resume = JSON.parse(localStorage.getItem("parsedResume") || "null");
    const jd = JSON.parse(localStorage.getItem("parsedJD") || "null");
    const matchResult = JSON.parse(
      localStorage.getItem("matchResult") || "null",
    );
    const role = localStorage.getItem("role") ?? "";
    const rank = localStorage.getItem("rank") ?? "";
    generateResume(
      resume,
      jd,
      role,
      rank,
      matchResult?.selectedProjectIds ?? [],
    );
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-950 via-slate-900 to-indigo-950 p-6">
      <div className="max-w-5xl mx-auto">
        {/* Nav */}
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => router.push("/match-result")}
            className="text-slate-500 hover:text-slate-300 text-sm flex items-center gap-1.5 transition-colors"
          >
            ← Back to Match Result
          </button>
          {state.status === "done" && (
            <button
              onClick={handleRegenerate}
              className="text-indigo-400 hover:text-indigo-300 text-sm font-medium transition-colors flex items-center gap-1.5"
            >
              <svg
                className="h-3.5 w-3.5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                />
              </svg>
              Regenerate
            </button>
          )}
        </div>

        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-white">
            Your Tailored Resume
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Generated by AI · Zero hallucination · ATS-optimised
          </p>
        </div>

        {/* States */}
        {state.status === "idle" && null}

        {state.status === "generating" && (
          <div className="bg-slate-900/80 backdrop-blur border border-slate-800 rounded-2xl p-16 shadow-2xl flex flex-col items-center gap-6">
            <div className="relative">
              <div className="w-20 h-20 border-4 border-slate-800 rounded-full" />
              <div className="absolute inset-0 w-20 h-20 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
            </div>
            <div className="text-center space-y-2">
              <p className="text-white font-semibold text-lg">
                Crafting your resume{dots}
              </p>
              <p className="text-slate-400 text-sm max-w-sm">
                The AI is tailoring your summary, reordering your skills, and
                writing achievement-driven project bullets based on the job
                description.
              </p>
            </div>
            <div className="w-full max-w-xs bg-slate-800 rounded-full h-1.5 overflow-hidden">
              <div className="h-full bg-indigo-600 rounded-full animate-pulse w-2/3" />
            </div>
          </div>
        )}

        {state.status === "error" && (
          <div className="bg-slate-900/80 border border-red-800/50 rounded-2xl p-10 text-center space-y-4">
            <p className="text-red-400 font-semibold text-lg">
              Generation Failed
            </p>
            <p className="text-slate-400 text-sm">{state.message}</p>
            <button
              onClick={handleRegenerate}
              className="bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-xl px-6 py-2.5 text-sm transition-all"
            >
              Try Again
            </button>
          </div>
        )}

        {state.status === "done" && (
          <div className="space-y-4">
            {/* Stats bar */}
            <div className="bg-slate-900/60 border border-slate-800 rounded-xl px-5 py-3 flex gap-6 text-sm">
              <Stat label="Projects" value={state.data.projects.length} />
              <Stat label="Skill Groups" value={state.data.skills.length} />
              <Stat
                label="Experience Entries"
                value={state.data.experience.length}
              />
              <Stat
                label="Certifications"
                value={state.data.certifications.length}
              />
            </div>

            {/* PDF viewer */}
            <PDFPreviewClient data={state.data} />
          </div>
        )}
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-indigo-400 font-bold">{value}</span>
      <span className="text-slate-500">{label}</span>
    </div>
  );
}
