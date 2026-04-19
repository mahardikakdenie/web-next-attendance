import { LucideIcon } from "lucide-react";

export interface Permission {
  id: string;          // Contoh: "user.create"
  module: string;      // Contoh: "user"
  action: string;      // Contoh: "create"
  description: string;
}

export interface PermissionModule {
  name: string;        // Label UI, contoh: "User Management"
  key: string;         // Key modul, contoh: "user"
  permissions: Permission[];
  icon?: LucideIcon;   // Optional for FE mapping
}

export interface PermissionResponse {
  status: string;
  message: string;
  data: PermissionModule[];
}

export interface RolePermissionState {
  roleId: number;
  assignedPermissions: string[]; // Array of Permission IDs
}
