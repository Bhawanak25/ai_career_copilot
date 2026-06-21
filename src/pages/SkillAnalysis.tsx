import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext.js";
import { UserSkill } from "../types/index.js";
import { 
  Compass, 
  Plus, 
  Trash2, 
  AlertCircle, 
  Sparkles, 
  Wrench, 
  CheckCircle2, 
  ArrowRight,
  RefreshCw,
  HelpCircle,
  Lightbulb
} from "lucide-react";
import { motion } from "motion/react";

interface GapReport {
  missingSkills: { name: string; importance: "High" | "Medium" | "Low"; reason: string }[];
  improvementPlan: { phase: string; steps: string[] }[];
}

export default function SkillAnalysis() {
  const { token } = useAuth();
  const [skills, setSkills] = useState<UserSkill[]>([]);
  const [skillName, setSkillName] = useState("");
  const [proficiency, setProficiency] = useState<"Beginner" | "Intermediate" | "Advanced">("Intermediate");
  
  const [targetRole, setTargetRole] = useState("");
  const [gapReport, setGapReport] = useState<GapReport | null>(null);
  const [loadingGap, setLoadingGap] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (token) {
      loadSkills();
    }
  }, [token]);

  const loadSkills = async () => {
    try {
      const res = await fetch("/api/skills", {
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setSkills(data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const addSkill = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!skillName.trim()) return;
    try {
      const res = await fetch("/api/skills", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ skillName: skillName.trim(), proficiencyLevel: proficiency })
      });
      if (res.ok) {
        setSkillName("");
        loadSkills();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const deleteSkill = async (id: string) => {
    try {
      const res = await fetch(`/api/skills/${id}`, {
        method: "DELETE",
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (res.ok) {
        setSkills(prev => prev.filter(s => s.id !== id));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const calculateGaps = async () => {
    if (!targetRole.trim()) {
      setErrorMessage("Please define your target career role.");
      return;
    }
    setErrorMessage(null);
    setLoadingGap(true);
    setGapReport(null);

    const skillsList = skills.map(s => `${s.skill_name} (${s.proficiency_level})`);

    try {
      const res = await fetch("/api/skills/gap-analysis", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ targetRole: targetRole.trim(), currentSkills: skillsList })
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to calculate skill gaps.");
      }
      setGapReport(data);
    } catch (err: any) {
      setErrorMessage(err?.message || "Failed to contact analysis server.");
    } finally {
      setLoadingGap(false);
    }
  };

  return (
    <div className="space-y-10">
      {/* View Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-extrabold pb-0.5">Skill Gap Analyzer</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Contrast your current skills ledger with requirements of top tier technology roles, receiving immediate action items.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Side: Skills Ledger */}
        <div className="lg:col-span-5 space-y-6">
          <div className="p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm space-y-6">
            <h3 className="text-sm font-bold flex items-center gap-2 font-display">
              <Wrench className="w-4.5 h-4.5 text-indigo-500" />
              My Current Skills Deck
            </h3>

            {/* Quick Skill Form inline */}
            <form onSubmit={addSkill} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-semibold text-slate-400 font-mono uppercase tracking-wider mb-2">Skill Name</label>
                  <input
                    type="text"
                    required
                    value={skillName}
                    onChange={(e) => setSkillName(e.target.value)}
                    placeholder="e.g. JavaScript, Docker"
                    className="w-full px-3 py-2.5 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:border-indigo-500 transition"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-semibold text-slate-400 font-mono uppercase tracking-wider mb-2">Proficiency</label>
                  <select
                    value={proficiency}
                    onChange={(e: any) => setProficiency(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:border-indigo-500 transition cursor-pointer"
                  >
                    <option value="Beginner">Beginner</option>
                    <option value="Intermediate">Intermediate</option>
                    <option value="Advanced">Advanced</option>
                  </select>
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-xs font-semibold rounded-lg flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                Add Skill to Ledger
              </button>
            </form>

            <div className="border-t border-slate-100 dark:border-slate-800 pt-4">
              {skills.length === 0 ? (
                <p className="text-xs text-slate-400 font-light text-center py-4">Your ledger is currently empty. Populate some skills above.</p>
              ) : (
                <div className="space-y-2 max-h-[250px] overflow-y-auto pr-1">
                  {skills.map((sk) => (
                    <div key={sk.id} className="p-3.5 rounded-xl border border-slate-100 dark:border-slate-850/40 bg-slate-50/50 dark:bg-slate-955/30 flex items-center justify-between text-xs hover:border-indigo-500/10 transition">
                      <div className="space-y-0.5 min-w-0">
                        <div className="font-bold truncate text-[11px]">{sk.skill_name}</div>
                        <div className="text-[10px] text-slate-400">Level: <span className="font-mono font-bold text-indigo-500">{sk.proficiency_level}</span></div>
                      </div>
                      <button 
                        onClick={() => deleteSkill(sk.id)}
                        className="p-1 text-slate-400 hover:text-rose-500 cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Side: Target Role Matching */}
        <div className="lg:col-span-7 space-y-6">
          <div className="p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm space-y-6">
            <h3 className="text-sm font-bold flex items-center gap-2 font-display">
              <Compass className="w-4.5 h-4.5 text-indigo-500" />
              Target Career Role
            </h3>

            <div className="flex flex-col sm:flex-row gap-4 items-end">
              <div className="flex-1 w-full">
                <label className="block text-[10px] font-semibold text-slate-400 font-mono uppercase tracking-wider mb-2">My Aspiring Role</label>
                <input
                  type="text"
                  required
                  value={targetRole}
                  onChange={(e) => setTargetRole(e.target.value)}
                  placeholder="e.g. Software Engineer, Data Scientist, UX Designer"
                  className="w-full px-4 py-3 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:border-indigo-500 transition"
                />
              </div>
              <button
                onClick={calculateGaps}
                disabled={loadingGap}
                className="w-full sm:w-auto px-5 py-3 bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-800 text-white rounded-lg text-xs font-semibold shadow-lg hover:shadow-indigo-500/10 flex items-center justify-center gap-1.5 whitespace-nowrap shrink-0 cursor-pointer"
              >
                {loadingGap ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    Analyzing gaps...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                    Match Gaps via AI
                  </>
                )}
              </button>
            </div>

            {errorMessage && (
              <div className="p-3.5 bg-rose-500/10 border border-rose-500/30 text-rose-600 dark:text-rose-400 rounded-xl text-xs flex items-center gap-2">
                <AlertCircle className="w-4.5 h-4.5 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}
          </div>

          {/* GAP Analysis Report Results */}
          {loadingGap ? (
            <div className="p-12 text-center space-y-6 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 bg-slate-50/20 dark:bg-slate-950/10 min-h-[300px] flex flex-col justify-center items-center">
              <RefreshCw className="w-10 h-10 text-indigo-500 animate-spin" />
              <div className="space-y-1">
                <h3 className="font-bold text-base">Reconciling Skills...</h3>
                <p className="text-xs text-slate-400 max-w-sm mx-auto leading-relaxed">
                  Comparing current skills against corporate talent profiles. This will formulate localized learning steps.
                </p>
              </div>
            </div>
          ) : gapReport ? (
            <div className="space-y-6">
              {/* Gaps listing */}
              <div className="p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm space-y-4">
                <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-400">Missing Core Competencies</h3>
                
                {gapReport.missingSkills.length === 0 ? (
                  <p className="text-xs text-emerald-500 font-semibold flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4" />
                    Amazing! No gaps parsed for user against {targetRole}!
                  </p>
                ) : (
                  <div className="space-y-3 pt-1">
                    {gapReport.missingSkills.map((sk, idx) => (
                      <div key={idx} className="p-4 rounded-xl border border-slate-100 dark:border-slate-850/50 bg-slate-50/50 dark:bg-slate-950/20 space-y-1.5 text-xs">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-sm text-slate-800 dark:text-slate-100">{sk.name}</span>
                          <span className={`px-2 py-0.5 rounded text-[9px] font-mono font-bold uppercase tracking-wider shrink-0 ${
                            sk.importance === "High" 
                              ? "bg-rose-500/10 text-rose-500 border border-rose-500/20" 
                              : sk.importance === "Medium"
                                ? "bg-amber-500/10 text-amber-500 border border-amber-500/15"
                                : "bg-slate-400/10 text-slate-400 border border-slate-400/15"
                          }`}>
                            {sk.importance} Importance
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 font-light leading-relaxed">{sk.reason}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Improvements Plan Roadmap-intro */}
              <div className="p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm space-y-4">
                <div className="flex items-center gap-1.5">
                  <Lightbulb className="w-4 h-4 text-indigo-500" />
                  <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-400">Tactical Improvement Steps</h3>
                </div>

                <div className="space-y-4 pt-1">
                  {gapReport.improvementPlan.map((plan, idx) => (
                    <div key={idx} className="space-y-2">
                      <div className="text-[11px] font-mono font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wide">{plan.phase}</div>
                      <div className="space-y-1.5 pl-3">
                        {plan.steps.map((st, sidx) => (
                          <div key={sidx} className="flex items-start gap-2 text-xs text-slate-600 dark:text-slate-300">
                            <span className="text-indigo-500 font-bold shrink-0">✓</span>
                            <span>{st}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="p-12 text-center space-y-4 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/10 min-h-[300px] flex flex-col justify-center items-center">
              <Wrench className="w-16 h-16 text-slate-300 dark:text-slate-700" />
              <div className="space-y-1">
                <h3 className="font-extrabold text-sm">Dissect System Gaps</h3>
                <p className="text-xs text-slate-400 max-w-sm leading-relaxed mx-auto">
                  Type of your target career position (e.g. Software Engineer) and click "Match Gaps" to automatically compare your skills with premium recruiters parameters.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
