// src/service/auth.service.ts
import { secureRequest } from "@/lib/axios";
import { 
  APIResponse, 
  ChangePasswordPayload,
  ForgotPasswordPayload,
  ResetPasswordPayload
} from "@/types/api";

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
      includes: "tenant,tenant.tenant_settings,attendances,role,shift",
    },
  });
};

//////////////////////////////////////////////////////////////
// 🔥 LOGOUT
//////////////////////////////////////////////////////////////
export const logoutAPI = async () => {
  return secureRequest("post", "/v1/auth/logout", {});
};

//////////////////////////////////////////////////////////////
// 🔥 PASSWORD MANAGEMENT
//////////////////////////////////////////////////////////////

export const changePasswordAPI = async (payload: ChangePasswordPayload) => {
  return secureRequest<APIResponse<null>>("post", "/v1/auth/change-password", payload);
};

export const forgotPasswordAPI = async (payload: ForgotPasswordPayload) => {
  return secureRequest<APIResponse<null>>("post", "/v1/auth/forgot-password", payload);
};

export const resetPasswordAPI = async (payload: ResetPasswordPayload) => {
  return secureRequest<APIResponse<null>>("post", "/v1/auth/reset-password", payload);
};
