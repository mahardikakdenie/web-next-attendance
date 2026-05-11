// src/service/users.ts
import { secureRequest } from "@/lib/axios";
import { APIResponse, UserData, CreateUserPayload, ProfileChangeRequest } from "@/types/api";

export const getDataUserslist = async ({ page = 1, limit = 10, user_id, search }: {page?: number, limit?: number, user_id?: number, search?: string}) => {
  const response = await secureRequest<APIResponse<UserData[]>>("get", "/v1/users", { page, limit, user_id, search });
  return response;
};

export const createUser = async (payload: CreateUserPayload) => {
  const response = await secureRequest<APIResponse<UserData>>("post", "/v1/users", payload);
  return response;
};

export const updateProfile = async (payload: Partial<UserData>) => {
  const response = await secureRequest<APIResponse<ProfileChangeRequest>>("put", "/v1/users/me", payload);
  return response;
};

/**
 * CHANGE REQUESTS (EMPLOYEE)
 */
export const getMyChangeRequests = async () => {
  return secureRequest<APIResponse<ProfileChangeRequest[]>>("get", "/v1/users/me/change-requests");
};

export const cancelChangeRequest = async (id: number) => {
  return secureRequest<APIResponse<null>>("patch", `/v1/users/me/change-requests/${id}/cancel`);
};

/**
 * CHANGE REQUESTS (HR/ADMIN)
 */
export const getAllChangeRequests = async (params?: { status?: string }) => {
  return secureRequest<APIResponse<ProfileChangeRequest[]>>("get", "/v1/users/change-requests", params);
};

export const approveChangeRequest = async (id: number) => {
  return secureRequest<APIResponse<null>>("post", `/v1/users/approve-change/${id}`);
};

export const rejectChangeRequest = async (id: number, adminNotes: string) => {
  return secureRequest<APIResponse<null>>("post", `/v1/users/reject-change/${id}`, {
    admin_notes: adminNotes
  });
};
