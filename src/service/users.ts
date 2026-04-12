// src/service/users.ts
import { secureRequest } from "@/lib/axios";
import { APIResponse, UserData, CreateUserPayload } from "@/types/api";

export const getDataUserslist = async ({ page = 1, limit = 10 }: {page?: number, limit?: number}) => {
  const response = await secureRequest<APIResponse<UserData[]>>("get", "/v1/users", { page, limit });
  return response;
};

export const createUser = async (payload: CreateUserPayload) => {
  const response = await secureRequest<APIResponse<UserData>>("post", "/v1/users", payload);
  return response;
};
