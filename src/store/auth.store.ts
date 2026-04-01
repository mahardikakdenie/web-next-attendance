import { create } from "zustand";

interface AuthState {
  user: {name?: string};
  setUser: (user: {name?: string}) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: {
    name: ''
  },
  setUser: (user) => set({ user }),
}));
