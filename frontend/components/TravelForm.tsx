"use client";

import { useState, useCallback } from "react";
import {
  MapPin, Calendar, DollarSign, Compass,
  ChevronDown, Sparkles,
} from "lucide-react";
import {
  Trip, TripFormValues, INITIAL_FORM,
  TRAVEL_STYLES, STYLE_EMOJI,
} from "@/lib/types";
import LoadingSpinner from "./LoadingSpinner";
import ErrorMessage from "./ErrorMessage";

interface TravelFormProps {
  onSuccess?: (trip: Trip) => void;
}

export default function TravelForm({ onSuccess }: TravelFormProps) {
  const [form,    setForm]    = useState<TripFormValues>(INITIAL_FORM);
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState<string | null>(null);

  /* ── Derived: real-time daily budget ── */
  const dailyBudget =
    form.budget && form.days && Number(form.days) > 0
      ? (Number(form.budget) / Number(form.days)).toFixed(2)
      : null;

  /* ── Derived: budget category preview ── */
  const categoryPreview = (() => {
    const b = Number(form.budget);
    if (!b) return null;
    if (b < 1000)  return "Backpacker";
    if (b < 3000)  return "Standard";
    return "Luxury";
  })();

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
      setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    },
    []
  );

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      setError(null);
      setLoading(true);

      try {
        const res = await fetch("/api/v1/trips", {
          method:  "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            destination:  form.destination,
            budget:       Number(form.budget),
            days:         Number(form.days),
            travel_style: form.travel_style,
          }),
        });

        if (!res.ok) {
          const err = await res.json().catch(() => ({}));
          throw new Error(
            err.detail ?? `Request failed (${res.status})`
          );
        }

        const trip: Trip = await res.json();
        setForm(INITIAL_FORM);
        onSuccess?.(trip);
      } catch (err: unknown) {
        setError(
          err instanceof Error ? err.message : "Something went wrong."
        );
      } finally {
        setLoading(false);
      }
    },
    [form, onSuccess]
  );

  if (loading) {
    return (
      <div className="w-full max-w-md mx-auto bg-white dark:bg-slate-900 rounded-2xl shadow-[0_2px_10px_rgba(0,0,0,0.06)] p-8">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="w-full max-w-md mx-auto">
      <form
        onSubmit={handleSubmit}
        noValidate
        className="flex flex-col gap-5 bg-white dark:bg-slate-900 rounded-2xl shadow-[0_2px_10px_rgba(0,0,0,0.06)] p-6 sm:p-8"
      >
        {/* ── Destination ── */}
        <Field label="Destination" htmlFor="destination" icon={<MapPin size={14} />}>
          <input
            id="destination"
            name="destination"
            type="text"
            required
            placeholder="e.g. Bali, Indonesia"
            value={form.destination}
            onChange={handleChange}
            autoComplete="off"
            className={inputCls}
          />
        </Field>

        {/* ── Days + Budget ── */}
        <div className="flex flex-col sm:flex-row gap-4">
          <Field label="Days" htmlFor="days" icon={<Calendar size={14} />} className="flex-1">
            <input
              id="days"
              name="days"
              type="number"
              required
              min={1}
              max={90}
              placeholder="e.g. 7"
              value={form.days}
              onChange={handleChange}
              className={inputCls}
            />
          </Field>

          <Field label="Budget (USD)" htmlFor="budget" icon={<DollarSign size={14} />} className="flex-1">
            <input
              id="budget"
              name="budget"
              type="number"
              required
              min={0}
              placeholder="e.g. 2000"
              value={form.budget}
              onChange={handleChange}
              className={inputCls}
            />
          </Field>
        </div>

        {/* ── Real-time budget preview ── */}
        {dailyBudget && (
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 rounded-xl bg-amber-50 dark:bg-amber-900/20 px-4 py-3 text-xs text-amber-800 dark:text-amber-300">
            <span className="font-semibold">
              ≈ ${dailyBudget} / day
            </span>
            {categoryPreview && (
              <>
                <span className="hidden sm:inline text-amber-400">·</span>
                <span className="font-medium opacity-80">
                  {categoryPreview} tier
                </span>
              </>
            )}
          </div>
        )}

        {/* ── Travel style ── */}
        <Field label="Travel Style" htmlFor="travel_style" icon={<Compass size={14} />}>
          <div className="relative">
            <select
              id="travel_style"
              name="travel_style"
              value={form.travel_style}
              onChange={handleChange}
              className={`${inputCls} appearance-none pr-10 cursor-pointer`}
            >
              {TRAVEL_STYLES.map((style) => (
                <option key={style} value={style}>
                  {STYLE_EMOJI[style]} {style}
                </option>
              ))}
            </select>
            <ChevronDown
              size={15}
              className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400"
            />
          </div>
        </Field>

        {/* ── Error ── */}
        {error && (
          <ErrorMessage
            message={error}
            onDismiss={() => setError(null)}
          />
        )}

        {/* ── Submit ── */}
        <button
          type="submit"
          disabled={loading}
          className="w-full h-12 rounded-xl bg-amber-700 text-white text-sm font-semibold tracking-wide inline-flex items-center justify-center gap-2 hover:bg-amber-600 active:scale-[0.98] disabled:opacity-50 transition-all duration-150 shadow-sm mt-1"
        >
          <Sparkles size={16} strokeWidth={2} />
          Plan My Trip
        </button>
      </form>
    </div>
  );
}

/* ─── Shared helpers ─────────────────────────────────────────────────── */

const inputCls =
  "w-full rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 " +
  "text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 " +
  "px-4 py-3 text-sm outline-none transition-all duration-150 " +
  "focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 dark:focus:border-amber-500 focus:bg-white dark:focus:bg-slate-900";

function Field({
  label,
  htmlFor,
  icon,
  className = "",
  children,
}: {
  label:     string;
  htmlFor:   string;
  icon?:     React.ReactNode;
  className?: string;
  children:  React.ReactNode;
}) {
  return (
    <div className={`flex flex-col gap-1.5 ${className}`}>
      <label
        htmlFor={htmlFor}
        className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400"
      >
        {icon}
        {label}
      </label>
      {children}
    </div>
  );
}
