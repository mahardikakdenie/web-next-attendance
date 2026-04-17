import { secureRequest } from "@/lib/axios";
import {
  APIResponse,
  PayrollCalculatePayload,
  PayrollSummaryStats,
  PayrollRecord,
  EmployeeBaseline,
  AttendanceSyncData,
  SavePayrollPayload
} from "@/types/api";

export const calculatePayrollAPI = async (payload: PayrollCalculatePayload) => {
  return secureRequest<APIResponse<PayrollRecord>>("post", "/v1/payroll/calculate", payload);
};

export const getPayrollSummary = async (period: string) => {
  return secureRequest<APIResponse<PayrollSummaryStats>>("get", `/v1/payroll/summary?period=${period}`);
};

export const saveEmployeePayroll = async (userId: number, payload: SavePayrollPayload) => {
  return secureRequest<APIResponse<null>>("post", `/v1/payroll/employee/${userId}/save`,
    payload);
}

export const getPayrollList = async (params: { period: string; page?: number; limit?: number; search?: string }) => {
  return secureRequest<APIResponse<PayrollRecord[]>>("get", "/v1/payroll", params);
};

export const generatePayrollCycle = async (period: string) => {
  return secureRequest<APIResponse<null>>("post", "/v1/payroll/generate", { period });
};

export const publishPayroll = async (id: number) => {
  return secureRequest<APIResponse<null>>("patch", `/v1/payroll/${id}/publish`);
};

export const getEmployeeBaseline = async (userId: number) => {
  return secureRequest<APIResponse<EmployeeBaseline>>("get", `/v1/payroll/employee/${userId}/baseline`);
};

export const getEmployeeAttendanceSync = async (userId: number, period: string) => {
  return secureRequest<APIResponse<AttendanceSyncData>>("get", `/v1/payroll/employee/${userId}/attendance-sync?period=${period}`);
};

export const getMyPayrollHistory = async (params?: { page?: number; limit?: number }) => {
  return secureRequest<APIResponse<PayrollRecord[]>>("get", "/v1/payroll/me", params);
};
