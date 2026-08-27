import Link from "next/link";
import {
  MapPin, Calendar, DollarSign, Sparkles,
  ArrowRight, Trash2,
} from "lucide-react";
import { Trip, CATEGORY_COLORS, STYLE_EMOJI } from "@/lib/types";

interface TripCardProps {
  trip: Trip;
  onDelete?: (id: number) => void;
}

export default function TripCard({ trip, onDelete }: TripCardProps) {
  const emoji     = STYLE_EMOJI[trip.travel_style] ?? "🌍";
  const badgeClass = CATEGORY_COLORS[trip.category] ??
    "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300";

  return (
    <article className="group flex flex-col bg-white dark:bg-slate-900 rounded-2xl overflow-hidden shadow-[0_2px_10px_rgba(0,0,0,0.05)] hover:shadow-[0_4px_24px_rgba(0,0,0,0.10)] dark:shadow-none dark:ring-1 dark:ring-slate-800 transition-shadow duration-200">

      {/* ── Colour band ── */}
      <div className="h-2 w-full bg-gradient-to-r from-amber-600 to-amber-400" />

      {/* ── Card body ── */}
      <div className="flex flex-col gap-4 p-5">

        {/* Header row */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <span
              className="text-2xl select-none"
              role="img"
              aria-label={trip.travel_style}
            >
              {emoji}
            </span>
            <div>
              <h3 className="text-base font-semibold tracking-tight text-slate-900 dark:text-slate-50 leading-tight">
                {trip.destination}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                {trip.travel_style} trip
              </p>
            </div>
          </div>

          {/* Category badge */}
          <span className={`shrink-0 text-xs font-semibold px-2.5 py-1 rounded-full ${badgeClass}`}>
            {trip.category}
          </span>
        </div>

        {/* Stats row */}
        <dl className="grid grid-cols-3 gap-3">
          <Stat icon={<Calendar size={13} />} label="Days" value={String(trip.days)} />
          <Stat
            icon={<DollarSign size={13} />}
            label="Budget"
            value={`$${trip.budget.toLocaleString()}`}
          />
          <Stat
            icon={<DollarSign size={13} />}
            label="Per Day"
            value={`$${Math.round(trip.daily_budget).toLocaleString()}`}
          />
        </dl>

        {/* AI snippet */}
        {trip.ai_recommendation && (
          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed line-clamp-2 flex gap-1.5">
            <Sparkles
              size={13}
              className="shrink-0 mt-0.5 text-amber-600"
              strokeWidth={2}
            />
            <span>{firstPlainLine(trip.ai_recommendation)}</span>
          </p>
        )}

        {/* Actions */}
        <div className="flex items-center justify-between pt-1 border-t border-slate-100 dark:border-slate-800">
          <Link
            href={`/trips/${trip.id}`}
            className="inline-flex items-center gap-1 text-xs font-semibold text-amber-700 dark:text-amber-400 hover:text-amber-900 dark:hover:text-amber-200 transition-colors"
          >
            View itinerary
            <ArrowRight size={13} strokeWidth={2.5} />
          </Link>

          {onDelete && (
            <button
              onClick={() => onDelete(trip.id)}
              aria-label={`Delete trip to ${trip.destination}`}
              className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors"
            >
              <Trash2 size={14} strokeWidth={2} />
            </button>
          )}
        </div>
      </div>
    </article>
  );
}

/* ── Sub-components ── */

function Stat({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex flex-col rounded-xl bg-slate-50 dark:bg-slate-800 px-3 py-2.5 gap-1">
      <dt className="flex items-center gap-1 text-[10px] font-medium text-slate-400 dark:text-slate-500 uppercase tracking-wide">
        {icon}
        {label}
      </dt>
      <dd className="text-sm font-semibold text-slate-800 dark:text-slate-100">
        {value}
      </dd>
    </div>
  );
}

/** Pull the first non-empty, non-Markdown line from the AI text for the snippet */
function firstPlainLine(raw: string): string {
  const line = raw
    .split(/\r?\n/)
    .map((l) => l.replace(/^#+\s*/, "").replace(/\*\*/g, "").trim())
    .find((l) => l.length > 0);
  return line ?? "";
}
