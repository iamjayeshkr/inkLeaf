import { create } from "zustand";

interface AuthUser {
  email: string;
  name: string;
  loginTime: number;
}

interface AuthState {
  isLoggedIn: boolean;
  user: AuthUser | null;
  initAuth: () => void;
  login: (email: string, name: string) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  isLoggedIn: false,
  user: null,
  initAuth: () => {
    if (typeof window !== "undefined") {
      const cached = localStorage.getItem("inkleaf_cache_user");
      if (cached) {
        set({ isLoggedIn: true, user: JSON.parse(cached) });
      }
    }
  },
  login: (email, name) => {
    const userData = { email, name, loginTime: Date.now() };
    localStorage.setItem("inkleaf_cache_user", JSON.stringify(userData));
    set({ isLoggedIn: true, user: userData });
  },
  logout: () => {
    localStorage.removeItem("inkleaf_cache_user");
    set({ isLoggedIn: false, user: null });
  }
}));
