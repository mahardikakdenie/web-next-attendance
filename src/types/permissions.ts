import { LucideIcon } from "lucide-react";

export type PermissionAction = "view" | "create" | "edit" | "delete" | "approve" | "export";

export interface Permission {
  id: string;
  name: string;
  description: string;
  action: PermissionAction;
}

export interface PermissionModule {
  id: string;
  name: string;
  icon: LucideIcon;
  permissions: Permission[];
}

export interface Role {
  id: string;
  name: string;
  description: string;
  isSystem: boolean; // System roles cannot be deleted
  baseRole?: "ADMIN" | "HR" | "FINANCE" | "USER"; // The core role it inherits from
  department?: string; // Optional department mapping
  memberCount: number;
  assignedPermissions: string[]; // Array of Permission IDs
}

export interface HierarchyRule {
  id: string;
  roleId: string;
  canManage: string[]; // Array of Role IDs this role can supervise
  canViewReportsOf: string[]; // Array of Role IDs this role can see data for
}
