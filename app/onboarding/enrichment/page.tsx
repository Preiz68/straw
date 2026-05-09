"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/app/context/AuthContext";
import { profileService } from "@/lib/profile/profileService";
import { Repo } from "@/types/repo";

export default function EnrichmentStep() {
  const router = useRouter();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState("Analyzing your selected projects...");
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const enrich = async () => {
      if (!user) return;

      const data = localStorage.getItem("finalSelectedRepos");
      if (!data) {
        router.push("/onboarding/projects");
        return;
      }

      const selectedRepos = JSON.parse(data) as Repo[];

      try {
        // 1. Process projects (AI Summary)
        // Note: In a real production app, this would be an async background job (Inngest)
        // For the flow, we'll call the processing API
        setStatus("Generating deep technical insights for your projects...");
        setProgress(20);
        
        await fetch("/api/process", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ selectedRepos, userId: user.uid }),
        });

        setProgress(60);
        setStatus("Synthesizing your developer identity...");

        // 2. Generate Profile Summary (Simulated here, but would be an AI call)
        const profileSummary = "Senior Software Engineer specialized in high-performance distributed systems and modern frontend architectures. Proven track record of delivering complex platforms with a focus on scalability and developer experience.";
        const tags = ["TypeScript", "React", "Node.js", "Distributed Systems", "Cloud Native"];

        // 3. Update final profile state
        await profileService.updateProfile(user.uid, {
          aiSummary: profileSummary,
          aiTags: tags,
          onboardingStatus: "COMPLETED",
          currentStep: 6
        });

        setProgress(100);
        setStatus("Profile ready! Redirecting to dashboard...");

        setTimeout(() => {
          router.push("/dashboard");
        }, 1500);

      } catch (error) {
        console.error(error);
        setStatus("Something went wrong, but don't worry. You can finish this later.");
        setTimeout(() => router.push("/dashboard"), 3000);
      } finally {
        setLoading(false);
      }
    };

    enrich();
  }, [user, router]);

  return (
    <div className="bg-slate-900/50 backdrop-blur-xl border border-slate-800 rounded-3xl p-12 shadow-2xl text-center">
      <div className="mb-8 relative">
        <div className="absolute inset-0 bg-indigo-600/20 blur-3xl rounded-full scale-150 animate-pulse"></div>
        <div className="relative z-10 text-6xl mb-6">🧠</div>
        <h2 className="text-3xl font-bold text-white mb-2 relative z-10">AI Enrichment</h2>
        <p className="text-slate-400 text-sm relative z-10">We're finalizing your profile based on your career data, resume, and GitHub repositories.</p>
      </div>

      <div className="max-w-md mx-auto space-y-6">
        <div className="space-y-3">
          <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest text-indigo-400">
            <span>{status}</span>
            <span>{progress}%</span>
          </div>
          <div className="h-2 w-full bg-slate-950 rounded-full border border-slate-800 overflow-hidden">
            <div 
              className="h-full bg-indigo-500 shadow-[0_0_15px_rgba(99,102,241,0.5)] transition-all duration-700 ease-out"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        </div>

        <div className="flex flex-wrap justify-center gap-2 pt-4">
           {["Parsing Skills", "Analyzing Patterns", "Scoring Complexity", "Detecting Stack"].map((label, i) => (
             <div 
               key={label}
               className={`text-[9px] font-bold px-3 py-1.5 rounded-lg border transition-all duration-500 ${
                 progress > (i + 1) * 20 ? "bg-indigo-600/10 border-indigo-500/50 text-indigo-300" : "bg-slate-950 border-slate-800 text-slate-600"
               }`}
             >
               {progress > (i + 1) * 20 ? "✓ " : "• "}{label}
             </div>
           ))}
        </div>
      </div>
    </div>
  );
}
