"use client";

import React, { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { getDataCurrentTenat, getTenantById } from "@/service/tenantSettings";
import { getMenusOverview } from "@/service/menu";
import { useAuthStore, ROLES } from "@/store/auth.store";
import { useRouter } from "next/navigation";
import { 
  Loader2, 
  Settings2, 
  Info, 
  ShieldCheck, 
  LayoutGrid, 
  Zap,
  Building,
  Lock,
  SearchX
} from "lucide-react";
import TenantInfoCard from "@/components/tenant-settings/TenantInfoCard";
import SubscriptionStatusCard from "@/components/tenant-settings/SubscriptionStatusCard";
import RoleMenuMatrix from "@/components/tenant-settings/RoleMenuMatrix";
import { AccessDenied } from "@/components/ui/AccessDenied";
import { Skeleton } from "@/components/ui/Skeleton";

export default function TenantInfoView() {
  const { user, loading: authLoading } = useAuthStore();
  const router = useRouter();

  // Strict Admin definition
  const role = (user?.role?.base_role?.toLowerCase() || user?.base_role?.toLowerCase() || user?.role?.name?.toLowerCase());
  const isAdmin = role === ROLES.ADMIN || role === ROLES.SUPERADMIN || user?.is_owner;

  // A. Setup Page & Security (Requirement A)
  useEffect(() => {
    if (!authLoading && user && !isAdmin) {
      // Redirect or let the component render AccessDenied below
    }
  }, [user, authLoading, isAdmin]);

  // B. Integrasi Data (Requirement B)
  const { data: tenantResp, isLoading: isTenantLoading } = useQuery({
    queryKey: ["tenant-details", user?.tenant_id],
    queryFn: () => getTenantById(user?.tenant_id as number),
    enabled: !!user?.tenant_id && isAdmin,
  });

  const { data: settingsResp, isLoading: isSettingsLoading } = useQuery({
    queryKey: ["tenant-settings-info"],
    queryFn: () => getDataCurrentTenat(),
    enabled: isAdmin,
  });

  const { data: menuOverviewResp, isLoading: isMenuLoading, error: menuError } = useQuery({
    queryKey: ["menus-overview"],
    queryFn: () => getMenusOverview(),
    enabled: isAdmin,
    retry: 1
  });

  const isLoading = authLoading || isTenantLoading || isSettingsLoading || isMenuLoading;

  if (authLoading) {
    return (
      <div className="h-[60vh] flex flex-col items-center justify-center">
        <Loader2 className="w-10 h-10 text-slate-900 animate-spin" />
        <p className="mt-4 text-slate-400 font-bold uppercase tracking-widest text-[10px]">Verifying Identity...</p>
      </div>
    );
  }

  if (!isAdmin) {
    return <AccessDenied message="Halaman ini hanya dapat diakses oleh Owner atau Administrator utama organisasi." />;
  }

  // Handle Skeleton Loading for initial fetch (Requirement 4.61)
  if (isLoading && !tenantResp) {
    return (
      <div className="flex flex-col gap-10 w-full max-w-7xl mx-auto pb-20">
        <div className="space-y-4">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-10 w-64" />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
           <Skeleton className="h-80 rounded-[40px]" />
           <Skeleton className="h-80 rounded-[40px]" />
        </div>
        <Skeleton className="h-[500px] rounded-[40px]" />
      </div>
    );
  }

  const isMenuForbidden = (menuError as any)?.response?.status === 403;

  return (
    <div className="flex flex-col gap-8 md:gap-12 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20 pt-4 md:pt-8 animate-in fade-in duration-700">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-indigo-600">
            <Building size={16} strokeWidth={3} />
            <span className="text-[10px] font-black uppercase tracking-[0.2em]">Administrative Hub</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
            Organization <span className="text-indigo-600">Intelligence</span>
          </h1>
          <p className="text-slate-500 font-medium text-sm sm:text-base max-w-2xl leading-relaxed">
            Transparency and control center for your workspace ecosystem. Monitor your organizational health and access rights.
          </p>
        </div>
      </div>

      {/* C. Pengembangan UI (Komponen - Requirement C) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-10">
        {/* Card: Status Langganan */}
        <div className="space-y-4">
           <div className="flex items-center gap-3 px-2">
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <Zap size={18} fill="currentColor" />
            </div>
            <h2 className="text-sm font-black text-slate-900 uppercase tracking-widest">Subscription Status</h2>
          </div>
          <SubscriptionStatusCard user={user} />
        </div>

        {/* Card: Profil Perusahaan */}
        <div className="space-y-4">
          <div className="flex items-center gap-3 px-2">
            <div className="w-8 h-8 rounded-lg bg-slate-900 text-white flex items-center justify-center">
              <Info size={18} />
            </div>
            <h2 className="text-sm font-black text-slate-900 uppercase tracking-widest">Company Profile</h2>
          </div>
          {tenantResp?.data && <TenantInfoCard tenant={tenantResp.data} />}
        </div>
      </div>

      {/* Section: Matriks Akses Menu (Role Overview) */}
      <div className="space-y-6 mt-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 px-2">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <LayoutGrid size={18} />
            </div>
            <div>
              <h2 className="text-sm font-black text-slate-900 uppercase tracking-widest">Role Access Transparency</h2>
              <p className="text-[10px] font-bold text-slate-400 uppercase mt-0.5">Understand exactly what your staff can see and do</p>
            </div>
          </div>
        </div>

        {isMenuForbidden ? (
          <div className="bg-amber-50 rounded-[40px] border border-amber-100 p-12 text-center flex flex-col items-center">
             <div className="w-16 h-16 rounded-3xl bg-white flex items-center justify-center text-amber-500 shadow-sm mb-6">
                <Lock size={32} />
             </div>
             <h4 className="text-lg font-black text-slate-900 uppercase tracking-tight">Feature Restricted</h4>
             <p className="text-sm font-medium text-slate-500 mt-2 max-w-md">
                Fitur transparansi menu ini memerlukan hak akses Owner atau Administrator Utama. Silakan hubungi Superadmin sistem jika Anda merasa ini adalah kesalahan.
             </p>
          </div>
        ) : menuOverviewResp?.data ? (
          <RoleMenuMatrix roles={menuOverviewResp.data} />
        ) : isMenuLoading ? (
          <Skeleton className="h-[600px] rounded-[40px]" />
        ) : (
          <div className="bg-slate-50 rounded-[40px] border border-slate-100 p-20 flex flex-col items-center text-center opacity-50 grayscale">
             <SearchX size={48} className="mb-4 text-slate-300" />
             <p className="font-bold text-slate-400">No organizational matrix data available.</p>
          </div>
        )}
      </div>
    </div>
  );
}
