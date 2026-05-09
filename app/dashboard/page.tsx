"use client";

import { useAuth } from "@/app/context/AuthContext";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { profileService, DeveloperProfile } from "@/lib/profile/profileService";

export default function DashboardPage() {
  const { user, loading, logout } = useAuth();
  const router = useRouter();
  const [profile, setProfile] = useState<DeveloperProfile | null>(null);
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
      return;
    }

    if (user) {
      profileService.getProfile(user.uid).then(p => {
        if (!p || p.onboardingStatus !== "COMPLETED") {
          router.push("/onboarding/career");
        } else {
          setProfile(p);
        }
        setFetching(false);
      });
    }
  }, [user, loading, router]);

  if (loading || fetching) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 flex">
      {/* Sidebar */}
      <aside className="w-64 border-r border-slate-800 bg-slate-950 flex flex-col p-6">
        <div className="flex items-center gap-3 mb-10">
          <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center font-bold text-white italic text-xl shadow-lg shadow-indigo-900/40">S</div>
          <span className="text-white font-bold tracking-tight text-lg">STRAW</span>
        </div>

        <nav className="flex-1 space-y-2">
          <NavItem icon="🏠" label="Command Center" active />
          <NavItem icon="👤" label="Developer Profile" />
          <NavItem icon="🚀" label="Project Lab" />
          <NavItem icon="📄" label="Resume Center" />
          <NavItem icon="📊" label="Insights" />
        </nav>

        <div className="pt-6 border-t border-slate-800 mt-auto">
          <button 
            onClick={logout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-slate-400 hover:bg-red-500/10 hover:text-red-400 transition-all text-sm font-medium"
          >
            <span>🚪</span> Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-y-auto bg-linear-to-b from-slate-900/50 to-slate-950">
        {/* Header */}
        <header className="px-10 py-6 flex items-center justify-between border-b border-slate-800/50 bg-slate-950/20 backdrop-blur-md">
          <div>
            <h1 className="text-2xl font-bold text-white">Dashboard</h1>
            <p className="text-slate-500 text-sm">Welcome back, {user?.displayName || "Developer"}</p>
          </div>
          
          <div className="flex items-center gap-4">
             <button className="p-2 bg-slate-900 border border-slate-800 rounded-xl hover:bg-slate-800 transition-all">🔔</button>
             <div className="w-10 h-10 rounded-full border border-indigo-500/30 p-0.5">
                <img src={user?.photoURL || ""} className="w-full h-full rounded-full" alt="avatar" />
             </div>
          </div>
        </header>

        {/* Dashboard Grid */}
        <div className="p-10 space-y-8">
          {/* Top Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <StatCard title="AI Profile Score" value="84/100" detail="Top 5% in Stack" color="text-indigo-400" />
            <StatCard title="Ranked Projects" value={5} detail="Selected for Portfolio" color="text-emerald-400" />
            <StatCard title="Resume Matches" value="12" detail="Last 30 Days" color="text-amber-400" />
          </div>

          {/* Profile Overview */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className="lg:col-span-8 space-y-8">
              <section className="bg-slate-900/50 border border-slate-800 rounded-3xl p-8">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-white font-bold text-lg">AI Developer Summary</h3>
                  <button className="text-indigo-400 text-xs font-bold hover:underline">Regenerate</button>
                </div>
                <p className="text-slate-300 leading-relaxed italic border-l-4 border-indigo-600 pl-6 py-2">
                  "{profile?.aiSummary}"
                </p>
                <div className="flex flex-wrap gap-2 mt-6">
                  {profile?.aiTags?.map(tag => (
                    <span key={tag} className="px-3 py-1 bg-indigo-500/10 border border-indigo-500/20 rounded-full text-[10px] font-bold text-indigo-400 uppercase tracking-wider">
                      {tag}
                    </span>
                  ))}
                </div>
              </section>

              <section className="bg-slate-900/50 border border-slate-800 rounded-3xl p-8">
                <div className="flex items-center justify-between mb-6">
                   <h3 className="text-white font-bold text-lg">Matching Lab</h3>
                   <span className="px-2 py-1 bg-indigo-500/20 rounded text-[10px] font-bold text-indigo-400 uppercase tracking-tighter">AI Powered</span>
                </div>
                
                <div className="space-y-4">
                   <p className="text-slate-400 text-sm">Paste a job description to analyze your match and generate a tailored resume.</p>
                   <textarea 
                     placeholder="Paste job description here..."
                     className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-5 text-slate-300 text-sm focus:ring-2 focus:ring-indigo-600 outline-none transition-all h-48 resize-none font-mono leading-relaxed"
                     id="jd-input"
                   />
                   <button 
                     onClick={async () => {
                       const jdText = (document.getElementById("jd-input") as HTMLTextAreaElement).value;
                       if (!jdText) return;

                       if (!profile?.role || !profile?.rank || !profile?.parsedResume) {
                          alert("Your profile is incomplete. Please ensure your career info and resume are set up.");
                          return;
                       }
                       
                       const btn = document.getElementById("match-btn");
                       if (btn) {
                          btn.innerHTML = '<div class="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> Parsing JD...';
                          btn.setAttribute("disabled", "true");
                       }

                       try {
                         // 1. Parse JD
                         const parseRes = await fetch("/api/parse-jd", {
                           method: "POST",
                           headers: { "Content-Type": "application/json" },
                           body: JSON.stringify({ jdText }),
                         });
                         const parsedJD = await parseRes.json();
                         
                         if (!parseRes.ok) {
                           throw new Error(parsedJD.error || "Failed to parse Job Description");
                         }

                         if (btn) btn.innerHTML = '<div class="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> Running AI Match...';

                         // 2. Match
                         const matchRes = await fetch("/api/match", {
                           method: "POST",
                           headers: { "Content-Type": "application/json" },
                           body: JSON.stringify({
                             role: profile?.role,
                             rank: profile?.rank,
                             resume: profile?.parsedResume,
                             jd: parsedJD,
                             userId: user?.uid
                           }),
                         });
                         
                         const matchResult = await matchRes.json();

                         if (!matchRes.ok) {
                           throw new Error(matchResult.error || "Matching failed");
                         }

                         localStorage.setItem("matchResult", JSON.stringify(matchResult));
                         router.push("/match-result");
                       } catch (err) {
                         console.error(err);
                         alert("Matching failed. Please try again.");
                       } finally {
                         if (btn) {
                            btn.innerHTML = "Generate Tailored Resume →";
                            btn.removeAttribute("disabled");
                         }
                       }
                     }}
                     id="match-btn"
                     className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-4 rounded-2xl transition-all shadow-lg shadow-indigo-900/20 flex items-center justify-center gap-3"
                   >
                     Generate Tailored Resume →
                   </button>
                </div>
              </section>

              <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 <div className="bg-slate-900/50 border border-slate-800 rounded-3xl p-6">
                    <h3 className="text-white font-bold mb-4">Core Identity</h3>
                    <div className="space-y-4">
                       <DetailRow label="Primary Role" value={profile?.role || "Developer"} />
                       <DetailRow label="Experience Level" value={profile?.rank || "Mid"} />
                       <DetailRow label="Years Exp" value={`${profile?.yearsOfExperience || 0} years`} />
                    </div>
                 </div>
                 <div className="bg-slate-900/50 border border-slate-800 rounded-3xl p-6">
                    <h3 className="text-white font-bold mb-4">GitHub Signal</h3>
                    <div className="space-y-4">
                       <DetailRow label="Username" value={profile?.githubUsername || "@unknown"} />
                       <DetailRow label="Integrations" value="Active" />
                       <DetailRow label="Auto-Sync" value="Enabled" />
                    </div>
                 </div>
              </section>
            </div>

            <div className="lg:col-span-4 space-y-6">
               <div className={`rounded-3xl p-8 text-white shadow-xl ${
                 profile?.role && profile?.parsedResume 
                   ? "bg-linear-to-br from-indigo-600 to-indigo-800 shadow-indigo-900/20" 
                   : "bg-linear-to-br from-amber-600 to-amber-800 shadow-amber-900/20"
               }`}>
                  <h3 className="font-bold text-lg mb-2">
                    {profile?.role && profile?.parsedResume ? "Profile Ready" : "Profile Incomplete"}
                  </h3>
                  <p className="text-white/80 text-xs mb-6 leading-relaxed">
                    {profile?.role && profile?.parsedResume 
                      ? "Your profile is fully enriched. You can now generate tailored resumes for specific job descriptions."
                      : "We're missing some key information like your career goals or parsed resume data."}
                  </p>
                  <button 
                    onClick={() => {
                      if (profile?.role && profile?.parsedResume) {
                        document.getElementById("jd-input")?.focus();
                      } else {
                        router.push("/onboarding/career");
                      }
                    }}
                    className="w-full bg-white text-slate-950 font-bold py-3 rounded-xl hover:bg-slate-100 transition-all text-sm"
                  >
                    {profile?.role && profile?.parsedResume ? "Start Matching →" : "Finish Onboarding →"}
                  </button>
               </div>

               <div className="bg-slate-900/50 border border-slate-800 rounded-3xl p-6">
                  <h3 className="text-white font-bold mb-4">Top 5 Projects</h3>
                  <div className="space-y-3">
                     {profile?.selectedProjectNames?.map((name, i) => (
                       <div key={name} className="flex items-center gap-3 p-3 bg-slate-950/50 border border-slate-800 rounded-xl">
                          <span className="text-indigo-400 font-mono text-xs">0{i + 1}</span>
                          <span className="text-slate-300 text-xs font-medium truncate">{name}</span>
                       </div>
                     )) || (
                       <p className="text-slate-500 text-xs italic">No projects selected yet.</p>
                     )}
                  </div>
               </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

function NavItem({ icon, label, active = false }: { icon: string, label: string, active?: boolean }) {
  return (
    <div className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all cursor-pointer font-medium text-sm ${
      active ? "bg-indigo-600 text-white shadow-lg shadow-indigo-900/20" : "text-slate-400 hover:bg-slate-900 hover:text-slate-200"
    }`}>
      <span className="text-lg">{icon}</span>
      {label}
    </div>
  );
}

function StatCard({ title, value, detail, color }: { title: string, value: string | number, detail: string, color: string }) {
  return (
    <div className="bg-slate-900/50 border border-slate-800 rounded-3xl p-6 flex flex-col gap-1">
      <span className="text-slate-500 text-xs font-bold uppercase tracking-wider">{title}</span>
      <span className={`text-3xl font-bold ${color}`}>{value}</span>
      <span className="text-slate-600 text-[10px] mt-1 font-medium">{detail}</span>
    </div>
  );
}

function DetailRow({ label, value }: { label: string, value: string }) {
  return (
    <div className="flex items-center justify-between py-1 border-b border-slate-800/30">
      <span className="text-slate-500 text-xs">{label}</span>
      <span className="text-slate-300 text-xs font-semibold">{value}</span>
    </div>
  );
}
