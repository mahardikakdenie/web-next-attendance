// src/service/attendance.ts
import { secureRequest } from "@/lib/axios";
import { AttendanceToday, AttendanceHistory, ClockPayload, APIResponse, UserAttendance } from "@/types/api";

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

export const getDataAttendances = async (page: number = 1, limit: number = 10) => {
  return secureRequest<APIResponse<UserAttendance[]>>("get", "/v1/attendance", {
    page,
    limit,
    include: "user"
  });
};
