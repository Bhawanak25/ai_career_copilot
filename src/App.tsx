import React, { useState, useEffect } from "react";
import { AuthProvider, useAuth } from "./context/AuthContext.js";
import Landing from "./pages/Landing.js";
import Login from "./pages/Login.js";
import Signup from "./pages/Signup.js";
import Dashboard from "./pages/Dashboard.js";
import ResumeAnalyzer from "./pages/ResumeAnalyzer.js";
import SkillAnalysis from "./pages/SkillAnalysis.js";
import InterviewPrep from "./pages/InterviewPrep.js";
import LearningRoadmap from "./pages/LearningRoadmap.js";
import TaskManager from "./pages/TaskManager.js";
import AIChat from "./pages/AIChat.js";
import ProfileSettings from "./pages/ProfileSettings.js";

import { 
  Sparkles, 
  LayoutDashboard, 
  FileText, 
  Wrench, 
  Brain, 
  Calendar, 
  CheckSquare, 
  MessageSquare, 
  User, 
  LogOut, 
  Sun, 
  Moon, 
  Menu, 
  X,
  UserCheck
} from "lucide-react";

function RootApp() {
  const { user, logout, token } = useAuth();
  const [currentPage, setCurrentPage] = useState<string>("landing");
  const [darkMode, setDarkMode] = useState<boolean>(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);

  // Sync state-based dark mode class on document element
  useEffect(() => {
    const root = window.document.documentElement;
    if (darkMode) {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
  }, [darkMode]);

  // Route security guard: redirect away from protected lanes if token is absent
  useEffect(() => {
    const protectedRoutes = ["dashboard", "resume", "skills", "interview", "roadmap", "tasks", "chat", "profile"];
    if (!token && protectedRoutes.includes(currentPage)) {
      setCurrentPage("landing");
    }
  }, [token, currentPage]);

  const handleNavigate = (page: string) => {
    setCurrentPage(page);
    setMobileMenuOpen(false);
  };

  const currentView = () => {
    switch (currentPage) {
      case "landing":
        return <Landing onNavigate={handleNavigate} />;
      case "login":
        return <Login onNavigate={handleNavigate} />;
      case "signup":
        return <Signup onNavigate={handleNavigate} />;
      case "dashboard":
        return <Dashboard onNavigate={handleNavigate} />;
      case "resume":
        return <ResumeAnalyzer />;
      case "skills":
        return <SkillAnalysis />;
      case "interview":
        return <InterviewPrep />;
      case "roadmap":
        return <LearningRoadmap />;
      case "tasks":
        return <TaskManager />;
      case "chat":
        return <AIChat />;
      case "profile":
        return <ProfileSettings />;
      default:
        return <Landing onNavigate={handleNavigate} />;
    }
  };

  const isAuthView = ["landing", "login", "signup"].includes(currentPage);

  if (isAuthView) {
    return (
      <div className="min-h-screen text-slate-900 dark:text-slate-100 bg-slate-50 dark:bg-slate-950 transition duration-150 relative">
        {/* Floating global theme toggler during initial landing views */}
        <div className="absolute top-6 right-6 z-[100] flex gap-2">
          <button
            onClick={() => setDarkMode(!darkMode)}
            className="p-3.5 bg-white/70 dark:bg-slate-900/60 backdrop-blur-md rounded-xl border border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 hover:text-indigo-500 cursor-pointer transition shadow-sm"
          >
            {darkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>
          
          {!token ? (
            <button
              onClick={() => handleNavigate("login")}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold shadow-lg transition duration-150 cursor-pointer"
            >
              Console Sign In
            </button>
          ) : (
            <button
              onClick={() => handleNavigate("dashboard")}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold shadow-lg transition duration-150 cursor-pointer flex items-center gap-1.5"
            >
              <LayoutDashboard className="w-3.5 h-3.5" />
              My Workspace
            </button>
          )}
        </div>
        {currentView()}
      </div>
    );
  }

  // Master Dashboard layout tree
  const sidebarItems = [
    { id: "dashboard", label: "My Workspace", icon: LayoutDashboard },
    { id: "resume", label: "Resume Scorer", icon: FileText },
    { id: "skills", label: "Skill Gap Analyzer", icon: Wrench },
    { id: "interview", label: "AI Interview Coach", icon: Brain },
    { id: "roadmap", label: "Study Roadmaps", icon: Calendar },
    { id: "tasks", label: "Productivity Task Plan", icon: CheckSquare },
    { id: "chat", label: "Advisor Chatbot", icon: MessageSquare },
    { id: "profile", label: "Account Profile", icon: User },
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col md:flex-row relative transition duration-150 font-sans">
      
      {/* Mobile Top Navigation Rail header */}
      <div className="md:hidden w-full p-4 border-b border-slate-200 dark:border-slate-850 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center gap-2 cursor-pointer" onClick={() => handleNavigate("dashboard")}>
          <div className="p-1.5 bg-indigo-600 rounded-lg text-white">
            <Sparkles className="w-4.5 h-4.5" />
          </div>
          <span className="font-bold text-sm tracking-tight font-display bg-gradient-to-r from-indigo-500 to-purple-500 bg-clip-text text-transparent">Career Copilot</span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setDarkMode(!darkMode)}
            className="p-2 text-slate-400 hover:text-indigo-500 transition cursor-pointer"
          >
            {darkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 text-slate-400 hover:text-indigo-500 transition cursor-pointer"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer menu list */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed inset-0 top-[60px] bg-white dark:bg-slate-900 z-40 p-6 flex flex-col justify-between border-t border-slate-100 dark:border-slate-800">
          <div className="space-y-4">
            {sidebarItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentPage === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleNavigate(item.id)}
                  className={`w-full p-4.5 rounded-xl border text-xs font-bold leading-none flex items-center gap-3.5 transition duration-150 cursor-pointer select-none ${
                    isActive 
                      ? "bg-indigo-600/10 border-indigo-500/20 text-indigo-600 dark:text-indigo-400 font-black" 
                      : "border-transparent text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-950/40"
                  }`}
                >
                  <Icon className="w-4.5 h-4.5" />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </div>

          <button
            onClick={() => { logout(); handleNavigate("landing"); }}
            className="w-full py-4 bg-slate-150 dark:bg-slate-950 text-rose-500 hover:text-rose-450 border border-transparent rounded-xl text-xs font-bold flex items-center justify-center gap-2 cursor-pointer"
          >
            <LogOut className="w-4.5 h-4.5" />
            Sign Out
          </button>
        </div>
      )}

      {/* Desktop Main Left Sidebar rail */}
      <aside className="hidden md:flex w-64 border-r border-slate-200 dark:border-slate-850/80 bg-white dark:bg-slate-900 flex-col justify-between sticky top-0 h-screen shrink-0 relative">
        <div className="p-6 space-y-8 flex-1 flex flex-col">
          {/* Logo element */}
          <div className="flex items-center gap-2.5 cursor-pointer pb-2" onClick={() => handleNavigate("landing")}>
            <div className="p-2 bg-indigo-600 rounded-xl text-white shadow-md shadow-indigo-600/10 shrink-0">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <span className="font-extrabold text-sm tracking-tight block">AI CAREER</span>
              <span className="font-mono text-[10px] tracking-widest text-slate-400 block font-bold">COPILOT SYSTEM</span>
            </div>
          </div>

          {/* Nav rail choices */}
          <nav className="space-y-1.5 flex-1 overflow-y-auto">
            {sidebarItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentPage === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleNavigate(item.id)}
                  className={`w-full px-4 py-3 rounded-xl border text-xs font-bold flex items-center justify-between transition duration-150 cursor-pointer ${
                    isActive 
                      ? "bg-indigo-600/10 border-indigo-100/10 dark:border-indigo-900/30 text-indigo-500 dark:text-indigo-400 font-extrabold shadow-sm" 
                      : "border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100/40 dark:hover:bg-slate-950/20"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className="w-4 h-4 shrink-0" />
                    <span>{item.label}</span>
                  </div>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Desktop Sidebar Account/Settings panel footer */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-850 bg-slate-50/[0.3] dark:bg-slate-950/[0.2] space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5 min-w-0 pr-2">
              <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-850 border border-slate-200 dark:border-slate-800 flex items-center justify-center shrink-0 text-slate-600 dark:text-slate-400">
                <UserCheck className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <div id="sidebar-fullname-display" className="text-xs font-bold truncate text-slate-800 dark:text-slate-200">{user?.full_name}</div>
                <div className="text-[9px] font-mono text-slate-400 truncate">Sess Member</div>
              </div>
            </div>

            <button
              onClick={() => setDarkMode(!darkMode)}
              className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-500 dark:text-slate-400 hover:text-indigo-500 transition cursor-pointer"
              title="Toggle Theme"
            >
              {darkMode ? <Sun className="w-3.5 h-3.5" /> : <Moon className="w-3.5 h-3.5" />}
            </button>
          </div>

          <button
            onClick={() => { logout(); handleNavigate("landing"); }}
            className="w-full py-2.5 bg-slate-150/10 hover:bg-rose-500/10 text-rose-500/90 hover:text-rose-500 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition duration-150 cursor-pointer border border-transparent hover:border-rose-500/10"
          >
            <LogOut className="w-3.5 h-3.5" />
            Destruct Session
          </button>
        </div>
      </aside>

      {/* Main Workspace Stage content */}
      <main className="flex-1 p-6 md:p-10 max-w-7xl mx-auto w-full overflow-x-hidden min-h-[calc(100vh-60px)] md:min-h-screen">
        {currentView()}
      </main>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <RootApp />
    </AuthProvider>
  );
}
