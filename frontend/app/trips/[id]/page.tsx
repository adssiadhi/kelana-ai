"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft, Calendar, DollarSign, Sparkles,
  Loader2, Trash2, RefreshCw,
} from "lucide-react";
import ErrorMessage from "@/components/ErrorMessage";
import LoadingSpinner from "@/components/LoadingSpinner";
import { Trip, CATEGORY_COLORS, STYLE_EMOJI } from "@/lib/types";

/* ─── Markdown → plain structured renderer ──────────────────────────── */

function stripInline(text: string): string {
  return text
    .replace(/\*\*(.+?)\*\*/g, "$1")
    .replace(/__(.+?)__/g, "$1")
    .replace(/\*(.+?)\*/g,   "$1")
    .replace(/_(.+?)_/g,     "$1")
    .replace(/`(.+?)`/g,     "$1")
    .trim();
}

type Line =
  | { type: "h1" | "h2" | "h3"; text: string }
  | { type: "bullet";            text: string }
  | { type: "para";              text: string };

function parseItinerary(raw: string): Line[] {
  const out: Line[] = [];
  for (const line of raw.split(/\r?\n/)) {
    const t = line.trim();
    if (!t) continue;
    const hm = t.match(/^(#{1,3})\s+(.+)/);
    if (hm) {
      const level = hm[1].length;
      out.push({
        type: level === 1 ? "h1" : level === 2 ? "h2" : "h3",
        text: stripInline(hm[2]),
      });
      continue;
    }
    const bm = t.match(/^(?:[-*]|\d+\.)\s+(.+)/);
    if (bm) { out.push({ type: "bullet", text: stripInline(bm[1]) }); continue; }
    out.push({ type: "para", text: stripInline(t) });
  }
  return out;
}

/* ─── Page ───────────────────────────────────────────────────────────── */

export default function TripDetailPage() {
  const { id }   = useParams<{ id: string }>();
  const router   = useRouter();

  const [trip,        setTrip]        = useState<Trip | null>(null);
  const [loading,     setLoading]     = useState(true);
  const [error,       setError]       = useState<string | null>(null);
  const [regenerating, setRegenerating] = useState(false);
  const [deleting,    setDeleting]    = useState(false);

  const fetchTrip = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/v1/trips/${id}`);
      if (res.status === 404) throw new Error("Trip not found.");
      if (!res.ok)            throw new Error(`Failed to load trip (${res.status})`);
      setTrip(await res.json());
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Could not load trip.");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => { fetchTrip(); }, [fetchTrip]);

  async function handleRegenerate() {
    setRegenerating(true);
    setError(null);
    try {
      const res = await fetch(`/api/v1/trips/${id}/generate`, { method: "POST" });
      if (!res.ok) throw new Error(`Regeneration failed (${res.status})`);
      setTrip(await res.json());
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Regeneration failed.");
    } finally {
      setRegenerating(false);
    }
  }

  async function handleDelete() {
    if (!confirm("Delete this trip?")) return;
    setDeleting(true);
    try {
      await fetch(`/api/v1/trips/${id}`, { method: "DELETE" });
      router.push("/trips");
    } catch {
      setError("Could not delete trip. Please try again.");
      setDeleting(false);
    }
  }

  /* ── Loading state ── */
  if (loading) {
    return (
      <main className="flex flex-col items-center justify-center min-h-[60vh] w-full px-4 py-16">
        <LoadingSpinner message="Loading your itinerary…" />
      </main>
    );
  }

  /* ── Error state ── */
  if (error && !trip) {
    return (
      <main className="flex flex-col items-center justify-center min-h-[60vh] w-full px-4 py-16">
        <div className="w-full max-w-md">
          <ErrorMessage message={error} onRetry={fetchTrip} />
          <button
            onClick={() => router.push("/trips")}
            className="mt-6 inline-flex items-center gap-2 text-sm text-slate-500 hover:text-slate-900 dark:hover:text-slate-100 transition-colors"
          >
            <ArrowLeft size={15} />
            Back to my trips
          </button>
        </div>
      </main>
    );
  }

  if (!trip) return null;

  const badgeClass = CATEGORY_COLORS[trip.category] ??
    "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300";
  const emoji = STYLE_EMOJI[trip.travel_style] ?? "🌍";
  const lines = parseItinerary(trip.ai_recommendation ?? "");

  return (
    <main className="flex flex-col w-full">
      <div className="mx-auto w-full max-w-3xl px-4 sm:px-6 md:px-8 py-10">

        {/* ── Back ── */}
        <button
          onClick={() => router.push("/trips")}
          className="inline-flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 transition-colors mb-8"
        >
          <ArrowLeft size={15} strokeWidth={2} />
          All trips
        </button>

        {/* ── Header card ── */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-[0_2px_10px_rgba(0,0,0,0.05)] dark:ring-1 dark:ring-slate-800 overflow-hidden mb-8">
          <div className="h-2 bg-gradient-to-r from-amber-700 to-amber-400" />
          <div className="p-6 sm:p-8">

            {/* Title row */}
            <div className="flex items-start justify-between gap-4 mb-6">
              <div className="flex items-center gap-3">
                <span className="text-3xl" role="img" aria-label={trip.travel_style}>{emoji}</span>
                <div>
                  <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-50 text-balance">
                    {trip.destination}
                  </h1>
                  <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
                    {trip.travel_style} trip
                  </p>
                </div>
              </div>
              <span className={`shrink-0 text-xs font-semibold px-3 py-1.5 rounded-full ${badgeClass}`}>
                {trip.category}
              </span>
            </div>

            {/* Stats grid: 1-col mobile → 4-col sm */}
            <dl className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
              <StatCard icon={<Calendar size={14} />} label="Duration"
                value={`${trip.days} day${trip.days !== 1 ? "s" : ""}`} />
              <StatCard icon={<DollarSign size={14} />} label="Total Budget"
                value={`$${trip.budget.toLocaleString()}`} />
              <StatCard icon={<DollarSign size={14} />} label="Per Day"
                value={`$${Math.round(trip.daily_budget).toLocaleString()}`} />
              <StatCard icon={<Sparkles size={14} />} label="Style"
                value={trip.travel_style} />
            </dl>

            {/* Actions row */}
            <div className="flex flex-wrap items-center gap-3">
              <button
                onClick={handleRegenerate}
                disabled={regenerating}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-700 text-white text-sm font-semibold hover:bg-amber-600 disabled:opacity-50 transition-colors shadow-sm"
              >
                {regenerating
                  ? <Loader2 size={15} className="animate-spin" />
                  : <RefreshCw size={15} strokeWidth={2} />}
                {regenerating ? "Regenerating…" : "Regenerate Itinerary"}
              </button>

              <button
                onClick={handleDelete}
                disabled={deleting}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/40 hover:bg-red-100 dark:hover:bg-red-950/70 disabled:opacity-50 transition-colors"
              >
                {deleting
                  ? <Loader2 size={15} className="animate-spin" />
                  : <Trash2 size={15} strokeWidth={2} />}
                {deleting ? "Deleting…" : "Delete Trip"}
              </button>
            </div>
          </div>
        </div>

        {/* ── Error (inline, trip still shown) ── */}
        {error && (
          <div className="mb-8">
            <ErrorMessage message={error} onDismiss={() => setError(null)} />
          </div>
        )}

        {/* ── AI Itinerary ── */}
        {regenerating ? (
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-[0_2px_10px_rgba(0,0,0,0.05)] dark:ring-1 dark:ring-slate-800 p-6 sm:p-8">
            <LoadingSpinner />
          </div>
        ) : lines.length > 0 ? (
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-[0_2px_10px_rgba(0,0,0,0.05)] dark:ring-1 dark:ring-slate-800 p-6 sm:p-8">
            <div className="flex items-center gap-2 mb-6">
              <Sparkles size={16} className="text-amber-600" strokeWidth={2} />
              <h2 className="text-xs font-semibold tracking-[0.15em] uppercase text-slate-400 dark:text-slate-500">
                AI Itinerary
              </h2>
            </div>
            <ItineraryBody lines={lines} />
          </div>
        ) : (
          <div className="bg-white dark:bg-slate-900 rounded-2xl ring-1 ring-slate-200 dark:ring-slate-800 p-6 sm:p-8 text-center">
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
              No itinerary generated yet.
            </p>
            <button
              onClick={handleRegenerate}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-700 text-white text-sm font-semibold hover:bg-amber-600 transition-colors"
            >
              <Sparkles size={15} />
              Generate Itinerary
            </button>
          </div>
        )}

      </div>
    </main>
  );
}

/* ─── Sub-components ─────────────────────────────────────────────────── */

function StatCard({
  icon, label, value,
}: {
  icon: React.ReactNode; label: string; value: string;
}) {
  return (
    <div className="flex flex-col rounded-xl bg-slate-50 dark:bg-slate-800 px-4 py-3 gap-1">
      <dt className="flex items-center gap-1 text-[10px] font-medium uppercase tracking-wide text-slate-400 dark:text-slate-500">
        {icon}{label}
      </dt>
      <dd className="text-sm font-semibold text-slate-800 dark:text-slate-100 truncate">
        {value}
      </dd>
    </div>
  );
}

function ItineraryBody({ lines }: { lines: Line[] }) {
  return (
    <div className="flex flex-col gap-1.5 text-sm text-slate-700 dark:text-slate-300">
      {lines.map((line, i) => {
        if (line.type === "h1") return (
          <p key={i} className="mt-7 mb-1 text-base font-bold tracking-tight text-slate-900 dark:text-slate-50 first:mt-0">
            {line.text}
          </p>
        );
        if (line.type === "h2") return (
          <p key={i} className="mt-5 mb-0.5 text-sm font-semibold text-amber-700 dark:text-amber-400">
            {line.text}
          </p>
        );
        if (line.type === "h3") return (
          <p key={i} className="mt-3 text-xs font-semibold tracking-[0.1em] uppercase text-slate-400 dark:text-slate-500">
            {line.text}
          </p>
        );
        if (line.type === "bullet") return (
          <div key={i} className="flex items-start gap-2.5 leading-relaxed pl-2">
            <span className="mt-[0.42rem] shrink-0 w-1 h-1 rounded-full bg-amber-600" />
            <span>{line.text}</span>
          </div>
        );
        return (
          <p key={i} className="leading-relaxed">{line.text}</p>
        );
      })}
    </div>
  );
}
