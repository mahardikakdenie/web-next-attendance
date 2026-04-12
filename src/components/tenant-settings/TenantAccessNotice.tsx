import { ROLES } from "@/store/auth.store";
import { UserData } from "@/types/api";
import { ShieldCheck, ShieldAlert, Info } from "lucide-react";

export default function TenantAccessNotice({ user }: { user: UserData | null }) {
  const isAdmin = user?.role?.name === ROLES.ADMIN || user?.role?.name === ROLES.SUPERADMIN;
  const hasAccess = Boolean(user?.tenant_id && isAdmin);

  if (hasAccess) {
    return (
      <div className="group rounded-3xl border border-emerald-100 bg-emerald-50/30 p-5 transition-all hover:bg-emerald-50/50">
        <div className="flex items-start gap-4">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-100 text-emerald-600">
            <ShieldCheck size={20} strokeWidth={2.5} />
          </div>
          <div className="flex flex-col gap-0.5">
            <h3 className="text-sm font-black text-emerald-900 tracking-tight uppercase">Privileged Access Granted</h3>
            <p className="text-xs font-medium text-emerald-700 leading-relaxed">
              You are currently authorized as <span className="font-black underline decoration-emerald-300 underline-offset-2">{user?.role?.name}</span> for Tenant ID: <span className="font-black">#{user?.tenant_id}</span>. You have full permission to modify organization rules.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="group rounded-3xl border border-amber-100 bg-amber-50/30 p-5 transition-all hover:bg-amber-50/50">
      <div className="flex items-start gap-4">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-100 text-amber-600">
          <ShieldAlert size={20} strokeWidth={2.5} />
        </div>
        <div className="flex flex-col gap-0.5">
          <h3 className="text-sm font-black text-amber-900 tracking-tight uppercase">Restricted Access</h3>
          <p className="text-xs font-medium text-amber-700 leading-relaxed">
            Your current role <span className="font-black italic">({user?.role?.name || 'unknown'})</span> does not have the necessary permissions to modify these settings. Please contact your system administrator if you believe this is an error.
          </p>
          <div className="mt-2 flex items-center gap-1.5 text-[10px] font-bold text-amber-600/70">
            <Info size={12} />
            Required Roles: Admin, Superadmin
          </div>
        </div>
      </div>
    </div>
  );
}
