import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext.js";
import { InterviewSession } from "../types/index.js";
import { 
  Award, 
  Sparkles, 
  MessageSquare, 
  Trash2, 
  CheckCircle2, 
  Play, 
  ArrowRight,
  TrendingUp,
  Brain,
  HelpCircle,
  Clock,
  RefreshCw,
  AlertCircle
} from "lucide-react";
import { motion } from "motion/react";

interface QuestionItem {
  question: string;
  category: "Technical" | "Behavioral" | "HR";
}

export default function InterviewPrep() {
  const { token } = useAuth();
  const [targetRole, setTargetRole] = useState("Software Engineer");
  const [category, setCategory] = useState<"Technical" | "Behavioral" | "HR">("Technical");
  
  const [questions, setQuestions] = useState<QuestionItem[]>([]);
  const [activeQuestionIdx, setActiveQuestionIdx] = useState<number | null>(null);
  const [userAnswer, setUserAnswer] = useState("");
  
  const [loadingQuestions, setLoadingQuestions] = useState(false);
  const [evaluating, setEvaluating] = useState(false);
  const [evaluationResult, setEvaluationResult] = useState<InterviewSession | null>(null);
  const [history, setHistory] = useState<InterviewSession[]>([]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (token) {
      loadHistory();
    }
  }, [token]);

  const loadHistory = async () => {
    try {
      const res = await fetch("/api/interview/history", {
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setHistory(data.reverse());
      }
    } catch (err) {
      console.error(err);
    }
  };

  const generateQuestions = async () => {
    if (!targetRole.trim()) {
      setErrorMessage("Please input your target role.");
      return;
    }
    setErrorMessage(null);
    setLoadingQuestions(true);
    setQuestions([]);
    setActiveQuestionIdx(null);
    setEvaluationResult(null);

    try {
      const res = await fetch("/api/interview/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ category, targetRole: targetRole.trim() })
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to draft interview questions.");
      }
      setQuestions(data.questions || []);
      if (data.questions && data.questions.length > 0) {
        setActiveQuestionIdx(0);
        setUserAnswer("");
      }
    } catch (err: any) {
      setErrorMessage(err?.message || "Failed to generate interview cards.");
    } finally {
      setLoadingQuestions(false);
    }
  };

  const submitAnswer = async () => {
    if (activeQuestionIdx === null || !questions[activeQuestionIdx]) return;
    if (!userAnswer.trim()) {
      setErrorMessage("Please write down your answer before submitting.");
      return;
    }

    setErrorMessage(null);
    setEvaluating(true);
    setEvaluationResult(null);

    try {
      const currentQ = questions[activeQuestionIdx].question;
      const res = await fetch("/api/interview/evaluate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          question: currentQ,
          answer: userAnswer.trim(),
          category: category
        })
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Session evaluation failed.");
      }
      setEvaluationResult(data.result);
      // Reload overall lists
      loadHistory();
    } catch (err: any) {
      setErrorMessage(err?.message || "Grade submission error. Please try again.");
    } finally {
      setEvaluating(false);
    }
  };

  const clearAllHistory = async () => {
    if (!window.confirm("Are you sure you want to delete your entire graded interview history?")) {
      return;
    }
    try {
      const res = await fetch("/api/interview/history", {
        method: "DELETE",
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (res.ok) {
        setHistory([]);
        setEvaluationResult(null);
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-10">
      {/* View Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-extrabold pb-0.5">AI Interview Coach</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Rehearse key technical, behavioral, and HR questions designed for your target industry, evaluated instantly by professional guidelines.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Config Column */}
        <div className="lg:col-span-4 space-y-6">
          <div className="p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm space-y-6">
            <h3 className="text-sm font-bold flex items-center gap-2 font-display">
              <Brain className="w-4.5 h-4.5 text-indigo-500" />
              Configure Interview Round
            </h3>

            <div>
              <label className="block text-[10px] font-semibold text-slate-400 font-mono uppercase tracking-wider mb-2">Target Role</label>
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
              <label className="block text-[10px] font-semibold text-slate-400 font-mono uppercase tracking-wider mb-2">Interview Category</label>
              <div className="grid grid-cols-3 gap-2">
                {(["Technical", "Behavioral", "HR"] as const).map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setCategory(cat)}
                    className={`py-2 px-1 text-xs font-semibold rounded-lg border cursor-pointer transition capitalize ${
                      category === cat
                        ? "bg-indigo-600/10 border-indigo-500 text-indigo-600 dark:text-indigo-400 font-bold"
                        : "border-slate-200 dark:border-slate-800 hover:border-slate-300 text-slate-500 hover:text-slate-700"
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={generateQuestions}
              disabled={loadingQuestions}
              className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-800 text-white rounded-xl text-xs font-semibold shadow-lg hover:shadow-indigo-500/10 flex items-center justify-center gap-1.5 cursor-pointer"
            >
              {loadingQuestions ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  Generating deck...
                </>
              ) : (
                <>
                  <Play className="w-3.5 h-3.5 fill-current" />
                  Initiate AI Session
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

          {/* Past sessions sidebar deck */}
          <div className="p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xs font-bold font-mono tracking-wider uppercase text-slate-400">Past Graded Answers</h3>
              {history.length > 0 && (
                <button 
                  onClick={clearAllHistory}
                  className="text-xs text-rose-500 hover:text-rose-400 flex items-center gap-0.5 cursor-pointer"
                >
                  <Trash2 className="w-3 h-3" />
                  Clear all
                </button>
              )}
            </div>

            {history.length === 0 ? (
              <p className="text-xs text-slate-400 font-light text-center py-4">Rehearse some answers to construct your portfolio index.</p>
            ) : (
              <div className="space-y-2.5 max-h-[300px] overflow-y-auto pr-1">
                {history.map((hist) => (
                  <div 
                    key={hist.id} 
                    className="p-3 rounded-xl border border-slate-100 dark:border-slate-850/50 bg-slate-50/50 dark:bg-slate-950/20 text-xs space-y-1 cursor-pointer hover:border-indigo-500/10"
                    onClick={() => {
                      // Simulates pulling up past record details in main dashboard
                      setEvaluationResult(hist);
                    }}
                  >
                    <div className="flex items-center justify-between">
                      <span className="px-1.5 py-0.5 rounded bg-indigo-500/10 text-indigo-500 text-[9px] font-mono font-bold leading-none shrink-0">{hist.category}</span>
                      <span className="font-mono font-bold text-slate-700 dark:text-slate-300">Grade: <span className="text-indigo-500">{hist.score}%</span></span>
                    </div>
                    <p className="font-semibold text-[11px] truncate">{hist.question}</p>
                    <p className="text-[10px] text-slate-400 font-mono">Date: {new Date(hist.created_at).toLocaleDateString()}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Answering/Feedback stage */}
        <div className="lg:col-span-8">
          {loadingQuestions ? (
            <div className="p-12 text-center space-y-6 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 bg-slate-50/20 dark:bg-slate-950/10 min-h-[440px] flex flex-col justify-center items-center">
              <RefreshCw className="w-10 h-10 text-indigo-500 animate-spin" />
              <div className="space-y-1">
                <h3 className="font-bold text-base leading-none">Scaffolding Scenarios...</h3>
                <p className="text-xs text-slate-400 max-w-sm mx-auto leading-relaxed">
                  Gemini AI is analyzing core parameters of modern technical roles to pull four dynamic and challenging scenario interview cards.
                </p>
              </div>
            </div>
          ) : activeQuestionIdx !== null && questions[activeQuestionIdx] ? (
            <div className="space-y-6">
              {/* Question card */}
              <div className="p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm space-y-4">
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-0.5 rounded-full bg-indigo-600/10 text-indigo-600 dark:text-indigo-400 border border-indigo-200/20 dark:border-indigo-900/40 text-[10px] font-mono uppercase tracking-wider font-bold">
                    Question {activeQuestionIdx + 1} of {questions.length} • {questions[activeQuestionIdx].category}
                  </span>
                  
                  {/* Selector circles */}
                  <div className="flex gap-1.5">
                    {questions.map((_, idx) => (
                      <button
                        key={idx}
                        onClick={() => {
                          setActiveQuestionIdx(idx);
                          setUserAnswer("");
                          setEvaluationResult(null);
                        }}
                        className={`w-5 h-5 rounded-full text-[10px] font-mono flex items-center justify-center border cursor-pointer ${
                          activeQuestionIdx === idx
                            ? "bg-indigo-600 border-indigo-600 text-white font-bold"
                            : "bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-500 hover:border-slate-350"
                        }`}
                      >
                        {idx + 1}
                      </button>
                    ))}
                  </div>
                </div>

                <blockquote className="text-base font-extrabold sm:text-lg border-l-4 border-indigo-600 pl-4 py-1 leading-snug">
                  "{questions[activeQuestionIdx].question}"
                </blockquote>
              </div>

              {/* Input section & analysis response side-by-side or stacked */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-stretch">
                {/* Answering text board */}
                <div className="md:col-span-7 flex flex-col justify-between p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm space-y-4">
                  <div className="space-y-2 flex-1 flex flex-col">
                    <label className="block text-xs font-semibold text-slate-400 font-mono uppercase tracking-wider">Type Your Answer</label>
                    <p className="text-[10px] text-slate-400 leading-none">Draft your verbal or conceptual solution clearly (aim for 2-4 sentences):</p>
                    <textarea
                      rows={6}
                      value={userAnswer}
                      onChange={(e) => setUserAnswer(e.target.value)}
                      placeholder="e.g. Under React, functional hooks are rendered sequentially. I state state variables inside functional bounds..."
                      className="w-full flex-1 p-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 text-xs focus:ring-1 focus:ring-indigo-500 focus:outline-none focus:border-indigo-500 transition font-sans leading-relaxed"
                    />
                  </div>

                  <button
                    id="submit-evaluate-btn"
                    onClick={submitAnswer}
                    disabled={evaluating}
                    className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-800 text-white rounded-xl text-xs font-semibold shadow-lg hover:shadow-indigo-500/20 flex items-center justify-center gap-1.5 cursor-pointer mt-2"
                  >
                    {evaluating ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        Analyzing spelling, STAR layouts & concepts...
                      </>
                    ) : (
                      <>
                        <Award className="w-4.5 h-4.5 text-amber-300" />
                        Grade My Answer
                      </>
                    )}
                  </button>
                </div>

                {/* Score analysis panel */}
                <div className="md:col-span-5 flex flex-col">
                  {evaluating ? (
                    <div className="flex-1 p-6 text-center space-y-4 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 bg-slate-50/20 dark:bg-slate-950/10 flex flex-col justify-center items-center">
                      <RefreshCw className="w-8 h-8 text-indigo-500 animate-spin" />
                      <div className="space-y-1">
                        <h4 className="font-semibold text-sm">Evaluating Syntax...</h4>
                        <p className="text-[11px] text-slate-400 max-w-xs leading-none">Applying recruiter evaluation frameworks.</p>
                      </div>
                    </div>
                  ) : evaluationResult ? (
                    <div className="flex-1 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm flex flex-col justify-between space-y-4">
                      <div className="space-y-3">
                        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                          <span className="text-xs font-mono font-bold uppercase tracking-wider text-slate-400">AI Evaluation Report</span>
                          <span className="text-sm font-black font-mono text-indigo-500">{evaluationResult.score}% Accord</span>
                        </div>

                        {/* Custom visual progress bar */}
                        <div className="h-2 bg-slate-100 dark:bg-slate-950 rounded-full overflow-hidden mt-1">
                          <div className="h-full bg-indigo-600 rounded-full" style={{ width: `${evaluationResult.score}%` }} />
                        </div>

                        <div className="space-y-1.5">
                          <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400">Constructive Feedback</span>
                          <p className="text-[11px] text-slate-650 dark:text-slate-350 leading-relaxed max-h-[140px] overflow-y-auto pr-1">{evaluationResult.feedback}</p>
                        </div>
                      </div>

                      <div className="p-3 rounded-lg bg-emerald-500/[0.04] border border-emerald-500/10 text-[10px] text-emerald-600 dark:text-emerald-400 font-mono capitalize text-center">
                        ✓ Report logged to past portfolio indexes!
                      </div>
                    </div>
                  ) : (
                    <div className="flex-1 p-6 text-center space-y-4 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 bg-slate-50/20 dark:bg-slate-950/10 flex flex-col justify-center items-center">
                      <Award className="w-10 h-10 text-slate-300 dark:text-slate-700" />
                      <div className="space-y-1">
                        <span className="font-extrabold text-xs">Review Outcome</span>
                        <p className="text-[10px] text-slate-400 max-w-sm leading-snug">Draft an answer in the text panel and trigger evaluate. Graded logs output here instantly.</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="p-12 text-center space-y-4 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/10 min-h-[440px] flex flex-col justify-center items-center">
              <Award className="w-16 h-16 text-slate-300 dark:text-slate-700" />
              <div className="space-y-1">
                <h3 className="font-extrabold text-sm">Interactive AI Interview Stage</h3>
                <p className="text-xs text-slate-400 max-w-sm leading-relaxed mx-auto">
                  Type of your target role and select category on the sidebar config. Click "Initiate AI Session" to summon realistic job simulation questions instantly.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
