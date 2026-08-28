"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft, Calendar, DollarSign, Sparkles,
  Loader2, Trash2, RefreshCw, Copy, Check, Printer,
} from "lucide-react";
import ErrorMessage from "@/components/ErrorMessage";
import LoadingSpinner from "@/components/LoadingSpinner";
import { Trip, CATEGORY_COLORS, STYLE_EMOJI } from "@/lib/types";
import { tripService } from "@/services/tripService";

/* ─── Markdown parser ────────────────────────────────────────────────── */

function stripInline(text: string): string {
  return text
    .replace(/\*\*(.+?)\*\*/g, "$1")
    .replace(/__(.+?)__/g,     "$1")
    .replace(/\*(.+?)\*/g,     "$1")
    .replace(/_(.+?)_/g,       "$1")
    .replace(/`(.+?)`/g,       "$1")
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
      out.push({ type: level === 1 ? "h1" : level === 2 ? "h2" : "h3", text: stripInline(hm[2]) });
      continue;
    }
    const bm = t.match(/^(?:[-*]|\d+\.)\s+(.+)/);
    if (bm) { out.push({ type: "bullet", text: stripInline(bm[1]) }); continue; }
    out.push({ type: "para", text: stripInline(t) });
  }
  return out;
}

/** Converts parsed lines back to clean plain text for clipboard */
function linesToPlainText(trip: Trip, lines: Line[]): string {
  const header = [
    `${trip.destination} — ${trip.days}-Day ${trip.travel_style} Trip`,
    `Budget: $${trip.budget.toLocaleString()} ($${Math.round(trip.daily_budget)}/day) · Category: ${trip.category}`,
    "",
    "─".repeat(60),
    "",
  ].join("\n");

  const body = lines
    .map((l) => {
      if (l.type === "h1") return `\n${"═".repeat(50)}\n${l.text.toUpperCase()}\n${"═".repeat(50)}`;
      if (l.type === "h2") return `\n${l.text}`;
      if (l.type === "h3") return `  ${l.text.toUpperCase()}`;
      if (l.type === "bullet") return `  • ${l.text}`;
      return l.text;
    })
    .join("\n");

  return header + body;
}

/* ─── Copy-to-clipboard hook ─────────────────────────────────────────── */

function useCopyToClipboard(text: string) {
  const [copied, setCopied] = useState(false);

  const copy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      /* Fallback for older browsers / insecure contexts */
      const el = document.createElement("textarea");
      el.value = text;
      el.style.cssText = "position:fixed;opacity:0";
      document.body.appendChild(el);
      el.select();
      document.execCommand("copy");
      document.body.removeChild(el);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  }, [text]);

  return { copied, copy };
}

/* ─── Print styles (injected once, server-safe) ─────────────────────── */
/*
 * We inject a <style> tag into <head> when the component mounts so the
 * print media query hides the Navbar, Footer, action buttons, etc., and
 * formats the itinerary cleanly for PDF export via the browser's
 * "Save as PDF" print destination.
 */
const PRINT_CSS = `
@media print {
  /* Hide everything that isn't the itinerary */
  header, footer, nav,
  [data-no-print] { display: none !important; }

  /* Remove shadows / backgrounds for clean paper look */
  body { background: white !important; color: black !important; }
  * { box-shadow: none !important; }

  /* Force page breaks between Day sections */
  [data-day-break] { page-break-before: always; }

  /* Itinerary card fills the page */
  [data-print-card] {
    border: none !important;
    padding: 0 !important;
    margin: 0 !important;
    box-shadow: none !important;
  }
}
`;

/* ─── Page ───────────────────────────────────────────────────────────── */

