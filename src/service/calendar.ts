import { secureRequest } from "@/lib/axios";
import { APIResponse } from "@/types/api";

export interface Holiday {
  id: string;
  date: string;
  name: string;
  type: string;
  is_paid: boolean;
}

/**
 * Holiday Calendar Service
 */
export const getHolidays = async (year: number) => {
  return secureRequest<APIResponse<Holiday[]>>("get", `/v1/hr/calendar`, undefined, {
    params: { year }
  });
};

export const createHoliday = async (data: Partial<Holiday>) => {
  return secureRequest<APIResponse<Holiday>>("post", "/v1/hr/calendar", data);
};

export const updateHoliday = async (id: string, data: Partial<Holiday>) => {
  return secureRequest<APIResponse<Holiday>>("put", `/v1/hr/calendar/${id}`, data);
};

export const deleteHoliday = async (id: string) => {
  return secureRequest<APIResponse<null>>("delete", `/v1/hr/calendar/${id}`);
};
