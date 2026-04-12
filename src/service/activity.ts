import { secureRequest } from "@/lib/axios";
import { APIResponse, RecentActivity, QuickInfo } from "@/types/api";

/**
 * Activity & System Notifications Service
 */

export const getRecentActivities = async () => {
  return secureRequest<APIResponse<RecentActivity[]>>("get", "/v1/activities/recent");
};

export const getQuickInfo = async () => {
  return secureRequest<APIResponse<QuickInfo>>("get", "/v1/activities/quick-info");
};
