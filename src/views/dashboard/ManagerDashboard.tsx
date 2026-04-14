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
  ShieldCheck
} from "lucide-react";
import { useEffect, useState, useCallback } from "react";
import ClockCard from "@/components/dashboard-user/ClockCard";
import { LeaveBalanceCard } from "@/components/dashboard-user/LeaveBalanceCard";
import { LeaveRequestCard } from "@/components/dashboard-user/LeaveRequestCard";
import { getHrDashboard } from "@/service/dashboard";
import { HrDashboardData } from "@/types/api";
import { Badge } from "@/components/ui/Badge";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { 
  LayoutDashboard,
  Sparkles
} from "lucide-react";
import { useAuthStore } from "@/store/auth.store";

export default function ManagerDashboardPage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const [data, setData] = useState<HrDashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchData = useCallback(async () => {
    try {
      setIsLoading(true);
      const resp = await getHrDashboard();
      if (resp.data) {
        setData(resp.data);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 animate-pulse">
        <div className="xl:col-span-8 space-y-8">
          <div className="h-40 bg-white rounded-[40px] border border-slate-100"></div>
          <div className="grid grid-cols-2 gap-6">
            <div className="h-32 bg-white rounded-3xl border border-slate-100"></div>
            <div className="h-32 bg-white rounded-3xl border border-slate-100"></div>
          </div>
          <div className="h-96 bg-white rounded-[40px] border border-slate-100"></div>
        </div>
        <div className="xl:col-span-4 space-y-8">
          <div className="h-[500px] bg-white rounded-[40px] border border-slate-100"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8 pb-12 animate-in fade-in duration-700">
      
      {/* Modern Operations Header */}
      <section className="relative overflow-hidden bg-slate-900 rounded-[40px] p-8 sm:p-10 shadow-2xl shadow-slate-900/20 text-white">
        <div className="absolute top-0 right-0 -mt-20 -mr-20 w-96 h-96 bg-blue-500 opacity-10 rounded-full blur-[100px] pointer-events-none"></div>
        
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 backdrop-blur-xl border border-white/10 text-[10px] font-black tracking-[0.2em] uppercase">
              <LayoutDashboard size={14} className="text-blue-400" />
              Operations Center
            </div>
            <h1 className="text-3xl sm:text-4xl font-black tracking-tight leading-tight">
              Control <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-400">Panel</span>
            </h1>
            <p className="text-slate-400 font-medium max-w-xl text-xs sm:text-sm leading-relaxed">
              Welcome back, {user?.name}. Manage daily attendance, pending approvals, and monitor workforce health from a single command interface.
            </p>
          </div>
          <div className="flex items-center gap-3 px-6 py-4 bg-white/5 rounded-3xl border border-white/5">
             <div className="text-right">
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">System Status</p>
                <p className="text-sm font-bold text-emerald-400">All Nodes Active</p>
             </div>
             <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center">
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
             </div>
          </div>
        </div>
      </section>

      {/* DASHBOARD ROWS */}
      <div className="flex flex-col gap-8">
        
        {/* ROW 1: Pulse & Immediate Action */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          <div className="lg:col-span-8">
            <section className="bg-white rounded-[40px] p-8 shadow-sm border border-slate-100 group hover:shadow-xl transition-all duration-500 h-full">
              <div className="flex items-center justify-between mb-8">
                <div className="space-y-1">
                  <h2 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
                    <Activity size={20} className="text-blue-600" />
                    Workforce Pulse
                    <Sparkles size={16} className="text-blue-400 animate-pulse" />
                  </h2>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Real-time attendance summary</p>
                </div>
                <button 
                  onClick={() => router.push('/analytics')}
                  className="p-2.5 bg-slate-50 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all"
                >
                  <ArrowUpRight size={20} />
                </button>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {[
                  { label: "Present", value: `${data?.stats.presence_rate}%`, icon: UserCheck, color: "text-emerald-600", bg: "bg-emerald-50" },
                  { label: "Avg OT", value: `${data?.stats.avg_overtime}h`, icon: Clock, color: "text-blue-600", bg: "bg-blue-50" },
                  { label: "Pending", value: data?.stats.pending_leave, icon: CalendarCheck, color: "text-amber-600", bg: "bg-amber-50" },
                  { label: "At Risk", value: data?.stats.at_risk_staff, icon: UserX, color: "text-rose-600", bg: "bg-rose-50" },
                ].map((stat, i) => (
                  <div key={i} className="p-5 rounded-3xl bg-slate-50/50 border border-slate-100 flex flex-col gap-3 group-hover:bg-white transition-colors">
                    <div className={`w-10 h-10 rounded-xl ${stat.bg} ${stat.color} flex items-center justify-center`}>
                      <stat.icon size={20} strokeWidth={2.5} />
                    </div>
                    <div>
                      <p className="text-2xl font-black text-slate-900">{stat.value}</p>
                      <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">{stat.label}</p>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </div>
          <div className="lg:col-span-4">
            <div className="flex flex-col gap-4 h-full">
              <div className="flex items-center gap-2 px-2">
                <ShieldCheck size={16} className="text-blue-600" />
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Personal Workspace</span>
              </div>
              <ClockCard />
            </div>
          </div>
        </div>

        {/* ROW 2: Approvals & Balance */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          <div className="lg:col-span-8">
            <section className="bg-white rounded-[40px] p-8 shadow-sm border border-slate-100 h-full">
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
                  <CheckCircle2 size={20} className="text-emerald-600" />
                  Approvals Hotline
                </h2>
                <Badge className="bg-blue-50 text-blue-600 border-none font-black text-[10px]">Action Required</Badge>
              </div>

              <div className="space-y-3">
                {(data?.stats?.at_risk_users || []).slice(0, 3).map((user, i) => (
                  <div key={i} className="flex items-center justify-between p-4 rounded-3xl bg-slate-50/50 border border-transparent hover:border-slate-100 hover:bg-white transition-all group">
                    <div className="flex items-center gap-4">
                      <div className="relative w-12 h-12 shrink-0 shadow-sm">
                        <Image src={user.avatar} fill alt={user.name} className="rounded-2xl object-cover border-2 border-white" />
                      </div>
                      <div>
                        <p className="font-black text-sm text-slate-900">{user.name}</p>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{user.department} • Leave Request</p>
                      </div>
                    </div>
                    <button 
                      onClick={() => router.push('/leaves')}
                      className="p-2 text-slate-300 group-hover:text-blue-600 group-hover:bg-blue-50 rounded-xl transition-all"
                    >
                      <ChevronRight size={20} />
                    </button>
                  </div>
                ))}
                <button 
                  onClick={() => router.push('/leaves')}
                  className="w-full py-4 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 hover:text-blue-600 transition-colors"
                >
                  View All {data?.stats?.pending_leave || 0} Pending Requests
                </button>
              </div>
            </section>
          </div>
          <div className="lg:col-span-4">
            <LeaveBalanceCard />
          </div>
        </div>

        {/* ROW 3: Personal Requests & Motivation */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          <div className="lg:col-span-8">
            <LeaveRequestCard />
          </div>
          <div className="lg:col-span-4">
            {/* Top Achievers (Motivation) */}
            <section className="bg-white rounded-[40px] p-8 border border-slate-100 shadow-sm h-full relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50/50 rounded-full blur-3xl -mr-16 -mt-16 group-hover:bg-blue-100/50 transition-colors duration-500"></div>
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-sm font-black uppercase tracking-[0.2em] text-slate-400">Punctuality Champions</h2>
                  <Sparkles size={16} className="text-amber-400 animate-pulse" />
                </div>
                
                <div className="flex flex-col gap-4">
                  {(data?.top_performers || []).slice(0, 3).map((emp, i) => {
                    const initials = emp.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
                    
                    return (
                      <div key={i} className="flex items-center justify-between p-3 rounded-2xl bg-slate-50/50 border border-slate-100 hover:bg-white hover:shadow-md transition-all group/item">
                        <div className="flex items-center gap-4">
                          <div className="relative w-12 h-12">
                            <div className="w-full h-full rounded-xl overflow-hidden border-2 border-white shadow-sm bg-slate-100 flex items-center justify-center">
                              {emp.avatar ? (
                                <Image src={emp.avatar} fill alt={emp.name} className="object-cover" />
                              ) : (
                                <span className="text-xs font-black text-slate-400">{initials}</span>
                              )}
                            </div>
                            <div className={`absolute -top-2 -right-2 w-6 h-6 rounded-lg flex items-center justify-center border-2 border-white text-[10px] font-black text-white shadow-sm ${
                              i === 0 ? 'bg-amber-500' : i === 1 ? 'bg-slate-400' : 'bg-amber-700'
                            }`}>
                              {i + 1}
                            </div>
                          </div>
                          <div>
                            <p className="text-xs font-black text-slate-900 group-hover/item:text-blue-600 transition-colors">{emp.name}</p>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{emp.department}</p>
                          </div>
                        </div>
                        <div className="text-right">
                           <p className="text-xs font-black text-emerald-600">Legend</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </section>
          </div>
        </div>

      </div>
    </div>
  );
}
