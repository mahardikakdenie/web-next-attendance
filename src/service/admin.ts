import { secureRequest } from "@/lib/axios";
import { APIResponse, UserData } from "@/types/api";

export interface UpdateTenantPayload {
  name: string;
  plan: string;
  is_suspended: boolean;
  suspended_reason: string;
}

/**
 * Superadmin Tenant Management
 */
export const updateTenant = (id: number, payload: UpdateTenantPayload) => {
  return secureRequest<APIResponse<null>>("put", `/v1/superadmin/tenants/${id}`, payload);
};

/**
 * Superadmin Platform Account Management
 */
export const getPlatformAccounts = (params?: { search?: string; limit?: number; offset?: number }) => {
  return secureRequest<APIResponse<UserData[]>>("get", "/v1/superadmin/platform-accounts", params);
};

export const createPlatformAccount = (payload: Partial<UserData> & { role_id: number; password?: string }) => {
  return secureRequest<APIResponse<UserData>>("post", "/v1/superadmin/platform-accounts", payload);
};

export const updatePlatformAccount = (id: number, payload: Partial<UserData> & { role_id?: number }) => {
  return secureRequest<APIResponse<UserData>>("put", `/v1/superadmin/platform-accounts/${id}`, payload);
};

export const toggleAccountStatus = (id: number, status: "active" | "suspended") => {
  return secureRequest<APIResponse<null>>("patch", `/v1/superadmin/platform-accounts/${id}/status`, { status });
};
