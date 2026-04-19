"use client";

import DashboardRouter from "@/views/dashboard/DashboardRouter";
import UserInsightsView from "@/views/dashboard/UserInsights";
import { useAuthStore, ROLES } from "@/store/auth.store";

export default function AnalyticsPage() {
  const { user } = useAuthStore();

  const isManagement = 
    user?.role?.name === ROLES.SUPERADMIN || 
    user?.role?.name === ROLES.ADMIN ||
    user?.role?.name === ROLES.HR ||
    user?.role?.name === ROLES.FINANCE;

  if (!isManagement) {
    return (
      <div className="w-full max-w-[1600px] mx-auto py-4">
        <UserInsightsView />
      </div>
    );
  }

  // For management, default to 'hr' or 'finance' to avoid the 'ops' (attendance) tab
  const defaultTab = user?.role?.name === ROLES.FINANCE ? "finance" : "hr";

  return (
    <div className="w-full max-w-[1600px] mx-auto py-4">
      <div className="mb-8">
        <h1 className="text-2xl font-black text-slate-900 tracking-tight">System Intelligence</h1>
        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Advanced reporting and workforce data analytics</p>
      </div>
      <DashboardRouter initialTab={defaultTab} />
    </div>
  );
}

