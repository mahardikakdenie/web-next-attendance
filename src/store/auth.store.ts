// src/store/auth.store.ts
import { create } from "zustand";
import { loginAPI, getMeAPI, logoutAPI } from "@/service/auth.service";
import { UserData } from "@/types/api";

export type TenantSettingsTenant = {
  id: number;
  name: string;
  code: string;
  plan: string;
  CreatedAt: string;
  UpdatedAt: string;
};

export type TenantSettings = {
  id: number;
  name: string;
  tenant_id: number;
  tenant_logo?: string;
  tenant?: TenantSettingsTenant;
  office_latitude: number;
  office_longitude: number;
  max_radius_meter: number;
  allow_remote: boolean;
  require_location: boolean;
  clock_in_start_time: string;
  clock_in_end_time: string;
  late_after_minute: number;
  clock_out_start_time: string;
  clock_out_end_time: string;
  require_selfie: boolean;
  allow_multiple_check: boolean;
  created_at: string;
  updated_at: string;
};

export type Tenant = {
  id: number;
  name: string;
  tenant_settings: TenantSettings;
};

export const ROLES = {
  // PLATFORM LEVEL (Owner of SaaS)
  SUPERADMIN: "superadmin",

  // TENANT LEVEL (Owner of Company & Staff)
  ADMIN: "admin", 
  HR: "hr",
  FINANCE: "finance",
  USER: "employee", 
} as const;

export type RoleName = typeof ROLES[keyof typeof ROLES];

// Re-using UserData from api.ts but allowing some overrides if needed
export type AuthUser = UserData;

type APIError = {
  response?: {
    data?: {
      message?: string;
    };
  };
};

type AuthState = {
  user: AuthUser | null;
  loading: boolean;
  isAuthenticated: boolean;
  mustChangePassword: boolean;
  login: (email: string, password: string) => Promise<void>;
  fetchUser: () => Promise<void>;
  logout: () => Promise<void>;
  /**
   * RBAC 2.0 Helper: Check if user has a specific permission
   */
  hasPermission: (permissionId: string) => boolean;
};

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  loading: false,
  isAuthenticated: false,
  mustChangePassword: false,

  login: async (email: string, password: string) => {
    try {
      set({ loading: true });

      await loginAPI({ email, password });

      const res = (await getMeAPI()) as { data: AuthUser };
      set({
        user: res.data,
        isAuthenticated: true,
        mustChangePassword: res.data.must_change_password,
        loading: false,
      });
    } catch (error: unknown) {
      const err = error as APIError;

      set({ loading: false });

      throw new Error(err?.response?.data?.message || "Login failed");
    }
  },

  fetchUser: async () => {
    try {
      set({ loading: true });

      const res = (await getMeAPI()) as {data: AuthUser};
      set({
        user: res.data,
        isAuthenticated: true,
        mustChangePassword: res.data.must_change_password,
        loading: false,
      });
    } catch {
      set({
        user: null,
        isAuthenticated: false,
        mustChangePassword: false,
        loading: false,
      });
    }
  },

  logout: async () => {
    await logoutAPI();

    set({
      user: null,
      isAuthenticated: false,
      mustChangePassword: false,
    });
  },

  hasPermission: (permissionId: string) => {
    const user = get().user;
    if (!user) return false;
    
    // Superadmin and Tenant Admin/Owner have all permissions by default
    if (user.is_owner || user.role?.base_role === 'ADMIN' || user.role?.name === 'superadmin') {
      return true;
    }

    return user.permissions?.includes(permissionId) || false;
  }
}));
