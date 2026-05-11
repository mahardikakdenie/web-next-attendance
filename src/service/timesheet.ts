import { secureRequest } from "@/lib/axios";
import { 
  APIResponse, 
  Project, 
  ProjectTask,
  TimesheetEntry, 
  TimesheetReport 
} from "@/types/api";

export interface TimesheetAnalytics {
  total_hours: number;
  active_employees: number;
  project_distribution: {
    project_id: number;
    project_name: string;
    total_hours: number;
    percentage: number;
  }[];
  daily_stats: {
    date: string;
    total_hours: number;
  }[];
}

export interface MonitoringParams {
  start_date: string;
  end_date: string;
  user_id?: number;
  project_id?: number;
  page?: number;
  limit?: number;
}

/**
 * ADMIN/HR PROJECT MANAGEMENT
 */
export const getProjects = async (params?: { search?: string; status?: string }) => {
  return secureRequest<APIResponse<Project[]>>("get", "/v1/timesheet/projects", params);
};

export const createProject = async (payload: Partial<Project>) => {
  return secureRequest<APIResponse<Project>>("post", "/v1/timesheet/admin/projects", payload);
};

export const updateProject = async (id: number, payload: Partial<Project>) => {
  return secureRequest<APIResponse<Project>>("put", `/v1/timesheet/admin/projects/${id}`, payload);
};

/**
 * TASK MANAGEMENT
 */
export const getTasks = async (projectId: number) => {
  return secureRequest<APIResponse<ProjectTask[]>>("get", `/v1/timesheet/tasks?project_id=${projectId}`);
};

export const createTask = async (payload: { project_id: number; name: string; description?: string }) => {
  return secureRequest<APIResponse<ProjectTask>>("post", "/v1/timesheet/tasks", payload);
};

export const updateTask = async (taskId: number, payload: { name: string; description?: string }) => {
  return secureRequest<APIResponse<ProjectTask>>("put", `/v1/timesheet/tasks/${taskId}`, payload);
};

export const deleteTask = async (taskId: number) => {
  return secureRequest<APIResponse<null>>("delete", `/v1/timesheet/tasks/${taskId}`);
};

/**
 * EMPLOYEE TIMESHEET ENTRIES
 */
export const getEmployeeProjects = async () => {
  return secureRequest<APIResponse<Project[]>>("get", "/v1/timesheet/projects");
};

export const getActiveProjects = async () => {
  return secureRequest<APIResponse<Project[]>>("get", "/v1/timesheet/projects");
};

export const createTimesheetEntry = async (payload: {
  project_id: number;
  task_id?: number; // Added task_id per new requirement
  task_name: string;
  duration_hours: number;
  date: string;
  description: string;
}) => {
  return secureRequest<APIResponse<TimesheetEntry>>("post", "/v1/timesheet/entries", payload);
};

export const getMyTimesheetEntries = async (params: { 
  start_date: string; 
  end_date: string; 
  page?: number; 
  limit?: number 
}) => {
  return secureRequest<APIResponse<{ 
    entries: TimesheetEntry[], 
    total: number, 
    page: number, 
    limit: number, 
    total_hours: number 
  }>>("get", "/v1/timesheet/me/entries", params);
};

/**
 * HR/MANAGEMENT MONITORING
 */
export const getTimesheetMonitoring = async (params: MonitoringParams) => {
  return secureRequest<APIResponse<TimesheetEntry[]>>("get", "/v1/timesheet/monitoring", params);
};

export const getTimesheetAnalytics = async (params: { start_date: string; end_date: string }) => {
  return secureRequest<APIResponse<TimesheetAnalytics>>("get", "/v1/timesheet/analytics", params);
};
