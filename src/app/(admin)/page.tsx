"use client";

import { useAuthStore } from "@/store/auth.store";
import { useEffect, useState } from "react";
import { 
  Clock, 
  FileText, 
  Zap, 
  TrendingUp,
  LayoutGrid
} from "lucide-react";

// Import individual view components
import UserDashboardPage from "@/views/dashboard/UserDashboard";
import DashboardRouter from "@/views/dashboard/DashboardRouter";
import UserInsightsView from "@/views/dashboard/UserInsights";
import { ROLES } from "@/store/auth.store";

// We'll define sub-sections for the user dashboard to be used in tabs
import ClockCard from "@/components/dashboard-user/ClockCard";
import TodayStatusCard from "@/components/dashboard-user/TodayStatusCard";
import { RecentAttendance } from "@/components/dashboard-user/RecentAttendance";
import { LeaveRequestCard } from "@/components/dashboard-user/LeaveRequestCard";
import { OvertimeRequestCard } from "@/components/dashboard-user/OvertimeRequestCard";
import { ReimbursementRequestCard } from "@/components/dashboard-user/ReimbursementRequestCard";

type DashboardTab = "absen" | "requests" | "actions" | "analytics";

export default function Page() {
  const { user, loading } = useAuthStore();
  const [mounted, setMounted] = useState(false);
  const [activeTab, setActiveTab] = useState<DashboardTab>("absen");

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted || loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] gap-6 animate-in fade-in duration-1000">
        <div className="relative">
          <div className="w-20 h-20 rounded-[24px] border-4 border-slate-100 border-t-blue-600 animate-spin" />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-10 h-10 rounded-full bg-blue-50 animate-pulse" />
          </div>
        </div>
        <p className="font-black text-slate-900 tracking-[0.2em] uppercase text-xs">Initializing Terminal</p>
      </div>
    );
  }

  const isManagement = 
    user?.role?.name === ROLES.SUPERADMIN || 
    user?.role?.name === ROLES.ADMIN ||
    user?.role?.name === ROLES.HR ||
    user?.role?.name === ROLES.FINANCE;

  const renderTabContent = () => {
    switch (activeTab) {
      case "absen":
        return (
          <div className="flex flex-col gap-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              <div className="lg:col-span-7">
                <ClockCard />
              </div>
              <div className="lg:col-span-5">
                <TodayStatusCard />
              </div>
            </div>
            <div className="bg-white rounded-[40px] border border-slate-100 shadow-sm p-6">
              <h3 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
                <Clock className="text-blue-600" size={20} />
                Recent Attendance Logs
              </h3>
              <RecentAttendance />
            </div>
          </div>
        );
      case "requests":
        return (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <LeaveRequestCard />
            <OvertimeRequestCard />
          </div>
        );
      case "actions":
        return (
          <div className="max-w-2xl mx-auto w-full animate-in fade-in slide-in-from-bottom-4 duration-500">
            <ReimbursementRequestCard />
          </div>
        );
      case "analytics":
        const defaultAnalyticsTab = user?.role?.name === ROLES.FINANCE ? "finance" : "hr";
        return isManagement ? <DashboardRouter initialTab={defaultAnalyticsTab} /> : <UserInsightsView />;
      default:
        return isManagement ? <DashboardRouter /> : <UserInsightsView />;
    }
  };

  return (
    <div className="w-full max-w-[1600px] mx-auto flex flex-col gap-8 pb-10">
      {/* Dynamic Tab Navigation */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 bg-white/40 backdrop-blur-xl p-4 rounded-[32px] border border-white shadow-xl shadow-slate-200/50 sticky top-0 z-40">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-blue-600 flex items-center justify-center text-white shadow-lg shadow-blue-200">
            <LayoutGrid size={24} />
          </div>
          <div>
            <h1 className="text-xl font-black text-slate-900 tracking-tight">Workspace Terminal</h1>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Employee Command Center</p>
          </div>
        </div>

        <nav className="flex items-center p-1.5 bg-slate-100/80 rounded-2xl border border-slate-200/50 overflow-x-auto no-scrollbar max-w-full">
          <button
            onClick={() => setActiveTab("absen")}
            className={`px-5 py-2.5 rounded-xl text-[11px] font-black uppercase tracking-wider transition-all flex items-center gap-2 shrink-0 ${
              activeTab === "absen" ? "bg-white text-blue-600 shadow-md ring-1 ring-slate-200/50" : "text-slate-500 hover:text-slate-900"
            }`}
          >
            <Clock size={16} /> Absen
          </button>
          <button
            onClick={() => setActiveTab("requests")}
            className={`px-5 py-2.5 rounded-xl text-[11px] font-black uppercase tracking-wider transition-all flex items-center gap-2 shrink-0 ${
              activeTab === "requests" ? "bg-white text-indigo-600 shadow-md ring-1 ring-slate-200/50" : "text-slate-500 hover:text-slate-900"
            }`}
          >
            <FileText size={16} /> Requests
          </button>
          <button
            onClick={() => setActiveTab("actions")}
            className={`px-5 py-2.5 rounded-xl text-[11px] font-black uppercase tracking-wider transition-all flex items-center gap-2 shrink-0 ${
              activeTab === "actions" ? "bg-white text-emerald-600 shadow-md ring-1 ring-slate-200/50" : "text-slate-500 hover:text-slate-900"
            }`}
          >
            <Zap size={16} /> Actions
          </button>
          <button
            onClick={() => setActiveTab("analytics")}
            className={`px-5 py-2.5 rounded-xl text-[11px] font-black uppercase tracking-wider transition-all flex items-center gap-2 shrink-0 ${
              activeTab === "analytics" ? "bg-white text-amber-600 shadow-md ring-1 ring-slate-200/50" : "text-slate-500 hover:text-slate-900"
            }`}
          >
            <TrendingUp size={16} /> Analytics
          </button>
        </nav>
      </div>

      {/* Content Area */}
      <main className="w-full">
        {renderTabContent()}
      </main>
    </div>
  );
}

