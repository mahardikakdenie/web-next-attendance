// src/services/auth.service.ts
import { api } from "@/lib/axios";

export const loginAPI = async (payload: {
  email: string;
  password: string;
}) => {
  const res = await api.post("/v1/auth/login", payload, {
    withCredentials: true,
  });
  return res.data;
};

export const getMeAPI = async () => {
  const res = await api.get("/v1/users/me", {
    withCredentials: true,
  });
  return res.data;
};

export const logoutAPI = async () => {
  const res = await api.post(
    "/v1/auth/logout",
    {},
    {
      withCredentials: true,
    }
  );
  return res.data;
};
