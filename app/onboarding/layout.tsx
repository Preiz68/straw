"use client";

import { useAuth } from "@/app/context/AuthContext";
import { useRouter, usePathname } from "next/navigation";
import { useEffect, useState } from "react";

const STEPS = [
  { id: "career", label: "Career Info", icon: "💼" },
  { id: "resume", label: "Resume", icon: "📄" },
  { id: "github", label: "GitHub", icon: "🐙" },
  { id: "projects", label: "Projects", icon: "🚀" },
  { id: "enrichment", label: "AI Profile", icon: "✨" },
];

export default function OnboardingLayout({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [currentStepId, setCurrentStepId] = useState("");

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [user, loading, router]);

  useEffect(() => {
    const step = pathname.split("/").pop();
    setCurrentStepId(step || "");
  }, [pathname]);

  const currentStepIndex = STEPS.findIndex(s => s.id === currentStepId);

  if (loading || !user) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-950 via-slate-900 to-indigo-950 flex flex-col">
      {/* Top Navigation */}
      <nav className="border-b border-slate-800 bg-slate-950/50 backdrop-blur-md px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center font-bold text-white italic">S</div>
            <span className="text-white font-bold tracking-tight">STRAW</span>
          </div>
          
          <div className="hidden md:flex items-center gap-8">
            {STEPS.map((step, index) => (
              <div 
                key={step.id} 
                className={`flex items-center gap-2 transition-colors duration-200 ${
                  index <= currentStepIndex ? "text-indigo-400" : "text-slate-600"
                }`}
              >
                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold border ${
                  index < currentStepIndex 
                    ? "bg-indigo-600 border-indigo-600 text-white" 
                    : index === currentStepIndex
                      ? "border-indigo-400 text-indigo-400 ring-4 ring-indigo-400/10"
                      : "border-slate-700 text-slate-600"
                }`}>
                  {index < currentStepIndex ? "✓" : index + 1}
                </div>
                <span className="text-xs font-semibold uppercase tracking-wider">{step.label}</span>
                {index < STEPS.length - 1 && (
                  <div className={`h-px w-8 ml-2 ${index < currentStepIndex ? "bg-indigo-600" : "bg-slate-800"}`} />
                )}
              </div>
            ))}
          </div>

          <div className="flex items-center gap-4">
            <span className="text-slate-400 text-xs hidden sm:inline">{user.email}</span>
            <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 overflow-hidden">
               <img src={user.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.uid}`} alt="avatar" />
            </div>
          </div>
        </div>
      </nav>

      <main className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-2xl animate-in fade-in slide-in-from-bottom-4 duration-700">
          {children}
        </div>
      </main>
      
      {/* Footer */}
      <footer className="p-6 text-center text-slate-600 text-[10px] uppercase tracking-[0.2em]">
        Secure Session • AI Processing Active
      </footer>
    </div>
  );
}
