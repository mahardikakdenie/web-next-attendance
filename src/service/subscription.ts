import { secureRequest } from "@/lib/axios";
import { APIResponse } from "@/types/api";
import { SubscriptionsResponse } from "@/types/subscription";
import { MySubscription, UpgradePayload } from "@/types/billing";

/**
 * TENANT ADMIN: Manage Own Subscription
 */
export const getMySubscription = () => {
  return secureRequest<APIResponse<MySubscription>>("get", "/v1/subscriptions/me");
};

export const upgradePlan = (payload: UpgradePayload) => {
  return secureRequest<APIResponse<null>>("post", "/v1/subscriptions/upgrade", payload);
};

/**
 * SUPERADMIN: Manage and Monitor Tenant Subscriptions
 */

export const getSubscriptions = (
  page: number = 1, 
  limit: number = 10, 
  status?: string, 
  search?: string
) => {
  return secureRequest<APIResponse<SubscriptionsResponse>>("get", "/v1/superadmin/subscriptions", {
    page,
    limit,
    status: status === "all" ? undefined : status,
    search
  });
};

export const sendBillingReminder = (id: number) => {
  return secureRequest<APIResponse<null>>("post", `/v1/superadmin/subscriptions/${id}/remind`);
};

export const suspendTenant = (id: number, reason: string) => {
  return secureRequest<APIResponse<null>>("post", `/v1/superadmin/subscriptions/${id}/suspend`, { reason });
};
