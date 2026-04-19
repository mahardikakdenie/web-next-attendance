"use client";

import { useState, useEffect } from "react";
import { Lock, Eye, EyeOff, Loader2, CheckCircle2, ShieldAlert } from "lucide-react";
import { useSearchParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import { resetPasswordAPI } from "@/service/auth.service";
import { toast } from "sonner";

export default function ResetPasswordView() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("token");

  const [formData, setFormData] = useState({
    new_password: "",
    confirm_password: ""
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  useEffect(() => {
    if (!token) {
      toast.error("Invalid or missing reset token.");
    }
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;

    if (formData.new_password.length < 6) {
      toast.error("Password must be at least 6 characters long.");
      return;
    }

    if (formData.new_password !== formData.confirm_password) {
      toast.error("Passwords do not match.");
      return;
    }

    try {
      setIsLoading(true);
      await resetPasswordAPI({
        token,
        new_password: formData.new_password,
        confirm_password: formData.confirm_password
      });
      setIsSuccess(true);
      toast.success("Password updated successfully!");
      setTimeout(() => router.push("/login"), 3000);
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : "Failed to reset password. Token might be expired.";
      toast.error(msg);
    } finally {
      setIsLoading(false);
    }
  };

  if (!token) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 text-center">
        <div className="max-w-md bg-white p-12 rounded-[40px] shadow-2xl border border-white">
          <div className="w-20 h-20 rounded-[32px] bg-rose-50 flex items-center justify-center text-rose-500 mx-auto mb-8 shadow-sm">
            <ShieldAlert size={40} />
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight mb-2">Invalid Session</h1>
          <p className="text-sm font-medium text-slate-400 mb-8">This reset link is invalid or has already been used.</p>
          <Button onClick={() => router.push("/login")} className="w-full h-14 rounded-2xl bg-slate-900 font-black text-xs uppercase tracking-widest">Back to Login</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-[40px] shadow-2xl border border-white p-8 sm:p-12 animate-in fade-in zoom-in-95 duration-500">
        
        <div className="flex flex-col items-center text-center mb-10">
          <div className="w-16 h-16 rounded-[24px] bg-indigo-50 flex items-center justify-center text-indigo-600 mb-6 shadow-sm border border-indigo-100">
            <Lock size={32} strokeWidth={2.5} />
          </div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Reset Password</h1>
          <p className="text-sm font-medium text-slate-400 mt-2">
            Secure your account with a new high-strength password.
          </p>
        </div>

        {isSuccess ? (
          <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-500 text-center">
            <div className="p-6 bg-emerald-50 rounded-[32px] border border-emerald-100 flex flex-col items-center gap-4 text-emerald-700">
              <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center shadow-sm">
                <CheckCircle2 size={24} />
              </div>
              <div className="space-y-1">
                <p className="font-black text-lg tracking-tight">Update Complete</p>
                <p className="text-sm font-medium opacity-80 leading-relaxed">
                  Redirecting you to login in a few seconds...
                </p>
              </div>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-2">New Password</label>
                <div className="relative group">
                  <Input 
                    type={showPassword ? "text" : "password"}
                    value={formData.new_password}
                    onChange={(e) => setFormData({ ...formData, new_password: e.target.value })}
                    placeholder="Min. 6 characters"
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

              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-2">Confirm New Password</label>
                <div className="relative group">
                  <Input 
                    type={showPassword ? "text" : "password"}
                    value={formData.confirm_password}
                    onChange={(e) => setFormData({ ...formData, confirm_password: e.target.value })}
                    placeholder="Repeat new password"
                    className="h-14 pr-12 rounded-2xl font-bold bg-slate-50 border-slate-100 focus:ring-4 focus:ring-indigo-500/5 transition-all shadow-inner"
                    required
                  />
                </div>
              </div>
            </div>

            <Button 
              type="submit" 
              disabled={isLoading}
              className="w-full h-14 rounded-2xl bg-slate-900 hover:bg-indigo-600 text-white font-black text-xs uppercase tracking-[0.2em] transition-all shadow-xl shadow-indigo-600/10 active:scale-95"
            >
              {isLoading ? <Loader2 className="animate-spin" /> : "Update Password"}
            </Button>
          </form>
        )}
      </div>
    </div>
  );
}
