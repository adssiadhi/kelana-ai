"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Compass, Map, PlaneTakeoff, Menu, X,
  LogIn, UserPlus, User as UserIcon,
  ChevronDown, LogOut,
} from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { useAuth } from "@/lib/auth";

const NAV_LINKS = [
  { href: "/",      label: "Plan Trip", icon: PlaneTakeoff },
  { href: "/trips", label: "My Trips",  icon: Map          },
] as const;

export default function Navbar() {
  const pathname = usePathname();
  const router   = useRouter();
  const { user, logout, loading } = useAuth();

  const [mobileOpen,  setMobileOpen]  = useState(false);
  const [dropOpen,    setDropOpen]    = useState(false);
  const dropRef = useRef<HTMLDivElement>(null);

  /* Close account dropdown on outside click */
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (dropRef.current && !dropRef.current.contains(e.target as Node)) {
        setDropOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  function handleLogout() {
    logout();
    setDropOpen(false);
    setMobileOpen(false);
    router.replace("/login");
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-950/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-4 sm:px-6">

        {/* ── Brand ── */}
        <Link href="/" className="flex items-center gap-2.5 group" aria-label="KelanaAI home">
          <span className="flex items-center justify-center w-8 h-8 rounded-xl bg-amber-700 text-white shadow-sm group-hover:bg-amber-600 transition-colors">
            <Compass size={17} strokeWidth={2.2} />
          </span>
          <span className="text-base font-bold tracking-tight text-slate-900 dark:text-slate-50">
            KelanaAI
          </span>
        </Link>

        {/* ── Desktop nav ── */}
        <div className="hidden sm:flex items-center gap-1">
          <nav className="flex items-center gap-1 mr-2" aria-label="Main navigation">
            {NAV_LINKS.map(({ href, label, icon: Icon }) => {
              const active = pathname === href;
              return (
                <Link
                  key={href}
                  href={href}
                  aria-current={active ? "page" : undefined}
                  className={[
                    "flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium transition-colors",
                    active
                      ? "bg-amber-50 dark:bg-amber-900/30 text-amber-800 dark:text-amber-300"
                      : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-100",
                  ].join(" ")}
                >
                  <Icon size={15} strokeWidth={2} />
                  {label}
                </Link>
              );
            })}
          </nav>

          {/* Auth section */}
          {loading ? (
            <span className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 animate-pulse" />
          ) : user ? (
            /* Account dropdown */
            <div ref={dropRef} className="relative">
              <button
                onClick={() => setDropOpen((v) => !v)}
                aria-expanded={dropOpen}
                aria-label="Account menu"
                className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <span className="flex items-center justify-center w-7 h-7 rounded-lg bg-amber-700 text-white text-xs font-bold select-none">
                  {user.name.charAt(0).toUpperCase()}
                </span>
                <span className="max-w-[120px] truncate">{user.name}</span>
                <ChevronDown
                  size={14}
                  className={`shrink-0 transition-transform ${dropOpen ? "rotate-180" : ""}`}
                />
              </button>

              {dropOpen && (
                <div className="absolute right-0 mt-1 w-48 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-lg overflow-hidden z-50">
                  <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-800">
                    <p className="text-xs font-semibold text-slate-800 dark:text-slate-100 truncate">{user.name}</p>
                    <p className="text-xs text-slate-400 dark:text-slate-500 truncate mt-0.5">{user.email}</p>
                  </div>

                  <Link
                    href="/profile"
                    onClick={() => setDropOpen(false)}
                    className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                  >
                    <UserIcon size={14} strokeWidth={2} /> Profile
                  </Link>
                  <Link
                    href="/trips"
                    onClick={() => setDropOpen(false)}
                    className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                  >
                    <Map size={14} strokeWidth={2} /> My Trips
                  </Link>

                  <div className="border-t border-slate-100 dark:border-slate-800">
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
                    >
                      <LogOut size={14} strokeWidth={2} /> Sign out
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            /* Login / Register links */
            <div className="flex items-center gap-1">
              <Link
                href="/login"
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-100 transition-colors"
              >
                <LogIn size={15} strokeWidth={2} /> Sign in
              </Link>
              <Link
                href="/register"
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold bg-amber-700 text-white hover:bg-amber-600 transition-colors shadow-sm"
              >
                <UserPlus size={15} strokeWidth={2} /> Register
              </Link>
            </div>
          )}
        </div>

        {/* ── Mobile hamburger ── */}
        <button
          className="sm:hidden flex items-center justify-center w-9 h-9 rounded-xl text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          onClick={() => setMobileOpen((v) => !v)}
          aria-label={mobileOpen ? "Close menu" : "Open menu"}
          aria-expanded={mobileOpen}
          aria-controls="mobile-menu"
        >
          {mobileOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* ── Mobile menu ── */}
      {mobileOpen && (
        <nav
          id="mobile-menu"
          className="sm:hidden border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 px-4 py-3 flex flex-col gap-1"
          aria-label="Mobile navigation"
        >
          {NAV_LINKS.map(({ href, label, icon: Icon }) => {
            const active = pathname === href;
            return (
              <Link
                key={href}
                href={href}
                onClick={() => setMobileOpen(false)}
                aria-current={active ? "page" : undefined}
                className={[
                  "flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-medium transition-colors",
                  active
                    ? "bg-amber-50 dark:bg-amber-900/30 text-amber-800 dark:text-amber-300"
                    : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800",
                ].join(" ")}
              >
                <Icon size={16} strokeWidth={2} />
                {label}
              </Link>
            );
          })}

          <div className="border-t border-slate-100 dark:border-slate-800 mt-1 pt-1">
            {user ? (
              <>
                <div className="px-4 py-2">
                  <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">{user.name}</p>
                  <p className="text-xs text-slate-400 truncate">{user.email}</p>
                </div>
                <Link
                  href="/profile"
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  <UserIcon size={16} /> Profile
                </Link>
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
                >
                  <LogOut size={16} /> Sign out
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  <LogIn size={16} /> Sign in
                </Link>
                <Link
                  href="/register"
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-semibold text-amber-700 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-900/20 transition-colors"
                >
                  <UserPlus size={16} /> Register
                </Link>
              </>
            )}
          </div>
        </nav>
      )}
    </header>
  );
}
