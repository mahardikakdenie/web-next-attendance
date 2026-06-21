"use client";

import React from "react";
import Image from "next/image";
import { Building2, ChevronDown } from "lucide-react";
import { useAuthStore } from "@/store/auth.store";
import { usePermission } from "@/components/auth/PermissionGuard";
import { TenantPlanBadge } from "@/components/tenant-settings/TenantPlanBadge";

export default function TenantSwitcher() {
  const { user } = useAuthStore();
  const hasRbacAccess = usePermission("rbac.access");
  const hasSuperadminAccess = usePermission("superadmin.access");
  const isPlatformAdmin = hasRbacAccess || hasSuperadminAccess;
  const isLoading = !user;

  if (!isPlatformAdmin || isLoading) {
    return null;
  }

  return (
    <div className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-blue-50/50 rounded-xl border border-blue-100/50 cursor-pointer hover:bg-blue-50 transition-colors group">
      <div className="relative w-5 h-5 rounded-md overflow-hidden flex items-center justify-center bg-white border border-blue-100 shadow-xs shrink-0">
        {user?.tenant_setting?.tenant_logo ? (
          <Image 
            src={user.tenant_setting.tenant_logo} 
            alt="Tenant Logo" 
            fill 
            className="object-cover"
            sizes="20px"
          />
        ) : (
          <Building2 size={12} className="text-blue-500" />
        )}
      </div>
      <div className="flex items-center gap-2 overflow-hidden">
        <span className="text-xs font-bold text-blue-700 leading-tight truncate">
          {user?.tenant?.name ?? 'Global System'}
        </span>
        <TenantPlanBadge />
      </div>
      <ChevronDown size={12} className="text-blue-400 group-hover:translate-y-0.5 transition-transform shrink-0" />
    </div>
  );
}
