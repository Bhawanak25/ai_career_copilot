import React, { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext.js";
import { DashboardStats } from "../types/index.js";
import { 
  Plus, 
  FileText, 
  Briefcase, 
  Award, 
  CheckSquare, 
  TrendingUp, 
  Compass, 
  Sparkles, 
  ArrowRight,
  TrendingUpIcon,
  ShieldCheck,
  CheckCircle2
} from "lucide-react";
import { motion } from "motion/react";

interface DashboardProps {
  onNavigate: (page: string) => void;
}

export default function Dashboard({ onNavigate }: DashboardProps) {
  const { user, token } = useAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [recentResumes, setRecentResumes] = useState<any[]>([]);

  useEffect(() => {
    if (token) {
      loadDashboardData();
    }
  }, [token]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const [statsRes, historyRes] = await Promise.all([
        fetch("/api/dashboard/stats", {
          headers: { "Authorization": `Bearer ${token}` }
        }),
        fetch("/api/resume/history", {
          headers: { "Authorization": `Bearer ${token}` }
        })
      ]);

      if (statsRes.ok) {
        const statsData = await statsRes.json();
        setStats(statsData);
      }
      if (historyRes.ok) {
        const historyData = await historyRes.json();
        // Take latest 3 resumes for dashboard showcase
        setRecentResumes(historyData.slice(-3).reverse());
      }
    } catch (err) {
      console.error("Failed to load dashboard metrics:", err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
        <p className="text-sm font-mono text-slate-500 animate-pulse">Summoning your career data...</p>
      </div>
    );
  }

  const welcomeMessage = () => {
    const hours = new Date().getHours();
    if (hours < 12) return "Good morning";
    if (hours < 18) return "Good afternoon";
    return "Good evening";
  };

  return (
    <div className="space-y-10">
      {/* Prime Header Card */}
      <div className="relative rounded-2xl overflow-hidden p-8 border border-indigo-500/10 dark:border-indigo-500/20 bg-gradient-to-br from-indigo-50/70 to-white/90 dark:from-indigo-950/40 dark:to-[#1E293B]/70 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-6 transition-all duration-200">
        <div className="absolute top-[-20%] left-[-10%] w-[40%] h-[140%] bg-indigo-500/5 dark:bg-indigo-500/10 rounded-full blur-[100px] pointer-events-none" />
        <div className="relative z-10 space-y-2">
          <h1 className="text-3xl font-extrabold pb-1">
            {welcomeMessage()}, <span className="bg-gradient-to-r from-indigo-500 to-purple-500 bg-clip-text text-transparent">{user?.full_name}</span>!
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Welcome to your AI Career Workspace. Optimize documents, bypass ATS gatekeepers, and prep for upcoming technical evaluations.
          </p>
        </div>
        <button
          id="upload-resume-dash-btn"
          onClick={() => onNavigate("resume")}
          className="relative z-10 px-5 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-sm font-semibold shadow-lg hover:shadow-indigo-500/10 flex items-center gap-2 transition duration-150 shrink-0 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          Scrape New Resume
        </button>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* STAT 1 */}
        <div className="p-6 rounded-2xl border border-slate-200 dark:border-slate-800/80 bg-white dark:bg-slate-900 shadow-sm flex items-center gap-5">
          <div className="p-4 bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 rounded-xl">
            <FileText className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <div className="text-xs font-mono font-bold tracking-wide uppercase text-slate-400">Total Analyzed</div>
            <div className="text-3xl font-black font-mono tracking-tight text-slate-800 dark:text-slate-100">{stats?.totalResumesAnalyzed || 0}</div>
            <div className="text-[11px] text-slate-400">Processed Resumes</div>
          </div>
        </div>

        {/* STAT 2 */}
        <div className="p-6 rounded-2xl border border-slate-200 dark:border-slate-800/80 bg-white dark:bg-slate-900 shadow-sm flex items-center gap-5">
          <div className="p-4 bg-sky-500/10 text-sky-600 dark:text-sky-400 rounded-xl">
            <TrendingUp className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <div className="text-xs font-mono font-bold tracking-wide uppercase text-slate-400">Average ATS Alignment</div>
            <div className="text-3xl font-black font-mono tracking-tight text-slate-800 dark:text-slate-100">{stats?.averageAtsScore || 0}%</div>
            <div className="text-[11px] text-slate-400">Ideal standard is &gt;80%</div>
          </div>
        </div>

        {/* STAT 3 */}
        <div className="p-6 rounded-2xl border border-slate-200 dark:border-slate-800/80 bg-white dark:bg-slate-900 shadow-sm flex items-center gap-5">
          <div className="p-4 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-xl">
            <Award className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <div className="text-xs font-mono font-bold tracking-wide uppercase text-slate-400">Coach Performance</div>
            <div className="text-3xl font-black font-mono tracking-tight text-slate-800 dark:text-slate-100">{stats?.interviewPerformance || 0}%</div>
            <div className="text-[11px] text-slate-400">Based on answers graded</div>
          </div>
        </div>

        {/* STAT 4 */}
        <div className="p-6 rounded-2xl border border-slate-200 dark:border-slate-800/80 bg-white dark:bg-slate-900 shadow-sm flex items-center gap-5">
          <div className="p-4 bg-purple-500/10 text-purple-600 dark:text-purple-400 rounded-xl">
            <CheckSquare className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <div className="text-xs font-mono font-bold tracking-wide uppercase text-slate-400">Verified Skills</div>
            <div className="text-3xl font-black font-mono tracking-tight text-slate-800 dark:text-slate-100">{stats?.skillsCompleted || 0} Passed</div>
            <div className="text-[11px] text-slate-400">In profile skills deck</div>
          </div>
        </div>
      </div>

      {/* Main Split Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          {/* Recent Resume Scoring Updates */}
          <div className="p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
            <div className="flex items-center justify-between pb-6 mb-2 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-indigo-500" />
                <h2 className="text-lg font-bold">Recent ATS Reports</h2>
              </div>
              <button
                onClick={() => onNavigate("resume")}
                className="text-xs text-indigo-500 hover:text-indigo-400 flex items-center gap-1 cursor-pointer"
              >
                Full Analyzer
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {recentResumes.length === 0 ? (
              <div className="py-12 text-center space-y-4">
                <FileText className="w-12 h-12 text-slate-300 dark:text-slate-700 mx-auto" />
                <div className="space-y-1">
                  <h3 className="font-bold text-sm">No Resume Scans Logged</h3>
                  <p className="text-xs text-slate-500 max-w-sm mx-auto">Upload your resume to discover formatting critiques and keyword matching gaps instantly.</p>
                </div>
                <button
                  onClick={() => onNavigate("resume")}
                  className="px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-xs font-semibold rounded-lg border border-slate-200 dark:border-slate-700 cursor-pointer"
                >
                  Upload First PDF
                </button>
              </div>
            ) : (
              <div className="space-y-4 pt-1">
                {recentResumes.map((resReport) => (
                  <div 
                    key={resReport.id} 
                    className="p-4 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/40 flex items-center justify-between gap-4 hover:border-indigo-500/20 transition cursor-pointer"
                    onClick={() => onNavigate("resume")}
                  >
                    <div className="space-y-1 min-w-0">
                      <div className="font-semibold text-sm truncate max-w-[200px] sm:max-w-xs">{resReport.uploaded_file_name}</div>
                      <div className="text-[11px] text-slate-400 font-mono">Analyzed on {new Date(resReport.created_at).toLocaleDateString()}</div>
                    </div>
                    
                    <div className="flex items-center gap-4 shrink-0">
                      <div className="text-right">
                        <div className="text-xs font-mono font-bold text-slate-400">Score</div>
                        <div className={`text-base font-black font-mono ${resReport.ats_score > 80 ? 'text-emerald-500' : 'text-amber-500'}`}>{resReport.ats_score}%</div>
                      </div>
                      <div className="p-1 px-3 rounded bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-[10px] uppercase font-mono font-bold font-light shrink-0">
                        {resReport.ats_score > 80 ? 'ATS Approved' : 'Fix Needed'}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Quick Info / Tips Alert */}
          <div className="p-6 rounded-2xl border border-indigo-500/20 bg-indigo-500/[0.03] dark:bg-indigo-500/[0.01] flex gap-4">
            <Sparkles className="w-6 h-6 text-indigo-500 shrink-0" />
            <div className="space-y-2">
              <h3 className="font-bold text-sm text-indigo-600 dark:text-indigo-400">Copilot Upskilling Recommendation</h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                By pairing your resume analyzer findings with the <strong>Learning Roadmap Generator</strong>, you can construct a dynamic weekly focus tracker that directly maps to target roles. Maintain a routine of updating your skills ledger to automatically push your overall performance score upwards on the master layout!
              </p>
            </div>
          </div>
        </div>

        {/* Sidebar Mini Column */}
        <div className="space-y-8">
          {/* Up-skilling Progress Circular Representation */}
          <div className="p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-center">
            <h2 className="text-base font-bold text-left mb-6 flex items-center gap-2">
              <Compass className="w-5 h-5 text-indigo-500" />
              SaaS Learning Pace
            </h2>

            <div className="relative inline-flex items-center justify-center p-2 mb-4">
              {/* Custom micro svg radial progress to dodge complex Recharts loading errors */}
              <svg className="w-32 h-32 transform -rotate-90">
                <circle cx="64" cy="64" r="54" strokeWidth="8" stroke="currentColor" fill="transparent" className="text-slate-100 dark:text-slate-800" />
                <circle cx="64" cy="64" r="54" strokeWidth="8" stroke="currentColor" fill="transparent" className="text-indigo-600" 
                  strokeDasharray={2 * Math.PI * 54} 
                  strokeDashoffset={2 * Math.PI * 54 * (1 - (stats?.learningProgress || 35) / 100)} 
                  strokeLinecap="round" />
              </svg>
              <div className="absolute text-center">
                <div className="text-2xl font-black font-mono">{stats?.learningProgress || 15}%</div>
                <div className="text-[10px] text-slate-400 tracking-wider">COMPLETED</div>
              </div>
            </div>

            <p className="text-xs text-slate-500 leading-relaxed max-w-xs mx-auto mb-6">
              Track overall completion of skills, milestones, and interview tasks under your Copilot profile.
            </p>

            <button
              onClick={() => onNavigate("roadmap")}
              className="w-full py-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-750 text-slate-800 dark:text-slate-200 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition duration-150 cursor-pointer"
            >
              Update Learning Track
              <ArrowRight className="w-4.5 h-4.5" />
            </button>
          </div>

          {/* Quick Tasks ledger */}
          <div className="p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
            <div className="flex items-center justify-between pb-4 mb-2 border-b border-slate-100 dark:border-slate-800">
              <h2 className="text-sm font-bold">Upcoming Agenda</h2>
              <button
                onClick={() => onNavigate("tasks")}
                className="text-xs text-indigo-500 hover:text-indigo-400 cursor-pointer"
              >
                Open agenda
              </button>
            </div>
            
            <p className="text-xs text-slate-400 leading-relaxed mb-4">Urgent tasks to lock before standard recruitment callbacks commence:</p>

            <div className="space-y-2">
              <div className="p-2.5 rounded-lg border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/20 text-xs flex items-center justify-between">
                <span className="truncate pr-2">Scaffold project portfolio</span>
                <span className="px-2 py-0.5 rounded bg-amber-500/10 text-amber-500 text-[9px] font-mono shrink-0">HIGH</span>
              </div>
              <div className="p-2.5 rounded-lg border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/20 text-xs flex items-center justify-between">
                <span className="truncate pr-2">Study GraphQL mutations</span>
                <span className="px-2 py-0.5 rounded bg-slate-500/10 text-slate-500 text-[9px] font-mono shrink-0">MEDIUM</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
