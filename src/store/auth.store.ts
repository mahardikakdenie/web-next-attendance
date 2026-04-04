// src/store/auth.store.ts
import { create } from "zustand";
import { loginAPI, getMeAPI, logoutAPI } from "@/service/auth.service";

type User = {
  id: number;
  name: string;
  email: string;
  role?: string;
  tenant_id?: number;
  tenant: {
    id: number;
    name: string;
  }
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

      const res = await getMeAPI();
      set({
        user: res.data, // ✅ FIX
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

      const res = await getMeAPI();
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
