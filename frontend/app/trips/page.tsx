"use client";

import { useEffect, useState, useCallback } from "react";
import { Map, PlusCircle, Loader2 } from "lucide-react";
import Link from "next/link";
import TripCard from "@/components/TripCard";
import ErrorMessage from "@/components/ErrorMessage";
import { Trip } from "@/lib/types";

export default function TripsPage() {
  const [trips,   setTrips]   = useState<Trip[]>([]);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState<string | null>(null);

  const fetchTrips = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/v1/trips");
      if (!res.ok) throw new Error(`Failed to load trips (${res.status})`);
      const data: Trip[] = await res.json();
      setTrips(data.slice().reverse()); // newest first
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Could not load trips.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchTrips(); }, [fetchTrips]);

  async function handleDelete(id: number) {
    // Optimistic remove
    setTrips((prev) => prev.filter((t) => t.id !== id));
    try {
      const res = await fetch(`/api/v1/trips/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Delete failed");
    } catch {
      // Re-fetch to restore accurate state if delete failed
      fetchTrips();
    }
  }

  return (
    <main className="flex flex-col w-full min-h-[60vh]">
      <div className="mx-auto w-full max-w-6xl px-4 sm:px-6 md:px-8 py-12">

        {/* ── Page header ── */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-10">
          <div className="flex items-center gap-3">
            <span className="flex items-center justify-center w-10 h-10 rounded-xl bg-amber-700 text-white shadow-sm">
              <Map size={18} strokeWidth={2} />
            </span>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-50">
                My Trips
              </h1>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                {trips.length} {trips.length === 1 ? "trip" : "trips"} planned
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

        {/* ── States ── */}
        {loading && (
          <div className="flex items-center justify-center py-24 gap-3 text-slate-400">
            <Loader2 size={20} className="animate-spin" />
            <span className="text-sm">Loading your trips…</span>
          </div>
        )}

        {!loading && error && (
          <ErrorMessage message={error} onRetry={fetchTrips} />
        )}

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

        {!loading && !error && trips.length > 0 && (
          /* Responsive grid: 1-col mobile → 2-col sm → 3-col lg */
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {trips.map((trip) => (
              <TripCard key={trip.id} trip={trip} onDelete={handleDelete} />
            ))}
          </div>
        )}

      </div>
    </main>
  );
}
