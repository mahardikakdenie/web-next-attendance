// src/lib/axios.ts
import axios, { type AxiosRequestConfig } from "axios";

export const api = axios.create({
  baseURL: "/api",
  withCredentials: true,
});

export const getSecurityHeaders = () => {
  return {
    "X-Timestamp": Date.now().toString(),
    "X-Request-ID": crypto.randomUUID(),
  };
};

export const getCSRFToken = () => {
  if (typeof document === "undefined") return undefined;
  return document.cookie
    .split("; ")
    .find((row) => row.startsWith("csrf_token="))
    ?.split("=")[1];
};

export const secureRequest = async <T>(
  method: "get" | "post" | "put" | "delete",
  url: string,
  data?: unknown,
  config: AxiosRequestConfig = {}
): Promise<T> => {
  const headers = {
    ...getSecurityHeaders(),
    ...(getCSRFToken() ? { "X-CSRF-Token": getCSRFToken() } : {}),
    ...(config.headers || {}),
  };

  const res =
    method === "get" || method === "delete"
      ? await api.request({
          method,
          url,
          headers,
          withCredentials: true,
          ...config,
        })
      : await api.request({
          method,
          url,
          data,
          headers,
          withCredentials: true,
          ...config,
        });

  return res.data;
};

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
