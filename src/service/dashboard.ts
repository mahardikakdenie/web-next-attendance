import { secureRequest } from "@/lib/axios";
import { APIResponse, HrDashboardData, HeatmapItem, HeatmapQueryParams } from "@/types/api";

/**
 * HR & People Analytics Dashboard Service
 */

export const getHrDashboard = async () => {
  return secureRequest<APIResponse<HrDashboardData>>('get', 'v1/dashboards/hr');
};

export const getHeatmap = async (params: HeatmapQueryParams) => {
  return secureRequest<APIResponse<HeatmapItem[]>>('get', 'v1/dashboards/heatmap', params);
};
