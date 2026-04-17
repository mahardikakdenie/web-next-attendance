import { secureRequest } from "@/lib/axios";
import { APIResponse, OwnerStatsResponse } from "@/types/api";
import { 
  SupportMessage, 
  TrialRequest, 
  ProvisioningTicket,
  CreateTrialPayload,
  CreateSupportMessagePayload
} from "@/types/support";

/**
 * Superadmin Analytics & Monitoring
 */
export const getOwnersStats = (limit: number = 10, offset: number = 0) => {
  return secureRequest<APIResponse<OwnerStatsResponse>>("get", "/v1/superadmin/owners-stats", { limit, offset });
};

/**
 * Public Lead Capture (Landing Page)
 */
export const submitTrialRequest = (payload: CreateTrialPayload) => {
  return secureRequest<APIResponse<TrialRequest>>("post", "/v1/public/trial-request", payload);
};

/**
 * Support Inbox Management (Staff/Superadmin in Tenant 1)
 */
export const getSupportMessages = () => {
  return secureRequest<APIResponse<SupportMessage[]>>("get", "/v1/admin/support/inbox");
};

export const updateMessageStatus = (id: string, status: SupportStatus) => {
  return secureRequest<APIResponse<SupportMessage>>("patch", `/v1/admin/support/inbox/${id}`, { status });
};

/**
 * Trial Qualification (Staff/Superadmin in Tenant 1)
 */
export const getTrialRequests = () => {
  return secureRequest<APIResponse<TrialRequest[]>>("get", "/v1/admin/support/trials");
};

export const updateTrialStatus = (id: string, status: TrialStatus) => {
  return secureRequest<APIResponse<TrialRequest>>("patch", `/v1/admin/support/trials/${id}`, { status });
};

/**
 * Provisioning & Activation (Superadmin Only)
 */
export const getProvisioningTickets = () => {
  return secureRequest<APIResponse<ProvisioningTicket[]>>("get", "/v1/admin/support/provisioning");
};

export const executeProvisioning = (id: string) => {
  return secureRequest<APIResponse<null>>("post", `/v1/admin/support/provisioning/${id}/execute`);
};

/**
 * Send Help Message (Available for all Tenants)
 */
export const sendSupportMessage = (payload: CreateSupportMessagePayload) => {
  return secureRequest<APIResponse<SupportMessage>>("post", "/v1/support/message", payload);
};

import { SupportStatus, TrialStatus } from "@/types/support";
