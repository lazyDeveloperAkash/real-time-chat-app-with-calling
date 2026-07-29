import { create } from "zustand";
import type { User } from "@/types/models";

interface AuthState {
  user: User | null;
  /** True once the initial `me` lookup has resolved (success or failure). */
  isReady: boolean;
  setUser: (user: User | null) => void;
  setReady: (ready: boolean) => void;
  clear: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isReady: false,
  setUser: (user) => set({ user }),
  setReady: (isReady) => set({ isReady }),
  clear: () => set({ user: null }),
}));
