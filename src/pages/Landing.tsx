import React from "react";
import { Sparkles, FileText, Brain, Award, Calendar, MessageSquare, ArrowRight, CheckCircle2 } from "lucide-react";
import { motion } from "motion/react";

interface LandingProps {
  onNavigate: (page: string) => void;
}

export default function Landing({ onNavigate }: LandingProps) {
  const features = [
    {
      icon: <FileText className="w-6 h-6 text-indigo-500" />,
      title: "Resume ATS Analyzer",
      description: "Upload your resume as PDF/text and instantly receive formatting critique, spelling reviews, missing keywords, and detailed ATS compatibility grades.",
    },
    {
      icon: <Brain className="w-6 h-6 text-sky-500" />,
      title: "Skill Gap Analyzer",
      description: "Match your current expertise against your target industry description or position. Identify exactly what's holding you back with localized visual summaries.",
    },
    {
      icon: <Award className="w-6 h-6 text-emerald-500" />,
      title: "AI Interview Coach",
      description: "Simulate rigorous technical, behavioral, and HR questioning. Type your answers to receive quantitative feedback, tips, and confidence score ratings.",
    },
    {
      icon: <CheckCircle2 className="w-6 h-6 text-purple-500" />,
      title: "Smart Task Manager",
      description: "Organize target applications and self-study goals. Use Gemini AI to automatically sort your tasks by urgency and receive smart productivity advice.",
    },
    {
      icon: <Calendar className="w-6 h-6 text-pink-500" />,
      title: "Learning Roadmaps",
      description: "Create structured multi-week timelines from beginner to expert status complete with daily routine routines, Sunday milestones, and verified URLs.",
    },
    {
      icon: <MessageSquare className="w-6 h-6 text-amber-500" />,
      title: "Placement Chatbot",
      description: "Consult your 24/7 senior career mentor on salaries, job hunting, cold mailing tactics, and campus placement strategies.",
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors duration-200">
      {/* Hero Section */}
      <div className="relative overflow-hidden py-24 px-6 sm:px-12 lg:px-24">
        {/* Ambient Glows */}
        <div className="absolute top-[-10%] left-[-10%] w-[45%] h-[45%] rounded-full bg-indigo-500/10 blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[45%] h-[45%] rounded-full bg-violet-500/10 blur-[120px]" />

        <div className="max-w-5xl mx-auto text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-900/50 text-xs font-semibold mb-8"
          >
            <Sparkles className="w-3.5 h-3.5" />
            Empowering Over 5,000+ Students & Seekers
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-5xl sm:text-7xl font-bold tracking-tight mb-8"
          >
            Get Hired with Your <br />
            <span className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 bg-clip-text text-transparent">
              AI Career Copilot
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-lg sm:text-xl text-slate-600 dark:text-slate-400 max-w-3xl mx-auto mb-12 font-light leading-relaxed"
          >
            The premium full-stack AI package that parses technical resumes, grades ATS compliance,
            simulates interview loops, schedules agendas, and drafts targeted master schedules.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <button
              id="get-started-btn"
              onClick={() => onNavigate("signup")}
              className="w-full sm:w-auto px-8 py-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-medium shadow-lg hover:shadow-indigo-500/20 shadow-neutral-900/10 flex items-center justify-center gap-2 transition duration-200 cursor-pointer"
            >
              Start Free Today
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              id="view-features-btn"
              onClick={() => {
                document.getElementById("features-section")?.scrollIntoView({ behavior: "smooth" });
              }}
              className="w-full sm:w-auto px-8 py-4 bg-slate-200 dark:bg-slate-900 hover:bg-slate-300 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200 rounded-xl font-medium border border-slate-300 dark:border-slate-800 transition duration-200 cursor-pointer"
            >
              Explore Copitot Features
            </button>
          </motion.div>
        </div>
      </div>

      {/* Visual Workspace Mockup */}
      <div className="max-w-6xl mx-auto px-6 mb-28">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="relative rounded-2xl border border-slate-200 dark:border-slate-800 p-2 bg-slate-100/50 dark:bg-slate-900/55 shadow-2xl overflow-hidden"
        >
          <div className="rounded-xl overflow-hidden shadow-inner bg-slate-900 aspect-[16/9] flex flex-col justify-between p-6 text-left border border-slate-200/10 relative">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-rose-500 inline-block" />
                <span className="w-3 h-3 rounded-full bg-amber-500 inline-block" />
                <span className="w-3 h-3 rounded-full bg-emerald-500 inline-block" />
                <span className="text-xs text-slate-500 font-mono ml-2">ai-career-copilot@workspace</span>
              </div>
              <span className="px-2.5 py-0.5 rounded bg-emerald-950 text-emerald-400 text-[10px] font-mono border border-emerald-900/40">● LIVE ASSISTANCE ACTIVE</span>
            </div>

            <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-6 py-4">
              <div className="p-4 bg-slate-950/80 rounded-lg border border-slate-800 flex flex-col justify-between">
                <div>
                  <div className="text-[10px] uppercase tracking-wider text-indigo-400 font-mono font-bold mb-1">ATS Optimization</div>
                  <div className="text-xl font-bold mb-2">Resume Score: 87%</div>
                  <p className="text-xs text-slate-400">Missing keywords 'Docker', 'RESTful API' detected in target profile.</p>
                </div>
                <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden mt-4">
                  <div className="h-full bg-indigo-500 rounded-full" style={{ width: '87%' }} />
                </div>
              </div>

              <div className="p-4 bg-slate-950/80 rounded-lg border border-slate-800 flex flex-col justify-between">
                <div>
                  <div className="text-[10px] uppercase tracking-wider text-emerald-400 font-mono font-bold mb-1">Coach Simulator</div>
                  <div className="text-xl font-bold mb-2">Confidence Level: High</div>
                  <p className="text-xs text-slate-400">"Excellent STAR alignment format. Mention cloud deployments next time."</p>
                </div>
                <div className="text-xs font-mono text-emerald-400 mt-4 bg-emerald-950/30 px-2 py-1 rounded border border-emerald-900/30">Coach Rating: 9.2/10</div>
              </div>

              <div className="p-3 bg-slate-950/80 rounded-lg border border-slate-800 flex flex-col justify-between">
                <div>
                  <div className="text-[10px] uppercase tracking-wider text-pink-400 font-mono font-bold mb-1">Interactive Scheduler</div>
                  <div className="font-semibold text-sm text-white">Full-Stack Roadmap</div>
                  <div className="text-[11px] text-slate-400 mt-2 space-y-1">
                    <div>• Week 1: Node & Express fundamentals</div>
                    <div>• Week 2: Docker containers & SQL DBs</div>
                    <div>• Week 3: API gateways & system scales</div>
                  </div>
                </div>
                <div className="text-[10px] text-indigo-300 font-mono mt-2 text-right">3 Learning Milestones</div>
              </div>
            </div>

            <div className="flex items-center gap-2 bg-slate-950 px-3 py-2 rounded-lg border border-slate-800 text-xs">
              <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
              <span className="text-slate-300 font-mono truncate">Prompt: "Generate interview answers emphasizing microservices deployment"</span>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Features Grid Section */}
      <div id="features-section" className="py-24 bg-white dark:bg-slate-900/50 border-t border-b border-slate-200 dark:border-slate-900 px-6 sm:px-12 lg:px-24">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">Complete Suite of AI Career Tools</h2>
            <p className="text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
              Everything you need to successfully navigate technical interviews, bypass computerized resume scrapers, and upskill intelligently.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, idx) => (
              <motion.div
                key={idx}
                whileHover={{ y: -5 }}
                className="p-8 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800/80 hover:border-indigo-500/30 transition-all duration-200 flex flex-col justify-between"
              >
                <div>
                  <div className="p-3 bg-white dark:bg-slate-900 rounded-xl w-max border border-slate-200/60 dark:border-slate-800/50 shadow-sm mb-6">
                    {feature.icon}
                  </div>
                  <h3 className="text-lg font-bold mb-3">{feature.title}</h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">{feature.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Footer social mockup or simple attribution */}
      <footer className="py-12 px-6 border-t border-slate-200 dark:border-slate-900 text-center">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-indigo-500" />
            <span className="font-display font-black text-lg tracking-tight bg-gradient-to-r from-indigo-500 to-violet-500 bg-clip-text text-transparent">AI Career Copilot</span>
          </div>
          <div className="text-xs text-slate-500 font-mono">
            © 2026 AI Career Copilot. Empowering job seekers with custom-engineered LLM alignment.
          </div>
        </div>
      </footer>
    </div>
  );
}
