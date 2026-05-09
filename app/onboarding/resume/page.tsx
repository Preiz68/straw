"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/app/context/AuthContext";
import { profileService } from "@/lib/profile/profileService";

export default function ResumeStep() {
  const router = useRouter();
  const { user } = useAuth();
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file || !user) return;

    setLoading(true);
    setError("");

    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/parse-resume", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) throw new Error("Failed to parse resume");

      const parsedData = await res.json();

      // Save to Firestore profile
      await profileService.updateProfile(user.uid, {
        currentStep: 3,
        parsedResume: parsedData,
      });

      // Also store in localStorage for immediate use if needed (existing logic compatibility)
      localStorage.setItem("parsedResume", JSON.stringify(parsedData));

      router.push("/onboarding/github");
    } catch (err: any) {
      setError(err.message || "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-slate-900/50 backdrop-blur-xl border border-slate-800 rounded-3xl p-8 shadow-2xl">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-white mb-2">Resume Upload</h2>
        <p className="text-slate-400 text-sm">
          Upload your professional resume. Our AI will analyze your experience
          and skills.
        </p>
      </div>

      <form onSubmit={handleUpload} className="space-y-6">
        <div className="space-y-4">
          <label
            htmlFor="resume-upload"
            className={`flex flex-col items-center justify-center border-2 border-dashed rounded-2xl p-12 cursor-pointer transition-all duration-200 group ${
              file
                ? "border-indigo-500 bg-indigo-500/5"
                : "border-slate-800 hover:border-indigo-600 hover:bg-slate-800/50"
            }`}
          >
            <div
              className={`text-5xl mb-4 transform transition-transform group-hover:scale-110 duration-300 ${file ? "text-indigo-400" : "text-slate-600"}`}
            >
              {file ? "📄" : "📤"}
            </div>
            <div className="text-center">
              <p className="text-white font-semibold">
                {file ? file.name : "Select your PDF resume"}
              </p>
              <p className="text-slate-500 text-xs mt-1">
                {file ? "Click to change file" : "or drag and drop here"}
              </p>
            </div>
            <input
              id="resume-upload"
              type="file"
              accept=".pdf"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
              className="hidden"
            />
          </label>
        </div>

        {error && (
          <div className="p-4 bg-red-500/10 border border-red-500/50 rounded-xl text-red-400 text-sm animate-in shake">
            {error}
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
            disabled={!file || loading}
            className="flex-2 bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-900 text-white font-semibold py-4 rounded-2xl transition-all duration-200 shadow-lg shadow-indigo-900/20 flex items-center justify-center gap-2"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
            ) : (
              <>
                Analyze Resume <span className="text-xl">→</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
