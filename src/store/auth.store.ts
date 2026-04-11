// src/store/auth.store.ts
import { create } from "zustand";
import { loginAPI, getMeAPI, logoutAPI } from "@/service/auth.service";
export type TenantSettingsTenant = {
  ID: number;
  Name: string;
  Code: string;
  CreatedAt: string;
  UpdatedAt: string;
};

export type TenantSettings = {
  id: number;
  tenant_id: number;
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

export type UserAttendance = {
  id: string;
  user_id: number;
  clock_in_time: string;
  clock_out_time?: string;
  clock_in_latitude: number;
  clock_in_longitude: number;
  clock_out_latitude?: number;
  clock_out_longitude?: number;
  clock_in_media_url: string;
  clock_out_media_url?: string;
  status: "done" | "late" | string;
};

export const ROLES = {
  SUPERADMIN: "superadmin",
  ADMIN: "admin",
  HR: "hr",
  FINANCE: "finance",
  USER: "employee", // Menggunakan 'employee' sesuai data dari API sebelumnya
} as const;

export type RoleName = typeof ROLES[keyof typeof ROLES];

export type User = {
  id: number;
  name: string;
  email: string;
  role: {
    id: number;
    name: RoleName;
  };
  tenant_id: number;
  employee_id: string;
  department: {
    id: number;
    name: string;
  };
  address: string;
  media_url: string;
  phone_number: string;
  created_at: string;
  tenant?: Tenant;
  attendances?: UserAttendance[];
};

export type UserResponse = {
  data: User;
  includes: string[];
};
type APIError = {
  response?: {
    data?: {
      message?: string;
    };
  };
};

type AuthState = {
  user: User | null;
  loading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  fetchUser: () => Promise<void>;
  logout: () => Promise<void>;
};

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  loading: false,
  isAuthenticated: false,

  login: async (email: string, password: string) => {
    try {
      set({ loading: true });

      await loginAPI({ email, password });

      const res = (await getMeAPI()) as { data: User };
      set({
        user: res.data,
        isAuthenticated: true,
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

      const res = (await getMeAPI()) as {data: User};
      console.log("🚀 ~ res:", res)
      set({
        user: res.data,
        isAuthenticated: true,
        loading: false,
      });
    } catch {
      set({
        user: null,
        isAuthenticated: false,
        loading: false,
      });
    }
  },

  logout: async () => {
    await logoutAPI();

    set({
      user: null,
      isAuthenticated: false,
    });
  },
}));
