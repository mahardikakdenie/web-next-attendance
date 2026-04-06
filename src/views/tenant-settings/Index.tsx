"use client";

import TenantAccessNotice from "@/components/tenant-settings/TenantAccessNotice";
import TenantSettingForm from "@/components/tenant-settings/TenantSettingForm";
import { useAuthStore } from "@/store/auth.store";

export default function TenantSettingsView() {
  const user = useAuthStore((state) => state.user);
  const canAccess = Boolean(user?.tenant_id && (user?.role === "admin" || user?.role === "employee"));

  return (
    <section className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Tenant Setting</h1>
        <p className="mt-1 text-sm text-slate-500">Attendance setting page with temporary role + tenant access check.</p>
      </div>

      <TenantAccessNotice user={user} />
      {canAccess ? <TenantSettingForm /> : null}
    </section>
  );
}
