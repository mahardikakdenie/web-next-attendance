// src/service/auth.service.ts
import { secureRequest } from "@/lib/axios";

//////////////////////////////////////////////////////////////
// 🔥 LOGIN
//////////////////////////////////////////////////////////////
export const loginAPI = async (payload: {
  email: string;
  password: string;
}) => {
  return secureRequest("post", "/v1/auth/login", payload);
};

export const uploadPhotos = async (payload: {media_url: string}) => {
  return secureRequest("put", "/v1/users/profile-photo", payload);
}

//////////////////////////////////////////////////////////////
// 🔥 GET ME
//////////////////////////////////////////////////////////////
export const getMeAPI = async () => {
  return secureRequest("get", "/v1/users/me", {
    includes: "tenant,tenant.tenant_settings,attendances,role",
  }, {
    params: {
      includes: "tenant,tenant.tenant_settings,attendances,role",
    },
  });
};

//////////////////////////////////////////////////////////////
// 🔥 LOGOUT
//////////////////////////////////////////////////////////////
export const logoutAPI = async () => {
  return secureRequest("post", "/v1/auth/logout", {});
};
