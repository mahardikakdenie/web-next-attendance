import { User } from "@/store/auth.store";

export default function TenantAccessNotice({ user }: { user: User | null }) {
  const hasAccess = Boolean(user?.tenant_id && (user?.role === "admin" || user?.role === "employee"));

  if (hasAccess) {
    return (
      <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4">
        <p className="text-sm font-semibold text-emerald-700">Access granted</p>
        <p className="mt-1 text-sm text-emerald-600">
          Current role <span className="font-semibold capitalize">{user?.role}</span> with tenant id {user?.tenant_id} can view attendance settings.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-amber-200 bg-amber-50 p-4">
      <p className="text-sm font-semibold text-amber-700">Access restricted</p>
      <p className="mt-1 text-sm text-amber-600">
        Temporary rule: only users with role <span className="font-semibold">admin</span> or <span className="font-semibold">employee</span> and valid
        tenant_id can see tenant attendance setting.
      </p>
    </div>
  );
}
