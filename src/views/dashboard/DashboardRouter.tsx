"use client";

import { useAuthStore, ROLES } from "@/store/auth.store";
import { useState } from "react";
import { 
  Users, 
  Wallet, 
  ShieldCheck
} from "lucide-react";
import UserDashboardPage from "./UserDashboard";
import AdminDashboardPage from "./AdminDashboard";
import HrDashboardPage from "./HrDashboard";
import FinanceDashboardPage from "./FinanceDashboard";

type AnalyticsTab = "platform" | "hr" | "finance" | "user";

export default function DashboardRouter() {
  const { user } = useAuthStore();
  const [activeTab, setActiveTab] = useState<AnalyticsTab>(
    user?.role?.name === ROLES.SUPERADMIN ? "platform" : 
    user?.role?.name === ROLES.ADMIN ? "hr" : "user"
  );

  if (!user) return <UserDashboardPage />;

  const isManagement = 
    user.role?.name === ROLES.SUPERADMIN || 
    user.role?.name === ROLES.ADMIN;

  if (isManagement) {
    return (
      <div className="flex flex-col gap-8">
        {/* Analytics Mode Switcher */}
        <div className="flex flex-wrap items-center justify-between gap-4 bg-white/60 backdrop-blur-md p-2 rounded-[32px] border border-white shadow-sm ring-1 ring-slate-200/50">
          <div className="flex p-1 bg-slate-100/80 rounded-2xl border border-slate-200/50">
            {user.role?.name === ROLES.SUPERADMIN && (
              <button
                onClick={() => setActiveTab("platform")}
                className={`px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all flex items-center gap-2 ${
                  activeTab === "platform" ? "bg-white text-blue-600 shadow-sm ring-1 ring-slate-200/50" : "text-slate-500 hover:text-slate-900"
                }`}
              >
                <ShieldCheck size={16} /> Platform
              </button>
            )}
            <button
              onClick={() => setActiveTab("hr")}
              className={`px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all flex items-center gap-2 ${
                activeTab === "hr" ? "bg-white text-blue-600 shadow-sm ring-1 ring-slate-200/50" : "text-slate-500 hover:text-slate-900"
              }`}
            >
              <Users size={16} /> HR Analytics
            </button>
            <button
              onClick={() => setActiveTab("finance")}
              className={`px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all flex items-center gap-2 ${
                activeTab === "finance" ? "bg-white text-blue-600 shadow-sm ring-1 ring-slate-200/50" : "text-slate-500 hover:text-slate-900"
              }`}
            >
              <Wallet size={16} /> Finance
            </button>
          </div>

          <div className="px-6 py-2 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 hidden sm:block">
            Executive Control Center
          </div>
        </div>

        {/* Dynamic View Rendering */}
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
          {activeTab === "platform" && <AdminDashboardPage />}
          {activeTab === "hr" && <HrDashboardPage />}
          {activeTab === "finance" && <FinanceDashboardPage />}
        </div>
      </div>
    );
  }

  // Roles with restricted single view
  switch (user.role?.name) {
    case ROLES.HR:
      return <HrDashboardPage />;
    case ROLES.FINANCE:
      return <FinanceDashboardPage />;
    case ROLES.USER:
    default:
      return <UserDashboardPage />;
  }
}
