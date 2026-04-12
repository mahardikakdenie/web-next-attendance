import { secureRequest } from "@/lib/axios";
import { APIResponse } from "@/types/api";
import { WorkShift, EmployeeSchedule } from "@/types/schedules";

/**
 * Shift Management Service
 */
export const getShifts = async () => {
  return secureRequest<APIResponse<WorkShift[]>>("get", "/v1/hr/shifts");
};

export const createShift = async (data: Partial<WorkShift>) => {
  return secureRequest<APIResponse<WorkShift>>("post", "/v1/hr/shifts", data);
};

/**
 * Weekly Rostering Service
 */
export const getRoster = async (startDate: string, endDate: string) => {
  return secureRequest<APIResponse<EmployeeSchedule[]>>("get", `/v1/hr/roster?start_date=${startDate}&end_date=${endDate}`);
};

export interface SaveRosterRequest {
  start_date: string;
  assignments: {
    user_id: number;
    roster: Record<string, string>;
  }[];
}

export const saveRoster = async (payload: SaveRosterRequest) => {
  return secureRequest<APIResponse<null>>("post", "/v1/hr/roster/save", payload);
};

/**
 * Holiday Calendar Service
 */
export interface Holiday {
  id: string;
  date: string;
  name: string;
  type: string;
  is_paid: boolean;
}

export const getHolidays = async (year: number) => {
  return secureRequest<APIResponse<Holiday[]>>("get", `/v1/hr/calendar?year=${year}`);
};

export const createHoliday = async (data: Partial<Holiday>) => {
  return secureRequest<APIResponse<Holiday>>("post", "/v1/hr/calendar", data);
};
