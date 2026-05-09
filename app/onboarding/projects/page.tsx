"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Repo } from "@/types/repo";
import { useAuth } from "@/app/context/AuthContext";
import { profileService } from "@/lib/profile/profileService";

export default function ProjectSelectionStep() {
  const router = useRouter();
  const { user } = useAuth();
  const [repos, setRepos] = useState<Repo[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const data = localStorage.getItem("rankedRepos");
    if (data) {
      const parsed = JSON.parse(data) as Repo[];
      setRepos(parsed);
      // Auto-select top 3 as a starting point
      setSelectedIds(parsed.slice(0, 3).map(r => r.name));
    }
  }, []);

  const toggleRepo = (name: string) => {
    setSelectedIds(prev => {
      if (prev.includes(name)) {
        return prev.filter(id => id !== name);
      }
      if (prev.length >= 5) return prev; // Limit to 5
      return [...prev, name];
    });
  };

  const moveUp = (index: number) => {
    if (index === 0) return;
    const newIds = [...selectedIds];
    [newIds[index - 1], newIds[index]] = [newIds[index], newIds[index - 1]];
    setSelectedIds(newIds);
  };

  const moveDown = (index: number) => {
    if (index === selectedIds.length - 1) return;
    const newIds = [...selectedIds];
    [newIds[index + 1], newIds[index]] = [newIds[index], newIds[index + 1]];
    setSelectedIds(newIds);
  };

  const handleNext = async () => {
    if (selectedIds.length === 0 || !user) return;
    setLoading(true);
    try {
      const selectedRepos = repos.filter(r => selectedIds.includes(r.name));
      // Reorder based on selection order
      const orderedSelected = selectedIds.map(id => selectedRepos.find(r => r.name === id)!);
      
      localStorage.setItem("finalSelectedRepos", JSON.stringify(orderedSelected));
      
      await profileService.updateProfile(user.uid, {
        selectedProjectNames: selectedIds,
        currentStep: 5
      });
      
      router.push("/onboarding/enrichment");
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const selectedRepos = selectedIds.map(id => repos.find(r => r.name === id)).filter(Boolean) as Repo[];

  return (
    <div className="flex flex-col gap-6 w-full max-w-5xl mx-auto">
      <div className="text-center mb-4">
        <h2 className="text-3xl font-bold text-white mb-2">Select Your Best Work</h2>
        <p className="text-slate-400">Choose up to 5 projects to feature in your AI-generated profile and resume.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Recommended List */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-bold text-slate-500 uppercase tracking-widest">Recommended Projects</h3>
            <span className="text-xs text-slate-400">{repos.length} Repositories Found</span>
          </div>
          
          <div className="space-y-3 max-h-[600px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-slate-800">
            {repos.map((repo, i) => {
              const isSelected = selectedIds.includes(repo.name);
              return (
                <div 
                  key={repo.name}
                  onClick={() => toggleRepo(repo.name)}
                  className={`group relative p-5 rounded-2xl border transition-all cursor-pointer ${
                    isSelected 
                      ? "bg-indigo-600/10 border-indigo-500 shadow-lg shadow-indigo-900/10" 
                      : "bg-slate-900/50 border-slate-800 hover:border-slate-700 hover:bg-slate-900/80"
                  }`}
                >
                  {i < 3 && !isSelected && (
                     <div className="absolute top-2 right-2 px-2 py-0.5 bg-indigo-500/20 border border-indigo-500/30 rounded-full text-[10px] font-bold text-indigo-400 uppercase tracking-tighter">
                       High Signal
                     </div>
                  )}
                  {isSelected && (
                    <div className="absolute top-2 right-2 w-5 h-5 bg-indigo-500 rounded-full flex items-center justify-center text-white text-[10px]">
                      ✓
                    </div>
                  )}

                  <div className="flex flex-col gap-2">
                    <h4 className="text-white font-bold group-hover:text-indigo-400 transition-colors">{repo.name}</h4>
                    <p className="text-slate-400 text-xs line-clamp-2">{repo.description || "No description provided."}</p>
                    <div className="flex items-center gap-3 mt-2">
                      <span className="text-[10px] font-mono text-indigo-300 bg-indigo-950/50 px-2 py-0.5 rounded border border-indigo-900/50">
                        {repo.language || "Unknown"}
                      </span>
                      <span className="text-[10px] text-slate-500 flex items-center gap-1">
                        ⭐ {repo.stars}
                      </span>
                      <span className="text-[10px] text-slate-500 flex items-center gap-1">
                        📅 {new Date(repo.updatedAt).getFullYear()}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Selected / Order Panel */}
        <div className="lg:col-span-5 flex flex-col gap-6">
          <div className="bg-slate-900/80 backdrop-blur-xl border border-slate-800 rounded-3xl p-6 shadow-2xl sticky top-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-white font-bold">Your Selection</h3>
              <span className={`text-xs font-bold px-2 py-1 rounded-lg ${selectedIds.length === 5 ? "bg-amber-500/20 text-amber-500" : "bg-slate-800 text-slate-400"}`}>
                {selectedIds.length} / 5
              </span>
            </div>

            {selectedIds.length === 0 ? (
              <div className="py-12 flex flex-col items-center justify-center text-center border-2 border-dashed border-slate-800 rounded-2xl">
                <span className="text-4xl mb-4 opacity-20">🎯</span>
                <p className="text-slate-500 text-sm px-6">Click on projects to add them to your featured list.</p>
              </div>
            ) : (
              <div className="space-y-3 mb-8">
                {selectedRepos.map((repo, idx) => (
                  <div key={repo.name} className="flex items-center gap-3 bg-slate-950/50 border border-slate-800 p-3 rounded-xl group/item">
                    <div className="flex flex-col gap-1">
                      <button 
                        onClick={(e) => { e.stopPropagation(); moveUp(idx); }}
                        className="text-slate-600 hover:text-indigo-400 disabled:opacity-0 transition-colors"
                        disabled={idx === 0}
                      >
                        ▲
                      </button>
                      <button 
                        onClick={(e) => { e.stopPropagation(); moveDown(idx); }}
                        className="text-slate-600 hover:text-indigo-400 disabled:opacity-0 transition-colors"
                        disabled={idx === selectedIds.length - 1}
                      >
                        ▼
                      </button>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-white text-xs font-bold truncate">{repo.name}</p>
                      <p className="text-slate-500 text-[10px] uppercase tracking-wider">{idx === 0 ? "Pinned Main Project" : `Priority ${idx + 1}`}</p>
                    </div>
                    <button 
                      onClick={() => toggleRepo(repo.name)}
                      className="w-6 h-6 rounded-lg bg-slate-900 flex items-center justify-center text-slate-500 hover:bg-red-500/20 hover:text-red-400 transition-all"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}

            <button
              onClick={handleNext}
              disabled={selectedIds.length === 0 || loading}
              className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-900 text-white font-semibold py-4 rounded-2xl transition-all duration-200 shadow-lg shadow-indigo-900/40 flex items-center justify-center gap-2"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              ) : (
                <>Confirm Selection <span className="text-xl">→</span></>
              )}
            </button>
            <p className="text-center text-[10px] text-slate-600 mt-4 uppercase tracking-tighter">
              The AI will enrich these projects in the next step.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
