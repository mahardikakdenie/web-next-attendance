import { LayoutGrid, Clock, FileText, Zap, TrendingUp } from "lucide-react";
import { DashboardTab } from "../hooks/useDashboardTab";

interface DashboardNavigationProps {
  activeTab: DashboardTab;
  setActiveTab: (tab: DashboardTab) => void;
}

export default function DashboardNavigation({ activeTab, setActiveTab }: DashboardNavigationProps) {
  return (
    <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 bg-white/40 backdrop-blur-xl p-4 rounded-[32px] border border-white shadow-xl shadow-slate-200/50 sticky top-0 z-10">
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
          onClick={() => setActiveTab("timesheet")}
          className={`px-5 py-2.5 rounded-xl text-[11px] font-black uppercase tracking-wider transition-all flex items-center gap-2 shrink-0 ${
            activeTab === "timesheet" ? "bg-white text-indigo-600 shadow-md ring-1 ring-slate-200/50" : "text-slate-500 hover:text-slate-900"
          }`}
        >
          <FileText size={16} /> Timesheet
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
  );
}
