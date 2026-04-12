"use client";

import { startTransition, useState } from "react";
import { useAuthStore } from "@/store/auth.store";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { 
  Lock, 
  Mail, 
  Eye, 
  EyeOff, 
  Loader2, 
  ShieldCheck, 
  Building2, 
  Users, 
  Phone, 
  Briefcase,
  ArrowRight,
  Sparkles,
  Zap,
  CheckCircle2,
  ChevronRight
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import { toast } from "sonner";
import { submitTrialRequest } from "@/service/support";

type AuthMode = "login" | "trial";

interface APIError {
  message?: string;
  response?: {
    data?: {
      meta?: {
        message?: string;
      };
      message?: string;
    };
  };
}

export default function LoginView() {
  const { login, loading } = useAuthStore();
  const router = useRouter();

  const [mode, setMode] = useState<AuthMode>("login");
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmittingTrial, setIsSubmittingTrial] = useState(false);

  // Login Form State
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");

  // Trial Form State
  const [trialData, setTrialData] = useState({
    name: "",
    email: "",
    companyName: "",
    employeeCount: "",
    industry: "",
    phone: ""
  });

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await login(loginEmail, loginPassword);
      toast.success("Welcome back! Synchronizing your workspace...");
      startTransition(() => {
        router.replace("/");
        router.refresh();
      });
    } catch (err: unknown) {
      const error = err as APIError;
      const msg = error.message || error.response?.data?.message || "Invalid credentials. Please try again.";
      toast.error(msg);
    }
  };

  const handleRequestTrial = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setIsSubmittingTrial(true);
      const resp = await submitTrialRequest({
        company_name: trialData.companyName,
        contact_name: trialData.name,
        email: trialData.email,
        phone_number: trialData.phone,
        employee_count_range: trialData.employeeCount,
        industry: trialData.industry
      });

      if (resp.success) {
        toast.success("Trial request submitted! Our team will contact you soon.");
        setMode("login");
        setTrialData({ name: "", email: "", companyName: "", employeeCount: "", industry: "", phone: "" });
      }
    } catch (err: unknown) {
      const error = err as APIError;
      const msg = error?.response?.data?.meta?.message || "Failed to submit request. Please try again.";
      toast.error(msg);
    } finally {
      setIsSubmittingTrial(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-slate-50 flex items-center justify-center p-4 sm:p-6 lg:p-10 overflow-hidden relative">
      
      {/* Abstract Background Orbs */}
      <div className="absolute top-0 -left-20 w-[500px] h-[500px] bg-blue-400/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 -right-20 w-[500px] h-[500px] bg-indigo-400/10 rounded-full blur-[120px] pointer-events-none" />

      <div className="w-full max-w-[1200px] grid grid-cols-1 lg:grid-cols-12 bg-white rounded-[48px] shadow-2xl shadow-slate-200 border border-white overflow-hidden animate-in fade-in zoom-in-95 duration-700 relative z-10 min-h-[800px]">
        
        {/* Left Side: Brand & Visual Journey (Spacious) */}
        <div className="hidden lg:flex lg:col-span-5 flex-col justify-between bg-slate-950 p-16 text-white relative overflow-hidden">
          <div className="absolute inset-0 bg-linear-to-br from-blue-600/20 via-transparent to-indigo-950/40 pointer-events-none" />
          <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/10 rounded-full blur-[100px] -mr-48 -mt-48" />
          
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-20 group cursor-pointer">
              <div className="w-12 h-12 rounded-2xl bg-blue-600 flex items-center justify-center shadow-xl shadow-blue-500/40 group-hover:scale-110 transition-transform duration-500">
                <Zap size={28} className="fill-current text-white" />
              </div>
              <span className="text-2xl font-black tracking-tight uppercase">Attendance<span className="text-blue-400">Pro</span></span>
            </div>

            {mode === "login" ? (
              <div className="space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-700">
                <h2 className="text-5xl font-black leading-[1.1] tracking-tight">
                  Next-Gen <br /> 
                  <span className="text-transparent bg-clip-text bg-linear-to-r from-blue-400 to-indigo-300">People Intel.</span>
                </h2>
                <p className="text-slate-400 font-medium leading-relaxed text-lg max-w-sm">
                  Empower your workforce with AI-driven analytics and seamless automated operations.
                </p>
                <div className="pt-10 flex flex-col gap-4">
                   {[
                     "Real-time Attendance Biometrics",
                     "Automated TER 2024 Tax Engine",
                     "Enterprise Role Hierarchy"
                   ].map((feat, i) => (
                     <div key={i} className="flex items-center gap-3 text-sm font-bold text-slate-300">
                        <CheckCircle2 size={18} className="text-blue-500" /> {feat}
                     </div>
                   ))}
                </div>
              </div>
            ) : (
              <div className="space-y-10 animate-in fade-in slide-in-from-bottom-8 duration-700">
                <div className="space-y-4">
                  <h2 className="text-5xl font-black leading-[1.1] tracking-tight">
                    Onboarding <br /> 
                    <span className="text-transparent bg-clip-text bg-linear-to-r from-blue-400 to-indigo-300">Journey.</span>
                  </h2>
                  <p className="text-slate-400 font-medium text-lg">Ikuti alur aktivasi cerdas untuk perusahaan Anda.</p>
                </div>

                <div className="relative space-y-12 pl-4">
                  {/* Vertical Connector Line */}
                  <div className="absolute left-8 top-2 bottom-2 w-px bg-linear-to-b from-blue-500/50 via-slate-700 to-transparent" />

                  {[
                    { icon: Zap, title: "Step 1: Data Organisasi", text: "Lengkapi formulir pendaftaran di sebelah kanan dengan data yang valid.", color: "bg-blue-600 shadow-blue-500/20" },
                    { icon: Mail, title: "Step 2: Aktivasi Email", text: "Kami akan mengirimkan instruksi aktivasi ke alamat email penanggung jawab.", color: "bg-emerald-600 shadow-emerald-500/20" },
                    { icon: ShieldCheck, title: "Step 3: Verifikasi Akses", text: "Pastikan email aktif untuk menerima kredensial login pertama Anda.", color: "bg-amber-600 shadow-amber-500/20" },
                  ].map((step, idx) => (
                    <div key={idx} className="relative flex items-start gap-8 group">
                      <div className={`w-10 h-10 shrink-0 rounded-2xl ${step.color} flex items-center justify-center shadow-lg relative z-10 group-hover:scale-110 transition-transform duration-300`}>
                        <step.icon size={20} strokeWidth={2.5} />
                      </div>
                      <div className="space-y-1 pt-1">
                        <p className="text-sm font-black uppercase tracking-[0.2em] text-white group-hover:text-blue-400 transition-colors">{step.title}</p>
                        <p className="text-[12px] font-bold text-slate-400 leading-relaxed max-w-[240px]">
                          {step.text}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="relative z-10 pt-12 border-t border-white/5">
            <div className="flex items-center gap-4 mb-6">
              <div className="flex -space-x-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="relative w-10 h-10 rounded-full border-2 border-slate-950 overflow-hidden shadow-xl">
                    <Image src={`https://i.pravatar.cc/100?u=${i+10}`} alt="User" fill className="object-cover" />
                  </div>
                ))}
              </div>
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest leading-tight">
                Trusted by <span className="text-white font-black">2,400+</span> <br /> Global Companies
              </p>
            </div>
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md">
               <ShieldCheck size={14} className="text-blue-400" />
               <span className="text-[10px] font-black uppercase tracking-widest text-slate-300">ISO 27001 Certified Security</span>
            </div>
          </div>
        </div>

        {/* Right Side: Forms (Standard Cols) */}
        <div className="lg:col-span-7 p-8 sm:p-16 lg:p-20 flex flex-col justify-center bg-white relative">
          
          {/* Mode Switcher */}
          <div className="flex p-1.5 bg-slate-100/80 rounded-2xl mb-12 w-fit self-center lg:self-start border border-slate-200/50">
            <button 
              type="button"
              onClick={() => setMode("login")}
              className={`px-10 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${mode === "login" ? "bg-white text-blue-600 shadow-xl scale-105" : "text-slate-500 hover:text-slate-900"}`}
            >
              Sign In
            </button>
            <button 
              type="button"
              onClick={() => setMode("trial")}
              className={`px-10 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${mode === "trial" ? "bg-white text-blue-600 shadow-xl scale-105" : "text-slate-500 hover:text-slate-900"}`}
            >
              Request Trial
            </button>
          </div>

          {mode === "login" ? (
            <div className="space-y-10 animate-in fade-in slide-in-from-right-8 duration-700">
              <div className="space-y-3">
                <h1 className="text-4xl font-black text-slate-900 tracking-tight leading-none">Welcome Back</h1>
                <p className="text-slate-400 font-medium text-lg">Enter your organization credentials to proceed.</p>
              </div>

              <form onSubmit={handleLogin} className="space-y-6">
                <div className="space-y-2.5">
                  <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">Work Identity</label>
                  <div className="relative group">
                    <Mail className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5 group-focus-within:text-blue-600 transition-colors" />
                    <Input 
                      required
                      type="email"
                      placeholder="name@company.com"
                      value={loginEmail}
                      onChange={(e) => setLoginEmail(e.target.value)}
                      className="pl-14 h-16 bg-slate-50 border-none rounded-2xl focus:ring-8 focus:ring-blue-500/5 focus:bg-white transition-all font-bold text-base shadow-inner"
                    />
                  </div>
                </div>

                <div className="space-y-2.5">
                  <div className="flex justify-between items-center px-1">
                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Security Key</label>
                    <button type="button" className="text-[10px] font-black uppercase text-blue-600 hover:text-blue-700 transition-colors">Forgot Password?</button>
                  </div>
                  <div className="relative group">
                    <Lock className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5 group-focus-within:text-blue-600 transition-colors" />
                    <Input 
                      required
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      className="pl-14 pr-14 h-16 bg-slate-50 border-none rounded-2xl focus:ring-8 focus:ring-blue-500/5 focus:bg-white transition-all font-bold text-base shadow-inner"
                    />
                    <button 
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors p-2 rounded-lg hover:bg-slate-100"
                    >
                      {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                  </div>
                </div>

                <Button 
                  disabled={loading}
                  type="submit" 
                  className="w-full h-16 bg-slate-950 text-white hover:bg-blue-600 rounded-3xl font-black text-sm uppercase tracking-[0.2em] shadow-2xl shadow-slate-200 transition-all active:scale-[0.98] flex items-center justify-center gap-4 mt-4"
                >
                  {loading ? <Loader2 className="animate-spin w-6 h-6" /> : <><Lock size={20} /> Sign In to Workspace</>}
                </Button>
              </form>
            </div>
          ) : (
            <div className="space-y-10 animate-in fade-in slide-in-from-left-8 duration-700">
              <div className="space-y-3">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-50 text-blue-600 text-[10px] font-black uppercase tracking-widest border border-blue-100 shadow-sm shadow-blue-500/10">
                  <Sparkles size={14} className="animate-pulse" /> Limited 14-Day Free Access
                </div>
                <h1 className="text-4xl font-black text-slate-900 tracking-tight leading-none">Register Organization</h1>
                <p className="text-slate-400 font-medium text-lg">Scale your workforce management with intelligence.</p>
              </div>

              <form onSubmit={handleRequestTrial} className="space-y-5 pt-6 border-t border-slate-100">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Contact Name</label>
                    <div className="relative group">
                      <Briefcase className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-4.5 h-4.5" />
                      <Input 
                        required
                        placeholder="Full Name"
                        value={trialData.name}
                        onChange={(e) => setTrialData({...trialData, name: e.target.value})}
                        className="pl-12 h-14 bg-slate-50 border-none rounded-2xl font-bold text-sm focus:bg-white transition-all shadow-xs"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Work Email</label>
                    <div className="relative group">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-4.5 h-4.5" />
                      <Input 
                        required
                        type="email"
                        placeholder="john@company.com"
                        value={trialData.email}
                        onChange={(e) => setTrialData({...trialData, email: e.target.value})}
                        className="pl-12 h-14 bg-slate-50 border-none rounded-2xl font-bold text-sm focus:bg-white transition-all shadow-xs"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Company Name</label>
                  <div className="relative group">
                    <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-4.5 h-4.5" />
                    <Input 
                      required
                      placeholder="e.g. Acme Tech Solutions"
                      value={trialData.companyName}
                      onChange={(e) => setTrialData({...trialData, companyName: e.target.value})}
                      className="pl-12 h-14 bg-slate-50 border-none rounded-2xl font-bold text-sm focus:bg-white transition-all shadow-xs"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Workforce Size</label>
                    <div className="relative group">
                      <Users className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-4.5 h-4.5 z-10" />
                      <select 
                        value={trialData.employeeCount}
                        onChange={(e) => setTrialData({...trialData, employeeCount: e.target.value})}
                        className="w-full pl-12 h-14 bg-slate-50 border border-transparent rounded-2xl font-bold text-sm focus:bg-white outline-none appearance-none transition-all cursor-pointer shadow-xs"
                      >
                        <option value="">Select range...</option>
                        <option value="1-10">1 - 10 Employees</option>
                        <option value="11-50">11 - 50 Employees</option>
                        <option value="51-200">51 - 200 Employees</option>
                        <option value="201+">201+ Employees</option>
                      </select>
                      <ChevronRight className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4 rotate-90" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Phone Number</label>
                    <div className="relative group">
                      <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-4.5 h-4.5" />
                      <Input 
                        required
                        placeholder="+62 812..."
                        value={trialData.phone}
                        onChange={(e) => setTrialData({...trialData, phone: e.target.value})}
                        className="pl-12 h-14 bg-slate-50 border-none rounded-2xl font-bold text-sm focus:bg-white transition-all shadow-xs"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Industry Sector</label>
                  <Input 
                    required
                    placeholder="e.g. Logistics, Fintech, etc."
                    value={trialData.industry}
                    onChange={(e) => setTrialData({...trialData, industry: e.target.value})}
                    className="h-14 bg-slate-50 border-none rounded-2xl font-bold text-sm focus:bg-white transition-all shadow-xs"
                  />
                </div>

                <Button 
                  disabled={isSubmittingTrial}
                  type="submit" 
                  className="w-full h-16 bg-blue-600 text-white hover:bg-blue-700 rounded-3xl font-black text-sm uppercase tracking-widest shadow-2xl shadow-blue-500/20 transition-all active:scale-[0.98] flex items-center justify-center gap-3 mt-6"
                >
                  {isSubmittingTrial ? <Loader2 className="animate-spin w-6 h-6" /> : <>Send Trial Request <ArrowRight size={20} /></>}
                </Button>
              </form>
            </div>
          )}

          <div className="mt-16 text-center border-t border-slate-50 pt-8">
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.2em]">
              © 2026 Attendance Pro Systems • Enterprise Solutions
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
