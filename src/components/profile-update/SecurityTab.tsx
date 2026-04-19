"use client";

import { useState } from "react";
import { Lock, Eye, EyeOff, Loader2, ShieldCheck, Smartphone, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import { changePasswordAPI } from "@/service/auth.service";
import { Badge } from "@/components/ui/Badge";
import { toast } from "sonner";

export default function SecurityTab() {
  const [formData, setFormData] = useState({
    old_password: "",
    new_password: "",
    confirm_password: ""
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.new_password.length < 6) {
      toast.error("New password must be at least 6 characters.");
      return;
    }

    if (formData.new_password !== formData.confirm_password) {
      toast.error("Passwords do not match.");
      return;
    }

    try {
      setIsSubmitting(true);
      await changePasswordAPI(formData);
      toast.success("Password updated successfully!");
      setFormData({ old_password: "", new_password: "", confirm_password: "" });
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : "Failed to update password. Please check your current password.";
      toast.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 px-4 md:px-0">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Change Password Form */}
        <div className="lg:col-span-7 bg-white p-8 sm:p-10 rounded-[40px] border border-neutral-200 shadow-sm space-y-8">
          <div className="flex items-center gap-4">
             <div className="w-12 h-12 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600 border border-indigo-100 shadow-sm">
                <Lock size={24} strokeWidth={2.5} />
             </div>
             <div>
                <h3 className="text-xl font-black text-slate-900 tracking-tight">Login Credentials</h3>
                <p className="text-xs font-medium text-slate-400 uppercase tracking-widest mt-1">Identity & Access Control</p>
             </div>
          </div>

          <form onSubmit={handlePasswordChange} className="space-y-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-2">Current Password</label>
                <div className="relative group">
                  <Input 
                    type={showPassword ? "text" : "password"}
                    value={formData.old_password}
                    onChange={(e) => setFormData({ ...formData, old_password: e.target.value })}
                    placeholder="Enter your current password"
                    className="h-14 pr-12 rounded-2xl font-bold bg-slate-50 border-slate-100 focus:ring-4 focus:ring-indigo-500/5 transition-all shadow-inner"
                    required
                  />
                  <button 
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-2"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-2">New Password</label>
                  <Input 
                    type={showPassword ? "text" : "password"}
                    value={formData.new_password}
                    onChange={(e) => setFormData({ ...formData, new_password: e.target.value })}
                    placeholder="Min. 6 chars"
                    className="h-14 rounded-2xl font-bold bg-slate-50 border-slate-100 focus:ring-4 focus:ring-indigo-500/5 transition-all shadow-inner"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-2">Confirm New Password</label>
                  <Input 
                    type={showPassword ? "text" : "password"}
                    value={formData.confirm_password}
                    onChange={(e) => setFormData({ ...formData, confirm_password: e.target.value })}
                    placeholder="Repeat new password"
                    className="h-14 rounded-2xl font-bold bg-slate-50 border-slate-100 focus:ring-4 focus:ring-indigo-500/5 transition-all shadow-inner"
                    required
                  />
                </div>
              </div>
            </div>

            <div className="p-4 bg-amber-50/50 rounded-2xl border border-amber-100/50 flex gap-3 items-start">
               <AlertCircle size={18} className="text-amber-600 shrink-0 mt-0.5" />
               <p className="text-[10px] font-medium text-amber-700 leading-relaxed italic">
                  Changing your password will NOT log you out of your current session, but other devices may require re-authentication.
               </p>
            </div>

            <Button 
              type="submit" 
              disabled={isSubmitting}
              className="w-full h-14 rounded-2xl bg-slate-900 hover:bg-indigo-600 text-white font-black text-xs uppercase tracking-[0.2em] transition-all shadow-xl shadow-indigo-600/10 active:scale-95"
            >
              {isSubmitting ? <Loader2 className="animate-spin" /> : "Update Credentials"}
            </Button>
          </form>
        </div>

        {/* Security Summary Cards */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white p-8 rounded-[40px] border border-neutral-200 shadow-sm space-y-6">
            <div className="flex items-center gap-3 text-emerald-600 font-black uppercase tracking-widest text-xs">
              <ShieldCheck size={18} /> Account Integrity
            </div>
            <div className="space-y-4">
               <div className="flex items-center justify-between p-4 bg-emerald-50/30 rounded-2xl border border-emerald-100/50">
                  <div>
                    <p className="text-sm font-black text-slate-900 leading-none">Password Strength</p>
                    <p className="text-[10px] font-bold text-emerald-600 uppercase mt-1 tracking-widest">Excellent</p>
                  </div>
                  <div className="flex gap-0.5">
                    {[1, 2, 3, 4].map(i => <div key={i} className="w-4 h-1 rounded-full bg-emerald-500" />)}
                  </div>
               </div>
               <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
                  <div>
                    <p className="text-sm font-black text-slate-900 leading-none">Last Changed</p>
                    <p className="text-[10px] font-bold text-slate-400 uppercase mt-1 tracking-widest">3 Months Ago</p>
                  </div>
                  <Badge className="bg-white border-slate-200 text-slate-500 font-bold text-[9px]">ROUTINE</Badge>
               </div>
            </div>
          </div>

          <div className="bg-indigo-600 p-8 rounded-[40px] shadow-xl shadow-indigo-200 text-white space-y-6 relative overflow-hidden">
             <div className="absolute top-0 right-0 p-4 opacity-10">
                <Smartphone size={80} />
             </div>
             <div className="relative z-10 space-y-4">
                <h4 className="text-lg font-black tracking-tight">Active Session</h4>
                <p className="text-sm font-medium text-indigo-100 opacity-80 leading-relaxed">
                   Currently managing account from <br /> 
                   <span className="font-black text-white italic">macOS 14.2 • Jakarta, ID</span>
                </p>
                <div className="pt-2">
                   <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-[9px] font-black uppercase tracking-widest">
                      <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" /> Live Session
                   </div>
                </div>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}
