// src/store/auth.store.ts
import { create } from "zustand";
import { loginAPI, getMeAPI, logoutAPI } from "@/service/auth.service";

export type Tenant = {
  id: number;
  name: string;
};

export type UserAttendance = {
  id?: number;
  created_at?: string;
  createdAt?: string;
  clock_in_time?: string;
  clock_out_time?: string;
  clock_in_media_url?: string;
  clock_out_media_url?: string;
  clock_in_latitude?: number;
  clock_in_longitude?: number;
  clock_out_latitude?: number;
  clock_out_longitude?: number;
};

export type User = {
  id: number;
  name: string;
  email: string;
  role?: string;
  profile_photo_url?: string;
  tenant_id?: number;
  tenant?: Tenant;
  attendances?: UserAttendance[];
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

      const res = (await getMeAPI()) as { data: User };
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
