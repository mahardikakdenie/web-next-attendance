"use client";

import { useAuthStore, ROLES } from "@/store/auth.store";
import { useState, useEffect, useMemo, useCallback } from "react";
import { 
  Users, 
  Wallet, 
  ShieldCheck,
  Monitor
} from "lucide-react";
import UserDashboardPage from "./UserDashboard";
import AdminDashboardPage from "./AdminDashboard";
import HrDashboardPage from "./HrDashboard";
import FinanceDashboardPage from "./FinanceDashboard";
import { useIsMobile } from "@/hooks/useIsMobile";
import { toast } from "sonner";
import { useRouter, useSearchParams } from "next/navigation";

type AnalyticsTab = "platform" | "hr" | "finance" | "user";

export default function DashboardRouter({ initialTab }: { initialTab?: AnalyticsTab }) {
  const { user } = useAuthStore();
  const isMobile = useIsMobile();
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // 1. Determine the source of truth for the tab (URL param > Prop > Role Default)
  const getInitialTab = (): AnalyticsTab => {
    const urlTab = searchParams.get("tab") as AnalyticsTab;
    const validTabs: AnalyticsTab[] = ["platform", "hr", "finance", "user"];
    
    if (urlTab && validTabs.includes(urlTab)) return urlTab;
    return initialTab || (user?.role?.name === ROLES.FINANCE ? "finance" : "hr");
  };

  const [activeTab, setActiveTab] = useState<AnalyticsTab>(getInitialTab);

  const isManagement = useMemo(() => 
    user?.role?.name === ROLES.SUPERADMIN || 
    user?.role?.name === ROLES.ADMIN ||
    user?.role?.name === ROLES.HR ||
    user?.role?.name === ROLES.FINANCE
  , [user]);

// 2. Handle Tab Changes and URL synchronization
  const handleTabChange = useCallback((tab: AnalyticsTab) => {
    // Proteksi 1: Pastikan tab target sesuai dengan aturan device
    const targetTab = (isMobile && isManagement && tab !== "user") ? "user" : tab;

    // Proteksi 2: Cegah setState jika tab tidak berubah (mencegah re-render berlebih)
    setActiveTab((prevTab) => {
      if (prevTab === targetTab) return prevTab;
      return targetTab;
    });

    // Proteksi 3: Hanya update URL jika parameternya benar-benar berbeda
    const params = new URLSearchParams(searchParams.toString());
    if (params.get("tab") !== targetTab) {
      params.set("tab", targetTab);
      router.replace(`?${params.toString()}`, { scroll: false });
    }
  }, [router, searchParams, isMobile, isManagement]);

  // 3. Mobile Optimization: Force User Dashboard for management roles on mobile
  useEffect(() => {
    if (isMobile && isManagement && activeTab !== "user") {
      // Solusi: Gunakan setTimeout(..., 0)
      // Ini menggeser eksekusi fungsi keluar dari "synchronous render phase" React
      // dan masuk ke antrian macrotask browser. Linter akan aman dan render lebih mulus.
      const timeoutId = setTimeout(() => {
        handleTabChange("user");
        toast.info("Mobile Mode: Switched to Employee Dashboard for better experience.", {
          description: "Use a desktop for full management analytics.",
          duration: 5000,
        });
      }, 0);

      // Cleanup function untuk mencegah memory leak jika komponen unmount cepat
      return () => clearTimeout(timeoutId); 
    }
  }, [isMobile, isManagement, activeTab, handleTabChange]);
  if (!user) return <UserDashboardPage />;

  if (isManagement && !isMobile) {
    return (
      <div className="flex flex-col gap-8">
        {/* Analytics Mode Switcher */}
        <div className="flex flex-wrap items-center justify-between gap-4 bg-white/60 backdrop-blur-md p-2 rounded-[32px] border border-white shadow-sm ring-1 ring-slate-200/50">
          <div className="flex p-1 bg-slate-100/80 rounded-2xl border border-slate-200/50 overflow-x-auto no-scrollbar">
            {user?.role?.name === ROLES.SUPERADMIN && (
              <button
                onClick={() => handleTabChange("platform")}
                className={`px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all flex items-center gap-2 shrink-0 ${
                  activeTab === "platform" ? "bg-white text-blue-600 shadow-sm ring-1 ring-slate-200/50" : "text-slate-500 hover:text-slate-900"
                }`}
              >
                <ShieldCheck size={16} /> Platform
              </button>
            )}

            {(user?.role?.name === ROLES.SUPERADMIN || user?.role?.name === ROLES.ADMIN || user?.role?.name === ROLES.HR) && (
              <button
                onClick={() => handleTabChange("hr")}
                className={`px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all flex items-center gap-2 shrink-0 ${
                  activeTab === "hr" ? "bg-white text-blue-600 shadow-sm ring-1 ring-slate-200/50" : "text-slate-500 hover:text-slate-900"
                }`}
              >
                <Users size={16} /> HR Analytics
              </button>
            )}

            {(user?.role?.name === ROLES.SUPERADMIN || user?.role?.name === ROLES.ADMIN || user?.role?.name === ROLES.FINANCE) && (
              <button
                onClick={() => handleTabChange("finance")}
                className={`px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all flex items-center gap-2 shrink-0 ${
                  activeTab === "finance" ? "bg-white text-blue-600 shadow-sm ring-1 ring-slate-200/50" : "text-slate-500 hover:text-slate-900"
                }`}
              >
                <Wallet size={16} /> Finance
              </button>
            )}

            <button
              onClick={() => handleTabChange("user")}
              className={`px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all flex items-center gap-2 shrink-0 ${
                activeTab === "user" ? "bg-white text-blue-600 shadow-sm ring-1 ring-slate-200/50" : "text-slate-500 hover:text-slate-900"
              }`}
            >
              <Monitor size={16} /> Personal
            </button>
          </div>

          <div className="px-6 py-2 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 hidden lg:block">
            Analytics Control Center
          </div>
        </div>

        {/* Dynamic View Rendering */}
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
          {activeTab === "platform" && <AdminDashboardPage />}
          {activeTab === "hr" && <HrDashboardPage />}
          {activeTab === "finance" && <FinanceDashboardPage />}
          {activeTab === "user" && <UserDashboardPage />}
        </div>
      </div>
    );
  }

  return <UserDashboardPage />;
}
