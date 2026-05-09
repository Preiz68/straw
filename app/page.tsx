"use client";

import { useRouter } from "next/navigation";
import { useAuth } from "@/app/context/AuthContext";
import { useEffect } from "react";

export default function LandingPage() {
  const router = useRouter();
  const { user, loading } = useAuth();

  useEffect(() => {
    if (!loading && user) {
      router.push("/dashboard");
    }
  }, [user, loading, router]);

  if (loading) return null;

  return (
    <div className="min-h-screen bg-slate-950 text-white selection:bg-indigo-500/30">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        {/* Background Gradients */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-full">
          <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[60%] bg-indigo-600/20 blur-[120px] rounded-full animate-pulse"></div>
          <div className="absolute bottom-[10%] right-[-5%] w-[30%] h-[50%] bg-blue-600/10 blur-[100px] rounded-full"></div>
        </div>

        <nav className="relative z-10 max-w-7xl mx-auto px-6 py-8 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center font-bold italic text-xl shadow-lg shadow-indigo-900/40">S</div>
            <span className="font-bold tracking-tight text-xl">STRAW</span>
          </div>
          <div className="flex items-center gap-6">
            <button 
              onClick={() => router.push("/login")}
              className="text-sm font-medium text-slate-400 hover:text-white transition-colors"
            >
              Sign In
            </button>
            <button 
              onClick={() => router.push("/login")}
              className="bg-white text-slate-950 px-5 py-2.5 rounded-xl text-sm font-bold hover:bg-slate-200 transition-all shadow-lg"
            >
              Get Started
            </button>
          </div>
        </nav>

        <main className="relative z-10 max-w-7xl mx-auto px-6 pt-20 pb-32 flex flex-col items-center text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-slate-900/50 border border-slate-800 mb-8 backdrop-blur-md">
            <span className="flex h-2 w-2 rounded-full bg-indigo-500 animate-ping"></span>
            <span className="text-xs font-bold text-indigo-400 uppercase tracking-widest">Now Powered by Llama 3.1 & 3.3</span>
          </div>

          <h1 className="text-6xl md:text-8xl font-black tracking-tighter mb-8 leading-[0.9]">
            YOUR CAREER, <br />
            <span className="bg-clip-text text-transparent bg-linear-to-r from-indigo-400 via-blue-400 to-emerald-400">
              AI OPTIMIZED.
            </span>
          </h1>

          <p className="max-w-2xl text-slate-400 text-lg md:text-xl mb-12 leading-relaxed">
            STRAW analyzes your GitHub repositories, parses your resume, and builds a deep technical profile that helps you match with the perfect roles.
          </p>

          <div className="flex flex-col sm:flex-row items-center gap-4">
            <button 
              onClick={() => router.push("/login")}
              className="px-8 py-5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-2xl transition-all shadow-2xl shadow-indigo-900/40 hover:scale-105 active:scale-95 text-lg"
            >
              Build Your Profile →
            </button>
            <button className="px-8 py-5 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-2xl border border-slate-800 transition-all text-lg">
              View Sample Demo
            </button>
          </div>

          {/* Social Proof / Features */}
          <div className="mt-24 grid grid-cols-1 md:grid-cols-3 gap-8 w-full">
            <FeatureCard 
              icon="🧬" 
              title="Identity Analysis" 
              desc="We go beyond keywords, analyzing your actual code quality and patterns on GitHub." 
            />
            <FeatureCard 
              icon="📄" 
              title="Tailored Resumes" 
              desc="Generate ATS-optimized resumes that highlight exactly what the recruiter is looking for." 
            />
            <FeatureCard 
              icon="🎯" 
              title="Smart Matching" 
              desc="Get a detailed percentage match score for any job description based on your real skills." 
            />
          </div>
        </main>
      </div>

      {/* Stats Section */}
      <section className="border-y border-slate-900 bg-slate-950/50 py-16">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-8">
           <Stat label="Repos Analyzed" value="12,400+" />
           <Stat label="Users Matches" value="5,200+" />
           <Stat label="AI Generations" value="48k" />
           <Stat label="Success Rate" value="94%" />
        </div>
      </section>

      {/* Simple Footer */}
      <footer className="py-20 px-6 max-w-7xl mx-auto text-center border-t border-slate-900/50 mt-20">
         <div className="flex items-center justify-center gap-2 mb-6">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center font-bold italic text-white">S</div>
            <span className="font-bold tracking-tight">STRAW</span>
         </div>
         <p className="text-slate-600 text-sm mb-8">© 2026 Preiz68. Built for the modern developer.</p>
         <div className="flex justify-center gap-6 text-slate-500 text-sm">
            <span className="hover:text-white cursor-pointer">Twitter</span>
            <span className="hover:text-white cursor-pointer">GitHub</span>
            <span className="hover:text-white cursor-pointer">Discord</span>
         </div>
      </footer>
    </div>
  );
}

function FeatureCard({ icon, title, desc }: { icon: string, title: string, desc: string }) {
  return (
    <div className="p-8 bg-slate-900/30 border border-slate-900 rounded-3xl text-left hover:bg-slate-900/50 transition-all hover:border-slate-800 group">
      <div className="text-3xl mb-4 group-hover:scale-110 transition-transform duration-300">{icon}</div>
      <h3 className="text-xl font-bold mb-2 text-white">{title}</h3>
      <p className="text-slate-500 text-sm leading-relaxed">{desc}</p>
    </div>
  );
}

function Stat({ label, value }: { label: string, value: string }) {
  return (
    <div className="flex flex-col items-center gap-1">
      <span className="text-3xl font-black text-indigo-500">{value}</span>
      <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{label}</span>
    </div>
  );
}
