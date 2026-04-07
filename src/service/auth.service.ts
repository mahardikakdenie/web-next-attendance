// src/services/auth.service.ts
import { api } from "@/lib/axios";

//////////////////////////////////////////////////////////////
// 🔥 HELPER: SECURITY HEADERS (ANTI REPLAY)
//////////////////////////////////////////////////////////////
export const getSecurityHeaders = () => {
  return {
    "X-Timestamp": Date.now().toString(),
    // Tambahkan Request-ID di sisi klien. Browser modern sudah mendukung crypto.randomUUID()
    "X-Request-ID": crypto.randomUUID(), 
  };
};

const getCSRFToken = () => {
  return document.cookie
    .split("; ")
    .find((row) => row.startsWith("csrf_token="))
    ?.split("=")[1];
};

//////////////////////////////////////////////////////////////
// 🔥 LOGIN
//////////////////////////////////////////////////////////////
export const loginAPI = async (payload: {
  email: string;
  password: string;
}) => {
  const res = await api.post("/v1/auth/login", payload, {
    withCredentials: true,
    headers: {
      ...getSecurityHeaders(),
      "X-CSRF-Token": getCSRFToken(),
    },
  });

  return res.data;
};

export const uploadPhotos = async (payload: {media_url: string}) => {
  const res = await api.put('/v1/users/profile-photo', payload, {
    withCredentials: true,
    headers: {
      ...getSecurityHeaders(),
      "X-CSRF-Token": getCSRFToken(),
    },
  });

  return res.data;
}

//////////////////////////////////////////////////////////////
// 🔥 GET ME
//////////////////////////////////////////////////////////////
export const getMeAPI = async () => {
  const res = await api.get("/v1/users/me", {
    withCredentials: true,
    params: {
      includes: "tenant,tenant.tenant_settings,attendances",
    },
    headers: {
      ...getSecurityHeaders(),
      "X-CSRF-Token": getCSRFToken(),
    },
  });

  return res.data;
};

//////////////////////////////////////////////////////////////
// 🔥 LOGOUT
//////////////////////////////////////////////////////////////
export const logoutAPI = async () => {
  const res = await api.post(
    "/v1/auth/logout",
    {},
    {
      withCredentials: true,
      headers: {
        ...getSecurityHeaders(),
        "X-CSRF-Token": getCSRFToken(),
      },
    }
  );

  return res.data;
};
