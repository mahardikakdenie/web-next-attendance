// src/service/leave.ts
import { secureRequest } from "@/lib/axios";
import { APIResponse, Balance, LeaveBalance, LeaveRequestPayload } from "@/types/api";

export const getLeaveBalances = async () => {
  return secureRequest<APIResponse<Balance[]>>('get',"/v1/leaves/balances");
};

export const requestLeave = async (payload: LeaveRequestPayload) => {
  return secureRequest<LeaveBalance[]>('post',"/v1/leaves/request", payload);
};
