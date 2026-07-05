import React from "react";
import { ShieldAlert, Plus, RefreshCw, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/Button";

interface PlatformRolesHeaderProps {
  isSyncing: boolean;
  handleSyncCache: () => void;
  setIsCreating: (val: boolean) => void;
}

export function PlatformRolesHeader({ 
  isSyncing, 
  handleSyncCache, 
  setIsCreating 
}: PlatformRolesHeaderProps) {
  return (
    <section className="relative overflow-hidden bg-slate-950 rounded-[40px] p-8 sm:p-12 shadow-2xl text-white">
      <div className="absolute top-0 right-0 -mt-20 -mr-20 w-96 h-96 bg-indigo-600 opacity-20 rounded-full blur-[100px] pointer-events-none"></div>
      
      <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="space-y-4">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 backdrop-blur-xl border border-white/10 text-[11px] font-black tracking-[0.2em] uppercase text-indigo-400">
            <ShieldAlert size={16} className="fill-current" />
            SECURITY & GOVERNANCE
          </div>
          <h1 className="text-4xl sm:text-5xl font-black tracking-tight leading-tight uppercase">
            ROLES & <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-blue-400">PERMISSIONS</span>
          </h1>
          <p className="text-slate-400 font-medium max-w-xl text-sm sm:text-base leading-relaxed">
            Define foundational RBAC blueprints, assign module capabilities, and grant user role-based menu access. Changes ripple across all organization tenants.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button 
            onClick={handleSyncCache}
            disabled={isSyncing}
            className="bg-slate-800/50 border border-slate-700 text-slate-300 hover:text-white hover:bg-slate-700/50 font-black px-6 py-4 rounded-2xl shadow-xl transition-all active:scale-95 flex items-center gap-2 uppercase text-xs tracking-widest"
          >
            {isSyncing ? <Loader2 size={20} className="animate-spin" /> : <RefreshCw size={20} strokeWidth={3} />} SYNC CACHE
          </Button>
          <Button 
            onClick={() => setIsCreating(true)}
            className="bg-indigo-600 text-white hover:bg-indigo-700 font-black px-8 py-4 rounded-2xl shadow-xl shadow-indigo-600/20 transition-all active:scale-95 flex items-center gap-2 uppercase text-xs tracking-widest"
          >
            <Plus size={20} strokeWidth={3} /> NEW MASTER CORE
          </Button>
        </div>
      </div>
    </section>
  );
}
