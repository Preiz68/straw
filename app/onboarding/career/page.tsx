"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ROLES, RANKS } from "@/types/match";
import { useAuth } from "@/app/context/AuthContext";
import { profileService } from "@/lib/profile/profileService";

export default function CareerStep() {
  const router = useRouter();
  const { user } = useAuth();
  const [role, setRole] = useState("");
  const [rank, setRank] = useState("");
  const [exp, setExp] = useState<string>("0");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!role || !rank || !user) return;

    setLoading(true);
    const expValue = parseInt(exp) || 0;
    try {
      // Check if profile exists, if not create it
      const existing = await profileService.getProfile(user.uid);
      if (!existing) {
        await profileService.createProfile(user.uid, {
          role,
          rank,
          yearsOfExperience: expValue,
          currentStep: 2,
        });
      } else {
        await profileService.updateProfile(user.uid, {
          role,
          rank,
          yearsOfExperience: expValue,
          currentStep: 2,
        });
      }
      router.push("/onboarding/resume");
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-slate-900/50 backdrop-blur-xl border border-slate-800 rounded-3xl p-8 shadow-2xl">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-white mb-2">
          Career Information
        </h2>
        <p className="text-slate-400 text-sm">
          Tell us about your professional background to personalize your AI
          profile.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-2">
          <label className="text-slate-300 text-sm font-medium ml-1">
            Target Developer Role
          </label>
          <select
            value={role}
            onChange={(e) => setRole(e.target.value)}
            required
            className="w-full bg-slate-950 border border-slate-800 rounded-xl py-3 px-4 text-white text-sm focus:ring-2 focus:ring-indigo-600 outline-none transition-all"
          >
            <option value="">Select a role...</option>
            {ROLES.map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-slate-300 text-sm font-medium ml-1">
              Current Seniority
            </label>
            <select
              value={rank}
              onChange={(e) => setRank(e.target.value)}
              required
              className="w-full bg-slate-950 border border-slate-800 rounded-xl py-3 px-4 text-white text-sm focus:ring-2 focus:ring-indigo-600 outline-none transition-all"
            >
              <option value="">Select level...</option>
              {RANKS.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-slate-300 text-sm font-medium ml-1">
              Years of Experience
            </label>
            <input
              type="number"
              min={0}
              max={50}
              value={exp}
              onChange={(e) => setExp(e.target.value)}
              required
              className="w-full bg-slate-950 border border-slate-800 rounded-xl py-3 px-4 text-white text-sm focus:ring-2 focus:ring-indigo-600 outline-none transition-all"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-900 text-white font-semibold py-4 rounded-2xl transition-all duration-200 shadow-lg shadow-indigo-900/20 flex items-center justify-center gap-2"
        >
          {loading ? (
            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
          ) : (
            <>
              Next Step: Resume Upload <span className="text-xl">→</span>
            </>
          )}
        </button>
      </form>
    </div>
  );
}
