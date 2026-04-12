"use client";

import { useAuthStore } from "@/store/auth.store";
import React from "react";

/**
 * Hook to check permission in functional components
 */
export function usePermission(permissionId: string) {
  const hasPermission = useAuthStore((state) => state.hasPermission);
  return hasPermission(permissionId);
}

interface CanProps {
  permission: string;
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

/**
 * Component to wrap elements that require specific permissions
 */
export function Can({ permission, children, fallback = null }: CanProps) {
  const allowed = usePermission(permission);

  if (!allowed) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}
