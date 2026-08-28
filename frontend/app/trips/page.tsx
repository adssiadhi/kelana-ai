"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import {
  Map, PlusCircle, Loader2, Search, X,
  ChevronLeft, ChevronRight, ArrowUpDown,
} from "lucide-react";
import Link from "next/link";
import TripCard from "@/components/TripCard";
import ErrorMessage from "@/components/ErrorMessage";
import { Trip } from "@/lib/types";
import { tripService } from "@/services/tripService";

/* ─── Sort options ───────────────────────────────────────────────────── */

type SortKey =
  | "latest"
  | "oldest"
  | "budget_high"
  | "budget_low"
  | "duration_long"
  | "duration_short";

const SORT_OPTIONS: { value: SortKey; label: string }[] = [
  { value: "latest",         label: "Latest"          },
  { value: "oldest",         label: "Oldest"          },
  { value: "budget_high",    label: "Budget: High → Low" },
  { value: "budget_low",     label: "Budget: Low → High" },
  { value: "duration_long",  label: "Duration: Long"  },
  { value: "duration_short", label: "Duration: Short" },
];

function sortTrips(trips: Trip[], key: SortKey): Trip[] {
  const t = [...trips];
  switch (key) {
    case "latest":         return t.sort((a, b) => b.id - a.id);
    case "oldest":         return t.sort((a, b) => a.id - b.id);
    case "budget_high":    return t.sort((a, b) => b.budget - a.budget);
    case "budget_low":     return t.sort((a, b) => a.budget - b.budget);
    case "duration_long":  return t.sort((a, b) => b.days - a.days);
    case "duration_short": return t.sort((a, b) => a.days - b.days);
  }
}

/* ─── Constants ──────────────────────────────────────────────────────── */

const PAGE_SIZE = 10;

/* ─── Page ───────────────────────────────────────────────────────────── */

