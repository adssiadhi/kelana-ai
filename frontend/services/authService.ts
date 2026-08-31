import { User, AuthTokenResponse, LoginInput, RegisterInput } from "@/lib/types";

/* ─── Helpers ────────────────────────────────────────────────────────── */

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(path, {
    headers: { "Content-Type": "application/json" },
    ...init,
  });

  if (!res.ok) {
    let detail = `Request failed (${res.status})`;
    try {
      const body = await res.json();
      if (body?.detail) detail = body.detail;
    } catch { /* ignore */ }
    throw new Error(detail);
  }

  return res.json() as Promise<T>;
}

/* ─── Service ────────────────────────────────────────────────────────── */

export const authService = {
  /**
   * Register a new user.
   * Routes through the Next.js API proxy → POST /api/v1/auth/register
   */
  register(data: RegisterInput): Promise<User> {
    return request<User>("/api/auth/register", {
      method: "POST",
      body:   JSON.stringify(data),
    });
  },

  /**
   * Log in and receive a JWT.
   * Routes through the Next.js API proxy → POST /api/v1/auth/login
   */
  login(data: LoginInput): Promise<AuthTokenResponse> {
    return request<AuthTokenResponse>("/api/auth/login", {
      method: "POST",
      body:   JSON.stringify(data),
    });
  },

  /**
   * Fetch the currently authenticated user's profile.
   * Routes through the Next.js API proxy → GET /api/v1/auth/me
   */
  getMe(token: string): Promise<User> {
    return request<User>("/api/auth/me", {
      headers: {
        "Content-Type":  "application/json",
        "Authorization": `Bearer ${token}`,
      },
    });
  },
};
