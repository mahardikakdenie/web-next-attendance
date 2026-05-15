"use client";

import React from "react";
import { Zap, ShieldCheck, CheckCircle2, AlertCircle, Info } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { UserData } from "@/types/api";

interface SubscriptionStatusCardProps {
  user: UserData | null;
}

export default function SubscriptionStatusCard({ user }: SubscriptionStatusCardProps) {
  const sub = user?.subscription;
  const features = user?.plan_features || [];

  const getStatusStyles = (status?: string) => {
    const s = status?.toLowerCase();
    if (s === "active" || s === "trial") return "bg-emerald-50 text-emerald-600 border-emerald-100";
    if (s === "expired" || s === "suspended") return "bg-rose-50 text-rose-600 border-rose-100";
    return "bg-amber-50 text-amber-600 border-amber-100";
  };

  return (
    <div className="bg-white rounded-[32px] md:rounded-[40px] border border-slate-100 shadow-sm overflow-hidden h-full flex flex-col">
      <div className="p-6 md:p-8 border-b border-slate-50 flex items-center justify-between">
        <div className="flex items-center gap-3 md:gap-4">
          <div className="w-10 h-10 md:w-12 md:h-12 rounded-2xl bg-blue-600 text-white flex items-center justify-center shadow-lg shadow-blue-600/20">
            <Zap size={20} className="md:size-[24px]" strokeWidth={2.5} fill="currentColor" />
          </div>
          <div>
            <h3 className="text-lg md:text-xl font-black text-slate-900 tracking-tight">Plan Status</h3>
            <p className="text-[9px] md:text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5 md:mt-1">Platform Capabilities</p>
          </div>
        </div>
        <Badge className={`${getStatusStyles(sub?.status)} border font-black text-[9px] uppercase tracking-widest py-1.5`}>
          {sub?.status || "Unknown"}
        </Badge>
      </div>

      <div className="p-6 md:p-8 space-y-6 md:space-y-8 flex-1">
        <div className="bg-slate-50 rounded-2xl md:rounded-3xl p-5 md:p-6 border border-slate-100 flex flex-col gap-1">
          <p className="text-[9px] md:text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Current Tier</p>
          <h4 className="text-xl md:text-2xl font-black text-slate-900 tracking-tight">{sub?.plan_name || "Free Trial"}</h4>
        </div>

        <div className="space-y-4">
          <div className="flex items-center gap-2 text-slate-400 mb-1">
            <ShieldCheck size={16} />
            <span className="text-[9px] md:text-[10px] font-black uppercase tracking-widest">Included Features</span>
          </div>
          
          <div className="grid grid-cols-1 gap-2.5 md:gap-3">
            {features.length > 0 ? (
              features.map((feature, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="w-5 h-5 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                    <CheckCircle2 size={12} strokeWidth={3} />
                  </div>
                  <span className="text-sm font-bold text-slate-600 capitalize">{feature.replace(/-/g, ' ').replace(/\./g, ' ')}</span>
                </div>
              ))
            ) : (
              <div className="flex items-center gap-3 text-slate-400">
                <AlertCircle size={16} />
                <span className="text-sm font-medium italic">Standard platform access</span>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="p-5 md:p-6 bg-slate-50/50 border-t border-slate-50 mt-auto">
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center text-blue-500 shadow-sm shrink-0">
            <Info size={16} />
          </div>
          <p className="text-[10px] md:text-[11px] font-medium text-slate-400 leading-relaxed">
            Your plan determines the available modules and staff capacity. Upgrade your plan in the <span className="text-blue-600 font-bold">Billing</span> section.
          </p>
        </div>
      </div>
    </div>
  );
}
