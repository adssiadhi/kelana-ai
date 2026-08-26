"use client";

import { useState } from "react";

/* ─── Types ──────────────────────────────────────────────────────────── */

interface TripResult {
  id: number;
  destination: string;
  days: number;
  budget: number;
  travel_style: string;
  category: string;
  daily_budget: number;
  ai_recommendation: string;
}

interface FormState {
  destination: string;
  budget: string;
  days: string;
  travel_style: string;
}

const INITIAL_FORM: FormState = {
  destination: "",
  budget: "",
  days: "",
  travel_style: "General",
};

/* ─── Page ───────────────────────────────────────────────────────────── */

export default function Home() {
  const [form, setForm] = useState<FormState>(INITIAL_FORM);
  const [result, setResult] = useState<TripResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setResult(null);
    setLoading(true);

    try {
      const response = await fetch("/api/v1/trips", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          destination: form.destination,
          budget: Number(form.budget),
          days: Number(form.days),
          travel_style: form.travel_style,
        }),
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(
          err.detail ?? `Request failed with status ${response.status}`
        );
      }

      const trip: TripResult = await response.json();
      setResult(trip);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="flex flex-col items-center min-h-screen px-6 py-16 bg-background">

      {/* ── Hero header ── */}
      <header className="text-center mb-16 max-w-lg">
        <p className="text-xs font-semibold tracking-[0.2em] uppercase text-accent mb-4">
          AI Travel Planner
        </p>
        <h1 className="text-5xl font-bold tracking-tight text-text-primary text-balance mb-4">
          KelanaAI
        </h1>
        <p className="text-base leading-relaxed text-text-secondary">
          Describe your trip and get a personalised day-by-day itinerary,
          powered by AI.
        </p>
      </header>

      {/* ── Form card ── */}
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-md flex flex-col gap-6 bg-surface rounded-2xl p-8"
        style={{ boxShadow: "var(--shadow-card)" }}
      >
        <Field label="Destination" htmlFor="destination">
          <input
            id="destination"
            name="destination"
            type="text"
            required
            placeholder="e.g. Bali, Indonesia"
            value={form.destination}
            onChange={handleChange}
            className={inputClass}
          />
        </Field>

        {/* Days + Budget side by side on the 8pt grid */}
        <div className="grid grid-cols-2 gap-4">
          <Field label="Days" htmlFor="days">
            <input
              id="days"
              name="days"
              type="number"
              required
              min={1}
              placeholder="e.g. 5"
              value={form.days}
              onChange={handleChange}
              className={inputClass}
            />
          </Field>

          <Field label="Budget (USD)" htmlFor="budget">
            <input
              id="budget"
              name="budget"
              type="number"
              required
              min={0}
              placeholder="e.g. 2000"
              value={form.budget}
              onChange={handleChange}
              className={inputClass}
            />
          </Field>
        </div>

        <Field label="Travel Style" htmlFor="travel_style">
          <select
            id="travel_style"
            name="travel_style"
            value={form.travel_style}
            onChange={handleChange}
            className={inputClass}
          >
            <option value="General">General</option>
            <option value="Adventure">Adventure</option>
            <option value="Relaxation">Relaxation</option>
            <option value="Cultural">Cultural</option>
            <option value="Family">Family</option>
            <option value="Budget">Budget</option>
            <option value="Luxury">Luxury</option>
          </select>
        </Field>

        <button
          type="submit"
          disabled={loading}
          className="mt-2 h-11 rounded-xl bg-accent text-white text-sm font-semibold tracking-wide hover:opacity-90 active:scale-[0.98] disabled:opacity-40 transition-all duration-150"
        >
          {loading ? "Planning your trip…" : "Plan My Trip"}
        </button>
      </form>

      {/* ── Error ── */}
      {error && (
        <div
          role="alert"
          className="mt-8 w-full max-w-md rounded-2xl bg-red-50 dark:bg-red-950/40 px-6 py-4 text-sm text-red-700 dark:text-red-300 leading-relaxed"
        >
          {error}
        </div>
      )}

      {/* ── Result ── */}
      {result && (
        <section
          className="mt-8 w-full max-w-2xl bg-surface rounded-2xl p-8"
          style={{ boxShadow: "var(--shadow-elevated)" }}
        >
          {/* Title */}
          <h2 className="text-2xl font-bold tracking-tight text-text-primary text-balance mb-8">
            Your {result.days}-Day Trip to{" "}
            <span className="text-accent">{result.destination}</span>
          </h2>

          {/* Stats grid — 8pt spacing */}
          <div className="grid grid-cols-2 gap-4 mb-8">
            <Stat
              label="Total Budget"
              value={`USD ${result.budget.toLocaleString()}`}
            />
            <Stat
              label="Daily Budget"
              value={`USD ${result.daily_budget.toLocaleString()}`}
            />
            <Stat label="Category" value={result.category} />
            <Stat label="Travel Style" value={result.travel_style} />
          </div>

          {/* Divider */}
          <div className="h-px bg-border mb-8" />

          {/* Itinerary */}
          <h3 className="text-xs font-semibold tracking-[0.15em] uppercase text-text-muted mb-6">
            AI Itinerary
          </h3>
          <Itinerary text={result.ai_recommendation} />
        </section>
      )}
    </main>
  );
}

