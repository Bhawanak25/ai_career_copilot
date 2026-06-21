import React, { useState } from "react";
import { useAuth } from "../context/AuthContext.js";
import { Sparkles, Mail, Lock, User, AlertCircle, ArrowRight } from "lucide-react";

interface SignupProps {
  onNavigate: (page: string) => void;
}

export default function Signup({ onNavigate }: SignupProps) {
  const { register } = useAuth();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName || !email || !password) {
      setError("Please fill out all the fields.");
      return;
    }
    if (password.length < 6) {
      setError("Password must consist of at least 6 characters.");
      return;
    }
    setError(null);
    setSubmitting(true);
    try {
      await register(fullName, email, password);
      onNavigate("dashboard");
    } catch (err: any) {
      setError(err?.message || "Failed to create an account. Please investigate.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center py-16 px-6 relative overflow-hidden">
      {/* Background glow flares */}
      <div className="absolute top-[-20%] left-[-20%] w-[50%] h-[50%] rounded-full bg-indigo-500/10 blur-[130px]" />
      <div className="absolute bottom-[-20%] right-[-20%] w-[50%] h-[50%] rounded-full bg-violet-500/10 blur-[130px]" />

      <div className="w-full max-w-md relative z-10">
        {/* Brand Header */}
        <div className="text-center mb-8 cursor-pointer" onClick={() => onNavigate("landing")}>
          <div className="inline-flex p-3 rounded-2xl bg-indigo-600/10 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-200/50 dark:border-indigo-900/30 mb-4 shadow-sm">
            <Sparkles className="w-6 h-6" />
          </div>
          <h2 className="text-3xl font-bold tracking-tight mb-2">Create Account</h2>
          <p className="text-slate-500 dark:text-slate-400 text-sm">Join over 5,000+ candidates optimizing career trajectories</p>
        </div>

        {/* Signup form Card */}
        <div className="p-8 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-900/60 backdrop-blur-xl shadow-xl">
          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div id="signup-error" className="p-3 bg-rose-500/10 border border-rose-500/30 text-rose-600 dark:text-rose-400 rounded-xl text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-2 font-mono uppercase tracking-wider">Full Name</label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 block"><User className="w-4 h-4" /></span>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Jane Student"
                  className="w-full pl-11 pr-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-sm text-slate-900 dark:text-slate-100 focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 focus:outline-none transition"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-2 font-mono uppercase tracking-wider">Email Address</label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 block"><Mail className="w-4 h-4" /></span>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="copilot@university.edu"
                  className="w-full pl-11 pr-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-sm text-slate-900 dark:text-slate-100 focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 focus:outline-none transition"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-2 font-mono uppercase tracking-wider">Password</label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 block"><Lock className="w-4 h-4" /></span>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="•••••••• (Min 6 chars)"
                  className="w-full pl-11 pr-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-sm text-slate-900 dark:text-slate-100 focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 focus:outline-none transition"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-700 text-white rounded-xl font-medium shadow-lg hover:shadow-indigo-500/20 text-sm flex items-center justify-center gap-2 transition duration-200 cursor-pointer p-2"
            >
              {submitting ? "Creating Profile..." : "Create Free Account"}
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        </div>

        {/* Footer Toggle */}
        <div className="text-center mt-8">
          <p className="text-slate-500 dark:text-slate-400 text-xs">
            Already have an AI Career Copilot account?{" "}
            <button
              onClick={() => onNavigate("login")}
              className="text-indigo-500 hover:text-indigo-400 hover:underline font-semibold cursor-pointer"
            >
              Sign In
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
