import { UserData } from "./api";

export type ProjectStatus = 'ACTIVE' | 'COMPLETED' | 'ON_HOLD';

export interface Project {
  id: number;
  name: string;
  client_name: string;
  budget: number;
  description: string;
  start_date: string;
  end_date?: string;
  status: ProjectStatus;
  created_at: string;
  updated_at: string;
}

export interface ProjectMember {
  id: number;
  project_id: number;
  user_id: number;
  role: string;
  allocated_hours: number;
  user?: UserData;
  created_at: string;
  updated_at: string;
}

export interface CreateProjectPayload {
  name: string;
  client_name: string;
  budget: number;
  description: string;
  start_date: string;
  end_date?: string;
  status: ProjectStatus;
}

export type UpdateProjectPayload = Partial<CreateProjectPayload>;

export interface AssignMemberPayload {
  user_id: number;
  role: string;
  allocated_hours: number;
}
