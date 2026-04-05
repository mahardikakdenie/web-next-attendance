// src/services/attendance.service.ts
import { api } from "@/lib/axios";
import type { AxiosRequestConfig } from "axios";

//////////////////////////////////////////////////////////////
// TYPES
//////////////////////////////////////////////////////////////

export type RecordAttendancePayload = {
  action: "clock_in" | "clock_out" | null;
  latitude: number;
  longitude: number;
  media_url: string;
};

//////////////////////////////////////////////////////////////
// 🔥 HELPER: SECURITY HEADER
//////////////////////////////////////////////////////////////

const getSecurityHeaders = () => {
  return {
    "X-Timestamp": Date.now().toString(),
    // Tambahkan Request-ID di sini agar Browser yang membuatnya
    "X-Request-ID": crypto.randomUUID(),
  };
};

// OPTIONAL (kalau pakai CSRF nanti)
const getCSRFToken = () => {
  if (typeof document === "undefined") return undefined;

  return document.cookie
    .split("; ")
    .find((row) => row.startsWith("csrf_token="))
    ?.split("=")[1];
};

//////////////////////////////////////////////////////////////
// 🔥 BASE REQUEST WRAPPER (BIAR DRY)
//////////////////////////////////////////////////////////////

const secureRequest = async <T>(
  method: "get" | "post",
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
    method === "get"
      ? await api.get(url, {
          withCredentials: true,
          headers,
          ...config,
        })
      : await api.post(url, data, {
          withCredentials: true,
          headers,
          ...config,
        });

  return res.data;
};

//////////////////////////////////////////////////////////////
// 🔥 API METHODS
//////////////////////////////////////////////////////////////

export const getDataAttendances = async () => {
  return secureRequest("get", "/v1/attendance");
};

export const recordAttendances = async (
  payload: RecordAttendancePayload
) => {
  return secureRequest("post", "/v1/attendance", payload);
};
