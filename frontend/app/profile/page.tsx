"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { User as UserIcon, Mail, Calendar, Map, Loader2, PlusCircle } from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/lib/auth";
import { tripService } from "@/services/tripService";
import { Trip, CATEGORY_COLORS } from "@/lib/types";
import ErrorMessage from "@/components/ErrorMessage";

export default function ProfilePage() {
  const router = useRouter();
  const { user, loading: authLoading, logout } = useAuth();

  const [trips,    setTrips]    = useState<Trip[]>([]);
  const [fetching, setFetching] = useState(true);
  const [error,    setError]    = useState<string | null>(null);

  /* Redirect unauthenticated users */
  useEffect(() => {
    if (!authLoading && !user) router.replace("/login");
  }, [authLoading, user, router]);

  /* Load trip count once user is known */
  useEffect(() => {
    if (!user) return;
    setFetching(true);
    tripService.getTrips()
      .then(setTrips)
      .catch((err: unknown) => setError(err instanceof Error ? err.message : "Failed to load trips."))
      .finally(() => setFetching(false));
  }, [user]);

  /* ── Loading skeleton ── */
  if (authLoading) {
    return (
      <main className="flex items-center justify-center min-h-[60vh]">
        <Loader2 size={24} className="animate-spin text-slate-400" />
      </main>
    );
  }

  if (!user) return null;

  /* ── Derived stats ── */
  const totalBudget = trips.reduce((s, t) => s + t.budget, 0);
  const totalDays   = trips.reduce((s, t) => s + t.days, 0);
  const categories  = [...new Set(trips.map((t) => t.category))];

  const joinedDate = user.created_at
    ? new Date(user.created_at).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })
    : null;

  return (
    <main className="flex flex-col w-full min-h-[60vh]">
      <div className="mx-auto w-full max-w-3xl px-4 sm:px-6 md:px-8 py-12">

        {/* ── Profile header card ── */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-[0_2px_10px_rgba(0,0,0,0.05)] dark:ring-1 dark:ring-slate-800 overflow-hidden mb-8">
          <div className="h-24 bg-gradient-to-r from-amber-700 via-amber-600 to-amber-400" />
          <div className="px-6 sm:px-8 pb-6 sm:pb-8">
            {/* Avatar */}
            <div className="-mt-10 mb-4">
              <span className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-white dark:bg-slate-800 text-amber-700 dark:text-amber-400 shadow-md border-4 border-white dark:border-slate-900 text-3xl font-bold select-none">
                {user.name.charAt(0).toUpperCase()}
              </span>
            </div>

            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-slate-50">
                  {user.name}
                </h1>
                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1">
                  <span className="flex items-center gap-1.5 text-sm text-slate-500 dark:text-slate-400">
                    <Mail size={13} /> {user.email}
                  </span>
                  {joinedDate && (
                    <span className="flex items-center gap-1.5 text-sm text-slate-500 dark:text-slate-400">
                      <Calendar size={13} /> Joined {joinedDate}
                    </span>
                  )}
                </div>
              </div>

              <button
                onClick={() => { logout(); router.replace("/login"); }}
                className="shrink-0 px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-sm font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-red-600 dark:hover:text-red-400 transition-colors"
              >
                Sign out
              </button>
            </div>
          </div>
        </div>

        {/* ── Stats ── */}
        {fetching ? (
          <div className="flex items-center gap-2 text-sm text-slate-400 mb-8">
            <Loader2 size={16} className="animate-spin" /> Loading stats…
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-8">
            <StatCard
              icon={<Map size={16} />}
              label="Trips Planned"
              value={String(trips.length)}
            />
            <StatCard
              icon={<Calendar size={16} />}
              label="Days Planned"
              value={String(totalDays)}
            />
            <StatCard
              icon={<span className="text-base">💸</span>}
              label="Total Budgeted"
              value={`$${totalBudget.toLocaleString()}`}
              className="col-span-2 sm:col-span-1"
            />
          </div>
        )}

        {/* ── Error ── */}
        {error && (
          <div className="mb-6">
            <ErrorMessage message={error} onDismiss={() => setError(null)} />
          </div>
        )}

        {/* ── Trip overview ── */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-[0_2px_10px_rgba(0,0,0,0.05)] dark:ring-1 dark:ring-slate-800 p-6 sm:p-8">
          <div className="flex items-center justify-between gap-4 mb-5">
            <h2 className="text-sm font-semibold text-slate-700 dark:text-slate-200">
              Recent Trips
            </h2>
            <Link
              href="/trips"
              className="text-xs font-semibold text-amber-700 dark:text-amber-400 hover:underline"
            >
              View all →
            </Link>
          </div>

          {trips.length === 0 ? (
            <div className="flex flex-col items-center gap-3 py-8 text-center">
              <span className="text-4xl">🌍</span>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                No trips yet. Plan your first adventure!
              </p>
              <Link
                href="/"
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-700 text-white text-xs font-semibold hover:bg-amber-600 transition-colors"
              >
                <PlusCircle size={13} /> Plan a Trip
              </Link>
            </div>
          ) : (
            <ul className="flex flex-col divide-y divide-slate-100 dark:divide-slate-800">
              {trips.slice(0, 5).map((trip) => {
                const badge = CATEGORY_COLORS[trip.category] ??
                  "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300";
                return (
                  <li key={trip.id}>
                    <Link
                      href={`/trips/${trip.id}`}
                      className="flex items-center justify-between gap-4 py-3 hover:bg-slate-50 dark:hover:bg-slate-800/50 px-2 rounded-xl transition-colors -mx-2"
                    >
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-slate-800 dark:text-slate-100 truncate">
                          {trip.destination}
                        </p>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                          {trip.days} days · ${trip.budget.toLocaleString()}
                        </p>
                      </div>
                      <span className={`shrink-0 text-xs font-semibold px-2.5 py-1 rounded-full ${badge}`}>
                        {trip.category}
                      </span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          )}

          {/* Category breakdown */}
          {categories.length > 0 && (
            <div className="mt-5 pt-5 border-t border-slate-100 dark:border-slate-800">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-400 dark:text-slate-500 mb-3">
                Trip mix
              </p>
              <div className="flex flex-wrap gap-2">
                {categories.map((cat) => {
                  const count = trips.filter((t) => t.category === cat).length;
                  const badge = CATEGORY_COLORS[cat] ??
                    "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300";
                  return (
                    <span key={cat} className={`text-xs font-semibold px-3 py-1 rounded-full ${badge}`}>
                      {cat} × {count}
                    </span>
                  );
                })}
              </div>
            </div>
          )}
        </div>

      </div>
    </main>
  );
}

function StatCard({
  icon, label, value, className = "",
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  className?: string;
}) {
  return (
    <div className={`flex flex-col rounded-2xl bg-slate-50 dark:bg-slate-800 px-5 py-4 gap-2 ${className}`}>
      <div className="flex items-center gap-1.5 text-slate-400 dark:text-slate-500">
        {icon}
        <span className="text-xs font-semibold uppercase tracking-wide">{label}</span>
      </div>
      <span className="text-xl font-bold text-slate-800 dark:text-slate-100">{value}</span>
    </div>
  );
}
