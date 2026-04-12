import { secureRequest } from "@/lib/axios";
import { APIResponse, OvertimeRequestPayload } from "@/types/api";

/**
 * Overtime Management Service
 */

export const requestOvertime = async (payload: OvertimeRequestPayload) => {
  return secureRequest<APIResponse<null>>("post", "/v1/overtimes/request", payload);
};
