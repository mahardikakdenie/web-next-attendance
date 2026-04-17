"use client";

import GreetingCard from "@/components/dashboard-user/GreetingCard";
import ClockCard from "@/components/dashboard-user/ClockCard";
import TodayStatusCard from "@/components/dashboard-user/TodayStatusCard";
import { QuickInfoCard } from "@/components/dashboard-user/QuickInfoCard";
import { RecentAttendance } from "@/components/dashboard-user/RecentAttendance";
import { OvertimeRequestCard } from "@/components/dashboard-user/OvertimeRequestCard";
import { RecentActivityCard } from "@/components/dashboard-user/RecentlyActivity";
import { LeaveBalanceCard } from "@/components/dashboard-user/LeaveBalanceCard";
import { LeaveRequestCard } from "@/components/dashboard-user/LeaveRequestCard";
import { ReimbursementRequestCard } from "@/components/dashboard-user/ReimbursementRequestCard";
import { UserGoalsSection } from "@/views/performance/UserGoals";
import { 
  LayoutGrid, 
  Clock, 
  FileText, 
  Target, 
  History 
} from "lucide-react";
import { useAuthStore } from "@/store/auth.store";

export default function UserDashboardPage() {
  const { user } = useAuthStore();
  
  return (
    <div className="flex flex-col gap-8 w-full pb-16 animate-in fade-in duration-700 max-w-[1600px] mx-auto px-4 md:px-8 xl:px-0">
      
      {/* 1. WELCOME SECTION */}
      <header className="flex flex-col gap-3 pt-4">
        <div className="flex items-center gap-2 text-blue-600 mb-1">
          <LayoutGrid size={18} strokeWidth={2.5} />
          <span className="text-xs font-bold uppercase tracking-[0.2em] text-blue-600/80">
            Employee Dashboard
          </span>
        </div>
        <GreetingCard />
      </header>

      {/* 2. MAIN LAYOUT */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 lg:gap-10 items-start relative">
        
        {/* LEFT & CENTER CONTENT (8/12) */}
        <div className="xl:col-span-8 flex flex-col gap-10">
          
          {/* PRIMARY ACTIONS: Clock & Today's Summary */}
          <section className="flex flex-col gap-5">
            <div className="flex items-center gap-3 px-1">
              <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shadow-sm border border-blue-100/50">
                <Clock size={18} strokeWidth={2.5} />
              </div>
              <h2 className="text-xl font-bold text-slate-900 tracking-tight">Daily Presence</h2>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
              <div className="lg:col-span-7 flex flex-col h-full">
                <ClockCard />
              </div>
              <div className="lg:col-span-5 flex flex-col h-full">
                <TodayStatusCard />
              </div>
            </div>
          </section>

          {/* REQUESTS & FORMS SECTION (UPDATE: FEATURED ACTION LAYOUT) */}
          <section className="flex flex-col gap-5">
            <div className="flex items-center gap-3 px-1">
              <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shadow-sm border border-indigo-100/50">
                <FileText size={18} strokeWidth={2.5} />
              </div>
              <h2 className="text-xl font-bold text-slate-900 tracking-tight">Quick Actions</h2>
            </div>
            
            {/* Grid layout 2 kolom */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 items-stretch">
              {/* Featured Card: Membentang penuh 2 kolom di layar medium ke atas */}
              <div className="md:col-span-2 flex flex-col h-full transition-transform hover:-translate-y-1 duration-300">
                <LeaveRequestCard />
              </div>
              
              {/* Secondary Cards: Berbagi ruang 50:50 di bawahnya */}
              <div className="flex flex-col h-full transition-transform hover:-translate-y-1 duration-300">
                <OvertimeRequestCard />
              </div>
              <div className="flex flex-col h-full transition-transform hover:-translate-y-1 duration-300">
                <ReimbursementRequestCard />
              </div>
            </div>
          </section>

          {/* PERFORMANCE & GOALS */}
          <section className="flex flex-col gap-5">
            <div className="flex items-center gap-3 px-1">
              <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shadow-sm border border-emerald-100/50">
                <Target size={18} strokeWidth={2.5} />
              </div>
              <h2 className="text-xl font-bold text-slate-900 tracking-tight">Goals & Performance</h2>
            </div>
            <UserGoalsSection />
          </section>

          {/* HISTORY / TABLE SECTION */}
          <section className="flex flex-col gap-5">
            <div className="flex items-center gap-3 px-1">
              <div className="w-9 h-9 rounded-xl bg-slate-100 text-slate-600 flex items-center justify-center shadow-sm border border-slate-200/50">
                <History size={18} strokeWidth={2.5} />
              </div>
              <h2 className="text-xl font-bold text-slate-900 tracking-tight">Attendance History</h2>
            </div>
            <div className="bg-white rounded-3xl md:rounded-[40px] border border-slate-100 shadow-sm overflow-hidden p-2 md:p-4">
              <RecentAttendance />
            </div>
          </section>

        </div>

        {/* RIGHT SIDEBAR (4/12) - STICKY TOP */}
        <aside className="xl:col-span-4 flex flex-col gap-8 sticky top-8">
          
          <div className="flex flex-col gap-5">
            <div className="flex items-center gap-3 px-1">
              <span className="text-xs font-bold uppercase tracking-[0.2em] text-slate-400">
                At a Glance
              </span>
            </div>
            
            <div className="flex flex-col gap-5">
              <LeaveBalanceCard />
              <QuickInfoCard />
              <RecentActivityCard />
            </div>
          </div>

          {/* Tips or Quote Card */}
          <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-3xl md:rounded-[40px] p-8 text-white relative overflow-hidden group shadow-2xl shadow-slate-200">
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-3xl -mr-16 -mt-16 group-hover:bg-blue-500/20 transition-all duration-700" />
            <div className="relative z-10 space-y-4">
              <div className="w-10 h-10 rounded-xl bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/10">
                <Target size={20} className="text-blue-400" />
              </div>
              <h4 className="text-lg font-bold tracking-tight">Pro Tip</h4>
              <p className="text-slate-300 text-sm font-medium leading-relaxed italic">
                &quot;Efficiency is doing things right; effectiveness is doing the right things.&quot;
              </p>
              <div className="pt-2">
                <p className="text-[10px] font-bold uppercase tracking-widest text-blue-400">
                  Keep it up, {user?.name?.split(' ')[0] || "Team"}!
                </p>
              </div>
            </div>
          </div>

        </aside>

      </div>
    </div>
  );
}
