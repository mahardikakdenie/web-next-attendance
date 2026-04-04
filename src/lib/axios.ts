// src/lib/axios.ts
import axios from "axios";

export const api = axios.create({
  baseURL: "/api",
  withCredentials: true,
});

let isRedirectingToLogin = false;

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error?.response?.status as number | undefined;
    const requestUrl = String(error?.config?.url ?? "");

    if (
      status === 401 &&
      typeof window !== "undefined" &&
      !isRedirectingToLogin &&
      window.location.pathname !== "/login" &&
      !requestUrl.includes("/v1/auth/login") &&
      !requestUrl.includes("/v1/auth/logout")
    ) {
      isRedirectingToLogin = true;
      window.location.replace("/login?forceLogin=1");
    }

    return Promise.reject(error);
  }
);
