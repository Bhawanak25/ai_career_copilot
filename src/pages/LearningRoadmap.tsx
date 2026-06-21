import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext.js";
import { LearningRoadmap as RoadmapType } from "../types/index.js";
import { 
  Compass, 
  Sparkles, 
  Clock, 
  Calendar, 
  ExternalLink, 
  BookOpen, 
  AlertCircle, 
  CheckCircle2, 
  ChevronRight, 
  ChevronDown,
  RefreshCw,
  Award,
  Video,
  FileText
} from "lucide-react";
import { motion } from "motion/react";

export default function LearningRoadmap() {
  const { token, user } = useAuth();
  const [targetRole, setTargetRole] = useState("Software Engineer");
  const [durationWeeks, setDurationWeeks] = useState(6);
  
  const [roadmap, setRoadmap] = useState<RoadmapType | null>(null);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [expandedWeek, setExpandedWeek] = useState<number | null>(1);
  const [userSkillsList, setUserSkillsList] = useState<string[]>([]);

  useEffect(() => {
    if (token) {
      loadLatestRoadmap();
      loadUserSkills();
    }
  }, [token]);

  const loadLatestRoadmap = async () => {
    try {
      const res = await fetch("/api/roadmap/latest", {
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        if (data) {
          setRoadmap(data);
          if (data.roadmap_data && data.roadmap_data.length > 0) {
            setExpandedWeek(data.roadmap_data[0].week);
          }
        }
      }
    } catch (err) {
      console.error("Failed to load historical roadmap:", err);
    }
  };

  const loadUserSkills = async () => {
    try {
      const res = await fetch("/api/skills", {
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        const names = data.map((s: any) => s.skill_name);
        setUserSkillsList(names);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const generateRoadmap = async () => {
    if (!targetRole.trim()) {
      setErrorMessage("Please input your aspiring job role.");
      return;
    }
    setErrorMessage(null);
    setLoading(true);
    setRoadmap(null);

    try {
      const res = await fetch("/api/roadmap/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          targetRole: targetRole.trim(),
          currentSkills: userSkillsList,
          durationWeeks: durationWeeks
        })
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to formulate timeline.");
      }
      setRoadmap(data);
      if (data.roadmap_data && data.roadmap_data.length > 0) {
        setExpandedWeek(data.roadmap_data[0].week);
      }
    } catch (err: any) {
      setErrorMessage(err?.message || "Failed to compile training roadmap. Please try slightly simpler terminology.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-10">
      {/* View Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-extrabold pb-0.5 animate-fade-in">Personalized Learning Roadmaps</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Formulate personalized step-by-step master syllabi from beginner topics to advanced deployments, backed by interactive daily schedules.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Control Input panel */}
        <div className="lg:col-span-4 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm space-y-6">
          <h3 className="text-sm font-bold flex items-center gap-2 font-display">
            <Calendar className="w-4.5 h-4.5 text-indigo-500" />
            Roadmap Parameters
          </h3>

          <div>
            <label className="block text-[10px] font-semibold text-slate-400 font-mono uppercase tracking-wider mb-2">Target Career Role</label>
            <input
              type="text"
              required
              value={targetRole}
              onChange={(e) => setTargetRole(e.target.value)}
              placeholder="e.g. Software Engineer"
              className="w-full px-3 py-2.5 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:border-indigo-500 transition"
            />
          </div>

          <div>
            <label className="block text-[10px] font-semibold text-slate-400 font-mono uppercase tracking-wider mb-2">Duration (Weeks)</label>
            <select
              value={durationWeeks}
              onChange={(e) => setDurationWeeks(parseInt(e.target.value))}
              className="w-full px-3 py-2.5 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:border-indigo-500 transition cursor-pointer"
            >
              <option value="4">4 Weeks (Crash track)</option>
              <option value="6">6 Weeks (Optimal speed)</option>
              <option value="8">8 Weeks (Standard bootcamp)</option>
              <option value="12">12 Weeks (Deep architectural dive)</option>
            </select>
          </div>

          <div className="p-3.5 rounded-xl bg-indigo-500/[0.03] border border-indigo-500/10 text-[11px] text-slate-550 dark:text-slate-400 leading-normal space-y-1 flex items-start gap-2">
            <BookOpen className="w-3.5 h-3.5 text-indigo-500 shrink-0 mt-0.5" />
            <span>AI will automatically ingest the <strong>{userSkillsList.length} skills</strong> you mapped on your Profile skills page as starting pre-requisites!</span>
          </div>

          <button
            onClick={generateRoadmap}
            disabled={loading}
            className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-800 text-white rounded-xl text-xs font-semibold shadow-lg hover:shadow-indigo-500/20 flex items-center justify-center gap-1.5 cursor-pointer"
          >
            {loading ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                Compiling syllabus track...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 text-amber-300" />
                Generate Roadmap
              </>
            )}
          </button>

          {errorMessage && (
            <div className="p-3.5 bg-rose-500/10 border border-rose-500/30 text-rose-600 dark:text-rose-400 rounded-xl text-xs flex items-center gap-2">
              <AlertCircle className="w-4.5 h-4.5 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}
        </div>

        {/* Right timeline stage */}
        <div className="lg:col-span-8">
          {loading ? (
            <div className="p-12 text-center space-y-6 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 bg-slate-50/20 dark:bg-slate-950/10 min-h-[460px] flex flex-col justify-center items-center">
              <RefreshCw className="w-10 h-10 text-indigo-500 animate-spin" />
              <div className="space-y-1">
                <h3 className="font-bold text-base leading-none">Compiling Chronologies...</h3>
                <p className="text-xs text-slate-450 max-w-sm mx-auto leading-relaxed">
                  Gemini AI is designing customized learning sequences, creating weekly Sunday homework deliverables, and formulating verified resource links.
                </p>
              </div>
            </div>
          ) : roadmap ? (
            <div className="space-y-6">
              {/* Header card info */}
              <div className="p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm flex items-center justify-between">
                <div className="space-y-1">
                  <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400">ACTIVE SYLLABUS PATH</span>
                  <h3 className="font-extrabold text-lg capitalize">{roadmap.target_role} • {roadmap.duration_weeks} Weeks</h3>
                  <p className="text-xs text-slate-400">Generated on {new Date(roadmap.created_at).toLocaleDateString()}</p>
                </div>
                <div className="px-3.5 py-1.5 rounded-lg bg-emerald-500/10 text-emerald-500 text-xs font-bold shrink-0 border border-emerald-500/15">
                  ● ACTIVE STUDY
                </div>
              </div>

              {/* Weekly collapsible items */}
              <div className="space-y-4">
                {roadmap.roadmap_data.map((weekData) => {
                  const isExpanded = expandedWeek === weekData.week;
                  return (
                    <div 
                      key={weekData.week} 
                      className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden shadow-sm"
                    >
                      {/* Collapsible header */}
                      <button
                        onClick={() => setExpandedWeek(isExpanded ? null : weekData.week)}
                        className="w-full p-5 flex items-center justify-between text-left hover:bg-slate-50/50 dark:hover:bg-slate-950/20 transition cursor-pointer"
                      >
                        <div className="flex items-center gap-4">
                          <span className="w-9 h-9 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 text-xs font-black font-mono flex items-center justify-center border border-indigo-500/10 shrink-0">
                            W{weekData.week}
                          </span>
                          <div>
                            <h4 className="font-extrabold text-sm text-slate-800 dark:text-slate-100">{weekData.title}</h4>
                            <p className="text-xs text-slate-400 font-light truncate max-w-[240px] sm:max-w-md">{weekData.description}</p>
                          </div>
                        </div>

                        {isExpanded ? <ChevronDown className="w-5 h-5 text-slate-400" /> : <ChevronRight className="w-5 h-5 text-slate-400" />}
                      </button>

                      {/* Expansible parameters */}
                      {isExpanded && (
                        <div className="p-6 border-t border-slate-100 dark:border-slate-850 bg-slate-50/[0.15] dark:bg-slate-950/[0.05] space-y-6">
                          {/* Daily Study routine */}
                          <div className="space-y-3">
                            <h5 className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400">Daily Study Blocks</h5>
                            <div className="grid grid-cols-1 sm:grid-cols-5 gap-3">
                              {weekData.daily_schedule && weekData.daily_schedule.map((day, didx) => (
                                <div key={didx} className="p-3 rounded-lg border border-slate-100 dark:border-slate-850 bg-white dark:bg-slate-950 text-[11px] leading-relaxed">
                                  {day}
                                </div>
                              ))}
                            </div>
                          </div>

                          {/* Milestones & checklist */}
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2 border-t border-slate-100 dark:border-slate-850">
                            {/* Goals */}
                            <div className="space-y-3">
                              <h5 className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400">Sunday Milestone Deliverables</h5>
                              <div className="space-y-2">
                                {weekData.milestones.map((mil, midx) => (
                                  <div key={midx} className="flex items-start gap-2 text-xs">
                                    <input type="checkbox" className="mt-1 shrink-0 accent-indigo-600 rounded cursor-pointer" />
                                    <span className="text-slate-650 dark:text-slate-350">{mil}</span>
                                  </div>
                                ))}
                              </div>
                            </div>

                            {/* Resources */}
                            <div className="space-y-3">
                              <h5 className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400">Verified Study Resources</h5>
                              <div className="space-y-2">
                                {weekData.resources.map((res, ridx) => (
                                  <a 
                                    key={ridx} 
                                    href={res.url} 
                                    target="_blank" 
                                    rel="noreferrer"
                                    className="p-3 rounded-lg border border-slate-100 dark:border-slate-850 bg-white hover:bg-slate-50 dark:bg-slate-950 dark:hover:bg-slate-890 flex items-center justify-between text-xs hover:border-indigo-500/25 transition cursor-pointer"
                                  >
                                    <div className="flex items-center gap-2 min-w-0">
                                      {res.type === "Video" ? <Video className="w-4 h-4 text-rose-500 shrink-0" /> : <BookOpen className="w-4 h-4 text-indigo-500 shrink-0" />}
                                      <div className="truncate">
                                        <div className="font-bold truncate text-[11px]">{res.name}</div>
                                        <div className="text-[9px] text-slate-400 font-mono uppercase">{res.type} Resource</div>
                                      </div>
                                    </div>
                                    <ExternalLink className="w-3.5 h-3.5 text-slate-400 transition" />
                                  </a>
                                ))}
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="p-12 text-center space-y-4 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/10 min-h-[460px] flex flex-col justify-center items-center">
              <Calendar className="w-16 h-16 text-slate-300 dark:text-slate-700" />
              <div className="space-y-1">
                <h3 className="font-extrabold text-sm">Design Study Track</h3>
                <p className="text-xs text-slate-400 max-w-sm leading-relaxed mx-auto">
                  Provide your desired job targets and length to allow Gemini to parse technical roadmaps, checklist Sunday goals, and allocate educational resources.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
