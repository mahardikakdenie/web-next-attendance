// src/service/tenantSettings.ts
import { secureRequest } from "@/lib/axios";
import { UpdateTenantSettingPayload } from "@/types/api";

//////////////////////////////////////////////////////////////
// TYPES
//////////////////////////////////////////////////////////////

export type RecordAttendancePayload = {
  action: "clock_in" | "clock_out" | null;
  latitude: number;
  longitude: number;
  media_url: string;
};

//////////////////////////////////////////////////////////////
// 🔥 API METHODS
//////////////////////////////////////////////////////////////

export const getDataCurrentTenat = async () => {
  return secureRequest("get", "/v1/tenant-setting");
};

export const updateDataCurrentTenant = async (payload: UpdateTenantSettingPayload) => {
  return secureRequest("put", "/v1/tenant-setting", payload);
};

// export const recordAttendances = async (
//   payload: RecordAttendancePayload
// ) => {
//   return secureRequest("post", "/v1/attendance", payload);
// };
