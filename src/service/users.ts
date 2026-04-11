// src/service/attendance.ts
import { secureRequest } from "@/lib/axios";
import { APIResponse, UserData } from "@/types/api";

export const getDataUserslist = async ({ limit }: {limit: number}) => {
  const response = await (await secureRequest<APIResponse<UserData[]>>("get", "/v1/users", {limit}));
  return response;
};
