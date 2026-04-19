"use client";

import { useState } from "react";
import { ShieldAlert, Lock, Eye, EyeOff, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import { changePasswordAPI } from "@/service/auth.service";
import { useAuthStore } from "@/store/auth.store";
import { toast } from "sonner";

export function ForcedChangePassword() {
  const { mustChangePassword, fetchUser } = useAuthStore();
  const [formData, setFormData] = useState({
    new_password: "",
    confirm_password: ""
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!mustChangePassword) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.new_password.length < 6) {
      toast.error("Password must be at least 6 characters.");
      return;
    }

    if (formData.new_password !== formData.confirm_password) {
      toast.error("Passwords do not match.");
      return;
    }

    try {
      setIsSubmitting(true);
      await changePasswordAPI({
        new_password: formData.new_password,
        confirm_password: formData.confirm_password
      });
      toast.success("Security updated! Welcome to your workspace.");
      await fetchUser(); // Update state globally
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : "Failed to update security credentials.";
      toast.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[9999] bg-slate-950 flex items-center justify-center p-4">
      <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-indigo-500 via-transparent to-transparent pointer-events-none" />
      
      <div className="relative w-full max-w-lg bg-white rounded-[48px] shadow-2xl border border-white p-10 sm:p-14 animate-in fade-in zoom-in-95 duration-500">
        <div className="flex flex-col items-center text-center mb-10">
          <div className="w-20 h-20 rounded-[32px] bg-indigo-50 flex items-center justify-center text-indigo-600 mb-8 shadow-sm border border-indigo-100 ring-4 ring-indigo-50/50">
            <Lock size={40} strokeWidth={2.5} />
          </div>
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-50 text-amber-700 text-[10px] font-black uppercase tracking-[0.2em] mb-4">
            <ShieldAlert size={14} className="fill-current" />
            Immediate Action Required
          </div>
          <h2 className="text-3xl font-black text-slate-900 tracking-tight leading-tight">Secure Your Identity</h2>
          <p className="text-slate-400 font-medium text-sm mt-3 leading-relaxed">
            Your account was created by the system. For your protection, you must establish a permanent secure password before proceeding.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="space-y-5">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-2">New Secure Password</label>
              <div className="relative group">
                <Input 
                  type={showPassword ? "text" : "password"}
                  value={formData.new_password}
                  onChange={(e) => setFormData({ ...formData, new_password: e.target.value })}
                  placeholder="Min. 6 high-entropy characters"
                  className="h-16 pr-14 rounded-3xl font-bold bg-slate-50 border-none focus:ring-8 focus:ring-indigo-500/5 transition-all shadow-inner"
                  required
                />
                <button 
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-2"
                >
                  {showPassword ? <EyeOff size={22} /> : <Eye size={22} />}
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-2">Confirm New Password</label>
              <Input 
                type={showPassword ? "text" : "password"}
                value={formData.confirm_password}
                onChange={(e) => setFormData({ ...formData, confirm_password: e.target.value })}
                placeholder="Repeat new password"
                className="h-16 rounded-3xl font-bold bg-slate-50 border-none focus:ring-8 focus:ring-indigo-500/5 transition-all shadow-inner"
                required
              />
            </div>
          </div>

          <Button 
            disabled={isSubmitting}
            type="submit" 
            className="w-full h-16 bg-slate-950 text-white hover:bg-indigo-600 rounded-3xl font-black text-sm uppercase tracking-[0.2em] shadow-2xl shadow-indigo-600/20 transition-all active:scale-95 flex items-center justify-center gap-4"
          >
            {isSubmitting ? <Loader2 className="animate-spin" /> : "Establish Security"}
          </Button>
          
          <p className="text-center text-[10px] font-bold text-slate-300 uppercase tracking-widest">
            © 2026 Enterprise Security Protocol
          </p>
        </form>
      </div>
    </div>
  );
}
