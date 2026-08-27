"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Compass, Map, PlaneTakeoff, Menu, X } from "lucide-react";
import { useState } from "react";

const NAV_LINKS = [
  { href: "/",       label: "Plan Trip",  icon: PlaneTakeoff },
  { href: "/trips",  label: "My Trips",   icon: Map          },
] as const;

export default function Navbar() {
  const pathname  = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-950/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-4 sm:px-6">

        {/* ── Brand ── */}
        <Link
          href="/"
          className="flex items-center gap-2.5 group"
          aria-label="KelanaAI home"
        >
          <span className="flex items-center justify-center w-8 h-8 rounded-xl bg-amber-700 text-white shadow-sm group-hover:bg-amber-600 transition-colors">
            <Compass size={17} strokeWidth={2.2} />
          </span>
          <span className="text-base font-bold tracking-tight text-slate-900 dark:text-slate-50">
            KelanaAI
          </span>
        </Link>

        {/* ── Desktop nav ── */}
        <nav className="hidden sm:flex items-center gap-1" aria-label="Main navigation">
          {NAV_LINKS.map(({ href, label, icon: Icon }) => {
            const active = pathname === href;
            return (
              <Link
                key={href}
                href={href}
                className={[
                  "flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium transition-colors",
                  active
                    ? "bg-amber-50 dark:bg-amber-900/30 text-amber-800 dark:text-amber-300"
                    : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-100",
                ].join(" ")}
                aria-current={active ? "page" : undefined}
              >
                <Icon size={15} strokeWidth={2} />
                {label}
              </Link>
            );
          })}
        </nav>

        {/* ── Mobile hamburger ── */}
        <button
          className="sm:hidden flex items-center justify-center w-9 h-9 rounded-xl text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          onClick={() => setOpen((v) => !v)}
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
          aria-controls="mobile-menu"
        >
          {open ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* ── Mobile menu ── */}
      {open && (
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
                onClick={() => setOpen(false)}
                className={[
                  "flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-medium transition-colors",
                  active
                    ? "bg-amber-50 dark:bg-amber-900/30 text-amber-800 dark:text-amber-300"
                    : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800",
                ].join(" ")}
                aria-current={active ? "page" : undefined}
              >
                <Icon size={16} strokeWidth={2} />
                {label}
              </Link>
            );
          })}
        </nav>
      )}
    </header>
  );
}