export default function TripDetailPage() {
  const { id }  = useParams<{ id: string }>();
  const router  = useRouter();
  const printStyleRef = useRef<HTMLStyleElement | null>(null);

  /* Inject print CSS once */
  useEffect(() => {
    if (typeof document === "undefined") return;
    if (printStyleRef.current) return;
    const style = document.createElement("style");
    style.textContent = PRINT_CSS;
    document.head.appendChild(style);
    printStyleRef.current = style;
    return () => { style.remove(); printStyleRef.current = null; };
  }, []);

  const [trip,         setTrip]         = useState<Trip | null>(null);
  const [loading,      setLoading]       = useState(true);
  const [error,        setError]         = useState<string | null>(null);
  const [regenerating, setRegenerating]  = useState(false);
  const [deleting,     setDeleting]      = useState(false);

  /* ── Fetch ── */
  const fetchTrip = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await tripService.getTrip(Number(id));
      setTrip(data);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Could not load trip.");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => { fetchTrip(); }, [fetchTrip]);

  /* ── Regenerate ── */
  async function handleRegenerate() {
    setRegenerating(true);
    setError(null);
    try {
      const updated = await tripService.generateItinerary(Number(id));
      setTrip(updated);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Regeneration failed.");
    } finally {
      setRegenerating(false);
    }
  }

  /* ── Delete ── */
  async function handleDelete() {
    if (!confirm("Delete this trip? This cannot be undone.")) return;
    setDeleting(true);
    try {
      await tripService.deleteTrip(Number(id));
      router.push("/trips");
    } catch {
      setError("Could not delete trip. Please try again.");
      setDeleting(false);
    }
  }

  /* ── Print / Save as PDF ── */
  function handlePrint() {
    window.print();
  }

  /* ── Derived ── */
  const lines       = parseItinerary(trip?.ai_recommendation ?? "");
  const plainText   = trip ? linesToPlainText(trip, lines) : "";
  const { copied, copy: handleCopy } = useCopyToClipboard(plainText);

  const badgeClass  = trip
    ? (CATEGORY_COLORS[trip.category] ?? "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300")
    : "";
  const emoji       = trip ? (STYLE_EMOJI[trip.travel_style] ?? "🌍") : "";

  /* ── Loading ── */
  if (loading) {
    return (
      <main className="flex flex-col items-center justify-center min-h-[60vh] w-full px-4 py-16">
        <LoadingSpinner message="Loading your itinerary…" />
      </main>
    );
  }

  /* ── Fetch error ── */
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

  return (
    <main className="flex flex-col w-full">
      <div className="mx-auto w-full max-w-3xl px-4 sm:px-6 md:px-8 py-10">

        {/* ── Back ── */}
        <button
          data-no-print
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
                <span className="text-3xl select-none" role="img" aria-label={trip.travel_style}>
                  {emoji}
                </span>
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

            {/* Stats grid: 2-col mobile → 4-col sm */}
            <dl className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
              <StatCard icon={<Calendar size={14} />}    label="Duration"
                value={`${trip.days} day${trip.days !== 1 ? "s" : ""}`} />
              <StatCard icon={<DollarSign size={14} />}  label="Total Budget"
                value={`$${trip.budget.toLocaleString()}`} />
              <StatCard icon={<DollarSign size={14} />}  label="Per Day"
                value={`$${Math.round(trip.daily_budget).toLocaleString()}`} />
              <StatCard icon={<Sparkles size={14} />}    label="Style"
                value={trip.travel_style} />
            </dl>

            {/* ── Action buttons ── */}
            <div data-no-print className="flex flex-wrap items-center gap-3">
              {/* Regenerate */}
              <button
                onClick={handleRegenerate}
                disabled={regenerating}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-700 text-white text-sm font-semibold hover:bg-amber-600 disabled:opacity-50 transition-colors shadow-sm"
              >
                {regenerating
                  ? <Loader2 size={15} className="animate-spin" />
                  : <RefreshCw size={15} strokeWidth={2} />}
                {regenerating ? "Regenerating…" : "Regenerate"}
              </button>

              {/* Copy to clipboard */}
              <button
                onClick={handleCopy}
                disabled={!trip.ai_recommendation}
                aria-label={copied ? "Copied!" : "Copy itinerary to clipboard"}
                className={[
                  "inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all duration-150 border",
                  copied
                    ? "bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-700"
                    : "bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700",
                  "disabled:opacity-40 disabled:cursor-not-allowed",
                ].join(" ")}
              >
                {copied
                  ? <><Check size={15} strokeWidth={2.5} />Copied!</>
                  : <><Copy size={15} strokeWidth={2} />Copy</>}
              </button>

              {/* Print / Save PDF */}
              <button
                onClick={handlePrint}
                disabled={!trip.ai_recommendation}
                aria-label="Print or save as PDF"
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                <Printer size={15} strokeWidth={2} />
                Print / PDF
              </button>

              {/* Delete */}
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/40 hover:bg-red-100 dark:hover:bg-red-950/70 disabled:opacity-50 transition-colors"
              >
                {deleting
                  ? <Loader2 size={15} className="animate-spin" />
                  : <Trash2 size={15} strokeWidth={2} />}
                {deleting ? "Deleting…" : "Delete"}
              </button>
            </div>
          </div>
        </div>

        {/* ── Inline error (trip still visible) ── */}
        {error && (
          <div data-no-print className="mb-8">
            <ErrorMessage message={error} onDismiss={() => setError(null)} />
          </div>
        )}

        {/* ── AI Itinerary ── */}
        {regenerating ? (
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-[0_2px_10px_rgba(0,0,0,0.05)] dark:ring-1 dark:ring-slate-800 p-6 sm:p-8">
            <LoadingSpinner />
          </div>
        ) : lines.length > 0 ? (
          <div
            data-print-card
            className="bg-white dark:bg-slate-900 rounded-2xl shadow-[0_2px_10px_rgba(0,0,0,0.05)] dark:ring-1 dark:ring-slate-800 p-6 sm:p-8"
          >
            {/* Itinerary header row */}
            <div className="flex items-center justify-between gap-4 mb-6">
              <div className="flex items-center gap-2">
                <Sparkles size={16} className="text-amber-600" strokeWidth={2} />
                <h2 className="text-xs font-semibold tracking-[0.15em] uppercase text-slate-400 dark:text-slate-500">
                  AI Itinerary
                </h2>
              </div>
              {/* Inline copy button next to heading (secondary, smaller) */}
              <button
                data-no-print
                onClick={handleCopy}
                disabled={!trip.ai_recommendation}
                aria-label={copied ? "Copied!" : "Copy itinerary"}
                className={[
                  "inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg border transition-all duration-150",
                  copied
                    ? "bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-700"
                    : "text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800",
                ].join(" ")}
              >
                {copied ? <><Check size={12} />Copied</> : <><Copy size={12} />Copy</>}
              </button>
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

function StatCard({ icon, label, value }: {
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
          <p
            key={i}
            data-day-break
            className="mt-7 mb-1 text-base font-bold tracking-tight text-slate-900 dark:text-slate-50 first:mt-0"
          >
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
        return <p key={i} className="leading-relaxed">{line.text}</p>;
      })}
    </div>
  );
}
