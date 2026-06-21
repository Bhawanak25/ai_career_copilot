import React, { useState } from "react";
import { useAuth } from "../context/AuthContext.js";
import { 
  User, 
  Lock, 
  ShieldCheck, 
  Trash2, 
  LogOut, 
  CheckCircle2, 
  AlertCircle, 
  RefreshCw,
  Clock,
  Briefcase
} from "lucide-react";
import { motion } from "motion/react";

export default function ProfileSettings() {
  const { user, token, updateProfile, logout } = useAuth();
  
  const [fullName, setFullName] = useState(user?.full_name || "");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  
  const [updating, setUpdating] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccessMsg(null);
    setErrorMsg(null);
    setUpdating(true);

    if (!fullName.trim()) {
      setErrorMsg("Full Name cannot be empty.");
      setUpdating(false);
      return;
    }

    try {
      await updateProfile(fullName.trim(), currentPassword || undefined, newPassword || undefined);
      setSuccessMsg("Profile variables optimized successfully!");
      setCurrentPassword("");
      setNewPassword("");
    } catch (err: any) {
      setErrorMsg(err?.message || "Verification of current password failed.");
    } finally {
      setUpdating(false);
    }
  };

  return (
    <div className="space-y-10 animate-fade-in">
      {/* View Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-extrabold pb-0.5">Profile & Security Managers</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Maintain your personal login credentials, check profile parameters, and revise system settings.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Side update form */}
        <div className="lg:col-span-7 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm space-y-6">
          <h3 className="text-sm font-bold flex items-center gap-2 font-display pb-3 border-b border-slate-50 dark:border-slate-850">
            <User className="w-4.5 h-4.5 text-indigo-500" />
            Accreditation Profile Card
          </h3>

          <form onSubmit={handleUpdate} className="space-y-5">
            {successMsg && (
              <div className="p-3.5 bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 rounded-xl text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4.5 h-4.5 shrink-0" />
                <span>{successMsg}</span>
              </div>
            )}

            {errorMsg && (
              <div className="p-3.5 bg-rose-500/10 border border-rose-500/30 text-rose-600 dark:text-rose-400 rounded-xl text-xs flex items-center gap-2">
                <AlertCircle className="w-4.5 h-4.5 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            <div>
              <label className="block text-[10px] font-semibold text-slate-400 font-mono uppercase tracking-wider mb-2">My Full Name</label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 block"><User className="w-4.5 h-4.5" /></span>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-slate-100 focus:ring-1 focus:ring-indigo-500 focus:outline-none transition"
                />
              </div>
            </div>

            <div className="border-t border-slate-100 dark:border-slate-850 pt-5 space-y-4">
              <span className="block text-[10px] font-semibold text-indigo-500 font-mono uppercase tracking-wider">Leave passwords empty unless intent is to revise secure access credentials:</span>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-semibold text-slate-400 font-mono uppercase tracking-wider mb-2">Current Code</label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 block"><Lock className="w-4 h-4" /></span>
                    <input
                      type="password"
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full pl-11 pr-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-slate-100 focus:ring-1 focus:ring-indigo-500 focus:outline-none transition"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-semibold text-slate-400 font-mono uppercase tracking-wider mb-2">New Code</label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 block"><Lock className="w-4 h-4" /></span>
                    <input
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Min 6 characters"
                      className="w-full pl-11 pr-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-slate-100 focus:ring-1 focus:ring-indigo-500 focus:outline-none transition"
                    />
                  </div>
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={updating}
              className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-800 text-white rounded-xl text-xs font-semibold shadow-lg hover:shadow-indigo-500/10 flex items-center justify-center gap-1.5 cursor-pointer"
            >
              {updating ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  Updating secure registry...
                </>
              ) : (
                <>
                  <ShieldCheck className="w-4.5 h-4.5 text-amber-300" />
                  Save Changes
                </>
              )}
            </button>
          </form>
        </div>

        {/* Right Side registered details */}
        <div className="lg:col-span-5 space-y-6">
          <div className="p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm space-y-6">
            <h3 className="text-sm font-bold flex items-center gap-2 font-display pb-3 border-b border-slate-50 dark:border-slate-850">
              <ShieldCheck className="w-4.5 h-4.5 text-indigo-500" />
              SaaS Registration details
            </h3>

            <div className="space-y-4 text-xs font-mono">
              <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-850 pb-2">
                <span className="text-slate-400">EMAIL STATUS:</span>
                <span className="text-emerald-500 font-bold">VERIFIED APPLICANT</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-850 pb-2">
                <span className="text-slate-400">ACC MEMBER ID:</span>
                <span className="text-slate-800 dark:text-slate-200">{user?.id ? user?.id.substring(0, 10) + "..." : "USER-SESS"}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-850 pb-2">
                <span className="text-slate-400">REGISTRATION PATH:</span>
                <span className="text-slate-800 dark:text-slate-200">STANDARD ENCRYPTED SHA256</span>
              </div>
            </div>

            <button
              onClick={logout}
              className="w-full py-3 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-rose-500 hover:text-rose-400 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition duration-150 cursor-pointer border border-transparent hover:border-rose-500/20"
            >
              <LogOut className="w-4 h-4" />
              Destruct Current Session (Log Out)
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
