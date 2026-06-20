import { secureRequest } from "@/lib/axios";
import { APIResponse, DynamicMenuItem, RoleOverview } from "@/types/api";

export const getMyMenus = async () => {
  return secureRequest<APIResponse<DynamicMenuItem[]>>("get", "/v1/menus/me");
};

export const getMenusOverview = async () => {
  return secureRequest<APIResponse<RoleOverview[]>>("get", "/v1/menus/overview");
};

/**
 * SUPERADMIN: Menu Management
 */

export const getSuperadminMenus = async () => {
  return secureRequest<APIResponse<DynamicMenuItem[]>>("get", "/v1/superadmin/menus");
};

export const updateMenu = async (id: number | string, payload: Partial<DynamicMenuItem> & { allowed_roles?: number[] }) => {
  return secureRequest<APIResponse<null>>("put", `/v1/superadmin/menus/${id}`, payload);
};

export const createMenu = async (payload: Partial<DynamicMenuItem>) => {
  return secureRequest<APIResponse<DynamicMenuItem>>("post", "/v1/superadmin/menus", payload);
};