export default function TripsPage() {
  const [trips,   setTrips]   = useState<Trip[]>([]);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState<string | null>(null);

  /* search / sort / page state */
  const [query,   setQuery]   = useState("");
  const [sort,    setSort]    = useState<SortKey>("latest");
  const [page,    setPage]    = useState(1);

  /* ── Fetch ── */
  const fetchTrips = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await tripService.getTrips();
      setTrips(data);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Could not load trips.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchTrips(); }, [fetchTrips]);

  /* Reset to page 1 whenever search or sort changes */
  useEffect(() => { setPage(1); }, [query, sort]);

  /* ── Optimistic delete ── */
  async function handleDelete(id: number) {
    setTrips((prev) => prev.filter((t) => t.id !== id));
    try {
      await tripService.deleteTrip(id);
    } catch {
      fetchTrips(); // restore if delete failed
    }
  }

  /* ── Derived data ── */
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const base = q
      ? trips.filter((t) =>
          t.destination.toLowerCase().includes(q) ||
          t.travel_style.toLowerCase().includes(q) ||
          t.category.toLowerCase().includes(q)
        )
      : trips;
    return sortTrips(base, sort);
  }, [trips, query, sort]);

  const totalPages  = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage    = Math.min(page, totalPages);
  const pageSlice   = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  /* ── Pagination helpers ── */
  function goPrev() { setPage((p) => Math.max(1, p - 1)); }
  function goNext() { setPage((p) => Math.min(totalPages, p + 1)); }

  /* Visible page numbers: always show first, last, current ±1 */
  const pageNumbers = useMemo(() => {
    const nums = new Set([1, totalPages, safePage, safePage - 1, safePage + 1]);
    return Array.from(nums)
      .filter((n) => n >= 1 && n <= totalPages)
      .sort((a, b) => a - b);
  }, [safePage, totalPages]);

  /* ── Render ── */
  return (
    <main className="flex flex-col w-full min-h-[60vh]">
      <div className="mx-auto w-full max-w-6xl px-4 sm:px-6 md:px-8 py-12">

        {/* ── Page header ── */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
          <div className="flex items-center gap-3">
            <span className="flex items-center justify-center w-10 h-10 rounded-xl bg-amber-700 text-white shadow-sm">
              <Map size={18} strokeWidth={2} />
            </span>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-50">
                My Trips
              </h1>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                {loading
                  ? "Loading…"
                  : `${filtered.length} of ${trips.length} ${trips.length === 1 ? "trip" : "trips"}`}
              </p>
            </div>
          </div>

          <Link
            href="/"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-700 text-white text-sm font-semibold hover:bg-amber-600 transition-colors shadow-sm"
          >
            <PlusCircle size={16} strokeWidth={2} />
            Plan New Trip
          </Link>
        </div>

        {/* ── Search + Sort toolbar ── */}
        {!loading && !error && trips.length > 0 && (
          <div className="flex flex-col sm:flex-row gap-3 mb-8">
            {/* Search input */}
            <div className="relative flex-1">
              <Search
                size={15}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
              />
              <input
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search by destination, style, or category…"
                aria-label="Search trips"
                className="w-full rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 pl-9 pr-9 py-2.5 text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 transition-all"
              />
              {query && (
                <button
                  onClick={() => setQuery("")}
                  aria-label="Clear search"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors"
                >
                  <X size={14} />
                </button>
              )}
            </div>

            {/* Sort select */}
            <div className="relative sm:w-56">
              <ArrowUpDown
                size={14}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
              />
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value as SortKey)}
                aria-label="Sort trips"
                className="w-full appearance-none rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 pl-8 pr-4 py-2.5 text-sm text-slate-700 dark:text-slate-300 outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 transition-all cursor-pointer"
              >
                {SORT_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
            </div>
          </div>
        )}

        {/* ── Loading ── */}
        {loading && (
          <div className="flex items-center justify-center py-24 gap-3 text-slate-400">
            <Loader2 size={20} className="animate-spin" />
            <span className="text-sm">Loading your trips…</span>
          </div>
        )}

        {/* ── Error ── */}
        {!loading && error && (
          <ErrorMessage message={error} onRetry={fetchTrips} />
        )}

        {/* ── Empty: no trips at all ── */}
        {!loading && !error && trips.length === 0 && (
          <div className="flex flex-col items-center justify-center gap-4 py-24 text-center">
            <span className="text-5xl" role="img" aria-label="globe">🌍</span>
            <p className="text-base font-semibold text-slate-700 dark:text-slate-300">
              No trips yet
            </p>
            <p className="text-sm text-slate-500 dark:text-slate-400 max-w-xs">
              Head back to the home page and plan your first adventure!
            </p>
            <Link
              href="/"
              className="mt-2 inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-amber-700 text-white text-sm font-semibold hover:bg-amber-600 transition-colors"
            >
              <PlusCircle size={16} />
              Plan a Trip
            </Link>
          </div>
        )}

        {/* ── Empty: search returned nothing ── */}
        {!loading && !error && trips.length > 0 && filtered.length === 0 && (
          <div className="flex flex-col items-center justify-center gap-3 py-24 text-center">
            <Search size={32} className="text-slate-300 dark:text-slate-700" />
            <p className="text-base font-semibold text-slate-700 dark:text-slate-300">
              No trips match &ldquo;{query}&rdquo;
            </p>
            <button
              onClick={() => setQuery("")}
              className="text-sm text-amber-700 dark:text-amber-400 hover:underline font-medium"
            >
              Clear search
            </button>
          </div>
        )}

        {/* ── Trip grid ── */}
        {!loading && !error && pageSlice.length > 0 && (
          <>
            {/* Results info */}
            <p className="text-xs text-slate-400 dark:text-slate-500 mb-4">
              Showing {(safePage - 1) * PAGE_SIZE + 1}–
              {Math.min(safePage * PAGE_SIZE, filtered.length)} of {filtered.length}
            </p>

            {/* Responsive grid: 1-col → 2-col sm → 3-col lg */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {pageSlice.map((trip) => (
                <TripCard key={trip.id} trip={trip} onDelete={handleDelete} />
              ))}
            </div>

            {/* ── Pagination ── */}
            {totalPages > 1 && (
              <nav
                className="flex items-center justify-center gap-1.5 mt-10"
                aria-label="Pagination"
              >
                {/* Prev */}
                <button
                  onClick={goPrev}
                  disabled={safePage === 1}
                  aria-label="Previous page"
                  className="flex items-center justify-center w-9 h-9 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronLeft size={16} />
                </button>

                {/* Page numbers with gap indicators */}
                {pageNumbers.map((n, i) => {
                  const prev = pageNumbers[i - 1];
                  const showGap = prev !== undefined && n - prev > 1;
                  return (
                    <span key={n} className="flex items-center gap-1.5">
                      {showGap && (
                        <span className="text-xs text-slate-400 px-1 select-none">…</span>
                      )}
                      <button
                        onClick={() => setPage(n)}
                        aria-label={`Page ${n}`}
                        aria-current={n === safePage ? "page" : undefined}
                        className={[
                          "flex items-center justify-center w-9 h-9 rounded-xl text-sm font-medium transition-colors",
                          n === safePage
                            ? "bg-amber-700 text-white shadow-sm"
                            : "border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800",
                        ].join(" ")}
                      >
                        {n}
                      </button>
                    </span>
                  );
                })}

                {/* Next */}
                <button
                  onClick={goNext}
                  disabled={safePage === totalPages}
                  aria-label="Next page"
                  className="flex items-center justify-center w-9 h-9 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronRight size={16} />
                </button>
              </nav>
            )}
          </>
        )}

      </div>
    </main>
  );
}
