import { secureRequest } from "@/lib/axios";
import { APIResponse } from "@/types/api";

export interface LifecycleTask {
  id: string;
  task_name: string;
  category: "ONBOARDING" | "OFFBOARDING";
  is_completed: boolean;
  completed_at?: string;
}

export interface LifecycleTemplate {
  id: string;
  task_name: string;
  category: "ONBOARDING" | "OFFBOARDING";
  created_at: string;
}

export interface EmployeeLifecycle {
  employee_id: number;
  status: "ONBOARDING" | "OFFBOARDING";
  tasks: LifecycleTask[];
}

/**
 * Employee Lifecycle Service (Specific to Employee)
 */
export const getEmployeeLifecycle = async (userId: number) => {
  return secureRequest<APIResponse<EmployeeLifecycle>>(
    "get",
    `/v1/hr/employees/${userId}/lifecycle`
  );
};

export const updateLifecycleTaskStatus = async (
  userId: number,
  taskId: string,
  isCompleted: boolean
) => {
  return secureRequest<APIResponse<null>>(
    "patch",
    `/v1/hr/employees/${userId}/lifecycle/tasks/${taskId}`,
    { is_completed: isCompleted }
  );
};

/**
 * Lifecycle Master Templates (Global for Tenant)
 */
export const getLifecycleTemplates = async () => {
  return secureRequest<APIResponse<LifecycleTemplate[]>>(
    "get",
    "/v1/hr/lifecycle-templates"
  );
};

export const createLifecycleTemplate = async (data: { task_name: string; category: string }) => {
  return secureRequest<APIResponse<LifecycleTemplate>>(
    "post",
    "/v1/hr/lifecycle-templates",
    data
  );
};

export const deleteLifecycleTemplate = async (id: string) => {
  return secureRequest<APIResponse<null>>(
    "delete",
    `/v1/hr/lifecycle-templates/${id}`
  );
};
