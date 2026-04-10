// src/service/activity.ts
// src/service/activity.ts
import { secureRequest } from "@/lib/axios";
import { RecentActivity, QuickInfo, APIResponse } from "@/types/api";

export const getRecentActivities = async () => {

  return secureRequest<APIResponse<RecentActivity[]>>("get", "/v1/activities/recent");
};

export const getQuickInfo = async () => {
  return secureRequest<APIResponse<QuickInfo>>('get',"/v1/activities/quick-info");
};
