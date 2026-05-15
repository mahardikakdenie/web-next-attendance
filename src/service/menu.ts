import { secureRequest } from "@/lib/axios";
import { APIResponse, DynamicMenuItem } from "@/types/api";

export const getMyMenus = async () => {
  return secureRequest<APIResponse<DynamicMenuItem[]>>("get", "/v1/menus/me");
};

export const getMenusOverview = async () => {
  return secureRequest<APIResponse<any[]>>("get", "/v1/menus/overview");
};

/**
 * SUPERADMIN: Menu Management
 */

export const getSuperadminMenus = async () => {
  return secureRequest<APIResponse<any[]>>("get", "/v1/superadmin/menus");
};

export const updateMenu = async (id: number | string, payload: any) => {
  return secureRequest<APIResponse<null>>("put", `/v1/superadmin/menus/${id}`, payload);
};
