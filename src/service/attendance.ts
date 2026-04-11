// src/service/attendance.ts
import { secureRequest } from "@/lib/axios";
import { AttendanceToday, AttendanceHistory, ClockPayload, APIResponse, UserAttendance, AttendanceSummary } from "@/types/api";

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

export const getDataAttendances = async (page: number = 1, limit: number = 10, status: string = '', date_from: string = '', date_to: string = '', offset: number= 0) => {
  return secureRequest<APIResponse<UserAttendance[]>>("get", "/v1/attendance", {
    page,
    limit,
    status,
    date_from,
    date_to,
    offset,
    include: "user"
  });
};

export const getDataSummary = async () => {
  return secureRequest<APIResponse<AttendanceSummary>>('get', '/v1/attendance/summary');
};
