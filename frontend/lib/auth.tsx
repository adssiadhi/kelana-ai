"use client";

import {
  createContext, useContext, useEffect, useState,
  useCallback, type ReactNode,
} from "react";
import { User } from "./types";

/* ─── Token helpers ──────────────────────────────────────────────────── */

const TOKEN_KEY = "kelana_access_token";

export function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string): void {
  localStorage.setItem(TOKEN_KEY, token);
}

export function clearToken(): void {
  localStorage.removeItem(TOKEN_KEY);
}

/** Returns the Authorization header value, or null if not logged in. */
export function authHeader(): Record<string, string> {
  const token = getToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

/* ─── Context ────────────────────────────────────────────────────────── */

interface AuthState {
  user:    User | null;
  token:   string | null;
  loading: boolean;
}

interface AuthContextValue extends AuthState {
  login:  (token: string, user: User) => void;
  logout: () => void;
  /** Re-fetch /auth/me and refresh the user object in state */
  refresh: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

/* ─── Provider ───────────────────────────────────────────────────────── */

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>({
    user:    null,
    token:   null,
    loading: true,
  });

  /* On mount, restore session from localStorage */
  const refresh = useCallback(async () => {
    const token = getToken();
    if (!token) {
      setState({ user: null, token: null, loading: false });
      return;
    }
    try {
      const res = await fetch("/api/auth/me", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) {
        clearToken();
        setState({ user: null, token: null, loading: false });
        return;
      }
      const user: User = await res.json();
      setState({ user, token, loading: false });
    } catch {
      clearToken();
      setState({ user: null, token: null, loading: false });
    }
  }, []);

  useEffect(() => { refresh(); }, [refresh]);

  const login = useCallback((token: string, user: User) => {
    setToken(token);
    setState({ user, token, loading: false });
  }, []);

  const logout = useCallback(() => {
    clearToken();
    setState({ user: null, token: null, loading: false });
  }, []);

  return (
    <AuthContext.Provider value={{ ...state, login, logout, refresh }}>
      {children}
    </AuthContext.Provider>
  );
}

/* ─── Hook ───────────────────────────────────────────────────────────── */

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
  return ctx;
}
