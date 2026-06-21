import React, { useState, useEffect, useRef } from "react";
import { useAuth } from "../context/AuthContext.js";
import { ChatSession, ChatMessage } from "../types/index.js";
import { 
  Sparkles, 
  Send, 
  MessageSquare, 
  Plus, 
  Trash2, 
  User, 
  Menu, 
  RefreshCw,
  HelpCircle,
  Clock,
  Compass
} from "lucide-react";
import { motion } from "motion/react";

export default function AIChat() {
  const { token, user } = useAuth();
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [typedMessage, setTypedMessage] = useState("");
  const [thinking, setThinking] = useState(false);
  const [loadingHistory, setLoadingHistory] = useState(true);
  const chatBottomRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (token) {
      loadChatThreads();
    }
  }, [token]);

  useEffect(() => {
    scrollToBottom();
  }, [sessions, activeSessionId, thinking]);

  const scrollToBottom = () => {
    chatBottomRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const loadChatThreads = async () => {
    try {
      setLoadingHistory(true);
      const res = await fetch("/api/chat/history", {
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setSessions(data);
        if (data.length > 0) {
          setActiveSessionId(data[0].id);
        } else {
          // Auto create a thread if none exist out of the box!
          await createNewThread("General Placement Prep");
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingHistory(false);
    }
  };

  const createNewThread = async (initialTitle?: string) => {
    try {
      const title = initialTitle || prompt("Enter a title for this chat topic:") || "New Career Session";
      if (!title.trim()) return;
      const res = await fetch("/api/chat/session", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ title: title.trim() })
      });
      if (res.ok) {
        const newSess = await res.json();
        setSessions(prev => [newSess, ...prev]);
        setActiveSessionId(newSess.id);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const deleteThread = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!window.confirm("Delete this chat thread? This conversation cannot be retrieved.")) return;
    try {
      const res = await fetch(`/api/chat/session/${id}`, {
        method: "DELETE",
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (res.ok) {
        setSessions(prev => prev.filter(s => s.id !== id));
        if (activeSessionId === id) {
          const remaining = sessions.filter(s => s.id !== id);
          setActiveSessionId(remaining.length > 0 ? remaining[0].id : null);
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!typedMessage.trim() || !activeSessionId || thinking) return;

    const userPrompt = typedMessage.trim();
    setTypedMessage("");
    setThinking(true);

    // Optimistically update current state so messages display instantly in UI
    setSessions(prev => {
      return prev.map(s => {
        if (s.id === activeSessionId) {
          return {
            ...s,
            messages: [
              ...s.messages,
              {
                id: Math.random().toString(),
                role: "user",
                content: userPrompt,
                timestamp: new Date().toISOString()
              }
            ]
          };
        }
        return s;
      });
    });

    try {
      const res = await fetch("/api/chat/message", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ sessionId: activeSessionId, message: userPrompt })
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to transmit message.");
      }
      
      // Update with server truth
      setSessions(prev => {
        return prev.map(s => {
          if (s.id === activeSessionId) {
            return data.session;
          }
          return s;
        });
      });
    } catch (err: any) {
      alert(err?.message || "Copilot chatbot encountered connection failure.");
    } finally {
      setThinking(false);
    }
  };

  const activeSession = sessions.find(s => s.id === activeSessionId);

  // Simple formatter to split returns into beautiful paragraphed lists safely in React
  const formatMsgContent = (text: string) => {
    if (!text) return null;
    return text.split("\n").map((para, idx) => {
      const trimmed = para.trim();
      if (trimmed.startsWith("-") || trimmed.startsWith("*")) {
        return (
          <li key={idx} className="list-disc pl-1 ml-5 text-slate-700 dark:text-slate-300 text-xs leading-relaxed my-1">
            {trimmed.substring(1).trim()}
          </li>
        );
      }
      if (trimmed.startsWith("###")) {
        return (
          <h4 key={idx} className="text-sm font-extrabold text-slate-800 dark:text-slate-100 mt-4 mb-2 font-display">
            {trimmed.substring(3).trim()}
          </h4>
        );
      }
      if (para === "") return <div key={idx} className="h-2" />;
      return (
        <p key={idx} className="text-xs text-slate-705 dark:text-slate-305 leading-relaxed my-1.5 font-light">
          {para}
        </p>
      );
    });
  };

  return (
    <div className="h-[74vh] flex rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden shadow-sm">
      {/* Sidebar - Chat threads */}
      <div className="w-1/3 border-r border-slate-100 dark:border-slate-850 flex flex-col justify-between shrink-0 bg-slate-50/50 dark:bg-slate-955/20 hidden md:flex">
        <div className="p-4 border-b border-slate-100 dark:border-slate-850 flex items-center justify-between">
          <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-400">Consultations</h3>
          <button 
            onClick={() => createNewThread()}
            className="p-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Threads list */}
        <div className="flex-1 overflow-y-auto p-3 space-y-2">
          {loadingHistory ? (
            <div className="text-center py-8 text-xs text-slate-400">Loading catalog...</div>
          ) : sessions.length === 0 ? (
            <p className="text-xs text-slate-400 text-center py-8">Create your first thread</p>
          ) : (
            sessions.map((sess) => {
              const isActive = sess.id === activeSessionId;
              return (
                <div 
                  key={sess.id}
                  onClick={() => setActiveSessionId(sess.id)}
                  className={`p-3 rounded-xl border flex items-center justify-between cursor-pointer transition ${
                    isActive 
                      ? "bg-white dark:bg-slate-900 border-indigo-500/20 text-indigo-600 dark:text-indigo-400 font-semibold" 
                      : "border-transparent text-slate-500 hover:bg-slate-100/50 dark:hover:bg-slate-950/20"
                  }`}
                >
                  <div className="flex items-center gap-2 min-w-0 pr-2">
                    <MessageSquare className="w-4 h-4 shrink-0" />
                    <span className="text-xs truncate">{sess.title}</span>
                  </div>
                  <button 
                    onClick={(e) => deleteThread(sess.id, e)}
                    className="p-1 hover:text-rose-500 text-slate-400 transition"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              );
            })
          )}
        </div>

        {/* User identification footer */}
        <div className="p-4 border-t border-slate-150 dark:border-slate-850 text-xs font-mono text-slate-400 truncate">
          Ref: {user?.email}
        </div>
      </div>

      {/* Main chat terminal stage */}
      <div className="flex-1 flex flex-col justify-between">
        {/* Chat header */}
        <div className="p-4 border-b border-slate-100 dark:border-slate-850/60 bg-white dark:bg-slate-900 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center border border-indigo-500/10 shrink-0">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-sm font-extrabold text-slate-800 dark:text-slate-100">{activeSession ? activeSession.title : "Career Coach AI"}</h4>
              <p className="text-[10px] text-emerald-500 font-mono font-bold leading-none uppercase">● 24/7 Placement Advisor Active</p>
            </div>
          </div>

          <div className="flex items-center gap-2 md:hidden">
            <button 
              onClick={() => {
                const title = prompt("New session title:");
                if (title) createNewThread(title);
              }}
              className="p-1 text-slate-400 hover:text-indigo-600"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Message sequence streams */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {activeSession ? (
            activeSession.messages.map((msg) => {
              const isAi = msg.role === "model";
              return (
                <div key={msg.id} className={`flex items-start gap-4 ${!isAi ? "flex-row-reverse" : ""}`}>
                  {/* Avatar */}
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 border ${
                    isAi 
                      ? "bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-indigo-600 dark:text-indigo-400" 
                      : "bg-indigo-600 border-indigo-600 text-white"
                  }`}>
                    {isAi ? <Sparkles className="w-4 h-4" /> : <User className="w-4 h-4" />}
                  </div>

                  {/* Bubble card */}
                  <div className={`p-4 rounded-2xl max-w-[85%] ${
                    isAi 
                      ? "border border-slate-150 dark:border-slate-850 bg-slate-50/[0.2] dark:bg-slate-950/[0.2]" 
                      : "bg-indigo-600 text-white rounded-tr-none"
                  }`}>
                    <div className="space-y-1">
                      {isAi ? (
                        formatMsgContent(msg.content)
                      ) : (
                        <p className="text-xs leading-relaxed font-light">{msg.content}</p>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="text-center py-12 text-slate-400 text-xs">Instantiate a chat thread on the left pane under consultations.</div>
          )}

          {thinking && (
            <div className="flex items-start gap-4">
              <div className="w-8 h-8 rounded-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0 animate-pulse">
                <Sparkles className="w-4 h-4" />
              </div>
              <div className="p-4 rounded-2xl border border-slate-150 dark:border-slate-850 bg-slate-50/[0.2] dark:bg-slate-950/[0.2] max-w-[80%] flex items-center gap-2">
                <div className="flex gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-bounce" style={{ animationDelay: "0ms" }} />
                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-bounce" style={{ animationDelay: "150ms" }} />
                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-bounce" style={{ animationDelay: "300ms" }} />
                </div>
                <span className="text-[10px] font-mono text-slate-400 animate-pulse">Mapping placement paths...</span>
              </div>
            </div>
          )}

          <div ref={chatBottomRef} />
        </div>

        {/* Prompts Input block */}
        <form onSubmit={sendMessage} className="p-4 border-t border-slate-150 dark:border-slate-850 bg-white dark:bg-slate-900 flex gap-3 items-center">
          <input
            type="text"
            required
            disabled={thinking || !activeSessionId}
            value={typedMessage}
            onChange={(e) => setTypedMessage(e.target.value)}
            placeholder="Ask anything (e.g. 'How do I quantize bullets?', 'How to crack Amazon HR?')"
            className="flex-1 px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-sm focus:outline-none focus:border-indigo-500 disabled:opacity-50 transition"
          />
          <button
            type="submit"
            disabled={thinking || !typedMessage.trim() || !activeSessionId}
            className="p-3 bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-300 dark:disabled:bg-slate-800 text-white rounded-xl transition cursor-pointer shrink-0"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
}
