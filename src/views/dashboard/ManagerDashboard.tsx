"use client";

import { 
  Clock, 
  CalendarCheck, 
  AlertCircle, 
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
import { getHrDashboard } from "@/service/dashboard";
import { HrDashboardData } from "@/types/api";
import { Badge } from "@/components/ui/Badge";
import Image from "next/image";
import { useRouter } from "next/navigation";

export default function ManagerDashboardPage() {
  const router = useRouter();
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
    <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 items-start pb-12 animate-in fade-in duration-700">
      
      {/* LEFT: Management Overview */}
      <div className="xl:col-span-8 space-y-8">
        
        {/* Real-time Workforce Pulse */}
        <section className="bg-white rounded-[40px] p-8 shadow-sm border border-slate-100">
          <div className="flex items-center justify-between mb-8">
            <div className="space-y-1">
              <h2 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
                <Activity size={20} className="text-blue-600" />
                Workforce Pulse
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

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: "Present", value: `${data?.stats.presence_rate}%`, icon: UserCheck, color: "text-emerald-600", bg: "bg-emerald-50" },
              { label: "Avg OT", value: `${data?.stats.avg_overtime}h`, icon: Clock, color: "text-blue-600", bg: "bg-blue-50" },
              { label: "Pending", value: data?.stats.pending_leave, icon: CalendarCheck, color: "text-amber-600", bg: "bg-amber-50" },
              { label: "At Risk", value: data?.stats.at_risk_staff, icon: UserX, color: "text-rose-600", bg: "bg-rose-50" },
            ].map((stat, i) => (
              <div key={i} className="p-5 rounded-3xl bg-slate-50/50 border border-slate-100 flex flex-col gap-3">
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

        {/* Quick Approvals Hotline */}
        <section className="bg-white rounded-[40px] p-8 shadow-sm border border-slate-100">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
              <CheckCircle2 size={20} className="text-emerald-600" />
              Approvals Hotline
            </h2>
            <Badge className="bg-blue-50 text-blue-600 border-none font-black text-[10px]">Action Required</Badge>
          </div>

          <div className="space-y-3">
            {data?.stats.at_risk_users.slice(0, 3).map((user, i) => (
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
              View All 12 Pending Requests
            </button>
          </div>
        </section>

        {/* Top Achievers (Motivation) */}
        <section className="bg-linear-to-br from-indigo-600 to-blue-700 rounded-[40px] p-8 text-white shadow-xl shadow-blue-900/20 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -mr-32 -mt-32"></div>
          <div className="relative z-10">
            <h2 className="text-xl font-black tracking-tight mb-6">Punctuality Champions</h2>
            <div className="flex items-center gap-6 overflow-x-auto no-scrollbar pb-2">
              {data?.top_performers.slice(0, 4).map((emp, i) => (
                <div key={i} className="flex flex-col items-center gap-2 shrink-0">
                  <div className="relative w-16 h-16 shadow-2xl">
                    <Image src={emp.avatar} fill alt={emp.name} className="rounded-[20px] object-cover border-2 border-white/20" />
                    <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-emerald-500 rounded-lg flex items-center justify-center border-2 border-indigo-600 text-[10px] font-black">
                      {i + 1}
                    </div>
                  </div>
                  <p className="text-[10px] font-black uppercase tracking-wider">{emp.name.split(' ')[0]}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>

      {/* RIGHT: Personal Focus */}
      <div className="xl:col-span-4 space-y-8">
        <div className="sticky top-8 z-30">
          <div className="flex items-center gap-2 px-2 mb-4">
            <ShieldCheck size={16} className="text-blue-600" />
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Personal Workspace</span>
          </div>
          <ClockCard />
          
          <div className="mt-8 bg-white rounded-[40px] p-8 border border-slate-100 shadow-sm">
             <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                   <AlertCircle size={20} strokeWidth={2.5} />
                </div>
                <h3 className="font-black text-slate-900 text-sm tracking-wide">HR Manager Tip</h3>
             </div>
             <p className="text-xs text-slate-500 font-medium leading-relaxed italic">
                &quot;The presence rate is currently at {data?.stats.presence_rate}%. Consider reviewing the attendance policy for the {data?.top_performers[0]?.department || 'selected'} department to maintain consistency.&quot;
             </p>
          </div>
        </div>
      </div>

    </div>
  );
}
