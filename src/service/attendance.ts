// src/service/attendance.ts
import { secureRequest } from "@/lib/axios";
import { AttendanceToday, AttendanceHistory, ClockPayload, APIResponse, AttendanceSummary, AttendanceFilterParams, AttendanceCorrectionPayload, AttendanceCorrectionData, ApprovalPayload, AttendanceRecord } from "@/types/api";

export const getTodayAttendance = async (sync: boolean = false) => {
  const url = sync ? "/v1/attendance/today?sync=true" : "/v1/attendance/today";
  return secureRequest<APIResponse<AttendanceToday>>("get", url);
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

/**
 * Submit a request for manual attendance correction.
 * @param payload - The payload containing the correction details (date, type, times, reason, and optional attendance ID).
 */
export const submitCorrection = async (payload: AttendanceCorrectionPayload) => {
  return secureRequest<APIResponse<AttendanceCorrectionData>>("post", "/v1/attendance/corrections", payload);
};

/**
 * Get a list of attendance correction requests.
 * @param params - Optional parameters to filter by status, limit, or offset.
 */
export const getCorrections = async (params?: { status?: string; limit?: number; offset?: number }) => {
  return secureRequest<APIResponse<AttendanceCorrectionData[]>>(
    "get", 
    "/v1/attendance/corrections", 
    undefined,
    { params }
  );
};

/**
 * Approve a pending attendance correction request.
 * @param id - The ID of the correction request.
 * @param payload - The approval details (approver notes).
 */
export const approveCorrection = async (id: string, payload: ApprovalPayload) => {
  return secureRequest<APIResponse<AttendanceCorrectionData>>("post", `/v1/attendance/corrections/${id}/approve`, payload);
};

/**
 * Reject a pending attendance correction request.
 * @param id - The ID of the correction request.
 * @param payload - The rejection details (rejection notes).
 */
export const rejectCorrection = async (id: string, payload: ApprovalPayload) => {
  return secureRequest<APIResponse<AttendanceCorrectionData>>("post", `/v1/attendance/corrections/${id}/reject`, payload);
};

/**
 * Mengakhiri sesi absensi hari ini (mengunci status absensi menjadi 'done').
 * Sesuai untuk skenario allow_multiple_check: true.
 */
export const endAttendanceSession = async () => {
  return secureRequest<APIResponse<null>>("post", "/v1/attendance/end-session", {});
};