/* ─── Shared input style ─────────────────────────────────────────────── */

const inputClass =
  "w-full rounded-xl bg-surface-raised text-text-primary placeholder:text-text-muted " +
  "px-4 py-3 text-sm outline-none transition-shadow duration-150 " +
  "focus:ring-2 focus:ring-accent/40 focus:bg-surface " +
  "border-0 appearance-none";

/* ─── Field wrapper ──────────────────────────────────────────────────── */

function Field({
  label,
  htmlFor,
  children,
}: {
  label: string;
  htmlFor: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-2">
      <label
        htmlFor={htmlFor}
        className="text-xs font-semibold tracking-wide uppercase text-text-muted"
      >
        {label}
      </label>
      {children}
    </div>
  );
}

/* ─── Stat card ──────────────────────────────────────────────────────── */

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col rounded-2xl bg-surface-raised px-5 py-4">
      <span className="text-xs text-text-muted mb-1">{label}</span>
      <span className="text-sm font-semibold text-text-primary">{value}</span>
    </div>
  );
}

/* ─── Itinerary renderer ─────────────────────────────────────────────── */

function stripInlineMarkdown(text: string): string {
  return text
    .replace(/\*\*(.+?)\*\*/g, "$1")
    .replace(/__(.+?)__/g, "$1")
    .replace(/\*(.+?)\*/g, "$1")
    .replace(/_(.+?)_/g, "$1")
    .replace(/`(.+?)`/g, "$1")
    .trim();
}

type ParsedLine =
  | { type: "heading"; level: 1 | 2 | 3; text: string }
  | { type: "bullet"; text: string }
  | { type: "paragraph"; text: string };

function parseRecommendation(raw: string): ParsedLine[] {
  const lines = raw.split(/\r?\n/);
  const result: ParsedLine[] = [];

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;

    const headingMatch = trimmed.match(/^(#{1,3})\s+(.+)/);
    if (headingMatch) {
      const level = headingMatch[1].length as 1 | 2 | 3;
      result.push({
        type: "heading",
        level,
        text: stripInlineMarkdown(headingMatch[2]),
      });
      continue;
    }

    const bulletMatch = trimmed.match(/^(?:[-*]|\d+\.)\s+(.+)/);
    if (bulletMatch) {
      result.push({ type: "bullet", text: stripInlineMarkdown(bulletMatch[1]) });
      continue;
    }

    result.push({ type: "paragraph", text: stripInlineMarkdown(trimmed) });
  }

  return result;
}

function Itinerary({ text }: { text: string }) {
  const lines = parseRecommendation(text);

  return (
    <div className="flex flex-col gap-2">
      {lines.map((line, i) => {
        if (line.type === "heading") {
          if (line.level === 1) {
            return (
              <p
                key={i}
                className="mt-6 mb-1 text-base font-semibold tracking-tight text-text-primary"
              >
                {line.text}
              </p>
            );
          }
          if (line.level === 2) {
            return (
              <p
                key={i}
                className="mt-4 mb-1 text-sm font-semibold text-accent"
              >
                {line.text}
              </p>
            );
          }
          return (
            <p
              key={i}
              className="mt-3 text-xs font-semibold tracking-[0.12em] uppercase text-text-muted"
            >
              {line.text}
            </p>
          );
        }

        if (line.type === "bullet") {
          return (
            <div key={i} className="flex items-start gap-3 leading-relaxed">
              <span className="mt-[0.45rem] shrink-0 w-1 h-1 rounded-full bg-accent" />
              <span className="text-sm text-text-secondary">{line.text}</span>
            </div>
          );
        }

        return (
          <p key={i} className="text-sm leading-relaxed text-text-secondary">
            {line.text}
          </p>
        );
      })}
    </div>
  );
}
