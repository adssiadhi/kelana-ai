"use client";

import { useState, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Compass, User as UserIcon, Mail, Lock, UserPlus, Eye, EyeOff } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { authService } from "@/services/authService";
import ErrorMessage from "@/components/ErrorMessage";

export default function RegisterPage() {
  const router = useRouter();
  const { login } = useAuth();

  const [name,      setName]      = useState("");
  const [email,     setEmail]     = useState("");
  const [password,  setPassword]  = useState("");
  const [showPw,    setShowPw]    = useState(false);
  const [loading,   setLoading]   = useState(false);
  const [error,     setError]     = useState<string | null>(null);

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      setError(null);

      if (password.length < 6) {
        setError("Password must be at least 6 characters.");
        return;
      }

      setLoading(true);
      try {
        /* 1 — register */
        await authService.register({ name, email, password });
        /* 2 — auto-login to get token */
        const { access_token } = await authService.login({ email, password });
        /* 3 — hydrate user */
        const user = await authService.getMe(access_token);
        /* 4 — store in context */
        login(access_token, user);
        router.replace("/");
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : "Registration failed.");
      } finally {
        setLoading(false);
      }
    },
    [name, email, password, login, router]
  );

  return (
    <main className="flex flex-col items-center justify-center min-h-[80vh] w-full px-4 py-16">
      <div className="w-full max-w-sm">

        {/* Brand mark */}
        <div className="flex flex-col items-center gap-3 mb-8">
          <span className="flex items-center justify-center w-12 h-12 rounded-2xl bg-amber-700 text-white shadow-sm">
            <Compass size={22} strokeWidth={2.2} />
          </span>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-50">
            Create your account
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 text-center">
            Start planning AI-powered trips in seconds.
          </p>
        </div>

        {/* Form card */}
        <form
          onSubmit={handleSubmit}
          noValidate
          className="flex flex-col gap-5 bg-white dark:bg-slate-900 rounded-2xl shadow-[0_2px_10px_rgba(0,0,0,0.06)] p-6 sm:p-8"
        >
          {/* Name */}
          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="name"
              className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400"
            >
              <UserIcon size={13} /> Full Name
            </label>
            <input
              id="name"
              type="text"
              autoComplete="name"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Jane Doe"
              className={inputCls}
            />
          </div>

          {/* Email */}
          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="email"
              className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400"
            >
              <Mail size={13} /> Email
            </label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className={inputCls}
            />
          </div>

          {/* Password */}
          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="password"
              className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400"
            >
              <Lock size={13} /> Password
            </label>
            <div className="relative">
              <input
                id="password"
                type={showPw ? "text" : "password"}
                autoComplete="new-password"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Min. 6 characters"
                className={`${inputCls} pr-10`}
              />
              <button
                type="button"
                onClick={() => setShowPw((v) => !v)}
                aria-label={showPw ? "Hide password" : "Show password"}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
              >
                {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>

            {/* Strength hint */}
            {password.length > 0 && (
              <p className={`text-xs mt-0.5 ${password.length >= 6 ? "text-emerald-600 dark:text-emerald-400" : "text-amber-600 dark:text-amber-400"}`}>
                {password.length >= 6 ? "✓ Strong enough" : `${6 - password.length} more character${6 - password.length !== 1 ? "s" : ""} needed`}
              </p>
            )}
          </div>

          {/* Error */}
          {error && <ErrorMessage message={error} onDismiss={() => setError(null)} />}

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full h-11 rounded-xl bg-amber-700 text-white text-sm font-semibold inline-flex items-center justify-center gap-2 hover:bg-amber-600 active:scale-[0.98] disabled:opacity-50 transition-all shadow-sm mt-1"
          >
            {loading ? (
              <span className="animate-spin w-4 h-4 border-2 border-white/40 border-t-white rounded-full" />
            ) : (
              <UserPlus size={16} strokeWidth={2} />
            )}
            {loading ? "Creating account…" : "Create account"}
          </button>

          {/* Login link */}
          <p className="text-center text-sm text-slate-500 dark:text-slate-400">
            Already have an account?{" "}
            <Link
              href="/login"
              className="font-semibold text-amber-700 dark:text-amber-400 hover:underline"
            >
              Sign in
            </Link>
          </p>
        </form>
      </div>
    </main>
  );
}

const inputCls =
  "w-full rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 " +
  "text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 " +
  "px-4 py-3 text-sm outline-none transition-all duration-150 " +
  "focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 dark:focus:border-amber-500 focus:bg-white dark:focus:bg-slate-900";
