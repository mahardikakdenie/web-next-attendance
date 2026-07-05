import { useState, useCallback, useMemo, useEffect } from "react";
import { 
  Building2,
  CreditCard,
  MessageSquare,
  UserCog,
  ShieldAlert,
  ShieldCheck,
  Clock,
  Wallet,
  Users,
  BarChart3,
  GitBranch,
  type LucideIcon
} from "lucide-react";
import { PermissionModule } from "@/types/permissions";
import { getAllPermissions } from "@/service/roles";
import { toast } from "sonner";

const MODULE_ICONS: Record<string, LucideIcon> = {
  tenant: Building2,
  subscription: CreditCard,
  billing: CreditCard,
  support: MessageSquare,
  account: UserCog,
  role: ShieldAlert,
  system: ShieldCheck,
  attendance: Clock,
  payroll: Wallet,
  user: Users,
  analytics: BarChart3,
  project: GitBranch
};

export function usePlatformPermissions() {
  const [permissionModules, setPermissionModules] = useState<PermissionModule[]>([]);
  const [isPermsLoading, setIsPermsLoading] = useState(true);
  const [permSearch, setPermSearch] = useState("");

  const fetchPermissions = useCallback(async () => {
    try {
      setIsPermsLoading(true);
      const resp = await getAllPermissions();
      if (resp.data) {
        const mappedModules = resp.data.map(mod => ({
          ...mod,
          icon: MODULE_ICONS[mod.key] || ShieldAlert
        }));
        setPermissionModules(mappedModules);
      }
    } catch {
      toast.error("Failed to load permission catalog");
    } finally {
      setIsPermsLoading(false);
    }
  }, []);

  const filteredModules = useMemo(() => {
    if (!permSearch.trim()) return permissionModules;
    const lowerQ = permSearch.toLowerCase();
    return permissionModules.map(mod => ({
      ...mod,
      permissions: mod.permissions.filter(p => 
        p.id.toLowerCase().includes(lowerQ) || 
        (p.description || "").toLowerCase().includes(lowerQ)
      )
    })).filter(mod => mod.permissions.length > 0);
  }, [permissionModules, permSearch]);

  return {
    permissionModules,
    isPermsLoading,
    permSearch,
    setPermSearch,
    filteredModules,
    fetchPermissions
  };
}
