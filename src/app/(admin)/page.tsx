"use client";

import { useAuthStore, ROLES } from "@/store/auth.store";
import UserDashboardPage from "@/views/dashboard/UserDashboard";
import ManagerDashboardPage from "@/views/dashboard/ManagerDashboard";
import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";

export default function Page() {
  const { user, loading } = useAuthStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setMounted(true);
    }, 0);
    return () => clearTimeout(timer);
  }, []);

  if (!mounted || loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <Loader2 className="w-10 h-10 text-blue-500 animate-spin" />
        <p className="font-bold text-slate-400 tracking-widest uppercase text-xs">Preparing Workspace...</p>
      </div>
    );
  }

  // PLATFORM LEVEL
  if (user?.role?.name === ROLES.SUPERADMIN) {
    return <ManagerDashboardPage />; 
  }

  // TENANT LEVEL - MANAGEMENT
  if (user?.role?.name === ROLES.ADMIN || user?.role?.name === ROLES.HR) {
    return <ManagerDashboardPage />;
  }

  // TENANT LEVEL - FINANCE
  if (user?.role?.name === ROLES.FINANCE) {
    return <ManagerDashboardPage />; 
  }

  // DEFAULT: EMPLOYEE
  return <UserDashboardPage />;
}
