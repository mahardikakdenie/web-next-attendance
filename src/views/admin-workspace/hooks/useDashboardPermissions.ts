import { useAuthStore } from "@/store/auth.store";
import { usePermission } from "@/components/auth/PermissionGuard";

export function useDashboardPermissions() {
  const { user, loading } = useAuthStore();
  const hasAnalyticsExec = usePermission("analytics.executive");
  const hasSuperadminAcc = usePermission("superadmin.access");
  const hasRbacAcc = usePermission("rbac.access");

  const isManagement = hasAnalyticsExec || hasSuperadminAcc || hasRbacAcc || user?.is_owner === true;

  return { user, loading, isManagement };
}
