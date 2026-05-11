import { secureRequest } from "@/lib/axios";
import { APIResponse, DynamicMenuItem } from "@/types/api";

export const getMyMenus = async () => {
  return secureRequest<APIResponse<DynamicMenuItem[]>>("get", "/v1/menus/me");
};
