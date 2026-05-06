"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ROLES, RANKS } from "@/types/match";

type Step = 1 | 2 | 3;

export default function GeneratePage() {
  const router = useRouter();

  // Step 1 — GitHub + Role + Rank
  const [username, setUsername] = useState("");
  const [role, setRole] = useState<string>("");
  const [rank, setRank] = useState<string>("");
  const [reposLoading, setReposLoading] = useState(false);

  // Step 2 — Job Description
  const [jdText, setJdText] = useState("");
  const [jdLoading, setJdLoading] = useState(false);
  const [parsedJD, setParsedJD] = useState<any>(null);

  // Step 3 — Resume Upload
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [parsedResume, setParsedResume] = useState<any>(null);
  const [resumeLoading, setResumeLoading] = useState(false);

  // Match
  const [matchLoading, setMatchLoading] = useState(false);
  const [error, setError] = useState("");

  const [step, setStep] = useState<Step>(1);

  // ── Step 1: Fetch & Rank GitHub repos ──────────────────────────────────────
  const handleStep1 = async () => {
    if (!username.trim() || !role || !rank) {
      setError("Please fill in all fields.");
      return;
    }
    setError("");
    setReposLoading(true);
    try {
      const reposRes = await fetch("/api/github", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username }),
      });
      const { repos } = await reposRes.json();

      const rankRes = await fetch("/api/rank", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ repos }),
      });
      const { ranked } = await rankRes.json();

      localStorage.setItem("repos", JSON.stringify(ranked));
      localStorage.setItem("githubUsername", username);
      localStorage.setItem("role", role);
      localStorage.setItem("rank", rank);

      setStep(2);
    } catch (e: any) {
      setError(e.message || "Failed to fetch GitHub repos.");
    } finally {
      setReposLoading(false);
    }
  };

  // ── Step 2: Parse Job Description ──────────────────────────────────────────
  const handleStep2 = async () => {
    if (!jdText.trim()) {
      setError("Please paste a job description.");
      return;
    }
    setError("");
    setJdLoading(true);
    try {
      const res = await fetch("/api/parse-jd", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jdText }),
      });
      const data = await res.json();
      setParsedJD(data);
      localStorage.setItem("parsedJD", JSON.stringify(data));
      setStep(3);
    } catch (e: any) {
      setError(e.message || "Failed to parse job description.");
    } finally {
      setJdLoading(false);
    }
  };

  // ── Step 3: Upload & Parse Resume ──────────────────────────────────────────
  const handleStep3 = async () => {
    if (!resumeFile) {
      setError("Please select a resume file.");
      return;
    }
    setError("");
    setResumeLoading(true);
    try {
      const formData = new FormData();
      formData.append("file", resumeFile);

      const res = await fetch("/api/parse-resume", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) throw new Error("Failed to parse resume");

      const data = await res.json();
      setParsedResume(data);
      localStorage.setItem("parsedResume", JSON.stringify(data));

      // Immediately run the AI match
      await runMatch(data);
    } catch (e: any) {
      setError(e.message || "Failed to parse resume.");
    } finally {
      setResumeLoading(false);
    }
  };

  // ── Run Match ───────────────────────────────────────────────────────────────
  const runMatch = async (resume: any) => {
    const jd =
      parsedJD ?? JSON.parse(localStorage.getItem("parsedJD") || "null");
    const storedRole = role || localStorage.getItem("role") || "";
    const storedRank = rank || localStorage.getItem("rank") || "";

    if (!jd) {
      setError("Job description not found. Please go back to step 2.");
      return;
    }

    setMatchLoading(true);
    setError("");
    try {
      const res = await fetch("/api/match", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          role: storedRole,
          rank: storedRank,
          resume,
          jd,
        }),
      });

      if (!res.ok) {
        const { error: msg } = await res.json();
        throw new Error(msg);
      }

      const matchResult = await res.json();
      localStorage.setItem("matchResult", JSON.stringify(matchResult));

      router.push("/match-result");
    } catch (e: any) {
      setError(e.message || "Matching failed.");
    } finally {
      setMatchLoading(false);
    }
  };

  const isLoading = reposLoading || jdLoading || resumeLoading || matchLoading;

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-950 via-slate-900 to-indigo-950 flex items-center justify-center p-6">
      <div className="w-full max-w-2xl">
        {/* Header */}
        <div className="mb-10 text-center">
          <h1 className="text-4xl font-bold text-white mb-2 tracking-tight">
            Resume <span className="text-indigo-400">AI</span>
          </h1>
          <p className="text-slate-400 text-sm">
            Match your profile to any job in seconds.
          </p>
        </div>

        {/* Step Indicators */}
        <div className="flex items-center gap-3 mb-8 justify-center">
          {([1, 2, 3] as Step[]).map((s) => (
            <div key={s} className="flex items-center gap-3">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition-all duration-300 ${
                  s < step
                    ? "bg-indigo-500 text-white"
                    : s === step
                      ? "bg-indigo-600 text-white ring-2 ring-indigo-400 ring-offset-2 ring-offset-slate-900"
                      : "bg-slate-800 text-slate-500"
                }`}
              >
                {s < step ? "✓" : s}
              </div>
              {s < 3 && (
                <div
                  className={`h-px w-12 transition-all duration-500 ${
                    s < step ? "bg-indigo-500" : "bg-slate-700"
                  }`}
                />
              )}
            </div>
          ))}
        </div>

        {/* Card */}
        <div className="bg-slate-900/80 backdrop-blur border border-slate-800 rounded-2xl p-8 shadow-2xl">
          {/* ── Step 1 ── */}
          {step === 1 && (
            <div className="space-y-6">
              <StepHeader
                step={1}
                title="Your Profile"
                subtitle="Tell us who you are and where you work."
              />

              <Field label="GitHub Username">
                <input
                  id="github-username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="e.g. Preiz68"
                  className="input-field"
                />
              </Field>

              <Field label="Target Role">
                <select
                  id="target-role"
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="input-field"
                >
                  <option value="">Select a role...</option>
                  {ROLES.map((r) => (
                    <option key={r} value={r}>
                      {r}
                    </option>
                  ))}
                </select>
              </Field>

              <Field label="Target Rank / Level">
                <select
                  id="target-rank"
                  value={rank}
                  onChange={(e) => setRank(e.target.value)}
                  className="input-field"
                >
                  <option value="">Select a level...</option>
                  {RANKS.map((r) => (
                    <option key={r} value={r}>
                      {r}
                    </option>
                  ))}
                </select>
              </Field>

              <ActionButton
                onClick={handleStep1}
                loading={reposLoading}
                label="Fetch GitHub Repos →"
                loadingLabel="Fetching repos..."
              />
            </div>
          )}

          {/* ── Step 2 ── */}
          {step === 2 && (
            <div className="space-y-6">
              <StepHeader
                step={2}
                title="Job Description"
                subtitle="Paste the full job posting you want to apply for."
              />

              <Field label="Paste Job Description">
                <textarea
                  id="jd-text"
                  value={jdText}
                  onChange={(e) => setJdText(e.target.value)}
                  placeholder="Paste the complete job description here..."
                  rows={10}
                  className="input-field resize-none font-mono text-xs leading-relaxed"
                />
              </Field>

              <div className="flex gap-3">
                <button
                  onClick={() => setStep(1)}
                  className="btn-secondary flex-1"
                >
                  ← Back
                </button>
                <ActionButton
                  onClick={handleStep2}
                  loading={jdLoading}
                  label="Parse Job Description →"
                  loadingLabel="Parsing..."
                  className="flex-1"
                />
              </div>
            </div>
          )}

          {/* ── Step 3 ── */}
          {step === 3 && (
            <div className="space-y-6">
              <StepHeader
                step={3}
                title="Upload Resume"
                subtitle="Upload your PDF resume for AI analysis."
              />

              {parsedJD && (
                <div className="bg-indigo-950/60 border border-indigo-800/50 rounded-xl p-4 text-sm space-y-1">
                  <p className="text-indigo-300 font-medium">JD Parsed ✓</p>
                  <p className="text-slate-400">
                    <span className="text-slate-300">{parsedJD.role}</span> at{" "}
                    {parsedJD.company} · {parsedJD.experienceLevel}
                  </p>
                </div>
              )}

              <Field label="Resume (PDF)">
                <label
                  htmlFor="resume-upload"
                  className="flex flex-col items-center justify-center border-2 border-dashed border-slate-700 rounded-xl p-8 cursor-pointer hover:border-indigo-600 hover:bg-indigo-950/20 transition-all duration-200 group"
                >
                  <div className="text-4xl mb-3 group-hover:scale-110 transition-transform duration-200">
                    📄
                  </div>
                  <p className="text-slate-300 font-medium text-sm">
                    {resumeFile ? resumeFile.name : "Click to upload PDF"}
                  </p>
                  <p className="text-slate-600 text-xs mt-1">PDF files only</p>
                  <input
                    id="resume-upload"
                    type="file"
                    accept=".pdf"
                    className="hidden"
                    onChange={(e) => setResumeFile(e.target.files?.[0] ?? null)}
                  />
                </label>
              </Field>

              <div className="flex gap-3">
                <button
                  onClick={() => setStep(2)}
                  className="btn-secondary flex-1"
                >
                  ← Back
                </button>
                <ActionButton
                  onClick={handleStep3}
                  loading={resumeLoading || matchLoading}
                  label={
                    resumeLoading
                      ? "Parsing resume..."
                      : matchLoading
                        ? "Running AI match..."
                        : "Generate Match →"
                  }
                  loadingLabel={
                    resumeLoading ? "Parsing resume..." : "Running AI match..."
                  }
                  className="flex-1"
                />
              </div>
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="mt-4 p-3 bg-red-950/60 border border-red-800/50 rounded-xl text-red-400 text-sm">
              {error}
            </div>
          )}
        </div>

        <p className="text-center text-slate-700 text-xs mt-6">
          Your data never leaves your session.
        </p>
      </div>

      <style>{`
        .input-field {
          width: 100%;
          background: rgb(15 23 42);
          border: 1px solid rgb(51 65 85);
          border-radius: 0.75rem;
          padding: 0.75rem 1rem;
          color: rgb(226 232 240);
          font-size: 0.875rem;
          outline: none;
          transition: border-color 0.2s, box-shadow 0.2s;
        }
        .input-field::placeholder { color: rgb(71 85 105); }
        .input-field:focus {
          border-color: rgb(99 102 241);
          box-shadow: 0 0 0 3px rgba(99,102,241,0.15);
        }
        .input-field option { background: rgb(15 23 42); }
        .btn-secondary {
          background: rgb(30 41 59);
          border: 1px solid rgb(51 65 85);
          color: rgb(148 163 184);
          border-radius: 0.75rem;
          padding: 0.75rem 1.5rem;
          font-size: 0.875rem;
          font-weight: 500;
          cursor: pointer;
          transition: background 0.2s;
        }
        .btn-secondary:hover { background: rgb(51 65 85); color: rgb(226 232 240); }
      `}</style>
    </div>
  );
}

// ── Sub-components ────────────────────────────────────────────────────────────

function StepHeader({
  step,
  title,
  subtitle,
}: {
  step: number;
  title: string;
  subtitle: string;
}) {
  return (
    <div className="mb-2">
      <p className="text-indigo-400 text-xs font-semibold uppercase tracking-widest mb-1">
        Step {step} of 3
      </p>
      <h2 className="text-white text-2xl font-bold">{title}</h2>
      <p className="text-slate-400 text-sm mt-1">{subtitle}</p>
    </div>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <label className="text-slate-300 text-sm font-medium">{label}</label>
      {children}
    </div>
  );
}

function ActionButton({
  onClick,
  loading,
  label,
  loadingLabel,
  className = "",
}: {
  onClick: () => void;
  loading: boolean;
  label: string;
  loadingLabel: string;
  className?: string;
}) {
  return (
    <button
      onClick={onClick}
      disabled={loading}
      className={`${className} relative flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-900 disabled:cursor-not-allowed text-white font-semibold rounded-xl px-6 py-3 text-sm transition-all duration-200 shadow-lg shadow-indigo-900/40`}
    >
      {loading && (
        <svg
          className="animate-spin h-4 w-4 text-white/70"
          xmlns="http://www.w3.org/2000/svg"
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
      )}
      {loading ? loadingLabel : label}
    </button>
  );
}
