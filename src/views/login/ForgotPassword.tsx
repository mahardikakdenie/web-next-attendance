"use client";

import { useState } from "react";
import { Mail, ArrowLeft, Loader2, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import { forgotPasswordAPI } from "@/service/auth.service";
import { toast } from "sonner";

export default function ForgotPasswordView() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    try {
      setIsLoading(true);
      await forgotPasswordAPI({ email });
      setIsSuccess(true);
      toast.success("Reset link sent to your email!");
    } catch {
      // Still show success to avoid email enumeration
      setIsSuccess(true);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-[40px] shadow-2xl border border-white p-8 sm:p-12 animate-in fade-in zoom-in-95 duration-500">
        
        <div className="flex flex-col items-center text-center mb-10">
          <div className="w-16 h-16 rounded-[24px] bg-indigo-50 flex items-center justify-center text-indigo-600 mb-6 shadow-sm border border-indigo-100">
            <Mail size={32} strokeWidth={2.5} />
          </div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Forgot Password</h1>
          <p className="text-sm font-medium text-slate-400 mt-2">
            No worries! Enter your registered email and we&apos;ll send you a secure reset link.
          </p>
        </div>

        {isSuccess ? (
          <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-500 text-center">
            <div className="p-6 bg-emerald-50 rounded-[32px] border border-emerald-100 flex flex-col items-center gap-4 text-emerald-700">
              <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center shadow-sm">
                <CheckCircle2 size={24} />
              </div>
              <div className="space-y-1">
                <p className="font-black text-lg tracking-tight">Check your inbox</p>
                <p className="text-sm font-medium opacity-80 leading-relaxed">
                  If an account exists for {email}, you will receive a reset link shortly.
                </p>
              </div>
            </div>

            <Link href="/login">
              <Button variant="secondary" className="w-full h-14 rounded-2xl font-black text-xs uppercase tracking-[0.2em] bg-white border-slate-200">
                Back to Login
              </Button>
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-2">Email Address</label>
              <div className="relative group">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-600 transition-colors" size={18} />
                <Input 
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="john@company.com"
                  className="h-14 pl-12 rounded-2xl font-bold bg-slate-50 border-slate-100 focus:ring-4 focus:ring-indigo-500/5 transition-all"
                  required
                />
              </div>
            </div>

            <Button 
              type="submit" 
              disabled={isLoading}
              className="w-full h-14 rounded-2xl bg-slate-900 hover:bg-indigo-600 text-white font-black text-xs uppercase tracking-[0.2em] transition-all shadow-xl shadow-indigo-600/10 active:scale-95"
            >
              {isLoading ? <Loader2 className="animate-spin" /> : "Send Reset Link"}
            </Button>

            <Link href="/login" className="flex items-center justify-center gap-2 text-[10px] font-black text-slate-400 hover:text-slate-900 uppercase tracking-[0.2em] transition-colors">
              <ArrowLeft size={14} /> Back to Login
            </Link>
          </form>
        )}
      </div>
    </div>
  );
}
