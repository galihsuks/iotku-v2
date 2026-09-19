import { create } from "zustand";
import type { User } from "../interfaces/auth";

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isResolved: boolean;
  actions: {
    login: (user: User, token?: string | null) => void;
    syncUser: (user: User | null) => void;
    logout: () => void;
  };
}

export const useAuthStore = create<AuthState>()((set) => ({
  user: null,
  isAuthenticated: false,
  isResolved: false,
  actions: {
    login: (user) => set({ user, isAuthenticated: true, isResolved: true }),
    syncUser: (user) =>
      set({
        user,
        isAuthenticated: Boolean(user),
        isResolved: true,
      }),
    logout: () => {
      set({ user: null, isAuthenticated: false, isResolved: true });
    },
  },
}));

export const useAuthActions = () => useAuthStore((state) => state.actions);
export const useUser = () => useAuthStore((state) => state.user);
