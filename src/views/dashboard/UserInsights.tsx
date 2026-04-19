"use client";

import { LeaveBalanceCard } from "@/components/dashboard-user/LeaveBalanceCard";
import { QuickInfoCard } from "@/components/dashboard-user/QuickInfoCard";
import { RecentActivityCard } from "@/components/dashboard-user/RecentlyActivity";
import { UserGoalsSection } from "@/views/performance/UserGoals";
import GreetingCard from "@/components/dashboard-user/GreetingCard";
import { TrendingUp, Target, Activity } from "lucide-react";

export default function UserInsightsView() {
  return (
    <div className="flex flex-col gap-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* 1. Header with Greeting */}
      <div className="bg-white/40 backdrop-blur-md p-6 rounded-[40px] border border-white shadow-sm ring-1 ring-slate-200/50">
        <GreetingCard />
      </div>

      {/* 2. Main Analytics Content */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Side: Performance & Goals (8/12) */}
        <div className="lg:col-span-8 flex flex-col gap-8">
          <div className="flex items-center gap-3 px-2">
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shadow-sm border border-emerald-100/50">
              <Target size={18} strokeWidth={2.5} />
            </div>
            <h2 className="text-xl font-bold text-slate-900 tracking-tight text-shadow-sm">Personal Performance Matrix</h2>
          </div>
          
          <UserGoalsSection />

          {/* Additional Analytics Placeholder */}
          <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-[40px] p-8 text-white relative overflow-hidden shadow-xl shadow-blue-200">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -mr-32 -mt-32" />
            <div className="relative z-10">
              <h3 className="text-xl font-black mb-2 flex items-center gap-2">
                <TrendingUp size={24} />
                Insights & Trends
              </h3>
              <p className="text-blue-100 text-sm font-medium leading-relaxed max-w-md">
                Your productivity score has increased by 12% compared to last month. Keep maintaining your punctuality to reach Top Performer status.
              </p>
              <div className="mt-8 grid grid-cols-3 gap-4">
                <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/10">
                  <p className="text-[10px] font-black uppercase tracking-widest text-blue-200 mb-1">Punctuality</p>
                  <p className="text-xl font-black">98.4%</p>
                </div>
                <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/10">
                  <p className="text-[10px] font-black uppercase tracking-widest text-blue-200 mb-1">Overtime</p>
                  <p className="text-xl font-black">12.5h</p>
                </div>
                <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/10">
                  <p className="text-[10px] font-black uppercase tracking-widest text-blue-200 mb-1">Leaves</p>
                  <p className="text-xl font-black">2 Days</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side: Quick Stats (4/12) */}
        <aside className="lg:col-span-4 flex flex-col gap-8">
          <div className="flex items-center gap-3 px-2">
            <div className="w-9 h-9 rounded-xl bg-slate-100 text-slate-600 flex items-center justify-center shadow-sm border border-slate-200/50">
              <Activity size={18} strokeWidth={2.5} />
            </div>
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">Status Snapshot</h2>
          </div>
          
          <div className="flex flex-col gap-6">
            <LeaveBalanceCard />
            <QuickInfoCard />
            <RecentActivityCard />
          </div>
        </aside>
      </div>
    </div>
  );
}
