import React, { useState } from "react";
import { useAuth } from "../context/AuthContext.js";
import { Sparkles, Mail, Lock, AlertCircle, ArrowRight } from "lucide-react";

interface LoginProps {
  onNavigate: (page: string) => void;
}

export default function Login({ onNavigate }: LoginProps) {
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [showForgot, setShowForgot] = useState(false);
  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotSuccess, setForgotSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError("Please fill out all required credentials.");
      return;
    }
    setError(null);
    setSubmitting(true);
    try {
      await login(email, password);
      onNavigate("dashboard");
    } catch (err: any) {
      setError(err?.message || "Invalid credentials. Please inspect and retry.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleForgotSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!forgotEmail) return;
    setForgotSuccess(true);
    setTimeout(() => {
      setForgotSuccess(false);
      setShowForgot(false);
      setForgotEmail("");
    }, 4500);
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
          <h2 className="text-3xl font-bold tracking-tight mb-2">Welcome Back</h2>
          <p className="text-slate-500 dark:text-slate-400 text-sm">Empower your career searches with custom engineering</p>
        </div>

        {/* Auth form Card */}
        <div className="p-8 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-900/60 backdrop-blur-xl shadow-xl">
          {showForgot ? (
            <form onSubmit={handleForgotSubmit} className="space-y-5">
              <h3 className="text-lg font-bold">Reset Password</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                Enter your registered student email address. AI Career Copilot will dispatch full reset instructions in seconds.
              </p>
              
              {forgotSuccess ? (
                <div id="forgot-success-text" className="p-3 bg-emerald-500/15 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 rounded-lg text-xs flex items-center gap-2">
                  <Sparkles className="w-4 h-4 shrink-0" />
                  Reset instructions dispatched to your mailbox! Check spam folder if delayed.
                </div>
              ) : null}

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2 font-mono uppercase tracking-wider">Email Address</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 block"><Mail className="w-4 h-4" /></span>
                  <input
                    type="email"
                    required
                    value={forgotEmail}
                    onChange={(e) => setForgotEmail(e.target.value)}
                    placeholder="student@university.edu"
                    className="w-full pl-10 pr-4 py-3 rounded-lg bg-slate-100 dark:bg-slate-950 border border-slate-300 dark:border-slate-850 text-sm focus:border-indigo-500 dark:focus:border-indigo-500 focus:outline-none transition"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between gap-4 pt-2">
                <button
                  type="button"
                  onClick={() => setShowForgot(false)}
                  className="text-xs text-slate-500 hover:text-indigo-500 cursor-pointer"
                >
                  Cancel and go back
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-indigo-600 text-white rounded-lg text-xs font-semibold hover:bg-indigo-500 transition cursor-pointer"
                >
                  Dispatch instructions
                </button>
              </div>
            </form>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <div id="auth-error-block" className="p-3.5 bg-rose-500/10 border border-rose-500/30 text-rose-600 dark:text-rose-400 rounded-xl text-xs flex items-center gap-2.5">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

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
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 font-mono uppercase tracking-wider">Password</label>
                  <button
                    type="button"
                    onClick={() => setShowForgot(true)}
                    className="text-xs text-indigo-500 hover:text-indigo-400 hover:underline cursor-pointer"
                  >
                    Forgot Password?
                  </button>
                </div>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 block"><Lock className="w-4 h-4" /></span>
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-11 pr-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-sm text-slate-900 dark:text-slate-100 focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 focus:outline-none transition"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-700 text-white rounded-xl font-medium shadow-lg hover:shadow-indigo-500/20 text-sm flex items-center justify-center gap-2 transition duration-150 cursor-pointer"
              >
                {submitting ? "Authenticating Session..." : "Sign In to Copilot"}
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          )}
        </div>

        {/* Footer Toggle */}
        <div className="text-center mt-8">
          <p className="text-slate-500 dark:text-slate-400 text-xs">
            Don't have an AI Career Copilot account?{" "}
            <button
              onClick={() => onNavigate("signup")}
              className="text-indigo-500 hover:text-indigo-400 hover:underline font-semibold cursor-pointer"
            >
              Sign Up for free
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
