"use client";

import { 
  Clock, 
  CalendarCheck, 
  ArrowUpRight, 
  Activity,
  CheckCircle2,
  ChevronRight,
  UserCheck,
  UserX,
  ShieldCheck,
  LayoutDashboard,
  Sparkles,
  Command,
  Users
} from "lucide-react";
import { useEffect, useState, useCallback } from "react";
import ClockCard from "@/components/dashboard-user/ClockCard";
import { LeaveBalanceCard } from "@/components/dashboard-user/LeaveBalanceCard";
import { LeaveRequestCard } from "@/components/dashboard-user/LeaveRequestCard";
import { ReimbursementRequestCard } from "@/components/dashboard-user/ReimbursementRequestCard";
import { getHrDashboard } from "@/service/dashboard";
import { getLeaveRequests, LeaveRequestData } from "@/service/leave";
import { HrDashboardData } from "@/types/api";
import { Badge } from "@/components/ui/Badge";
import Avatar from "@/components/ui/Avatar";
import { getProfileImage } from "@/lib/utils";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/auth.store";

export default function ManagerDashboardPage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const [data, setData] = useState<HrDashboardData | null>(null);
  const [pendingLeaves, setPendingLeaves] = useState<LeaveRequestData[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchData = useCallback(async () => {
    try {
      setIsLoading(true);
      const [resp, leaveResp] = await Promise.all([
        getHrDashboard(),
        getLeaveRequests({ status: 'pending', page: 1, limit: 5 })
      ]);

      if (resp.data) {
        setData(resp.data);
      }
      if (leaveResp.data) {
        setPendingLeaves(leaveResp.data);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    Promise.resolve().then(() => {
      fetchData();
    });
  }, [fetchData]);

  if (isLoading) {
    return (
      <div className="flex flex-col gap-10 max-w-[1600px] mx-auto animate-pulse pb-16">
        <div className="h-60 bg-slate-200/50 rounded-[40px]" />
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          <div className="lg:col-span-8 flex flex-col gap-10">
            <div className="h-40 bg-slate-100 rounded-[40px]" />
            <div className="h-80 bg-slate-100 rounded-[40px]" />
          </div>
          <div className="lg:col-span-4 flex flex-col gap-10">
             <div className="h-64 bg-slate-100 rounded-[40px]" />
             <div className="h-80 bg-slate-100 rounded-[40px]" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-10 pb-16 animate-in fade-in duration-700 max-w-[1600px] mx-auto">
      
      {/* 1. OPERATIONS HEADER */}
      <section id="tour-manager-header" className="relative overflow-hidden bg-slate-900 rounded-[40px] p-8 sm:p-12 shadow-2xl shadow-slate-900/30 text-white">
        <div className="absolute top-0 right-0 -mt-20 -mr-20 w-96 h-96 bg-blue-500 opacity-20 rounded-full blur-[100px] pointer-events-none animate-pulse"></div>
        <div className="absolute bottom-0 left-0 -mb-20 -ml-20 w-64 h-64 bg-indigo-500 opacity-10 rounded-full blur-[80px] pointer-events-none"></div>
        
        <div className="relative z-10 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-10">
          <div className="space-y-4 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-xl border border-white/10 text-[10px] font-black tracking-[0.25em] uppercase text-blue-300">
              <Command size={14} />
              Operational Headquarters
            </div>
            <h1 className="text-4xl sm:text-5xl font-black tracking-tight leading-tight">
              Command <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400 animate-gradient">Interface</span>
            </h1>
            <p className="text-slate-400 font-medium text-sm sm:text-base leading-relaxed">
              Hello, {user?.name}. You have <span className="text-blue-400 font-bold">{data?.stats.pending_leave || 0} pending approvals</span> and <span className="text-rose-400 font-bold">{data?.stats.at_risk_staff || 0} employees</span> requiring attention today.
            </p>
          </div>
          
          <div className="grid grid-cols-2 gap-4 shrink-0">
             <div className="flex flex-col gap-1 px-6 py-4 bg-white/5 rounded-3xl border border-white/10 backdrop-blur-md">
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Active Nodes</p>
                <p className="text-xl font-black text-emerald-400 flex items-center gap-2">
                  All Systems <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                </p>
             </div>
             <div className="flex flex-col gap-1 px-6 py-4 bg-white/5 rounded-3xl border border-white/10 backdrop-blur-md">
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Global Sync</p>
                <p className="text-xl font-black text-blue-400">99.8%</p>
             </div>
          </div>
        </div>
      </section>

      {/* TATA LETAK UTAMA: GRID DENGAN ITEMS-START PENTING DI SINI */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
        
        {/* MANAGEMENT SIDE (8/12) */}
        <div className="lg:col-span-8 flex flex-col gap-10">
          
          {/* A. WORKFORCE METRICS */}
          <section id="tour-manager-metrics" className="flex flex-col gap-6">
            <div className="flex items-center gap-3 px-2">
              <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shadow-sm">
                <Activity size={16} strokeWidth={2.5} />
              </div>
              <h2 className="text-lg font-black text-slate-900 tracking-tight text-center lg:text-left">Workforce Pulse</h2>
            </div>
            
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {[
                { label: "Presence", value: `${data?.stats.presence_rate}%`, icon: UserCheck, color: "text-emerald-600", bg: "bg-emerald-50", desc: "Live rate" },
                { label: "Overtime", value: `${data?.stats.avg_overtime}h`, icon: Clock, color: "text-blue-600", bg: "bg-blue-50", desc: "Daily avg" },
                { label: "Pending", value: data?.stats.pending_leave, icon: CalendarCheck, color: "text-amber-600", bg: "bg-amber-50", desc: "In backlog" },
                { label: "At Risk", value: data?.stats.at_risk_staff, icon: UserX, color: "text-rose-600", bg: "bg-rose-50", desc: "Action needed" },
              ].map((stat, i) => (
                <div key={i} className="p-6 rounded-[32px] bg-white border border-slate-100 shadow-sm hover:shadow-xl transition-all duration-300 group flex flex-col gap-4">
                  <div className={`w-12 h-12 rounded-2xl ${stat.bg} ${stat.color} flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
                    <stat.icon size={24} strokeWidth={2.5} />
                  </div>
                  <div>
                    <p className="text-2xl font-black text-slate-900 tracking-tight">{stat.value}</p>
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mt-1">{stat.label}</p>
                    <p className="text-[9px] font-bold text-slate-300 uppercase tracking-tighter">{stat.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* B. APPROVALS HUB */}
          <section id="tour-manager-approvals" className="bg-white rounded-[40px] p-8 shadow-sm border border-slate-100 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-50/50 rounded-full blur-[80px] -mr-32 -mt-32 pointer-events-none" />
            
            <div className="relative z-10 flex items-center justify-between mb-8">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                  <CheckCircle2 size={16} strokeWidth={2.5} />
                </div>
                <h2 className="text-lg font-black text-slate-900 tracking-tight">Approvals Hotline</h2>
              </div>
              <Badge className="bg-rose-50 text-rose-600 border-none font-black text-[10px] uppercase tracking-widest px-3 py-1">Hot Queue</Badge>
            </div>

            <div className="space-y-3">
              {(pendingLeaves || []).length > 0 ? (
                pendingLeaves.slice(0, 3).map((leave, i) => (
                  <div key={i} className="flex items-center justify-between p-5 rounded-3xl bg-slate-50/50 border border-transparent hover:border-slate-100 hover:bg-white hover:shadow-md transition-all group">
                    <div className="flex items-center gap-4">
                      <div className="relative w-14 h-14 shrink-0">
                        <Avatar src={getProfileImage(leave.user?.media_url)} className="rounded-2xl border-2 border-white shadow-sm" alt={leave.user?.name || "User"} />
                      </div>
                      <div>
                        <p className="font-black text-slate-900 group-hover:text-blue-600 transition-colors">{leave.user?.name}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{leave.leave_type?.name || "Leave"}</span>
                          <span className="w-1 h-1 rounded-full bg-slate-300" />
                          <span className="text-[10px] font-black text-indigo-500 uppercase tracking-widest">{leave.total_days} Days</span>
                        </div>
                      </div>
                    </div>
                    <button 
                      onClick={() => router.push('/leaves')}
                      className="w-10 h-10 flex items-center justify-center bg-white rounded-xl text-slate-400 group-hover:bg-blue-600 group-hover:text-white shadow-sm transition-all"
                    >
                      <ChevronRight size={20} strokeWidth={3} />
                    </button>
                  </div>
                ))
              ) : (
                <div className="py-12 text-center">
                  <p className="text-sm font-bold text-slate-300 uppercase tracking-widest">Queue Clear. Great job!</p>
                </div>
              )}
              
              <button 
                onClick={() => router.push('/leaves')}
                className="w-full mt-4 py-4 rounded-2xl bg-slate-50 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 hover:bg-slate-100 hover:text-slate-900 transition-all border border-dashed border-slate-200"
              >
                Enter Full Approval Center ({data?.stats?.pending_leave || 0})
              </button>
            </div>
          </section>

          {/* C. QUICK REQUESTS (MANAGER AS EMPLOYEE) */}
          <section className="flex flex-col gap-6">
             <div className="flex items-center gap-3 px-2">
                <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                  <Sparkles size={16} strokeWidth={2.5} />
                </div>
                <h2 className="text-lg font-black text-slate-900 tracking-tight">Manager Quick Actions</h2>
             </div>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <LeaveRequestCard />
                <ReimbursementRequestCard />
             </div>
          </section>

        </div>

        {/* PERSONAL & INSIGHTS SIDE (4/12) */}
        <aside className="lg:col-span-4 flex flex-col gap-10">
          
          {/* 1. CLOCK & BALANCE */}
          <div className="flex flex-col gap-6">
            <div className="flex items-center gap-2 px-2">
              <ShieldCheck size={16} className="text-blue-600" />
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Personal Space</span>
            </div>
            <ClockCard />
            <LeaveBalanceCard />
          </div>

          {/* 2. LEADERBOARD */}
          <section id="tour-manager-leaderboard" className="bg-slate-900 rounded-[40px] p-8 border border-white/5 shadow-2xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-40 h-40 bg-blue-500/10 rounded-full blur-3xl -mr-20 -mt-20 group-hover:bg-blue-500/20 transition-all duration-500"></div>
            
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-2">
                  <Users size={16} className="text-blue-400" />
                  <h2 className="text-sm font-black uppercase tracking-[0.2em] text-slate-400">Punctuality Squad</h2>
                </div>
                <Sparkles size={16} className="text-amber-400 animate-pulse" />
              </div>
              
              <div className="flex flex-col gap-3">
                {(data?.top_performers || []).length > 0 ? (
                  data?.top_performers.slice(0, 3).map((emp, i) => {
                    return (
                      <div key={i} className="flex items-center justify-between p-4 rounded-3xl bg-white/5 border border-white/5 hover:bg-white/10 transition-all group/item">
                        <div className="flex items-center gap-4">
                          <div className="relative w-12 h-12">
                            <Avatar src={getProfileImage(emp.avatar)} className="rounded-2xl border-2 border-slate-800 shadow-sm" alt={emp.name} />
                            <div className={`absolute -top-1.5 -right-1.5 w-6 h-6 rounded-lg flex items-center justify-center border-2 border-slate-900 text-[10px] font-black text-white shadow-lg ${
                              i === 0 ? 'bg-amber-500' : i === 1 ? 'bg-slate-400' : 'bg-amber-700'
                            }`}>
                              {i + 1}
                            </div>
                          </div>
                          <div>
                            <p className="text-sm font-black text-white group-hover/item:text-blue-400 transition-colors">{emp.name}</p>
                            <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mt-0.5">{emp.department}</p>
                          </div>
                        </div>
                        <div className="text-right">
                           <p className="text-[10px] font-black text-emerald-400">98%</p>
                        </div>
                      </div>
                    )
                  })
                ) : (
                  <p className="text-center py-6 text-xs font-bold text-slate-600 uppercase">No Data Recorded</p>
                )}
              </div>
            </div>
          </section>

          {/* 3. QUICK ANALYTICS LINK */}
          <div 
            id="tour-manager-analytics"
            onClick={() => router.push('/analytics')}
            className="group cursor-pointer bg-gradient-to-br from-indigo-600 to-blue-700 rounded-[40px] p-8 text-white shadow-xl shadow-indigo-200 relative overflow-hidden"
          >
            <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-white/10 rounded-full blur-3xl group-hover:scale-150 transition-all duration-700" />
            <div className="relative z-10 flex flex-col gap-6">
              <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/20">
                <LayoutDashboard size={24} />
              </div>
              <div className="space-y-1">
                <h3 className="text-xl font-black tracking-tight">Full Insights</h3>
                <p className="text-indigo-100 text-xs font-medium leading-relaxed">
                  Access deep dive data analysis, trends, and comprehensive workforce reports.
                </p>
              </div>
              <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest mt-2 group-hover:translate-x-2 transition-transform">
                Go to Analytics <ArrowUpRight size={14} strokeWidth={3} />
              </div>
            </div>
          </div>

        </aside>

      </div>
    </div>
  );
}
