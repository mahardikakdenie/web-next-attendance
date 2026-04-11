import { secureRequest } from "@/lib/axios";
import { APIResponse, Role } from "@/types/api";

/**
 * RBAC 2.0 Management Service
 */

export const getTenantRoles = () => {
  return secureRequest<APIResponse<Role[]>>("get", "/v1/tenant-roles");
};

export const createCustomRole = (data: Partial<Role> & { permissions: string[] }) => {
  return secureRequest<APIResponse<Role>>("post", "/v1/tenant-roles", data);
};

export const saveRoleHierarchy = (parent_id: number, child_ids: number[]) => {
  return secureRequest<APIResponse<null>>("post", "/v1/tenant-roles/hierarchy", { 
    parent_role_id: parent_id, 
    child_role_ids: child_ids 
  });
};
