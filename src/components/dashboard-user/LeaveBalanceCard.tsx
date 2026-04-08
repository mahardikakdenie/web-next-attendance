"use client";

import { Umbrella, Sparkles, TrendingUp } from "lucide-react";

export function LeaveBalanceCard() {
  const balanceData = {
    total: 12,
    used: 4,
    remaining: 8,
    accrued: 2,
  };

  return (
    <div className="w-full h-full rounded-[32px] border border-neutral-200 bg-white p-6 shadow-sm overflow-hidden flex flex-col">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-base font-bold text-neutral-800 tracking-tight">Time Off Balance</h2>
          <p className="text-[10px] font-medium text-neutral-400 uppercase tracking-widest mt-0.5">Annual Leave Cycle</p>
        </div>
        <div className="h-10 w-10 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600 border border-indigo-100">
          <Umbrella size={20} strokeWidth={2.5} />
        </div>
      </div>

      <div className="flex flex-col gap-4">
        {/* Main Counter */}
        <div className="relative p-6 rounded-[24px] bg-indigo-600 text-white overflow-hidden shadow-xl shadow-indigo-600/20 group">
          <div className="relative z-10">
            <span className="text-[10px] font-black uppercase tracking-[0.2em] opacity-80">Remaining Days</span>
            <div className="flex items-baseline gap-1 mt-1">
              <span className="text-4xl font-black tracking-tighter">{balanceData.remaining}</span>
              <span className="text-xs font-bold opacity-60">/ {balanceData.total} Days</span>
            </div>
          </div>
          
          {/* Decorative Elements */}
          <Sparkles size={64} className="absolute -right-4 -bottom-4 text-white/10 rotate-12 group-hover:scale-110 transition-transform duration-700" />
        </div>

        {/* Breakdown Stats */}
        <div className="grid grid-cols-2 gap-3">
          <div className="p-3.5 rounded-2xl border border-neutral-100 bg-neutral-50/50 flex flex-col gap-1 transition-all hover:bg-white hover:border-neutral-200 group">
            <div className="flex items-center gap-2">
              <div className="h-5 w-5 rounded-lg bg-emerald-100 text-emerald-600 flex items-center justify-center">
                <TrendingUp size={10} strokeWidth={3} />
              </div>
              <span className="text-[9px] font-black text-neutral-400 uppercase tracking-widest">Accrued</span>
            </div>
            <span className="text-sm font-black text-neutral-900 ml-0.5">+{balanceData.accrued} Days</span>
          </div>

          <div className="p-3.5 rounded-2xl border border-neutral-100 bg-neutral-50/50 flex flex-col gap-1 transition-all hover:bg-white hover:border-neutral-200 group">
            <div className="flex items-center gap-2">
              <div className="h-5 w-5 rounded-lg bg-rose-100 text-rose-600 flex items-center justify-center">
                <TrendingUp size={10} strokeWidth={3} className="rotate-180" />
              </div>
              <span className="text-[9px] font-black text-neutral-400 uppercase tracking-widest">Used</span>
            </div>
            <span className="text-sm font-black text-neutral-900 ml-0.5">{balanceData.used} Days</span>
          </div>
        </div>
      </div>

      <div className="mt-auto pt-4 border-t border-neutral-100/50">
        <div className="flex items-center justify-between text-[10px] font-bold text-neutral-400">
          <span>Policy Reset: Jan 1, 2027</span>
          <span className="text-indigo-600 underline cursor-pointer hover:text-indigo-700">View History</span>
        </div>
      </div>
    </div>
  );
}
