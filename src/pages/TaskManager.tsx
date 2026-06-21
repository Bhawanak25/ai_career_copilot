import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext.js";
import { Task } from "../types/index.js";
import { 
  Plus, 
  Trash2, 
  Sparkles, 
  CheckCircle2, 
  AlertCircle, 
  Calendar, 
  LayoutList, 
  CheckSquare, 
  RefreshCw,
  Lightbulb,
  BrainCircuit,
  Focus
} from "lucide-react";
import { motion } from "motion/react";

export default function TaskManager() {
  const { token } = useAuth();
  
  const [tasks, setTasks] = useState<Task[]>([]);
  const [taskName, setTaskName] = useState("");
  const [priority, setPriority] = useState<"High" | "Medium" | "Low">("Medium");
  const [dueDate, setDueDate] = useState("");
  
  const [prioritizing, setPrioritizing] = useState(false);
  const [aiAdvice, setAiAdvice] = useState<string | null>(null);
  const [reasonMap, setReasonMap] = useState<Record<string, string>>({});
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (token) {
      loadTasks();
    }
  }, [token]);

  const loadTasks = async () => {
    try {
      const res = await fetch("/api/tasks", {
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setTasks(data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const createTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!taskName.trim()) return;
    try {
      const res = await fetch("/api/tasks", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          taskName: taskName.trim(),
          priority,
          dueDate: dueDate || new Date().toISOString().split('T')[0]
        })
      });
      if (res.ok) {
        setTaskName("");
        setDueDate("");
        loadTasks();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const toggleTask = async (task: Task) => {
    try {
      const nextStatus = task.status === "Pending" ? "Completed" : "Pending";
      const res = await fetch(`/api/tasks/${task.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ ...task, status: nextStatus })
      });
      if (res.ok) {
        loadTasks();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const deleteTask = async (id: string) => {
    try {
      const res = await fetch(`/api/tasks/${id}`, {
        method: "DELETE",
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (res.ok) {
        setTasks(prev => prev.filter(t => t.id !== id));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const executeAiPrioritize = async () => {
    if (tasks.length === 0) {
      setErrorMessage("Please write down at least 1-2 tasks to prioritize.");
      return;
    }
    setErrorMessage(null);
    setPrioritizing(true);
    setAiAdvice(null);
    setReasonMap({});

    try {
      const res = await fetch("/api/tasks/ai-prioritize", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        }
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to reorganize tasks.");
      }
      setAiAdvice(data.advice);
      
      // Load specific rationale maps
      const mappings: Record<string, string> = {};
      if (data.taskPriorities && Array.isArray(data.taskPriorities)) {
        for (const pr of data.taskPriorities) {
          mappings[pr.id] = pr.reason;
        }
      }
      setReasonMap(mappings);

      // Refresh task weights list
      loadTasks();
    } catch (err: any) {
      setErrorMessage(err?.message || "Workspace advisor timed out. Reduce tasks count.");
    } finally {
      setPrioritizing(false);
    }
  };

  // Progress metrics calculation
  const totalCount = tasks.length;
  const completedCount = tasks.filter(t => t.status === "Completed").length;
  const progressPercent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  return (
    <div className="space-y-10 animate-fade-in">
      {/* View Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-extrabold pb-0.5">Smart Task Manager</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Scaffold your learning milestones, schedule job applications, and ask Gemini AI to sort task priority levels intelligently based on urgency.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left column: Add tasks Form & Progress board */}
        <div className="lg:col-span-5 space-y-6">
          {/* Progress Tracker */}
          <div className="p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm space-y-4">
            <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-400">Workspace Tasks Progress</h3>
            
            <div className="space-y-2">
              <div className="flex justify-between text-xs font-semibold">
                <span className="text-slate-550 dark:text-slate-400">Completed: {completedCount} / {totalCount} tasks</span>
                <span className="text-indigo-600 dark:text-indigo-400 font-mono">{progressPercent}% done</span>
              </div>
              <div className="h-2 rounded-full bg-slate-100 dark:bg-slate-950 overflow-hidden relative">
                <div className="h-full bg-indigo-600 rounded-full transition-all duration-300" style={{ width: `${progressPercent}%` }} />
              </div>
            </div>
          </div>

          {/* Form Create */}
          <div className="p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm space-y-6">
            <h3 className="text-sm font-bold flex items-center gap-2 font-display">
              <CheckSquare className="w-4.5 h-4.5 text-indigo-500" />
              Skein Action Item
            </h3>

            <form onSubmit={createTask} className="space-y-4">
              <div>
                <label className="block text-[10px] font-semibold text-slate-400 font-mono uppercase tracking-wider mb-2">Goal / Task Title</label>
                <input
                  type="text"
                  required
                  value={taskName}
                  onChange={(e) => setTaskName(e.target.value)}
                  placeholder="e.g., Code dynamic sidebar router"
                  className="w-full px-3 py-2.5 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:border-indigo-500 transition"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-semibold text-slate-400 font-mono uppercase tracking-wider mb-2">Priority Level</label>
                  <select
                    value={priority}
                    onChange={(e: any) => setPriority(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:border-indigo-500 transition"
                  >
                    <option value="High">High</option>
                    <option value="Medium">Medium</option>
                    <option value="Low">Low</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-semibold text-slate-400 font-mono uppercase tracking-wider mb-2">Due Date</label>
                  <input
                    type="date"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    className="w-full px-3 py-2 py-2.5 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:border-indigo-500 transition"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-xs font-semibold rounded-lg flex items-center justify-center gap-1.5 cursor-pointer border border-slate-205"
              >
                <Plus className="w-3.5 h-3.5" />
                Add Task
              </button>
            </form>
          </div>

          {/* AI Prioritizer Action Trigger */}
          <div className="p-6 rounded-2xl border border-indigo-500/20 bg-indigo-500/[0.02] dark:bg-indigo-500/[0.01] space-y-4">
            <div className="flex items-center gap-2">
              <BrainCircuit className="w-5 h-5 text-indigo-500" />
              <h3 className="font-extrabold text-sm text-indigo-600 dark:text-indigo-400">AI Agenda Prioritizer</h3>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-normal">
              Busy schedule? Prompt Gemini AI to instantly check your current task list. It will auto-update priority weights and issue specific advice blocks.
            </p>

            <button
              onClick={executeAiPrioritize}
              disabled={prioritizing || tasks.length === 0}
              className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-800 text-white rounded-xl text-xs font-bold shadow-lg hover:shadow-indigo-500/20 flex items-center justify-center gap-1.5 cursor-pointer"
            >
              {prioritizing ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  Analyzing urgent career items...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-amber-300" />
                  Optimize Agenda via AI
                </>
              )}
            </button>

            {errorMessage && (
              <div className="p-3 bg-rose-500/10 border border-rose-500/30 text-rose-600 dark:text-rose-400 rounded-xl text-[11px] flex items-center gap-1.5">
                <AlertCircle className="w-3.5 h-3.5" />
                <span>{errorMessage}</span>
              </div>
            )}
          </div>
        </div>

        {/* Right column: Interactive list with checkboxes */}
        <div className="lg:col-span-7 space-y-6">
          {/* Productivity Advice alert if generated */}
          {aiAdvice && (
            <div className="p-5 rounded-2xl border border-emerald-500/20 bg-emerald-500/[0.03] flex gap-4">
              <Lightbulb className="w-5.5 h-5.5 text-emerald-500 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <h4 className="font-bold text-xs text-emerald-600 dark:text-emerald-400 font-mono tracking-wider uppercase">Personalized Productivity Recommendation</h4>
                <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed font-light">{aiAdvice}</p>
              </div>
            </div>
          )}

          {/* Core Tasks lists card */}
          <div className="p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm space-y-4">
            <h3 className="text-sm font-bold flex items-center gap-2 font-display pb-3 border-b border-slate-50 dark:border-slate-850">
              <LayoutList className="w-4.5 h-4.5 text-indigo-500" />
              Active Study agenda
            </h3>

            {tasks.length === 0 ? (
              <div className="py-12 text-center space-y-3">
                <LayoutList className="w-12 h-12 text-slate-300 dark:text-slate-700 mx-auto" />
                <div>
                  <h3 className="font-bold text-sm">Review study agenda is empty</h3>
                  <p className="text-xs text-slate-400 font-light max-w-sm mx-auto">Add target deadlines like "Relaunch sandbox code", or "Email recruiter" in the left card form.</p>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                {tasks.map((task) => {
                  const isDone = task.status === "Completed";
                  const rationale = reasonMap[task.id];
                  
                  return (
                    <div 
                      key={task.id} 
                      className={`p-4 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:border-indigo-500/20 transition ${
                        isDone 
                          ? "border-slate-100 dark:border-slate-900 bg-slate-50/20 dark:bg-slate-950/10 opacity-70" 
                          : "border-slate-100 dark:border-slate-850 bg-slate-50/50 dark:bg-slate-950/20"
                      }`}
                    >
                      <div className="flex items-start gap-3.5 min-w-0 flex-1">
                        <button 
                          onClick={() => toggleTask(task)}
                          className="mt-0.5 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 shrink-0 cursor-pointer"
                        >
                          <input 
                            type="checkbox" 
                            checked={isDone} 
                            onChange={() => {}} // Controlled via parent button click
                            className="w-4.5 h-4.5 accent-indigo-600 rounded cursor-pointer" 
                          />
                        </button>
                        
                        <div className="space-y-1 min-w-0 pr-4">
                          <p className={`text-xs font-bold leading-none ${isDone ? "line-through text-slate-500" : "text-slate-800 dark:text-slate-200"}`}>
                            {task.task_name}
                          </p>
                          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[10px] text-slate-400 font-mono">
                            <span className="flex items-center gap-1 whitespace-nowrap">
                              <Calendar className="w-3.5 h-3.5" />
                              Due {new Date(task.due_date).toLocaleDateString()}
                            </span>
                          </div>
                          
                          {/* AI Priority assessment rationale */}
                          {rationale && (
                            <p className="text-[10px] text-indigo-500 italic mt-1 bg-indigo-500/[0.02] dark:bg-indigo-500/[0.01] p-1 px-2 rounded-md border border-indigo-500/5 leading-snug">
                              AI Reasoning: {rationale}
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-3 justify-end shrink-0 pl-7 sm:pl-0">
                        <span className={`px-2 py-0.5 rounded text-[9px] font-mono font-bold uppercase tracking-wider shrink-0 ${
                          task.priority === "High" 
                            ? "bg-rose-500/10 text-rose-500 border border-rose-500/15" 
                            : task.priority === "Medium"
                              ? "bg-amber-500/10 text-amber-500 border border-amber-500/15"
                              : "bg-slate-500/10 text-slate-400 border border-slate-500/15"
                        }`}>
                          {task.priority} Priority
                        </span>
                        
                        <button 
                          onClick={() => deleteTask(task.id)}
                          className="p-1 px-1.5 text-slate-400 hover:text-rose-500 shrink-0 cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
