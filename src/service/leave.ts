// src/service/leave.ts
import { secureRequest } from "@/lib/axios";
import { LeaveBalance, LeaveRequestPayload, APIResponse } from "@/types/api";

export const getLeaveBalances = async () => {
  return secureRequest<APIResponse<LeaveBalance[]>>('get',"/v1/leaves/balances");
};

export const requestLeave = async (payload: LeaveRequestPayload) => {
  return secureRequest<APIResponse<LeaveBalance[]>>('post',"/v1/leaves/request", payload);
};
