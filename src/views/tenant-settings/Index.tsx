"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Settings, Shield } from "lucide-react";
import TenantAccessNotice from "@/components/tenant-settings/TenantAccessNotice";
import TenantSettingForm from "@/components/tenant-settings/TenantSettingForm";
import { useAuthStore, ROLES } from "@/store/auth.store";

export default function TenantSettingsView() {
  const { user, loading } = useAuthStore();
  const router = useRouter();

  const isAdmin = user?.role?.name === ROLES.ADMIN || user?.role?.name === ROLES.SUPERADMIN;
  const canAccess = Boolean(user?.tenant_id && isAdmin);

  useEffect(() => {
    if (!loading && user && !canAccess) {
      router.replace("/");
    }
  }, [user, loading, router, canAccess]);

  if (loading || (user && !canAccess)) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center p-6">
        <div className="flex flex-col items-center gap-4">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-neutral-900 border-t-transparent" />
          <p className="text-xs font-black text-neutral-400 uppercase tracking-widest animate-pulse">Verifying Access</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12 sm:pb-20 pt-4 sm:pt-8">
      <header className="flex flex-col gap-6 mb-8 sm:mb-12 lg:flex-row lg:items-end lg:justify-between">
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2 text-blue-600">
            <Settings size={16} strokeWidth={3} />
            <span className="text-[10px] font-black uppercase tracking-[0.2em]">Administration</span>
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-neutral-900 tracking-tight">
            Tenant Settings
          </h1>
          <p className="text-sm sm:text-base text-neutral-500 font-medium max-w-2xl leading-relaxed">
            Configure attendance rules, working hours, and security policies for your organization.
          </p>
        </div>
        
        <div className="flex items-center gap-3 self-start lg:self-end px-4 py-2.5 rounded-2xl bg-white border border-neutral-200 shadow-sm">
          <div className="h-9 w-9 rounded-xl bg-amber-50 flex items-center justify-center text-amber-600 border border-amber-100">
            <Shield size={18} strokeWidth={2.5} />
          </div>
          <div className="flex flex-col">
            <span className="text-[9px] font-black text-neutral-400 uppercase leading-none tracking-tight">Access Level</span>
            <span className="text-sm font-bold text-neutral-900 capitalize">{user?.role?.name.toLowerCase()}</span>
          </div>
        </div>
      </header>

      <main className="flex flex-col gap-6 sm:gap-10">
        <TenantAccessNotice user={user} />
        
        {canAccess ? (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-1000">
            <TenantSettingForm />
          </div>
        ) : (
          <div className="p-10 sm:p-20 rounded-4xl border-2 border-dashed border-neutral-200 bg-neutral-50/50 text-center">
            <div className="max-w-xs mx-auto flex flex-col items-center gap-4">
              <div className="h-12 w-12 rounded-2xl bg-neutral-100 flex items-center justify-center text-neutral-400">
                <Shield size={24} />
              </div>
              <p className="text-neutral-500 font-bold leading-tight">
                Insufficient permissions to modify organizational settings.
              </p>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
