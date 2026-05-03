import { secureRequest } from "@/lib/axios";
import { APIResponse } from "@/types/api";
import { 
  SubscriptionsResponse, 
  SubscriptionPlan, 
  CreatePlanPayload, 
  UpdatePlanPayload, 
  OverrideSubscriptionPayload 
} from "@/types/subscription";
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

export const overrideSubscription = (id: number, payload: OverrideSubscriptionPayload) => {
  return secureRequest<APIResponse<null>>("put", `/v1/superadmin/subscriptions/${id}`, payload);
};

export const sendBillingReminder = (id: number) => {
  return secureRequest<APIResponse<null>>("post", `/v1/superadmin/subscriptions/${id}/remind`);
};

export const suspendTenant = (id: number, reason: string) => {
  return secureRequest<APIResponse<null>>("post", `/v1/superadmin/subscriptions/${id}/suspend`, { reason });
};

/**
 * SUPERADMIN: Global Plans CRUD
 */

export const getPlans = () => {
  return secureRequest<APIResponse<SubscriptionPlan[]>>("get", "/v1/superadmin/plans");
};

export const createPlan = (payload: CreatePlanPayload) => {
  return secureRequest<APIResponse<SubscriptionPlan>>("post", "/v1/superadmin/plans", payload);
};

export const updatePlan = (id: number, payload: UpdatePlanPayload) => {
  return secureRequest<APIResponse<SubscriptionPlan>>("put", `/v1/superadmin/plans/${id}`, payload);
};

export const deletePlan = (id: number) => {
  return secureRequest<APIResponse<null>>("delete", `/v1/superadmin/plans/${id}`);
};
