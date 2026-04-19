import { secureRequest } from "@/lib/axios";
import { 
  APIResponse, 
  Project, 
  TimesheetEntry, 
  TimesheetReport 
} from "@/types/api";

/**
 * ADMIN/HR PROJECT MANAGEMENT
 */

export const getProjects = async (params?: { search?: string; status?: string }) => {
  return secureRequest<APIResponse<Project[]>>("get", "/v1/timesheet/admin/projects", params);
};

export const createProject = async (payload: Partial<Project>) => {
  return secureRequest<APIResponse<Project>>("post", "/v1/timesheet/admin/projects", payload);
};

export const updateProject = async (id: number, payload: Partial<Project>) => {
  return secureRequest<APIResponse<Project>>("put", `/v1/timesheet/admin/projects/${id}`, payload);
};

/**
 * EMPLOYEE TIMESHEET ENTRIES
 */

export const getActiveProjects = async () => {
  return secureRequest<APIResponse<Project[]>>("get", "/v1/timesheet/projects/active");
};

export const createTimesheetEntry = async (payload: {
  project_id: number;
  task_name: string;
  duration_hours: number;
  date: string;
  description: string;
}) => {
  return secureRequest<APIResponse<TimesheetEntry>>("post", "/v1/timesheet/entries", payload);
};

export const getMyTimesheetReport = async (period: string) => {
  return secureRequest<APIResponse<TimesheetReport>>("get", `/v1/timesheet/me/report?period=${period}`);
};
