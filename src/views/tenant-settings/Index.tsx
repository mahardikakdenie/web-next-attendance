"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import TenantAccessNotice from "@/components/tenant-settings/TenantAccessNotice";
import TenantSettingForm from "@/components/tenant-settings/TenantSettingForm";
import { useAuthStore, ROLES } from "@/store/auth.store";

export default function TenantSettingsView() {
  const { user, loading } = useAuthStore();
  const router = useRouter();

  const canAccess = Boolean(
    user?.tenant_id && 
    (user?.role?.name === ROLES.ADMIN || user?.role?.name === ROLES.SUPERADMIN)
  );

  useEffect(() => {
    if (!loading && user && !canAccess) {
      router.replace("/");
    }
  }, [user, loading, router, canAccess]);

  if (loading || (user && !canAccess)) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
      </div>
    );
  }

  return (
    <section className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Tenant Setting</h1>
        <p className="mt-1 text-sm text-slate-500">
          Attendance setting page for authorized roles within their tenant.
        </p>
      </div>

      <TenantAccessNotice user={user} />
      {canAccess ? <TenantSettingForm /> : null}
    </section>
  );
}