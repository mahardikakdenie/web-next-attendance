// src/service/attendance.ts
import { secureRequest } from "@/lib/axios";
import { AttendanceToday, AttendanceHistory, ClockPayload, APIResponse, AttendanceSummary, AttendanceFilterParams, AttendanceCorrectionPayload, AttendanceCorrectionData, ApprovalPayload, AttendanceRecord } from "@/types/api";

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
  limit: number = 5 , 
  offset: number = 0,
  status: string = '', 
  date_from: string = '', 
  date_to: string = '', 
  search: string = ''
) => {
  return secureRequest<APIResponse<AttendanceRecord[]>>(
    "get", 
    "/v1/attendance", 
    {
        limit,
        offset,
        status,
        date_from,
        date_to,
        search,
        include: "user"
      }
  );
};

export const getDataSummary = async (_currentFilters: AttendanceFilterParams) => {
  return secureRequest<APIResponse<AttendanceSummary>>('get', '/v1/attendance/summary', _currentFilters);
};

export const submitCorrection = async (payload: AttendanceCorrectionPayload) => {
  return secureRequest<APIResponse<AttendanceCorrectionData>>("post", "/v1/attendance/corrections", payload);
};

export const getCorrections = async (params?: { status?: string; limit?: number; offset?: number }) => {
  return secureRequest<APIResponse<{ data: AttendanceCorrectionData[]; meta: { total: number } }>>(
    "get", 
    "/v1/attendance/corrections", 
    undefined,
    { params }
  );
};

export const approveCorrection = async (id: string, payload: ApprovalPayload) => {
  return secureRequest<APIResponse<AttendanceCorrectionData>>("post", `/v1/attendance/corrections/${id}/approve`, payload);
};

export const rejectCorrection = async (id: string, payload: ApprovalPayload) => {
  return secureRequest<APIResponse<AttendanceCorrectionData>>("post", `/v1/attendance/corrections/${id}/reject`, payload);
};
