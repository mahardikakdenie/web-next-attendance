// src/service/overtime.ts
import { secureRequest } from "@/lib/axios";
import { OvertimeRequestPayload, APIResponse } from "@/types/api";

export const requestOvertime = async (payload: OvertimeRequestPayload) => {
  return secureRequest<APIResponse<null>>('post',"/v1/overtimes/request", payload);
};
