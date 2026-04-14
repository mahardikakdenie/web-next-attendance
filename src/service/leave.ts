// src/service/leave.ts
import { secureRequest } from "@/lib/axios";
import { APIResponse, Balance, LeaveBalance, LeaveRequestPayload } from "@/types/api";

export interface LeaveRequestData {
  id: number;
  user_id: number;
  leave_type_id: number;
  start_date: string;
  end_date: string;
  reason: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  notes?: string;
  total_days: number;
  created_at: string;
  user?: {
    name: string;
    media_url: string;
    employee_id: string;
  };
  leave_type?: {
    name: string;
  };
  // Compatibility fields for flat structure
  user_name?: string;
  user_avatar?: string;
  leave_type_name?: string;
}

export const getLeaveRequests = async (params?: { limit?: number; offset?: number; status?: string; search?: string; page: number; }) => {
  return secureRequest<APIResponse<LeaveRequestData[]>>(
    'get', 
    "/v1/leaves", 
    params
  );
};

export const getLeaveBalances = async () => {
  return secureRequest<APIResponse<Balance[]>>('get',"/v1/leaves/balances");
};

export const requestLeave = async (payload: LeaveRequestPayload) => {
  return secureRequest<LeaveBalance[]>('post',"/v1/leaves/request", payload);
};

export const approveLeave = (id: number, notes?: string) => {
  return secureRequest<APIResponse<null>>("post", `/v1/leaves/approve/${id}`, { notes });
};

export const rejectLeave = (id: number, notes?: string) => {
  return secureRequest<APIResponse<null>>("post", `/v1/leaves/reject/${id}`, { notes });
};
