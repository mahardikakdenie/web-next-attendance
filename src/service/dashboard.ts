import { secureRequest } from "@/lib/axios";
import { APIResponse, HrDashboardData, HeatmapItem, HeatmapQueryParams, EmployeeDnaData } from "@/types/api";

/**
 * HR & People Analytics Dashboard Service
 */

export const getHrDashboard = async () => {
  return secureRequest<APIResponse<HrDashboardData>>('get', 'v1/dashboards/hr');
};

export const getEmployeeDna = async (userId: number) => {
  return secureRequest<APIResponse<EmployeeDnaData>>('get', `v1/dashboards/hr/employee-dna/${userId}`);
};

export const getHeatmap = async (params: HeatmapQueryParams) => {
  return secureRequest<APIResponse<HeatmapItem[]>>('get', 'v1/dashboards/heatmap', params);
};
