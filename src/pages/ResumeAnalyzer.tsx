import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext.js";
import { Resume } from "../types/index.js";
import { 
  Upload, 
  FileText, 
  Sparkles, 
  CheckCircle2, 
  AlertCircle, 
  Trash2, 
  BookOpen, 
  RefreshCw,
  HelpCircle,
  FileCheck2
} from "lucide-react";
import { motion } from "motion/react";

export default function ResumeAnalyzer() {
  const { token } = useAuth();
  const [activeTab, setActiveTab] = useState<"upload" | "paste">("upload");
  const [resumeText, setResumeText] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [report, setReport] = useState<Resume | null>(null);
  const [history, setHistory] = useState<Resume[]>([]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (token) {
      loadHistory();
    }
  }, [token]);

  const loadHistory = async () => {
    try {
      const res = await fetch("/api/resume/history", {
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setHistory(data.reverse());
      }
    } catch (err) {
      console.error("Failed to load resume reports history:", err);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (file.type === "application/pdf" || file.name.endsWith(".pdf") || file.name.endsWith(".txt")) {
        setSelectedFile(file);
        setErrorMessage(null);
      } else {
        setErrorMessage("Please drop a valid PDF or plain text resume file.");
      }
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      setErrorMessage(null);
    }
  };

  // Convert files to base64 string
  const getBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        const result = reader.result as string;
        // Strip the mime scheme prefix
        const base64 = result.split(",")[1];
        resolve(base64);
      };
      reader.onerror = (err) => reject(err);
    });
  };

  const executeAnalysis = async () => {
    if (activeTab === "paste" && !resumeText.trim()) {
      setErrorMessage("Please input your resume text first.");
      return;
    }
    if (activeTab === "upload" && !selectedFile) {
      setErrorMessage("Please drag and drop or upload a document file.");
      return;
    }

    setErrorMessage(null);
    setAnalyzing(true);
    setReport(null);

    try {
      let payload: any = {
        resumeText: activeTab === "paste" ? resumeText : "",
      };

      if (activeTab === "upload" && selectedFile) {
        const base64Str = await getBase64(selectedFile);
        payload.fileBase64 = base64Str;
        payload.fileName = selectedFile.name;
        // fallback mime type
        payload.mimeType = selectedFile.type || "application/pdf";
      }

      const res = await fetch("/api/resume/analyze", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to finalize analysis session.");
      }
      setReport(data.report);
      // Reload overall list
      loadHistory();
    } catch (err: any) {
      setErrorMessage(err?.message || "Internal error grading resume. Try smaller pastes.");
    } finally {
      setAnalyzing(false);
    }
  };

  const deleteReport = async (id: string) => {
    try {
      const res = await fetch(`/api/resume/${id}`, {
        method: "DELETE",
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (res.ok) {
        setHistory(prev => prev.filter(r => r.id !== id));
        if (report && report.id === id) {
          setReport(null);
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-10">
      {/* View Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-extrabold pb-0.5">Resume Analyzer & ATS Scorer</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Optimize your technical credentials, resolve grammar/layout problems, and discover missing target role keywords.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Input panel */}
        <div className="lg:col-span-5 space-y-6">
          <div className="p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm space-y-6">
            <div className="flex bg-slate-100 dark:bg-slate-950 p-1.5 rounded-xl border border-slate-200/50 dark:border-slate-800/40">
              <button
                onClick={() => { setActiveTab("upload"); setErrorMessage(null); }}
                className={`flex-1 py-2 text-xs font-semibold rounded-lg transition duration-150 cursor-pointer ${
                  activeTab === "upload" 
                    ? "bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm border border-slate-200/30" 
                    : "text-slate-500 hover:text-slate-700"
                }`}
              >
                Upload Document
              </button>
              <button
                onClick={() => { setActiveTab("paste"); setErrorMessage(null); }}
                className={`flex-1 py-2 text-xs font-semibold rounded-lg transition duration-150 cursor-pointer ${
                  activeTab === "paste" 
                    ? "bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm border border-slate-200/30" 
                    : "text-slate-500 hover:text-slate-700"
                }`}
              >
                Paste Plain Text
              </button>
            </div>

            {errorMessage && (
              <div id="analyzer-error" className="p-3.5 bg-rose-500/10 border border-rose-500/30 text-rose-600 dark:text-rose-400 rounded-xl text-xs flex items-center gap-2">
                <AlertCircle className="w-4.5 h-4.5 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            {activeTab === "upload" ? (
              <div
                onDragEnter={handleDrag}
                onDragOver={handleDrag}
                onDragLeave={handleDrag}
                onDrop={handleDrop}
                className={`border-2 border-dashed rounded-xl p-8 text-center transition cursor-pointer flex flex-col items-center justify-center min-h-[220px] relative ${
                  dragActive 
                    ? "border-indigo-600 bg-indigo-500/[0.04]" 
                    : "border-slate-200 dark:border-slate-800 hover:border-indigo-500/40 bg-slate-50/50 dark:bg-slate-950/20"
                }`}
              >
                <input
                  type="file"
                  id="resume-file-input"
                  accept=".pdf"
                  onChange={handleFileChange}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                />
                
                <div className="space-y-4">
                  <div className="p-3 bg-indigo-500/15 text-indigo-600 rounded-xl w-max mx-auto border border-indigo-500/10">
                    <Upload className="w-6 h-6" />
                  </div>
                  <div>
                    {selectedFile ? (
                      <div className="space-y-1">
                        <p className="text-sm font-bold text-slate-800 dark:text-slate-200">{selectedFile.name}</p>
                        <p className="text-[11px] text-indigo-500">{(selectedFile.size / 1024 / 1024).toFixed(2)} MB • File selected</p>
                      </div>
                    ) : (
                      <div className="space-y-1.5">
                        <p className="text-sm font-bold text-slate-800 dark:text-slate-200">Drag & Drop Resume PDF</p>
                        <p className="text-xs text-slate-400">or click to browse local folders</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                <label className="block text-xs font-semibold text-slate-500 font-mono uppercase tracking-wider">Raw Resume Text</label>
                <textarea
                  rows={9}
                  value={resumeText}
                  onChange={(e) => setResumeText(e.target.value)}
                  placeholder="Paste complete copy of your layout fields, experience, achievements, and contacts..."
                  className="w-full p-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 text-xs focus:ring-1 focus:ring-indigo-500 focus:outline-none focus:border-indigo-500 transition font-mono"
                />
              </div>
            )}

            <button
              id="analyze-run-btn"
              onClick={executeAnalysis}
              disabled={analyzing}
              className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-800 text-white rounded-xl text-xs font-semibold shadow-lg hover:shadow-indigo-500/20 flex items-center justify-center gap-2 cursor-pointer"
            >
              {analyzing ? (
                <>
                  <RefreshCw className="w-4.5 h-4.5 animate-spin" />
                  Aligning ATS algorithms...
                </>
              ) : (
                <>
                  <Sparkles className="w-4.5 h-4.5 text-amber-300" />
                  Grade Resume Now
                </>
              )}
            </button>
          </div>

          {/* Past Scans History Ledger */}
          <div className="p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
            <h3 className="text-sm font-bold mb-4 font-display">Past ATS Reviews</h3>
            {history.length === 0 ? (
              <p className="text-xs text-slate-400 font-light text-center py-4">No reviews stored yet.</p>
            ) : (
              <div className="space-y-3 max-h-[220px] overflow-y-auto pr-1">
                {history.map((hReport) => (
                  <div 
                    key={hReport.id} 
                    className="p-3 rounded-xl border border-slate-100 dark:border-slate-850/50 bg-slate-50/50 dark:bg-slate-950/20 flex items-center justify-between text-xs cursor-pointer hover:border-indigo-500/20"
                    onClick={() => setReport(hReport)}
                  >
                    <div className="space-y-0.5 truncate pr-2">
                      <div className="font-bold truncate text-[11px]">{hReport.uploaded_file_name}</div>
                      <div className="text-[10px] text-slate-400">Score: <span className="font-mono font-bold text-indigo-500">{hReport.ats_score}%</span></div>
                    </div>
                    <button 
                      onClick={(e) => { e.stopPropagation(); deleteReport(hReport.id); }}
                      className="p-1 px-1.5 text-slate-400 hover:text-rose-500 transition cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Output reports panel */}
        <div className="lg:col-span-7">
          {analyzing ? (
            <div className="p-12 text-center space-y-6 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 bg-slate-50/20 dark:bg-slate-950/10 min-h-[400px] flex flex-col justify-center items-center">
              <div className="relative">
                <div className="absolute top-0 left-0 w-full h-full border-4 border-indigo-600/10 rounded-full" />
                <div className="w-14 h-14 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
              </div>
              <div className="space-y-2">
                <h3 className="font-bold text-base leading-none">Drafting Critique...</h3>
                <p className="text-xs text-slate-400 max-w-sm leading-relaxed">
                  Gemini AI is currently examining document syntax blocks, verifying styling schemas, and parsing keywords against corporate ATS filters.
                </p>
              </div>
            </div>
          ) : report ? (
            <div className="space-y-6">
              {/* Score banner */}
              <div className="p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm flex flex-col sm:flex-row items-center gap-6">
                {/* Radial metric */}
                <div className="relative shrink-0 flex items-center justify-center">
                  <svg className="w-24 h-24 transform -rotate-90">
                    <circle cx="48" cy="48" r="40" strokeWidth="6" stroke="currentColor" fill="transparent" className="text-slate-100 dark:text-slate-850" />
                    <circle cx="48" cy="48" r="40" strokeWidth="6" stroke="currentColor" fill="transparent" 
                      className={report.ats_score >= 80 ? "text-emerald-500" : "text-amber-500"} 
                      strokeDasharray={2 * Math.PI * 40} 
                      strokeDashoffset={2 * Math.PI * 40 * (1 - report.ats_score / 100)} 
                      strokeLinecap="round" />
                  </svg>
                  <span className="absolute text-xl font-black font-mono">{report.ats_score}%</span>
                </div>

                <div className="space-y-2 text-center sm:text-left">
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 text-[10px] font-mono tracking-wider font-semibold">
                    <FileCheck2 className="w-3.5 h-3.5" />
                    ATS STANDARDS REPORT
                  </div>
                  <h3 className="font-extrabold text-base">Score: {report.ats_score >= 80 ? "Excellent Match!" : "Needs Quick Tuning"}</h3>
                  <p className="text-xs text-slate-500 leading-relaxed dark:text-slate-400">{report.feedback_summary}</p>
                </div>
              </div>

              {/* Suggestions grid columns */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* STRENGTHS */}
                <div className="p-5 rounded-2xl border border-emerald-500/10 bg-emerald-500/[0.02] space-y-3">
                  <h4 className="text-xs font-bold font-mono tracking-wider text-emerald-500 uppercase">Aesthetic Strengths</h4>
                  
                  {report.strengths.length === 0 ? (
                    <p className="text-xs text-slate-400">Stable attributes are N/A.</p>
                  ) : (
                    <ul className="space-y-1.5 text-xs">
                      {report.strengths.map((str, idx) => (
                        <li key={idx} className="flex items-start gap-2 text-[11px] text-slate-600 dark:text-slate-300">
                          <span className="text-emerald-500 shrink-0">•</span>
                          <span>{str}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>

                {/* WEAKNESSES */}
                <div className="p-5 rounded-2xl border border-rose-500/10 bg-rose-500/[0.02] space-y-3">
                  <h4 className="text-xs font-bold font-mono tracking-wider text-rose-500 uppercase">Primary Gaps</h4>
                  
                  {report.weaknesses.length === 0 ? (
                    <p className="text-xs text-slate-400">Gaps not identified.</p>
                  ) : (
                    <ul className="space-y-1.5 text-xs">
                      {report.weaknesses.map((wk, idx) => (
                        <li key={idx} className="flex items-start gap-2 text-[11px] text-slate-600 dark:text-slate-300">
                          <span className="text-rose-500 shrink-0">•</span>
                          <span>{wk}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>

              {/* Missing keywords & detailed feedback layout */}
              <div className="p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm space-y-6">
                {/* Missing Keywords Box */}
                <div className="space-y-3">
                  <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-400">Urgent Missing Keywords</h3>
                  {report.missing_keywords.length === 0 ? (
                    <p className="text-xs text-emerald-500 font-semibold">Perfect alignment! All mandatory skill tags detected.</p>
                  ) : (
                    <div className="flex flex-wrap gap-2 pt-1">
                      {report.missing_keywords.map((kw, idx) => (
                        <span 
                          key={idx} 
                          className="px-2.5 py-1 rounded bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 border border-indigo-100/50 dark:border-indigo-900/45 text-[11px] font-mono font-medium"
                        >
                          + {kw}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Grammar checks */}
                <div className="space-y-3 pt-2">
                  <div className="flex items-center gap-1.5">
                    <BookOpen className="w-4 h-4 text-indigo-500" />
                    <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-400">Phrasings & Grammatics Review</h3>
                  </div>
                  {report.grammar_analysis.length === 0 ? (
                    <p className="text-xs text-slate-500">Perfect grammar checks!</p>
                  ) : (
                    <ul className="space-y-1 text-xs text-slate-600 dark:text-slate-300">
                      {report.grammar_analysis.map((gm, idx) => (
                        <li key={idx} className="list-disc pl-1.5 ml-4 leading-relaxed text-[11px]">{gm}</li>
                      ))}
                    </ul>
                  )}
                </div>

                {/* Formatting Suggestions */}
                <div className="space-y-3 pt-2">
                  <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-400">Layout & Hierarchy Tweaks</h3>
                  {report.formatting_suggestions.length === 0 ? (
                    <p className="text-xs text-slate-500">Excellent structural hierarchy.</p>
                  ) : (
                    <ul className="space-y-1 text-xs text-slate-600 dark:text-slate-300">
                      {report.formatting_suggestions.map((fm, idx) => (
                        <li key={idx} className="list-disc pl-1.5 ml-4 leading-relaxed text-[11px]">{fm}</li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="p-12 text-center space-y-4 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/10 min-h-[400px] flex flex-col justify-center items-center">
              <FileCheck2 className="w-16 h-16 text-slate-300 dark:text-slate-700" />
              <div className="space-y-1">
                <h3 className="font-extrabold text-sm">Review Report Deck</h3>
                <p className="text-xs text-slate-400 max-w-sm leading-relaxed">
                  Upload your professional PDF resume document or drop a copy-paste text block. Click "Grade Resume" to fetch direct feedback.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
