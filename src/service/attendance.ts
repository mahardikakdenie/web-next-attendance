// src/service/attendance.ts
import { secureRequest } from "@/lib/axios";
import { AttendanceToday, AttendanceHistory, ClockPayload, APIResponse, UserAttendance, AttendanceSummary, AttendanceFilterParams } from "@/types/api";

export const getTodayAttendance = async () => {
  return secureRequest<APIResponse<AttendanceToday>>("get", "/v1/attendance/today");
};

export const getAttendanceHistory = async (limit: number = 5) => {
  return secureRequest<APIResponse<AttendanceHistory[]>>("get", `/v1/attendance/history`, {
    limit,
  });
};

export const clockAttendance = async (payload: ClockPayload) => {
  return secureRequest<APIResponse<null>>("post", "/v1/attendance", payload);
};

export const getDataAttendances = async (
  limit: number = 10, 
  offset: number = 0,
  status: string = '', 
  date_from: string = '', 
  date_to: string = '', 
  search: string = ''
) => {
  return secureRequest<APIResponse<{ data: UserAttendance[]; meta: { total: number; limit: number; offset: number } }>>(
    "get", 
    "/v1/attendance", 
    undefined, 
    {
      params: {
        limit,
        offset,
        status,
        date_from,
        date_to,
        search,
        include: "user"
      }
    }
  );
};

export const getDataSummary = async (_currentFilters: AttendanceFilterParams) => {
  return secureRequest<APIResponse<AttendanceSummary>>('get', '/v1/attendance/summary', _currentFilters);
};
