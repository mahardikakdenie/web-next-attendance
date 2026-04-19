import { secureRequest } from "@/lib/axios";
import { APIResponse } from "@/types/api";
import { 
  Project, 
  CreateProjectPayload, 
  UpdateProjectPayload, 
  ProjectMember, 
  AssignMemberPayload 
} from "@/types/projects";

export const getProjects = (params?: { status?: string; search?: string; page?: number; limit?: number }) => {
  return secureRequest<APIResponse<Project[]>>("get", "/v1/projects", params);
};

export const createProject = (data: CreateProjectPayload) => {
  return secureRequest<APIResponse<Project>>("post", "/v1/projects", data);
};

export const updateProject = (id: number, data: UpdateProjectPayload) => {
  return secureRequest<APIResponse<Project>>("put", `/v1/projects/${id}`, data);
};

export const deleteProject = (id: number) => {
  return secureRequest<APIResponse<null>>("delete", `/v1/projects/${id}`);
};

export const getProjectMembers = (projectId: number) => {
  return secureRequest<APIResponse<ProjectMember[]>>("get", `/v1/projects/${projectId}/members`);
};

export const assignProjectMember = (projectId: number, data: AssignMemberPayload) => {
  return secureRequest<APIResponse<ProjectMember>>("post", `/v1/projects/${projectId}/members`, data);
};

export const removeProjectMember = (projectId: number, userId: number) => {
  return secureRequest<APIResponse<null>>("delete", `/v1/projects/${projectId}/members/${userId}`);
};
